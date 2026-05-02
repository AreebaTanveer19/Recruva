/**
 * regenerateQuestionService.js
 *
 * Fixes applied:
 *   #2 — shared Prisma singleton via config/db
 *   #3 — parallel fetch of oldQuestion + job via Promise.all
 *   #4 — filterByTechnologyFit used instead of the broken filterRelevantQuestions
 *          call (filterRelevantQuestions was referenced but never imported here —
 *          the bank-alternative path has been throwing ReferenceError silently)
 *   #6 — seniority context injected into regeneration prompt
 */

const prisma = require("../../config/db");
const groq   = require("../../config/groq");

const { getSignificantWords, isQuestionDuplicate }                           = require("./helperFunctions");
const { extractSeniority, getSeniorityPromptContext }                        = require("../../utils/seniority");
const { filterByTechnologyFit }                                              = require("../../utils/technologyConflicts");

async function regenerateQuestion(jobId, oldQuestionId, jobDescription, requirements = []) {

  // Fix #3: fetch both records in parallel — they are fully independent queries.
  // Previously these ran sequentially, adding an extra ~50ms round trip.
  const [oldQuestion, job] = await Promise.all([
    prisma.questionBank.findUnique({ where: { id: oldQuestionId } }),
    prisma.job.findUnique({
      where:  { id: jobId },
      select: { title: true, keywords: true, details: { select: { description: true, requirements: true } } },
    }),
  ]);

  if (!oldQuestion) throw new Error(`Question ${oldQuestionId} not found in bank`);
  if (!job)         throw new Error(`Job ${jobId} not found`);

  const jobTitle        = job.title;
  const jobDesc         = jobDescription || job.details?.description || "";
  const jobRequirements = requirements.length > 0 ? requirements : (job.details?.requirements || []);
  const keywords        = job.keywords || [];

  // Fix #6: derive seniority from title for calibrated prompt depth
  const seniority    = extractSeniority(jobTitle);
  const seniorityCtx = getSeniorityPromptContext(seniority);

  // ── Try bank alternative first — 0 LLM calls ────────────────────────────
  // Fix #4: the previous code called filterRelevantQuestions here, which was
  // never imported into this file — it would throw ReferenceError at runtime.
  // We now use filterByTechnologyFit (local, deterministic) instead.
  const alternative = await prisma.questionBank.findFirst({
    where: {
      tags:         { hasSome: oldQuestion.tags },
      difficulty:   oldQuestion.difficulty,
      id:           { not: oldQuestionId },
      jobQuestions: { none: { jobId } },
    },
  });

  if (alternative) {
    const compatible = filterByTechnologyFit([alternative], keywords);
    if (compatible.length > 0) {
      console.log("Swapping in bank alternative — 0 LLM calls");
      await prisma.jobQuestion.update({
        where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
        data:  { questionId: alternative.id },
      });
      return alternative;
    }
    console.log("Bank alternative conflicts with job stack — generating new question");
  }

  // ── Fetch existing questions for similarity check ────────────────────────
  const existingQuestions = await prisma.questionBank.findMany({
    where:  { jobQuestions: { some: { jobId } } },
    select: { question: true },
  });

  // Pre-compute significant words once outside the retry loop
  const existingSignificantWords = existingQuestions.map(q => ({
    question: q.question,
    words:    getSignificantWords(q.question),
  }));

  const existingSummary = existingQuestions
    .slice(0, 10)
    .map(q => `- ${q.question}`)
    .join("\n");

  // ── Generate 3 candidates per attempt, pick first non-duplicate ──────────
  // Asking for 3 candidates in one call avoids 3 separate LLM round-trips.
  // Temperature ramps up on retries to increase lexical diversity.
  const MAX_RETRIES = 3;
  let saved = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const prompt = `You are a technical interviewer. Generate 3 different replacement questions.

Job Title: ${jobTitle} (${seniority.toUpperCase()})
${seniorityCtx}

Job Description: ${jobDesc}
Key Skills: ${keywords.join(", ")}
Requirements: ${jobRequirements.slice(0, 5).join(", ")}

Replace this question: "${oldQuestion.question}"
Tags to stay near: ${oldQuestion.tags.join(", ")}
Difficulty: ${oldQuestion.difficulty}

RULES:
1. All 3 must be relevant to the job AND appropriate for ${seniority.toUpperCase()} level.
2. Each must cover a DIFFERENT sub-topic from the others.
3. Do NOT repeat the concept from the replaced question.
4. Tags MUST include the specific technology (e.g. "Node.js" NOT just "Backend").
5. Tags must include at least one of: ${keywords.slice(0, 5).join(", ")}.
6. Do NOT generate questions similar to:
${existingSummary || "  (none)"}

Return ONLY a JSON array of exactly 3 objects:
[{
  "question":    string,
  "difficulty":  "${oldQuestion.difficulty}",
  "category":    "Technical" | "Behavioral" | "Situational" | "HR",
  "tags":        string[],
  "briefAnswer": string
}]
No markdown, no explanation.`;

    const result = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      temperature: Math.min(0.7 + attempt * 0.15, 1.2),
    });

    const raw = result.choices[0].message.content.trim()
      .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let candidates;
    try {
      candidates = JSON.parse(raw);
      if (!Array.isArray(candidates)) candidates = [candidates];
    } catch {
      console.log(`Attempt ${attempt}: JSON parse failed — retrying`);
      continue;
    }

    console.log(`Attempt ${attempt}: received ${candidates.length} candidates`);

    const valid = candidates.find(
      c => !isQuestionDuplicate(c.question, existingSignificantWords)
    );

    if (!valid) {
      console.log(`Attempt ${attempt}: all candidates too similar — retrying with higher temperature`);
      continue;
    }

    console.log(`Attempt ${attempt} selected: "${valid.question}"`);

    saved = await prisma.questionBank.upsert({
      where:  { question: valid.question },
      update: {},
      create: {
        question:    valid.question,
        briefAnswer: valid.briefAnswer || null,
        difficulty:  valid.difficulty,
        category:    valid.category || "Technical",
        tags:        Array.isArray(valid.tags) ? valid.tags : [],
      },
    });
    break;
  }

  if (!saved) {
    throw new Error("Failed to generate a unique replacement question after maximum retries");
  }

  await prisma.jobQuestion.update({
    where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
    data:  { questionId: saved.id },
  });

  return saved;
}

module.exports = { regenerateQuestion };

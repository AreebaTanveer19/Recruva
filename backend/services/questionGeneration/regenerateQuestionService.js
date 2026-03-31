const { PrismaClient } = require("@prisma/client");
const Groq = require("groq-sdk");
const  {
  getSignificantWords,
  isQuestionDuplicate,
} = require("./helperFunctions")

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── REGENERATE: Replace one question with a better one ───────────
// Groq calls: 0-1 (bank alt check) + 1-3 (generation, 3 candidates per call)
// Minimum: 0 calls (relevant bank alt found) | Maximum: 4 calls
async function regenerateQuestion(jobId, oldQuestionId, jobDescription, requirements = []) {
  const oldQuestion = await prisma.questionBank.findUnique({
    where: { id: oldQuestionId },
  });
  if (!oldQuestion) throw new Error(`Question with id ${oldQuestionId} not found in bank`);

  // Fetch job context
  const job = await prisma.job.findUnique({
    where:  { id: jobId },
    select: { title: true, keywords: true, details: { select: { description: true, requirements: true } } },
  });
  if (!job) throw new Error(`Job with id ${jobId} not found`);

  const jobTitle        = job.title;
  const jobDesc         = jobDescription || job.details?.description || "";
  const jobRequirements = requirements.length > 0 ? requirements : (job.details?.requirements || []);
  const keywords        = job.keywords || [];

  // ─── Try bank alternative first — 0 Groq calls ───────────────
  const alternative = await prisma.questionBank.findFirst({
    where: {
      tags:         { hasSome: oldQuestion.tags },
      difficulty:   oldQuestion.difficulty,
      id:           { not: oldQuestionId },
      jobQuestions: { none: { jobId } },
    },
  });

  if (alternative) {
    // 1 Groq call to verify relevance
    const relevant = await filterRelevantQuestions([alternative], jobTitle, jobDesc, jobRequirements);
    if (relevant.length > 0) {
      console.log("Found relevant alternative in bank — 0 generation calls used");
      await prisma.jobQuestion.update({
        where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
        data:  { questionId: alternative.id },
      });
      return alternative;
    }
    console.log("Bank alternative not relevant — generating new question");
  }

  // Fetch existing questions for similarity check — DB only
  const existingQuestions = await prisma.questionBank.findMany({
    where:  { jobQuestions: { some: { jobId } } },
    select: { question: true },
  });

  // Pre-extract significant words once outside loop
  const existingSignificantWords = existingQuestions.map(q => ({
    question: q.question,
    words:    getSignificantWords(q.question),
  }));

  // Build existing summary once outside loop
  const existingSummary = existingQuestions
    .slice(0, 10)
    .map(q => `- ${q.question}`)
    .join("\n");

  // ─── Generate 3 candidates per attempt, pick best locally ────
  // Each attempt = 1 Groq call (instead of 2 with relevance check)
  const MAX_RETRIES = 3;
  let saved = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const prompt = `You are a technical interviewer. Generate 3 DIFFERENT replacement interview questions for this specific job.

Job Title: ${jobTitle}
Job Description: ${jobDesc}
Key Skills: ${keywords.join(", ")}
Requirements: ${jobRequirements.slice(0, 5).join(", ")}

Difficulty: ${oldQuestion.difficulty}
Tags to stay close to: ${oldQuestion.tags.join(", ")}

STRICT RULES:
1. All 3 questions MUST be directly relevant to this job
2. Difficulty MUST stay: ${oldQuestion.difficulty}
3. Each question MUST cover a DIFFERENT skill or sub-topic from each other
4. Tags MUST include at least one of: ${keywords.slice(0, 5).join(", ")}
5. Do NOT ask about the same concept as: "${oldQuestion.question}"
6. Do NOT generate questions similar to these already linked to this job:
${existingSummary}

Return ONLY a JSON array of exactly 3 objects:
[
  {
    "question": "...",
    "difficulty": "${oldQuestion.difficulty}",
    "category": "Technical" | "Behavioral" | "Situational" | "HR",
    "tags": ["tag1", "tag2", ...],
    "briefAnswer": "one sentence"
  }
]
No markdown, no explanation.`;

    const result = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      temperature: Math.min(0.9 + (attempt * 0.1), 1.2), // ramp up creativity per retry
    });

    const raw = result.choices[0].message.content.trim()
      .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let candidates;
    try {
      candidates = JSON.parse(raw);
      if (!Array.isArray(candidates)) candidates = [candidates];
    } catch {
      console.log(`Attempt ${attempt}: Failed to parse JSON, retrying...`);
      continue;
    }

    console.log(`Attempt ${attempt}: Got ${candidates.length} candidates`);

    // Pick first non-duplicate — no extra Groq call
    const validCandidate = candidates.find(newQ => {
      const isDuplicate = isQuestionDuplicate(newQ.question, existingSignificantWords);
      if (isDuplicate) console.log(`  Skipping (too similar): "${newQ.question}"`);
      return !isDuplicate;
    });

    if (!validCandidate) {
      console.log(`Attempt ${attempt}: All candidates too similar — retrying with higher temperature`);
      continue;
    }

    console.log(`Attempt ${attempt} selected: "${validCandidate.question}"`);

    saved = await prisma.questionBank.upsert({
      where:  { question: validCandidate.question },
      update: {},
      create: { ...validCandidate },
    });

    break;
  }

  if (!saved) {
    throw new Error("Failed to generate a unique question after maximum retries");
  }

  await prisma.jobQuestion.update({
    where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
    data:  { questionId: saved.id },
  });

  return saved;
}

module.exports = {
  regenerateQuestion,
};
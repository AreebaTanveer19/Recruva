/**
 * questionGenerationService.js
 *
 * Fixes applied:
 *   #1  — filterRelevantQuestions (LLM call on every fetch) replaced by
 *          filterByTechnologyFit (local, deterministic, zero API calls)
 *   #2  — shared Prisma singleton via config/db
 *   #4  — technology conflict filtering via filterByTechnologyFit
 *   #5  — generation prompt enforces specific technology tags, not generic "Backend"
 *   #6  — seniority-aware difficulty distribution and prompt depth
 *   #7  — per-keyword quotas computed as hard numbers, not vague "priority" prose
 *
 * LLM call budget after fixes:
 *   Minimum: 0 calls  (keywords cached AND bank covers full distribution)
 *   Maximum: 2 calls  (keywords extracted + gaps generated)
 */

const prisma = require("../../config/db");
const Groq   = require("groq-sdk");

const { extractKeywords }                                                       = require("./extractKeywordsService");
const { dedupeKeywords, convertToWeightedKeywords, deduplicateQuestions }       = require("./helperFunctions");
const { extractSeniority, getDifficultyDistribution, getSeniorityPromptContext }= require("../../utils/seniority");
const { filterByTechnologyFit }                                                 = require("../../utils/technologyConflicts");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ─── STEP 1: Search existing question bank ────────────────────────────────────
//
// Fix #1 + #4: No LLM call at all. The old code called filterRelevantQuestions
// (an LLM) after every bank fetch — even when returning cached results.
// Now we use filterByTechnologyFit (local, in-memory) to reject questions whose
// tags contain a conflicting technology (e.g. Django questions in a Node.js job).
//
// Take limit (200): prevents loading the entire question bank into memory as
// it grows. 200 is well above the 15-question target even after conflict filtering.
async function searchQuestionBank(keywords, jobId, distribution) {
  const alreadyLinked = await prisma.jobQuestion.findMany({
    where:  { jobId },
    select: { questionId: true },
  });
  const excludeIds  = alreadyLinked.map(q => q.questionId);
  const safeExclude = excludeIds.length > 0 ? excludeIds : [-1];

  const results = await prisma.questionBank.findMany({
    where: {
      tags: { hasSome: keywords },
      id:   { notIn: safeExclude },
    },
    take: 200,
  });

  // Local conflict filter — zero LLM calls, runs in microseconds
  const compatible = filterByTechnologyFit(results, keywords);
  console.log(`Bank: ${results.length} raw → ${compatible.length} after conflict filter`);

  return {
    easy:   deduplicateQuestions(compatible.filter(q => q.difficulty === "easy"),   distribution.easy),
    medium: deduplicateQuestions(compatible.filter(q => q.difficulty === "medium"), distribution.medium),
    hard:   deduplicateQuestions(compatible.filter(q => q.difficulty === "hard"),   distribution.hard),
  };
}

// ─── STEP 2: Generate only the missing questions ───────────────────────────────
//
// Fix #5: Prompt now explicitly instructs the LLM to tag questions with the
//   specific technology first (e.g. "Node.js", not just "Backend").
//   This makes future filterByTechnologyFit calls effective on generated questions.
//
// Fix #6: Seniority context (seniorityCtx) tells the LLM how deep to go per
//   difficulty level. Without this, a "Junior React Developer" and "Senior React
//   Developer" get the same questions.
//
// Fix #7: Per-keyword quotas are computed as hard integer numbers before building
//   the prompt. LLMs reliably follow "React: ~4 questions" but ignore
//   "React has higher priority than Node.js".
//
// Quota rounding fix: Math.round across all keywords can drift from totalNeeded
//   by ±1. We correct by adjusting the last keyword's quota to make the sum exact.
//
// totalWeight guard: if all keyword weights are 0, divide-by-zero would produce
//   NaN quotas. We fall back to even distribution in that case.
async function generateMissingQuestions(
  jobTitle, jobDescription, requirements, keywords,
  found, distribution, seniority
) {
  const gaps = [];
  if (found.easy.length   < distribution.easy)   gaps.push({ difficulty: "easy",   count: distribution.easy   - found.easy.length });
  if (found.medium.length < distribution.medium) gaps.push({ difficulty: "medium", count: distribution.medium - found.medium.length });
  if (found.hard.length   < distribution.hard)   gaps.push({ difficulty: "hard",   count: distribution.hard   - found.hard.length });

  if (gaps.length === 0) {
    console.log("Bank covered all questions — skipping generation");
    return [];
  }

  // Fix #7: compute explicit per-keyword counts instead of vague "priority"
  const totalNeeded = gaps.reduce((s, g) => s + g.count, 0);
  const totalWeight = keywords.reduce((s, k) => s + k.weight, 0);

  let keywordQuotas;
  if (totalWeight === 0 || keywords.length === 0) {
    // Edge case: no weights — distribute evenly
    const base = Math.floor(totalNeeded / Math.max(keywords.length, 1));
    keywordQuotas = keywords.map(k => ({ name: k.name, quota: base || 1 }));
  } else {
    keywordQuotas = keywords.map(k => ({
      name:  k.name,
      quota: Math.max(1, Math.round((k.weight / totalWeight) * totalNeeded)),
    }));
    // Correct rounding drift so sum equals totalNeeded exactly
    const quotaSum = keywordQuotas.reduce((s, k) => s + k.quota, 0);
    if (keywordQuotas.length > 0) {
      keywordQuotas[keywordQuotas.length - 1].quota += (totalNeeded - quotaSum);
    }
  }

  const existingQuestionsText = [...found.easy, ...found.medium, ...found.hard]
    .map(q => `- ${q.question}`).join("\n");

  const gapList         = gaps.map(g => `- ${g.count} ${g.difficulty} questions`).join("\n");
  const seniorityCtx    = getSeniorityPromptContext(seniority);
  const keywordQuotaStr = keywordQuotas.map(k => `  ${k.name}: ~${k.quota} questions`).join("\n");
  const specificTechs   = keywords.map(k => k.name).join(", ");

  const prompt = `You are a technical interviewer building an interview for:
Job Title: ${jobTitle}
Seniority: ${seniority.toUpperCase()}
Tech Stack: ${specificTechs}

${seniorityCtx}

Job Description: ${jobDescription}

Skill quotas — distribute questions EXACTLY as follows:
${keywordQuotaStr}

Requirements: ${requirements.slice(0, 5).join(", ")}

Generate exactly:
${gapList}

RULES:
1. Follow the quota per skill above — spread questions across ALL skills, NEVER cluster on one.
2. TAGGING IS CRITICAL — determines future reusability of every question:
   - Tags MUST include the SPECIFIC technology first (e.g. "Node.js" NOT just "Backend")
   - Tags MUST include the SPECIFIC framework (e.g. "Django" NOT just "Python")
   - Include 3–6 tags total: [specificTech, broadCategory, topic, subtopic]
   - GOOD: ["Node.js", "Backend", "Event Loop", "Async"]
   - BAD:  ["Backend", "Server", "Programming"] — too generic, will be rejected
3. Match question depth and complexity STRICTLY to ${seniority.toUpperCase()} level.
4. Do NOT generate questions similar to these already in this interview:
${existingQuestionsText || "  (none yet)"}
5. briefAnswer: 1–2 sentences only.

Return ONLY a valid JSON array. Each element:
{
  "question":    string,
  "difficulty":  "easy" | "medium" | "hard",
  "category":    "Technical" | "Behavioral" | "Situational" | "HR",
  "tags":        string[],
  "briefAnswer": string
}
No markdown, no explanation, no preamble.`;

  const result = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages:    [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const raw = result.choices[0].message.content.trim()
    .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let generated = [];
  try {
    const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!match) throw new Error("No JSON array found in LLM response");
    generated = JSON.parse(match[0]);
  } catch (err) {
    console.error("Failed to parse generated questions:", err.message);
    return [];
  }

  // Upsert to bank — prevents duplicates if generation is retried
  const saved = await Promise.all(
    generated.map(q =>
      prisma.questionBank.upsert({
        where:  { question: q.question },
        update: {},
        create: {
          question:    q.question,
          briefAnswer: q.briefAnswer || null,
          difficulty:  q.difficulty,
          category:    q.category || "Technical",
          tags:        Array.isArray(q.tags) ? q.tags : [],
        },
      })
    )
  );

  console.log(`Generated and saved ${saved.length} questions to bank`);
  return saved;
}

// ─── MAIN: populateJobQuestions ────────────────────────────────────────────────
//
// Orchestrates the full flow:
//   1. Extract / reuse job keywords
//   2. Search question bank (0 LLM calls)
//   3. Filter with local conflict filter (0 LLM calls)
//   4. Generate only what the bank can't cover (0–1 LLM calls)
//   5. Link all questions to the job via JobQuestion join table
//
// Race condition note: if two requests arrive simultaneously for the same job,
// both can enter this function before either has linked questions. The
// skipDuplicates: true on createMany prevents duplicate links, but two LLM
// generation calls may still run. This is acceptable for now — the upsert on
// the bank prevents duplicate bank entries.
async function populateJobQuestions(jobId, jobTitle, jobDescription, requirements = []) {
  console.log(`\nPopulating questions for job ${jobId} — "${jobTitle}"`);

  // Fix #6: extract seniority from title to drive distribution + prompt depth
  const seniority    = extractSeniority(jobTitle);
  const distribution = getDifficultyDistribution(seniority);
  console.log(`Seniority: ${seniority} | Distribution:`, distribution);

  // ── Keywords ──────────────────────────────────────────────────────────────
  const job = await prisma.job.findUnique({
    where:  { id: jobId },
    select: { keywords: true },
  });

  let keywordNames;
  let weightedKeywords;

  if (job?.keywords?.length > 0) {
    keywordNames     = job.keywords;
    weightedKeywords = convertToWeightedKeywords(keywordNames);
    console.log("Reusing cached keywords:", keywordNames);
  } else {
    let extracted = await extractKeywords(jobTitle, jobDescription, requirements);
    extracted     = dedupeKeywords(extracted);
    keywordNames  = [...new Set(extracted.map(k => k.name))];

    await prisma.job.update({
      where: { id: jobId },
      data:  { keywords: keywordNames },
    });

    console.log("Extracted & saved keywords:", keywordNames);
    weightedKeywords = extracted;
  }

  // ── Bank search — 0 LLM calls ─────────────────────────────────────────────
  const found = await searchQuestionBank(keywordNames, jobId, distribution);
  console.log(`After conflict filter — easy:${found.easy.length} med:${found.medium.length} hard:${found.hard.length}`);

  // ── Generate missing — 0 or 1 LLM call ───────────────────────────────────
  const generated = await generateMissingQuestions(
    jobTitle, jobDescription, requirements,
    weightedKeywords, found, distribution, seniority
  );

  // Slot generated questions into their respective difficulty buckets
  const slotGenerated = (difficulty, needed) =>
    generated.filter(q => q.difficulty === difficulty).slice(0, Math.max(0, needed));

  const finalEasy   = [...found.easy,   ...slotGenerated("easy",   distribution.easy   - found.easy.length)];
  const finalMedium = [...found.medium, ...slotGenerated("medium", distribution.medium - found.medium.length)];
  const finalHard   = [...found.hard,   ...slotGenerated("hard",   distribution.hard   - found.hard.length)];

  const allQuestions = [...finalEasy, ...finalMedium, ...finalHard];

  if (allQuestions.length === 0) {
    throw new Error("No questions could be generated or found for this job");
  }

  await prisma.jobQuestion.createMany({
    data: allQuestions.map(q => ({
      jobId,
      questionId: q.id,
      status:     "pending",
    })),
    skipDuplicates: true,
  });

  console.log(`${allQuestions.length} questions linked to job ${jobId}\n`);
  return allQuestions;
}

module.exports = { populateJobQuestions };

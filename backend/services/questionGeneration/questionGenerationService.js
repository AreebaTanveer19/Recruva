const { PrismaClient } = require("@prisma/client");
const Groq = require("groq-sdk");
const { extractKeywords } = require("./extractKeywordsService");
const  {
  getSignificantWords,
  dedupeKeywords,
  convertToWeightedKeywords,
  isTooSimilar,
  deduplicateQuestions,
  isQuestionDuplicate,
} = require("./helperFunctions")

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const QUESTIONS_PER_DIFFICULTY = 5;

// ─── Groq Call 1 (optional): Filter bank questions for relevance ──
// Called in: populateJobQuestions (always), regenerateQuestion (only if bank alternative exists)
async function filterRelevantQuestions(questions, jobTitle, jobDescription, requirements, strict = true) {
  if (questions.length === 0) return [];

  const prompt = `You are a technical interviewer. Given a job posting, decide which questions are truly relevant.

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Requirements: ${requirements.slice(0, 5).join(", ")}

Questions to evaluate:
${JSON.stringify(questions.map(q => ({ id: q.id, question: q.question, tags: q.tags })))}

${strict
  ? `Return ONLY a JSON array of IDs that are relevant to this specific job.`
  : `Be LENIENT. Return the ID if the question is even loosely related to the job skills or domain.
     Only reject if the question is completely unrelated (e.g., a Python job getting a question about Excel).`
}
Example: [1, 3, 5]
If all are relevant return all IDs. If none are relevant return [].
No markdown, no explanation. Return ONLY a valid JSON array.`;

  const result = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages:    [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const raw = result.choices[0].message.content.trim()
    .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.warn("filterRelevantQuestions: Failed to parse LLM response:", raw);
    return questions; // fallback — assume all relevant rather than blocking
  }

  const idsArray    = Array.isArray(parsed) ? parsed : [parsed];
  const relevantIds = new Set(idsArray.map(Number));
  return questions.filter(q => relevantIds.has(q.id));
}

// ─── STEP 1: Search existing question bank ────────────────────────
// No Groq calls — DB only
async function searchQuestionBank(keywords, jobId) {
  const alreadyLinked = await prisma.jobQuestion.findMany({
    where:  { jobId },
    select: { questionId: true },
  });
  const excludeIds = alreadyLinked.map(q => q.questionId);

  const results = await prisma.questionBank.findMany({
    where: {
      tags: { hasSome: keywords },
      id:   { notIn: excludeIds.length > 0 ? excludeIds : [-1] },
    },
  });

  return {
    easy:   deduplicateQuestions(results.filter(q => q.difficulty === "easy"),   QUESTIONS_PER_DIFFICULTY),
    medium: deduplicateQuestions(results.filter(q => q.difficulty === "medium"), QUESTIONS_PER_DIFFICULTY),
    hard:   deduplicateQuestions(results.filter(q => q.difficulty === "hard"),   QUESTIONS_PER_DIFFICULTY),
  };
}

// ─── STEP 2: Generate only missing questions ──────────────────────
// Groq Call 2 (conditional): only if bank doesn't cover all 15
async function generateMissingQuestions(jobDescription, requirements, keywords, found) {
  const gaps = [];
  if (found.easy.length   < QUESTIONS_PER_DIFFICULTY) gaps.push({ difficulty: "easy",   count: QUESTIONS_PER_DIFFICULTY - found.easy.length });
  if (found.medium.length < QUESTIONS_PER_DIFFICULTY) gaps.push({ difficulty: "medium", count: QUESTIONS_PER_DIFFICULTY - found.medium.length });
  if (found.hard.length   < QUESTIONS_PER_DIFFICULTY) gaps.push({ difficulty: "hard",   count: QUESTIONS_PER_DIFFICULTY - found.hard.length });

  if (gaps.length === 0) {
    console.log("Bank covered all 15 questions — skipping generation");
    return [];
  }

  const gapList              = gaps.map(g => `- ${g.count} ${g.difficulty} questions`).join("\n");
  const existingQuestions    = [...found.easy, ...found.medium, ...found.hard].map(q => q.question).join("\n- ");
  const weightedKeywordsText = keywords.map(k => `${k.name} (priority: ${k.weight})`).join(", ");

  const prompt = `Generate interview questions for this job posting.

Job Description: ${jobDescription}

Key Skills (with priority):
${weightedKeywordsText}

Requirements:
${requirements.slice(0, 5).join(", ")}

Generate exactly:
${gapList}

RULES:
1. PRIORITY-BASED DISTRIBUTION:
   - Higher priority skills MUST have MORE questions
   - Do NOT distribute evenly
   Example: React (5), Node.js (4), MongoDB (2) → more React questions than Node.js

2. RELEVANCE: Every question MUST relate to at least one key skill

3. AVOID DUPLICATES — do NOT generate questions similar to:
   - ${existingQuestions}

4. DIFFICULTY GUIDE:
   - easy:   basic concepts, definitions
   - medium: practical application
   - hard:   system design, deep expertise

5. TAGGING: Tags MUST include the main skill. Include both broad + specific tags.

Return ONLY a JSON array. Each object must have:
- "question": string
- "difficulty": "easy" | "medium" | "hard"
- "category": "Technical" | "Behavioral" | "Situational" | "HR"
- "tags": array of 3-6 keywords
- "briefAnswer": one sentence summary

No markdown, no explanation.`;

  const result = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages:    [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const raw = result.choices[0].message.content.trim()
    .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const generated = JSON.parse(raw);

  const saved = await Promise.all(
    generated.map(q =>
      prisma.questionBank.upsert({
        where:  { question: q.question },
        update: {},
        create: {
          question:    q.question,
          briefAnswer: q.briefAnswer || null,
          difficulty:  q.difficulty,
          category:    q.category,
          tags:        q.tags,
        },
      })
    )
  );

  console.log(`Generated and saved ${saved.length} new questions to bank`);
  return saved;
}

// ─── MAIN: Called when a job is created ───────────────────────────
// Groq calls: 1 (keywords, skipped if cached) + 1 (filter) + 1 (generate, skipped if bank full)
// Minimum: 1 call | Maximum: 3 calls
async function populateJobQuestions(jobId, jobTitle, jobDescription, requirements = []) {
  console.log(`\n Populating questions for job ${jobId}`);

  try {
    const job = await prisma.job.findUnique({
      where:  { id: jobId },
      select: { keywords: true },
    });

    let keywordNames    = [];
    let weightedKeywords = [];

    if (job?.keywords?.length > 0) {
      // Reuse saved keywords — 0 Groq calls
      keywordNames     = job.keywords;
      weightedKeywords = convertToWeightedKeywords(keywordNames);
      console.log("Reusing saved keywords:", keywordNames);
    } else {
      // Extract and save new keywords — 1 Groq call
      let extracted = await extractKeywords(jobTitle, jobDescription, requirements);
      extracted     = dedupeKeywords(extracted);
      keywordNames  = Array.from(new Set(extracted.map(k => k.name)));

      await prisma.job.update({
        where: { id: jobId },
        data:  { keywords: keywordNames },
      });

      console.log("Extracted & saved keywords:", keywordNames);
      weightedKeywords = extracted;
    }

    // Search bank — 0 Groq calls
    const found = await searchQuestionBank(keywordNames, jobId);
    console.log(`Found in bank — easy: ${found.easy.length}, medium: ${found.medium.length}, hard: ${found.hard.length}`);

    // Filter for relevance — 1 Groq call
    const allFound = [...found.easy, ...found.medium, ...found.hard];
    const relevant = await filterRelevantQuestions(allFound, jobTitle, jobDescription, requirements);

    const filteredFound = {
      easy:   deduplicateQuestions(relevant.filter(q => q.difficulty === "easy"),   QUESTIONS_PER_DIFFICULTY),
      medium: deduplicateQuestions(relevant.filter(q => q.difficulty === "medium"), QUESTIONS_PER_DIFFICULTY),
      hard:   deduplicateQuestions(relevant.filter(q => q.difficulty === "hard"),   QUESTIONS_PER_DIFFICULTY),
    };
    console.log(`Relevant after filtering — easy: ${filteredFound.easy.length}, medium: ${filteredFound.medium.length}, hard: ${filteredFound.hard.length}`);

    // Generate missing — 1 Groq call (skipped if bank is full)
    const generated = await generateMissingQuestions(jobDescription, requirements, weightedKeywords, filteredFound);

    const allQuestions = [
      ...filteredFound.easy,
      ...filteredFound.medium,
      ...filteredFound.hard,
      ...generated,
    ];

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

  } catch (err) {
    console.error(`populateJobQuestions failed for job ${jobId}:`, err.message);
    throw err;
  }
}

module.exports = {
  populateJobQuestions,
};
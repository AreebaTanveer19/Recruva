const { PrismaClient } = require("@prisma/client");
const Groq = require("groq-sdk");
const { extractKeywords } = require("./extractKeywordsService");

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const QUESTIONS_PER_DIFFICULTY = 5;

// Helper: extract significant words from a question for comparison
function getSignificantWords(text) {
  const stopWords = new Set(["what", "is", "the", "a", "an", "of", "in", "and", "or", "how", "do", "does", "can", "you", "for", "to", "are", "with", "this", "that", "your", "explain", "describe", "define", "give", "between"]);
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
  );
}

// Helper: check if two questions are too similar
function isTooSimilar(q1, q2, threshold = 0.4) {
  const words1 = getSignificantWords(q1);
  const words2 = getSignificantWords(q2);
  const smaller = Math.min(words1.size, words2.size);
  if (smaller === 0) return false;
  let overlap = 0;
  for (const w of words1) { if (words2.has(w)) overlap++; }
  return (overlap / smaller) >= threshold;
}

// Helper: filter out similar questions, keeping the first unique ones
function deduplicateQuestions(questions, limit) {
  const picked = [];
  for (const q of questions) {
    if (picked.length >= limit) break;
    const isDuplicate = picked.some(p => isTooSimilar(p.question, q.question));
    if (!isDuplicate) picked.push(q);
  }
  return picked;
}

// STEP 1: Search existing bank 

async function searchQuestionBank(keywords, jobId) {
  // Get questions already linked to this job
  const alreadyLinked = await prisma.jobQuestion.findMany({
    where:  { jobId },
    select: { questionId: true }
  });
  const excludeIds = alreadyLinked.map(q => q.questionId);

  const results = await prisma.questionBank.findMany({
    where: {
      tags: { hasSome: keywords },
      id:   { notIn: excludeIds.length > 0 ? excludeIds : [-1] }
    },
  });

  return {
    easy:   deduplicateQuestions(results.filter(q => q.difficulty === "easy"), QUESTIONS_PER_DIFFICULTY),
    medium: deduplicateQuestions(results.filter(q => q.difficulty === "medium"), QUESTIONS_PER_DIFFICULTY),
    hard:   deduplicateQuestions(results.filter(q => q.difficulty === "hard"), QUESTIONS_PER_DIFFICULTY),
  };
}

// STEP 2: Generate ONLY missing questions 

async function generateMissingQuestions(jobDescription, requirements, keywords, found) {
  const gaps = [];

  if (found.easy.length   < QUESTIONS_PER_DIFFICULTY) gaps.push({ difficulty: "easy",   count: QUESTIONS_PER_DIFFICULTY - found.easy.length });
  if (found.medium.length < QUESTIONS_PER_DIFFICULTY) gaps.push({ difficulty: "medium", count: QUESTIONS_PER_DIFFICULTY - found.medium.length });
  if (found.hard.length   < QUESTIONS_PER_DIFFICULTY) gaps.push({ difficulty: "hard",   count: QUESTIONS_PER_DIFFICULTY - found.hard.length });

  if (gaps.length === 0) {
    console.log("Bank covered all 15 questions");
    return [];
  }

  const gapList = gaps.map(g => `- ${g.count} ${g.difficulty} questions`).join("\n");

  const existingQuestions = [...found.easy, ...found.medium, ...found.hard]
    .map(q => q.question).join("\n- ");

  const prompt = `Generate interview questions for this job posting.

Job Description: ${jobDescription}
Key Skills: ${keywords.join(", ")}
Requirements: ${requirements.slice(0, 5).join(", ")}

Generate exactly:
${gapList}

IMPORTANT: Do NOT generate questions similar to these existing ones:
- ${existingQuestions}

Difficulty guide:
- easy: basic concepts, definitions, junior level
- medium: practical application, requires explanation, mid level
- hard: system design, architecture, deep expertise, senior level

Return ONLY a JSON array. Each object must have:
- "question": string
- "difficulty": "easy" | "medium" | "hard"
- "category": "Technical" | "Behavioral" | "Situational" | "HR"
- "tags": array of 3-6 keywords (broad + specific, e.g. ["React", "Frontend", "Hooks"])
- "briefAnswer": one sentence summary of the expected answer

No markdown, no explanation.`;

  const result = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages:    [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const raw = result.choices[0].message.content.trim()
    .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const generated = JSON.parse(raw);

  // Save to bank so future jobs can reuse them
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


// MAIN: Called when manager creates a job

async function populateJobQuestions(jobId, jobTitle, jobDescription, requirements = []) {
  console.log(`\n Populating questions for job ${jobId}`);

  try {
    // Check if keywords already saved
    const job = await prisma.job.findUnique({
      where:  { id: jobId },
      select: { keywords: true }
    });

    let keywords;

    if (job.keywords && job.keywords.length > 0) {
      
      keywords = job.keywords;
      console.log(" Reusing saved keywords:", keywords);
    } else {
      // Extract and save
      keywords = await extractKeywords(jobTitle, jobDescription, requirements);
      await prisma.job.update({
        where: { id: jobId },
        data:  { keywords }
      });
      console.log("Keywords saved:");
    }

    // Search bank
    // const found = await searchQuestionBank(keywords, jobId);
    // console.log(` Found — easy: ${found.easy.length}, medium: ${found.medium.length}, hard: ${found.hard.length}`);

    // // Fill gaps
    // const generated = await generateMissingQuestions(jobDescription, requirements, keywords, found);

    // // Combine all
    // const allQuestions = [
    //   ...found.easy,
    //   ...found.medium,
    //   ...found.hard,
    //   ...generated,
    // ];

// Always generate fresh from LLM — skip bank search
    const generated = await generateMissingQuestions(jobDescription, requirements, keywords, {
      easy:   [],
      medium: [],
      hard:   [],
    });

    const allQuestions = [...generated];


    // Link to job
    await prisma.jobQuestion.createMany({
      data: allQuestions.map(q => ({
        jobId,
        questionId: q.id,
        status: "pending",
      })),
      skipDuplicates: true,
    });

    console.log(` ${allQuestions.length} questions linked to job ${jobId}\n`);
    return allQuestions;

  } catch (err) {
    console.error(` populateJobQuestions failed for job ${jobId}:`, err.message);
  }
}

// Manager regenerates a question

async function regenerateQuestion(jobId, oldQuestionId, jobDescription, requirements = []) {
  const oldQuestion = await prisma.questionBank.findUnique({
    where: { id: oldQuestionId }
  });

  // Search bank for alternative first — 0 API calls
  const alternative = await prisma.questionBank.findFirst({
    where: {
      tags:         { hasSome: oldQuestion.tags },
      difficulty:   oldQuestion.difficulty,
      id:           { not: oldQuestionId },
      jobQuestions: { none: { jobId } },
    }
  });

  if (alternative) {
    console.log(" Found alternative in bank ");
    await prisma.jobQuestion.update({
      where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
      data:  { questionId: alternative.id, status: "regenerated" },
    });
    return alternative;
  }

  // Nothing in bank — generate 1 new question
  const prompt = `Generate 1 interview question to replace this one.
Original: "${oldQuestion.question}"
Difficulty: ${oldQuestion.difficulty}
Tags: ${oldQuestion.tags.join(", ")}

Return ONLY a JSON object with: "question", "difficulty", "category", "tags", "briefAnswer". No markdown.`;

  const result = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages:    [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const raw = result.choices[0].message.content.trim()
    .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const newQ = JSON.parse(raw);

  const saved = await prisma.questionBank.create({
    data: { ...newQ }
  });

  await prisma.jobQuestion.update({
    where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
    data:  { questionId: saved.id, status: "regenerated" },
  });

  return saved;
}

module.exports = {
  populateJobQuestions,
  regenerateQuestion,
};
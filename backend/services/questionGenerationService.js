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

function dedupeKeywords(weightedKeywords) {
  const map = new Map();

  weightedKeywords.forEach(k => {
    if (!map.has(k.name) || map.get(k.name).weight < k.weight) {
      map.set(k.name, k);
    }
  });

  return Array.from(map.values());
}

async function filterRelevantQuestions(questions, jobTitle, jobDescription, requirements) {
  if (questions.length === 0) return [];

  const prompt = `You are a technical interviewer. Given a job posting, decide which questions are truly relevant.

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Requirements: ${requirements.slice(0, 5).join(", ")}

Questions to evaluate:
${JSON.stringify(questions.map(q => ({ id: q.id, question: q.question, tags: q.tags })))}

Return ONLY a JSON array of IDs that are relevant to this specific job.
Example: [1, 3, 5]
No markdown, no explanation.`;

  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2, // low temp — this is a filtering decision, not creative
  });

  const raw = result.choices[0].message.content.trim()
    .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  const relevantIds = new Set(JSON.parse(raw));
  return questions.filter(q => relevantIds.has(q.id));
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
function convertToWeightedKeywords(keywords) {
  return keywords.map((k, index) => ({
    name: k,
    weight: keywords.length - index, // simple priority (can improve later)
  }));
}

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

const weightedKeywordsText = keywords
  .map(k => `${k.name} (priority: ${k.weight})`)
  .join(", ");

const prompt = `Generate interview questions for this job posting.

Job Description: ${jobDescription}

Key Skills (with priority):
${weightedKeywordsText}

Requirements:
${requirements.slice(0, 5).join(", ")}

Generate exactly:
${gapList}

IMPORTANT RULES:

1. PRIORITY-BASED DISTRIBUTION:
- Higher priority skills MUST have MORE questions
- Lower priority skills should have FEWER questions
- Do NOT distribute evenly

Example:
If React (5), Node.js (4), MongoDB (2)
→ Generate more React questions than Node.js, and very few MongoDB

2. RELEVANCE:
- Every question MUST relate to at least one key skill
- Avoid generic or unrelated questions

3. AVOID DUPLICATES:
Do NOT generate questions similar to:
- ${existingQuestions}

4. DIFFICULTY GUIDE:
- easy: basic concepts, definitions
- medium: practical application
- hard: system design, deep expertise

5. TAGGING RULE:
- Tags MUST include the main skill (e.g., React, Node.js)
- Include both broad + specific tags

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
  console.log(`\n🔹 Populating questions for job ${jobId}`);

  try {
    // Fetch existing job keywords
 
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      select: { keywords: true },
    });

    let keywordNames = [];
    let weightedKeywords = [];

    if (job?.keywords?.length > 0) {
      // ✅ Reuse saved keywords
      keywordNames = job.keywords;
      weightedKeywords = convertToWeightedKeywords(keywordNames);
      console.log("🔑 Reusing saved keywords:", keywordNames);
    } else {
      // Extract new keywords
      let extracted = await extractKeywords(jobTitle, jobDescription, requirements);

      // Deduplicate based on name & weight
      extracted = dedupeKeywords(extracted);

      // Save only unique names in DB
      keywordNames = Array.from(new Set(extracted.map(k => k.name)));

      await prisma.job.update({
        where: { id: jobId },
        data: { keywords: keywordNames }, 
      });

      console.log(" Extracted & saved keywords:", keywordNames);

      // Use extracted as weighted for generation
      weightedKeywords = extracted;
    }
    // Search question bank for this job
   
    // const found = await searchQuestionBank(keywordNames, jobId);
    // console.log(
    //   `📚 Found questions — easy: ${found.easy.length}, medium: ${found.medium.length}, hard: ${found.hard.length}`
    // );

    // // Generate missing questions
    // const generated = await generateMissingQuestions(
    //   jobDescription,
    //   requirements,
    //   weightedKeywords,
    //   found
    // );

    const found = await searchQuestionBank(keywordNames, jobId);
console.log(`📚 Found questions — easy: ${found.easy.length}, medium: ${found.medium.length}, hard: ${found.hard.length}`);

// ✅ NEW: Filter bank results for job relevance
const allFound = [...found.easy, ...found.medium, ...found.hard];
const relevant = await filterRelevantQuestions(allFound, jobTitle, jobDescription, requirements);

const filteredFound = {
  easy:   deduplicateQuestions(relevant.filter(q => q.difficulty === "easy"),   QUESTIONS_PER_DIFFICULTY),
  medium: deduplicateQuestions(relevant.filter(q => q.difficulty === "medium"), QUESTIONS_PER_DIFFICULTY),
  hard:   deduplicateQuestions(relevant.filter(q => q.difficulty === "hard"),   QUESTIONS_PER_DIFFICULTY),
};

console.log(`✅ Relevant after filtering — easy: ${filteredFound.easy.length}, medium: ${filteredFound.medium.length}, hard: ${filteredFound.hard.length}`);

// Pass filteredFound instead of found
const generated = await generateMissingQuestions(
  jobDescription,
  requirements,
  weightedKeywords,
  filteredFound  // ← was `found`
);

    // Combine all questions

    const allQuestions = [
      ...filteredFound.easy,
      ...filteredFound.medium,
      ...filteredFound.hard,
      ...generated,
    ];

    // Link questions to job

    await prisma.jobQuestion.createMany({
      data: allQuestions.map(q => ({
        jobId,
        questionId: q.id,
        status: "pending",
      })),
      skipDuplicates: true,
    });

    console.log(`${allQuestions.length} questions linked to job ${jobId}\n`);
    return allQuestions;

  } catch (err) {
    console.error(` populateJobQuestions failed for job ${jobId}:`, err.message);
    throw err; 
  }
}

async function regenerateQuestion(jobId, oldQuestionId, jobDescription, requirements = []) {
  const oldQuestion = await prisma.questionBank.findUnique({
    where: { id: oldQuestionId }
  });

  if (!oldQuestion) {
    throw new Error(`Question with id ${oldQuestionId} not found in bank`);
  }

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
    console.log("Found alternative in bank");
    await prisma.jobQuestion.update({
      where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
      data:  { questionId: alternative.id },
    });
    return alternative;
  }

  // Fetch all existing questions for this job to check similarity
  const existingQuestions = await prisma.questionBank.findMany({
    where: { jobQuestions: { some: { jobId } } },
    select: { question: true }
  });

  // Nothing in bank — generate 1 new question with retry for duplicates
  const MAX_RETRIES = 10;
  let saved = null;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const prompt = `Generate 1 interview question to replace this one.
Original: "${oldQuestion.question}"
Difficulty: ${oldQuestion.difficulty}
Tags: ${oldQuestion.tags.join(", ")}

IMPORTANT: Do NOT generate questions similar to these existing ones:
- ${existingQuestions.map(q => q.question).join("\n- ")}

Return ONLY a JSON object with: "question", "difficulty", "category", "tags", "briefAnswer". No markdown.`;

    const result = await groq.chat.completions.create({
      model:       "llama-3.3-70b-versatile",
      messages:    [{ role: "user", content: prompt }],
      temperature: 0.7,
    });

    const raw = result.choices[0].message.content.trim()
      .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    const newQ = JSON.parse(raw);

    // Check semantic similarity against existing job questions
    const isDuplicate = existingQuestions.some(q => isTooSimilar(q.question, newQ.question));

    if (isDuplicate) {
      console.log(`Attempt ${attempt}: Generated question too similar, retrying...`);
      if (attempt === MAX_RETRIES) {
        throw new Error("Failed to generate a unique question after maximum retries");
      }
      continue;
    }

    // Unique question — save to bank
    saved = await prisma.questionBank.upsert({
      where:  { question: newQ.question },
      update: {},
      create: { ...newQ },
    });

    console.log(`Generated unique question on attempt ${attempt}`);
    break;
  }

  // Update job question link
  await prisma.jobQuestion.update({
    where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
    data:  { questionId: saved.id },
  });

  return saved;
}

module.exports = {
  populateJobQuestions,
  regenerateQuestion,
};
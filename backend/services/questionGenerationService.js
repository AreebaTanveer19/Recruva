// const { PrismaClient } = require("@prisma/client");
// const Groq = require("groq-sdk");
// const { extractKeywords } = require("./extractKeywordsService");

// const prisma = new PrismaClient();
// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// const QUESTIONS_PER_DIFFICULTY = 5;

// // Helper: extract significant words from a question for comparison
// function getSignificantWords(text) {
//   const stopWords = new Set(["what", "is", "the", "a", "an", "of", "in", "and", "or", "how", "do", "does", "can", "you", "for", "to", "are", "with", "this", "that", "your", "explain", "describe", "define", "give", "between"]);
//   return new Set(
//     text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w))
//   );
// }

// function dedupeKeywords(weightedKeywords) {
//   const map = new Map();

//   weightedKeywords.forEach(k => {
//     if (!map.has(k.name) || map.get(k.name).weight < k.weight) {
//       map.set(k.name, k);
//     }
//   });

//   return Array.from(map.values());
// }

// // async function filterRelevantQuestions(questions, jobTitle, jobDescription, requirements) {
// //   if (questions.length === 0) return [];

// //   const prompt = `You are a technical interviewer. Given a job posting, decide which questions are truly relevant.

// // Job Title: ${jobTitle}
// // Job Description: ${jobDescription}
// // Requirements: ${requirements.slice(0, 5).join(", ")}

// // Questions to evaluate:
// // ${JSON.stringify(questions.map(q => ({ id: q.id, question: q.question, tags: q.tags })))}

// // Return ONLY a JSON array of IDs that are relevant to this specific job.
// // Example: [1, 3, 5]
// // No markdown, no explanation.`;

// //   const result = await groq.chat.completions.create({
// //     model: "llama-3.3-70b-versatile",
// //     messages: [{ role: "user", content: prompt }],
// //     temperature: 0.2, // low temp — this is a filtering decision, not creative
// //   });

// //   const raw = result.choices[0].message.content.trim()
// //     .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

// //   const relevantIds = new Set(JSON.parse(raw));
// //   return questions.filter(q => relevantIds.has(q.id));
// // }


// // Helper: check if two questions are too similar

// async function filterRelevantQuestions(questions, jobTitle, jobDescription, requirements, strict = true) {
//   if (questions.length === 0) return [];

//   const prompt = `You are a technical interviewer. Given a job posting, decide which questions are truly relevant.

// Job Title: ${jobTitle}
// Job Description: ${jobDescription}
// Requirements: ${requirements.slice(0, 5).join(", ")}

// Questions to evaluate:
// ${JSON.stringify(questions.map(q => ({ id: q.id, question: q.question, tags: q.tags })))}

// ${strict
//   ? `Return ONLY a JSON array of IDs that are relevant to this specific job.`
//   : `Be LENIENT. Return the ID if the question is even loosely related to the job skills or domain.
//      Only reject if the question is completely unrelated (e.g., a Python job getting a question about Excel).`
// }
// Example: [1, 3, 5]
// No markdown, no explanation.`;

//   const result = await groq.chat.completions.create({
//     model: "llama-3.3-70b-versatile",
//     messages: [{ role: "user", content: prompt }],
//     temperature: 0.2,
//   });

//   const raw = result.choices[0].message.content.trim()
//     .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
//  let parsed;
//   try {
//     parsed = JSON.parse(raw);
//   } catch {
//     console.warn("filterRelevantQuestions: Failed to parse LLM response:", raw);
//     return questions; // if parse fails, assume all relevant rather than blocking
//   }

//   // ─── Ensure it's always an array ─────────────────────────────
//   const idsArray = Array.isArray(parsed) ? parsed : [parsed];
//   const relevantIds = new Set(idsArray.map(Number)); // normalize to numbers

//   return questions.filter(q => relevantIds.has(q.id));
// }

// function isTooSimilar(q1, q2, threshold = 0.4) {
//   const words1 = getSignificantWords(q1);
//   const words2 = getSignificantWords(q2);
//   const smaller = Math.min(words1.size, words2.size);
//   if (smaller === 0) return false;
//   let overlap = 0;
//   for (const w of words1) { if (words2.has(w)) overlap++; }
//   return (overlap / smaller) >= threshold;
// }

// // Helper: filter out similar questions, keeping the first unique ones
// function deduplicateQuestions(questions, limit) {
//   const picked = [];
//   for (const q of questions) {
//     if (picked.length >= limit) break;
//     const isDuplicate = picked.some(p => isTooSimilar(p.question, q.question));
//     if (!isDuplicate) picked.push(q);
//   }
//   return picked;
// }

// // STEP 1: Search existing bank 

// async function searchQuestionBank(keywords, jobId) {
//   // Get questions already linked to this job
//   const alreadyLinked = await prisma.jobQuestion.findMany({
//     where:  { jobId },
//     select: { questionId: true }
//   });
//   const excludeIds = alreadyLinked.map(q => q.questionId);

//   const results = await prisma.questionBank.findMany({
//     where: {
//       tags: { hasSome: keywords },
//       id:   { notIn: excludeIds.length > 0 ? excludeIds : [-1] }
//     },
//   });

//   return {
//     easy:   deduplicateQuestions(results.filter(q => q.difficulty === "easy"), QUESTIONS_PER_DIFFICULTY),
//     medium: deduplicateQuestions(results.filter(q => q.difficulty === "medium"), QUESTIONS_PER_DIFFICULTY),
//     hard:   deduplicateQuestions(results.filter(q => q.difficulty === "hard"), QUESTIONS_PER_DIFFICULTY),
//   };
// }

// // STEP 2: Generate ONLY missing questions 
// function convertToWeightedKeywords(keywords) {
//   return keywords.map((k, index) => ({
//     name: k,
//     weight: keywords.length - index, // simple priority (can improve later)
//   }));
// }

// async function generateMissingQuestions(jobDescription, requirements, keywords, found) {
//   const gaps = [];

//   if (found.easy.length   < QUESTIONS_PER_DIFFICULTY) gaps.push({ difficulty: "easy",   count: QUESTIONS_PER_DIFFICULTY - found.easy.length });
//   if (found.medium.length < QUESTIONS_PER_DIFFICULTY) gaps.push({ difficulty: "medium", count: QUESTIONS_PER_DIFFICULTY - found.medium.length });
//   if (found.hard.length   < QUESTIONS_PER_DIFFICULTY) gaps.push({ difficulty: "hard",   count: QUESTIONS_PER_DIFFICULTY - found.hard.length });

//   if (gaps.length === 0) {
//     console.log("Bank covered all 15 questions");
//     return [];
//   }

//   const gapList = gaps.map(g => `- ${g.count} ${g.difficulty} questions`).join("\n");

//   const existingQuestions = [...found.easy, ...found.medium, ...found.hard]
//     .map(q => q.question).join("\n- ");

// const weightedKeywordsText = keywords
//   .map(k => `${k.name} (priority: ${k.weight})`)
//   .join(", ");

// const prompt = `Generate interview questions for this job posting.

// Job Description: ${jobDescription}

// Key Skills (with priority):
// ${weightedKeywordsText}

// Requirements:
// ${requirements.slice(0, 5).join(", ")}

// Generate exactly:
// ${gapList}

// IMPORTANT RULES:

// 1. PRIORITY-BASED DISTRIBUTION:
// - Higher priority skills MUST have MORE questions
// - Lower priority skills should have FEWER questions
// - Do NOT distribute evenly

// Example:
// If React (5), Node.js (4), MongoDB (2)
// → Generate more React questions than Node.js, and very few MongoDB

// 2. RELEVANCE:
// - Every question MUST relate to at least one key skill
// - Avoid generic or unrelated questions

// 3. AVOID DUPLICATES:
// Do NOT generate questions similar to:
// - ${existingQuestions}

// 4. DIFFICULTY GUIDE:
// - easy: basic concepts, definitions
// - medium: practical application
// - hard: system design, deep expertise

// 5. TAGGING RULE:
// - Tags MUST include the main skill (e.g., React, Node.js)
// - Include both broad + specific tags

// Return ONLY a JSON array. Each object must have:
// - "question": string
// - "difficulty": "easy" | "medium" | "hard"
// - "category": "Technical" | "Behavioral" | "Situational" | "HR"
// - "tags": array of 3-6 keywords
// - "briefAnswer": one sentence summary

// No markdown, no explanation.`;

//   const result = await groq.chat.completions.create({
//     model:       "llama-3.3-70b-versatile",
//     messages:    [{ role: "user", content: prompt }],
//     temperature: 0.7,
//   });

//   const raw = result.choices[0].message.content.trim()
//     .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

//   const generated = JSON.parse(raw);

//   // Save to bank so future jobs can reuse them
//   const saved = await Promise.all(
//     generated.map(q =>
//       prisma.questionBank.upsert({
//         where:  { question: q.question },
//         update: {},
//         create: {
//           question:    q.question,
//           briefAnswer: q.briefAnswer || null,
//           difficulty:  q.difficulty,
//           category:    q.category,
//           tags:        q.tags,
//         },
//       })
//     )
//   );

//   console.log(`Generated and saved ${saved.length} new questions to bank`);
//   return saved;
// }


// // MAIN: Called when manager creates a job

// async function populateJobQuestions(jobId, jobTitle, jobDescription, requirements = []) {
//   console.log(`\n🔹 Populating questions for job ${jobId}`);

//   try {
//     // Fetch existing job keywords
 
//     const job = await prisma.job.findUnique({
//       where: { id: jobId },
//       select: { keywords: true },
//     });

//     let keywordNames = [];
//     let weightedKeywords = [];

//     if (job?.keywords?.length > 0) {
//       // ✅ Reuse saved keywords
//       keywordNames = job.keywords;
//       weightedKeywords = convertToWeightedKeywords(keywordNames);
//       console.log("🔑 Reusing saved keywords:", keywordNames);
//     } else {
//       // Extract new keywords
//       let extracted = await extractKeywords(jobTitle, jobDescription, requirements);

//       // Deduplicate based on name & weight
//       extracted = dedupeKeywords(extracted);

//       // Save only unique names in DB
//       keywordNames = Array.from(new Set(extracted.map(k => k.name)));

//       await prisma.job.update({
//         where: { id: jobId },
//         data: { keywords: keywordNames }, 
//       });

//       console.log(" Extracted & saved keywords:", keywordNames);

//       // Use extracted as weighted for generation
//       weightedKeywords = extracted;
//     }
  

//     const found = await searchQuestionBank(keywordNames, jobId);
// console.log(`📚 Found questions — easy: ${found.easy.length}, medium: ${found.medium.length}, hard: ${found.hard.length}`);

// // ✅ NEW: Filter bank results for job relevance
// const allFound = [...found.easy, ...found.medium, ...found.hard];
// const relevant = await filterRelevantQuestions(allFound, jobTitle, jobDescription, requirements);

// const filteredFound = {
//   easy:   deduplicateQuestions(relevant.filter(q => q.difficulty === "easy"),   QUESTIONS_PER_DIFFICULTY),
//   medium: deduplicateQuestions(relevant.filter(q => q.difficulty === "medium"), QUESTIONS_PER_DIFFICULTY),
//   hard:   deduplicateQuestions(relevant.filter(q => q.difficulty === "hard"),   QUESTIONS_PER_DIFFICULTY),
// };

// console.log(`✅ Relevant after filtering — easy: ${filteredFound.easy.length}, medium: ${filteredFound.medium.length}, hard: ${filteredFound.hard.length}`);

// // Pass filteredFound instead of found
// const generated = await generateMissingQuestions(
//   jobDescription,
//   requirements,
//   weightedKeywords,
//   filteredFound  // ← was `found`
// );

//     // Combine all questions

//     const allQuestions = [
//       ...filteredFound.easy,
//       ...filteredFound.medium,
//       ...filteredFound.hard,
//       ...generated,
//     ];

//     // Link questions to job

//     await prisma.jobQuestion.createMany({
//       data: allQuestions.map(q => ({
//         jobId,
//         questionId: q.id,
//         status: "pending",
//       })),
//       skipDuplicates: true,
//     });

//     console.log(`${allQuestions.length} questions linked to job ${jobId}\n`);
//     return allQuestions;

//   } catch (err) {
//     console.error(` populateJobQuestions failed for job ${jobId}:`, err.message);
//     throw err; 
//   }
// }

// // async function regenerateQuestion(jobId, oldQuestionId, jobDescription, requirements = []) {
// //   const oldQuestion = await prisma.questionBank.findUnique({
// //     where: { id: oldQuestionId }
// //   });

// //   if (!oldQuestion) {
// //     throw new Error(`Question with id ${oldQuestionId} not found in bank`);
// //   }

// //   // Search bank for alternative first — 0 API calls
// //   const alternative = await prisma.questionBank.findFirst({
// //     where: {
// //       tags:         { hasSome: oldQuestion.tags },
// //       difficulty:   oldQuestion.difficulty,
// //       id:           { not: oldQuestionId },
// //       jobQuestions: { none: { jobId } },
// //     }
// //   });

// //   if (alternative) {
// //     console.log("Found alternative in bank");
// //     await prisma.jobQuestion.update({
// //       where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
// //       data:  { questionId: alternative.id },
// //     });
// //     return alternative;
// //   }

// //   // Fetch all existing questions for this job to check similarity
// //   const existingQuestions = await prisma.questionBank.findMany({
// //     where: { jobQuestions: { some: { jobId } } },
// //     select: { question: true }
// //   });

// //   // Nothing in bank — generate 1 new question with retry for duplicates
// //   const MAX_RETRIES = 10;
// //   let saved = null;

// //   for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
// //     const prompt = `Generate 1 interview question to replace this one.
// // Original: "${oldQuestion.question}"
// // Difficulty: ${oldQuestion.difficulty}
// // Tags: ${oldQuestion.tags.join(", ")}

// // IMPORTANT: Do NOT generate questions similar to these existing ones:
// // - ${existingQuestions.map(q => q.question).join("\n- ")}

// // Return ONLY a JSON object with: "question", "difficulty", "category", "tags", "briefAnswer". No markdown.`;

// //     const result = await groq.chat.completions.create({
// //       model:       "llama-3.3-70b-versatile",
// //       messages:    [{ role: "user", content: prompt }],
// //       temperature: 0.7,
// //     });

// //     const raw = result.choices[0].message.content.trim()
// //       .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

// //     const newQ = JSON.parse(raw);

// //     // Check semantic similarity against existing job questions
// //     const isDuplicate = existingQuestions.some(q => isTooSimilar(q.question, newQ.question));

// //     if (isDuplicate) {
// //       console.log(`Attempt ${attempt}: Generated question too similar, retrying...`);
// //       if (attempt === MAX_RETRIES) {
// //         throw new Error("Failed to generate a unique question after maximum retries");
// //       }
// //       continue;
// //     }

// //     // Unique question — save to bank
// //     saved = await prisma.questionBank.upsert({
// //       where:  { question: newQ.question },
// //       update: {},
// //       create: { ...newQ },
// //     });

// //     console.log(`Generated unique question on attempt ${attempt}`);
// //     break;
// //   }

// //   // Update job question link
// //   await prisma.jobQuestion.update({
// //     where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
// //     data:  { questionId: saved.id },
// //   });

// //   return saved;
// // }
// async function regenerateQuestion(jobId, oldQuestionId, jobDescription, requirements = []) {
//   const oldQuestion = await prisma.questionBank.findUnique({
//     where: { id: oldQuestionId }
//   });

//   if (!oldQuestion) {
//     throw new Error(`Question with id ${oldQuestionId} not found in bank`);
//   }

//   // ─── Fetch job context ────────────────────────────────────────
//   const job = await prisma.job.findUnique({
//     where: { id: jobId },
//     select: { title: true, keywords: true, details: { select: { description: true, requirements: true } } }
//   });

//   if (!job) throw new Error(`Job with id ${jobId} not found`);

//   const jobTitle        = job.title;
//   const jobDesc         = jobDescription || job.details?.description || "";
//   const jobRequirements = requirements.length > 0 ? requirements : (job.details?.requirements || []);
//   const keywords        = job.keywords || [];

//   // Search bank for alternative first — 0 API calls
//   const alternative = await prisma.questionBank.findFirst({
//     where: {
//       tags:         { hasSome: oldQuestion.tags },
//       difficulty:   oldQuestion.difficulty,
//       id:           { not: oldQuestionId },
//       jobQuestions: { none: { jobId } },
//     }
//   });

//   if (alternative) {
//     const relevant = await filterRelevantQuestions([alternative], jobTitle, jobDesc, jobRequirements);
//     if (relevant.length > 0) {
//       console.log("Found relevant alternative in bank");
//       await prisma.jobQuestion.update({
//         where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
//         data:  { questionId: alternative.id },
//       });
//       return alternative;
//     }
//     console.log("Bank alternative found but not relevant to job — generating new one");
//   }

//   // Fetch existing questions for similarity check
//   const existingQuestions = await prisma.questionBank.findMany({
//     where:  { jobQuestions: { some: { jobId } } },
//     select: { question: true }
//   });

//   // Pre-extract significant words from all existing questions for faster comparison
//   const existingSignificantWords = existingQuestions.map(q => ({
//     question: q.question,
//     words: getSignificantWords(q.question)
//   }));

//   // ─── Generate with full job context ──────────────────────────
//   const MAX_RETRIES = 10;
//   let saved = null;
// for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

//     const existingSummary = existingQuestions
//       .slice(0, 10)
//       .map(q => `- ${q.question}`)
//       .join("\n");

//     const prompt = `You are a technical interviewer. Generate 1 replacement interview question for this specific job.

// Job Title: ${jobTitle}
// Job Description: ${jobDesc}
// Key Skills: ${keywords.join(", ")}
// Requirements: ${jobRequirements.slice(0, 5).join(", ")}

// Difficulty: ${oldQuestion.difficulty}
// Tags to stay close to: ${oldQuestion.tags.join(", ")}

// STRICT RULES:
// 1. The question MUST be directly relevant to this job — not generic
// 2. Difficulty MUST stay: ${oldQuestion.difficulty}
// 3. Tags MUST include at least one of: ${keywords.slice(0, 5).join(", ")}
// 4. The question MUST be completely different in topic and wording from ALL questions below:
// ${existingSummary}
// 5. Do NOT ask about the same concept as: "${oldQuestion.question}"
// 6. Pick a DIFFERENT skill or sub-topic from the job requirements — not the same one as the replaced question

// Return ONLY a JSON object:
// {
//   "question": "...",
//   "difficulty": "${oldQuestion.difficulty}",
//   "category": "Technical" | "Behavioral" | "Situational" | "HR",
//   "tags": ["tag1", "tag2", ...],
//   "briefAnswer": "one sentence"
// }
// No markdown, no explanation.`;

//     const result = await groq.chat.completions.create({
//       model:       "llama-3.3-70b-versatile",
//       messages:    [{ role: "user", content: prompt }],
//       temperature: Math.min(0.9 + (attempt * 0.02), 1.2),
//     });

//     const raw = result.choices[0].message.content.trim()
//       .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

//     let newQ;
//     try {
//       newQ = JSON.parse(raw);
//     } catch {
//       console.log(`Attempt ${attempt}: Failed to parse JSON, retrying...`);
//       continue;
//     }

//     // ─── Log generated question for debugging ─────────────────────
//     console.log(`Attempt ${attempt} generated: "${newQ.question}" [tags: ${newQ.tags?.join(", ")}]`);

//     // ─── Similarity check ─────────────────────────────────────────
//     const isDuplicate = existingSignificantWords.some(({ words }) => {
//       const newWords = getSignificantWords(newQ.question);
//       const smaller  = Math.min(words.size, newWords.size);
//       if (smaller === 0) return false;
//       let overlap = 0;
//       for (const w of newWords) { if (words.has(w)) overlap++; }
//       return (overlap / smaller) >= 0.6;
//     });

//     if (isDuplicate) {
//       console.log(`Attempt ${attempt}: Too similar to existing question, retrying...`);
//       continue;
//     }

//     // ─── Lenient relevance check for regeneration ─────────────────
//     // Give generated question a fake id for filterRelevantQuestions
//     const questionWithId = { ...newQ, id: -1 };
//     const relevanceCheck = await filterRelevantQuestions(
//       [questionWithId],
//       jobTitle,
//       jobDesc,
//       jobRequirements,
//       false  // lenient mode
//     );

//     if (relevanceCheck.length === 0) {
//       console.log(`Attempt ${attempt}: Not relevant to job, retrying... (question was: "${newQ.question}")`);
//       continue;
//     }

//     // ─── Save and link ─────────────────────────────────────────────
//     saved = await prisma.questionBank.upsert({
//       where:  { question: newQ.question },
//       update: {},
//       create: { ...newQ },
//     });

//     console.log(`Generated relevant unique question on attempt ${attempt}`);
//     break;
//   }

// //   for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {

// //     // Pass existing questions to LLM so it avoids them directly
// //     const existingSummary = existingQuestions
// //       .slice(0, 10) // don't blow up the prompt
// //       .map(q => `- ${q.question}`)
// //       .join("\n");

// //     const prompt = `You are a technical interviewer. Generate 1 replacement interview question for this specific job.

// // Job Title: ${jobTitle}
// // Job Description: ${jobDesc}
// // Key Skills: ${keywords.join(", ")}
// // Requirements: ${jobRequirements.slice(0, 5).join(", ")}

// // Difficulty: ${oldQuestion.difficulty}
// // Tags to stay close to: ${oldQuestion.tags.join(", ")}

// // STRICT RULES:
// // 1. The question MUST be directly relevant to this job — not generic
// // 2. Difficulty MUST stay: ${oldQuestion.difficulty}
// // 3. Tags MUST include at least one of: ${keywords.slice(0, 5).join(", ")}
// // 4. The question MUST be completely different in topic and wording from ALL questions below:
// // ${existingSummary}
// // 5. Do NOT ask about the same concept as: "${oldQuestion.question}"
// // 6. Pick a DIFFERENT skill or sub-topic from the job requirements — not the same one as the replaced question

// // Return ONLY a JSON object:
// // {
// //   "question": "...",
// //   "difficulty": "${oldQuestion.difficulty}",
// //   "category": "Technical" | "Behavioral" | "Situational" | "HR",
// //   "tags": ["tag1", "tag2", ...],
// //   "briefAnswer": "one sentence"
// // }
// // No markdown, no explanation.`;

// //     const result = await groq.chat.completions.create({
// //       model:       "llama-3.3-70b-versatile",
// //       messages:    [{ role: "user", content: prompt }],
// //       temperature: 0.9 + (attempt * 0.02), // increase creativity each retry
// //     });

// //     const raw = result.choices[0].message.content.trim()
// //       .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

// //     let newQ;
// //     try {
// //       newQ = JSON.parse(raw);
// //     } catch {
// //       console.log(`Attempt ${attempt}: Failed to parse JSON, retrying...`);
// //       continue;
// //     }

// //     // ─── Relaxed similarity check (0.6 instead of 0.4) ───────────
// //     const isDuplicate = existingSignificantWords.some(({ words }) => {
// //       const newWords = getSignificantWords(newQ.question);
// //       const smaller  = Math.min(words.size, newWords.size);
// //       if (smaller === 0) return false;
// //       let overlap = 0;
// //       for (const w of newWords) { if (words.has(w)) overlap++; }
// //       return (overlap / smaller) >= 0.6; // raised from 0.4 → 0.6
// //     });

// //     if (isDuplicate) {
// //       console.log(`Attempt ${attempt}: Too similar to existing question, retrying...`);
// //       continue;
// //     }

// //     // ─── Relevance check ─────────────────────────────────────────
// //     const relevanceCheck = await filterRelevantQuestions([newQ], jobTitle, jobDesc, jobRequirements);
// //     if (relevanceCheck.length === 0) {
// //       console.log(`Attempt ${attempt}: Not relevant to job, retrying...`);
// //       continue;
// //     }

// //     // ─── Save and link ────────────────────────────────────────────
// //     saved = await prisma.questionBank.upsert({
// //       where:  { question: newQ.question },
// //       update: {},
// //       create: { ...newQ },
// //     });

// //     console.log(`Generated relevant unique question on attempt ${attempt}`);
// //     break;
// //   }

//   if (!saved) {
//     throw new Error("Failed to generate a unique relevant question after maximum retries");
//   }

//   await prisma.jobQuestion.update({
//     where: { jobId_questionId: { jobId, questionId: oldQuestionId } },
//     data:  { questionId: saved.id },
//   });

//   return saved;
// }
// module.exports = {
//   populateJobQuestions,
//   regenerateQuestion,
// };


const { PrismaClient } = require("@prisma/client");
const Groq = require("groq-sdk");
const { extractKeywords } = require("./extractKeywordsService");

const prisma = new PrismaClient();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const QUESTIONS_PER_DIFFICULTY = 5;

// ─── Helper: extract significant words for similarity comparison ──
function getSignificantWords(text) {
  const stopWords = new Set([
    "what", "is", "the", "a", "an", "of", "in", "and", "or", "how",
    "do", "does", "can", "you", "for", "to", "are", "with", "this",
    "that", "your", "explain", "describe", "define", "give", "between"
  ]);
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
  );
}

// ─── Helper: deduplicate weighted keywords by name ────────────────
function dedupeKeywords(weightedKeywords) {
  const map = new Map();
  weightedKeywords.forEach(k => {
    if (!map.has(k.name) || map.get(k.name).weight < k.weight) {
      map.set(k.name, k);
    }
  });
  return Array.from(map.values());
}

// ─── Helper: convert keyword names to weighted format ─────────────
function convertToWeightedKeywords(keywords) {
  return keywords.map((k, index) => ({
    name:   k,
    weight: keywords.length - index,
  }));
}

// ─── Helper: check if two questions are too similar ───────────────
function isTooSimilar(q1, q2, threshold = 0.6) {
  const words1  = getSignificantWords(q1);
  const words2  = getSignificantWords(q2);
  const smaller = Math.min(words1.size, words2.size);
  if (smaller === 0) return false;
  let overlap = 0;
  for (const w of words1) { if (words2.has(w)) overlap++; }
  return (overlap / smaller) >= threshold;
}

// ─── Helper: filter out similar questions, keeping first unique ───
function deduplicateQuestions(questions, limit) {
  const picked = [];
  for (const q of questions) {
    if (picked.length >= limit) break;
    const isDuplicate = picked.some(p => isTooSimilar(p.question, q.question));
    if (!isDuplicate) picked.push(q);
  }
  return picked;
}

// ─── Helper: check candidate against existing for similarity ──────
function isQuestionDuplicate(newQuestion, existingSignificantWords) {
  const newWords = getSignificantWords(newQuestion);
  return existingSignificantWords.some(({ words }) => {
    const smaller = Math.min(words.size, newWords.size);
    if (smaller === 0) return false;
    let overlap = 0;
    for (const w of newWords) { if (words.has(w)) overlap++; }
    return (overlap / smaller) >= 0.6;
  });
}

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
  populateJobQuestions,
  regenerateQuestion,
};
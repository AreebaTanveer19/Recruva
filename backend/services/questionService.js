// const { PrismaClient } = require("@prisma/client");
// const prisma = new PrismaClient();

// // Get all questions for a job grouped by difficulty

// // async function getJobQuestions(jobId) {
// //   const questions = await prisma.jobQuestion.findMany({
// //     where:   { jobId },
// //     include: { question: true },
// //   });

// //   return {
// //     easy:   questions.filter(q => q.question.difficulty === "easy").map(q => ({ ...q.question, status: q.status, jobQuestionId: q.id })),
// //     medium: questions.filter(q => q.question.difficulty === "medium").map(q => ({ ...q.question, status: q.status, jobQuestionId: q.id })),
// //     hard:   questions.filter(q => q.question.difficulty === "hard").map(q => ({ ...q.question, status: q.status, jobQuestionId: q.id })),
// //     total:  questions.length,
// //   };
// // }

// async function getJobQuestions(jobId) {
//   const job = await prisma.job.findUnique({
//     where:  { id: jobId },
//     select: { keywords: true }
//   });

//   const questions = await prisma.jobQuestion.findMany({
//     where:   { jobId },
//     include: { question: true },
//   });

//   const grouped = {};

//   for (const q of questions) {
//     const questionData = {
//       ...q.question,
//       status:        q.status,
//       jobQuestionId: q.id
//     };

//     // Find the first tag that matches job keywords
//     const matchedKeyword = q.question.tags.find(tag =>
//       job.keywords.map(k => k.toLowerCase()).includes(tag.toLowerCase())
//     );

//     // Fallback to first tag if no keyword match
//     const groupKey = (matchedKeyword || q.question.tags[0] || "general").toLowerCase();

//     if (!grouped[groupKey]) grouped[groupKey] = [];
//     grouped[groupKey].push(questionData);
//   }

//   // Step 1: Calculate limit per tag
// const totalQuestions = questions.length;
// const totalTags = Object.keys(grouped).length;
// const MAX_PER_TAG = Math.ceil(totalQuestions / totalTags);

// // Step 2: Balance grouped questions
// const balancedGrouped = {};

// for (const tag in grouped) {
//   balancedGrouped[tag] = grouped[tag].slice(0, MAX_PER_TAG);
// }
// return { grouped: balancedGrouped, total: questions.length };
//   // return { grouped, total: questions.length };
// }

// // Keep a question

// async function keepQuestion(jobId, questionId) {
//   return prisma.jobQuestion.update({
//     where: { jobId_questionId: { jobId, questionId } },
//     data:  { status: "save" },
//   });
// }

// module.exports = {
//   getJobQuestions,
//   keepQuestion,
// };


const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const TARGET_PER_TAG = 4;
const difficultyOrder = { easy: 0, medium: 1, hard: 2 };

const sortByDifficulty = (arr) =>
  [...arr].sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

async function getJobQuestions(jobId) {
  const job = await prisma.job.findUnique({
    where:  { id: jobId },
    select: { keywords: true },
  });

  const questions = await prisma.jobQuestion.findMany({
    where:   { jobId },
    include: { question: true },
  });

  const grouped = {};

  for (const q of questions) {
    const questionData = {
      ...q.question,
      status:        q.status,
      jobQuestionId: q.id,
    };
// WITH this:
const jobKeywordsLower = job.keywords.map((k) => k.toLowerCase());

// Match by keyword priority (job keywords order) not tag order
const matchedKeyword = jobKeywordsLower.find((keyword) =>
  q.question.tags.map((t) => t.toLowerCase()).includes(keyword)
);

const groupKey = (matchedKeyword || q.question.tags[0] || "general").toLowerCase();
    // const matchedKeyword = q.question.tags.find((tag) =>
    //   job.keywords.map((k) => k.toLowerCase()).includes(tag.toLowerCase())
    // );

    // const groupKey = (matchedKeyword || q.question.tags[0] || "general").toLowerCase();

    if (!grouped[groupKey]) grouped[groupKey] = [];
    grouped[groupKey].push(questionData);
  }

  // Step 1: Assign up to TARGET_PER_TAG to each tag, collect leftovers
  const balancedGrouped = {};
  const leftoverPool = [];

  for (const tag in grouped) {
    const sorted = sortByDifficulty(grouped[tag]);
    balancedGrouped[tag] = sorted.slice(0, TARGET_PER_TAG);
    leftoverPool.push(...sorted.slice(TARGET_PER_TAG));
  }

  // Step 2: Sort leftover pool by difficulty
  leftoverPool.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);

  // Step 3: Fill sparse tags from the leftover pool
  // for (const tag in balancedGrouped) {
  //   while (balancedGrouped[tag].length < TARGET_PER_TAG && leftoverPool.length > 0) {
  //     balancedGrouped[tag].push(leftoverPool.shift());
  //   }
  // }
  // Step 3: Fill sparse tags — only pull relevant leftovers
  for (const tag in balancedGrouped) {
    const relevantLeftovers = leftoverPool.filter(q =>
      q.tags.some(t =>
        job.keywords.map(k => k.toLowerCase()).includes(t.toLowerCase())
      )
    );

    while (balancedGrouped[tag].length < TARGET_PER_TAG && relevantLeftovers.length > 0) {
      const next = relevantLeftovers.shift();
      leftoverPool.splice(leftoverPool.indexOf(next), 1);
      balancedGrouped[tag].push(next);
    }
  }

  const total = Object.values(balancedGrouped).reduce((sum, g) => sum + g.length, 0);

  return { grouped: balancedGrouped, total };
}

async function keepQuestion(jobId, questionId) {
  return prisma.jobQuestion.update({
    where: { jobId_questionId: { jobId, questionId } },
    data:  { status: "save" },
  });
}

module.exports = {
  getJobQuestions,
  keepQuestion,
};
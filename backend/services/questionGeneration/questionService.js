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

    const jobKeywordsLower = job.keywords.map((k) => k.toLowerCase());

    const matchedKeyword = jobKeywordsLower.find((keyword) =>
      q.question.tags.map((t) => t.toLowerCase()).includes(keyword)
    );

    const groupKey = (matchedKeyword || q.question.tags[0] || "general").toLowerCase();

    if (!grouped[groupKey]) grouped[groupKey] = [];
    grouped[groupKey].push(questionData);
  }

  const balancedGrouped = {};
  for (const tag in grouped) {
    balancedGrouped[tag] = sortByDifficulty(grouped[tag]);
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
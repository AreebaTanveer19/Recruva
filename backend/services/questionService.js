const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Get all questions for a job grouped by difficulty

async function getJobQuestions(jobId) {
  const questions = await prisma.jobQuestion.findMany({
    where:   { jobId },
    include: { question: true },
  });

  return {
    easy:   questions.filter(q => q.question.difficulty === "easy").map(q => ({ ...q.question, status: q.status, jobQuestionId: q.id })),
    medium: questions.filter(q => q.question.difficulty === "medium").map(q => ({ ...q.question, status: q.status, jobQuestionId: q.id })),
    hard:   questions.filter(q => q.question.difficulty === "hard").map(q => ({ ...q.question, status: q.status, jobQuestionId: q.id })),
    total:  questions.length,
  };
}

// Keep a question

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
const { populateJobQuestions, regenerateQuestion } = require("../services/questionGenerationService");
const {getJobQuestions} = require("../services/questionService")
const prisma = require("../config/db");
const generateQuestions = async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);

    // Check if questions already generated for this job
    const existing = await prisma.jobQuestion.count({
      where: { jobId }
    });

    if (existing > 0) {
      // Already generated — just return them
      const { getJobQuestions } = require("../services/questionService");
      const questions = await getJobQuestions(jobId);
      return res.status(200).json({
        message:   "Questions already generated",
        questions,
      });
    }

    // Get job details for generation
    const job = await prisma.job.findUnique({
      where:   { id: jobId },
      include: { details: true }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    if (!job.details) {
      return res.status(400).json({ error: "Job details not found" });
    }

    // Generate questions
    const questions = await populateJobQuestions(
      job.id,
      job.title,
      job.details.description,
      job.details.requirements
    );

    const { getJobQuestions } = require("../services/questionService");
    const grouped = await getJobQuestions(jobId);

    res.status(200).json({
      message:   "Questions generated successfully",
      questions: grouped,
    });

  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({ error: "Failed to generate questions" });
  }
};

// DELETE /jobs/:jobId/questions/:questionId
const deleteQuestion = async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);
    const questionId = parseInt(req.params.questionId);

    const jobQuestion = await prisma.jobQuestion.findUnique({
      where: { jobId_questionId: { jobId, questionId } },
    });

    if (!jobQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    await prisma.jobQuestion.delete({
      where: { jobId_questionId: { jobId, questionId } },
    });

    res.status(200).json({ message: "Question deleted successfully" });

  } catch (error) {
    console.error("Error deleting question:", error);
    res.status(500).json({ error: "Failed to delete question" });
  }
};

// PUT /jobs/:jobId/questions/:questionId/regenerate
const regenerateQuestionController = async (req, res) => {
  try {
    const jobId = parseInt(req.params.jobId);
    const questionId = parseInt(req.params.questionId);

    const jobQuestion = await prisma.jobQuestion.findUnique({
      where: { jobId_questionId: { jobId, questionId } },
      include: { job: { include: { details: true } } },
    });

    if (!jobQuestion) {
      return res.status(404).json({ error: "Question not found" });
    }

    if (!jobQuestion.job.details) {
      return res.status(400).json({ error: "Job details not found" });
    }

    const newQuestion = await regenerateQuestion(
      jobId,
      questionId,
      jobQuestion.job.details.description,
      jobQuestion.job.details.requirements
    );

    res.status(200).json({ message: "Question regenerated successfully", question: newQuestion });

  } catch (error) {
    console.error("Error regenerating question:", error);
    res.status(500).json({ error: "Failed to regenerate question" });
  }
};

module.exports = { generateQuestions, deleteQuestion, regenerateQuestion: regenerateQuestionController };

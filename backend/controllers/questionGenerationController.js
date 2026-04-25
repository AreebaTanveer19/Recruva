/**
 * questionGenerationController.js
 *
 * Fixes applied:
 *   #2  — shared Prisma singleton via config/db
 *   #8  — input validation: isNaN() checks before any DB call
 *   #9  — all imports at top; no duplicate require() inside function bodies
 *   #10 — specific error messages: 400 for known bad states, detail field on 500s
 */

const prisma                   = require("../config/db");
const { populateJobQuestions } = require("../services/questionGeneration/questionGenerationService");
const { regenerateQuestion }   = require("../services/questionGeneration/regenerateQuestionService");
const { getJobQuestions }      = require("../services/questionGeneration/questionService");

// POST /jobs/:jobId/questions/generate
const generateQuestions = async (req, res) => {
  try {
    // Fix #8: validate before touching the DB — parseInt("abc") = NaN
    const jobId = parseInt(req.params.jobId);
    if (isNaN(jobId)) {
      return res.status(400).json({ error: "Invalid jobId — must be a number" });
    }

    // Return cached questions if already generated for this job
    const existing = await prisma.jobQuestion.count({ where: { jobId } });
    if (existing > 0) {
      const questions = await getJobQuestions(jobId);
      return res.status(200).json({ message: "Questions already generated", questions });
    }

    const job = await prisma.job.findUnique({
      where:   { id: jobId },
      include: { details: true },
    });

    // Fix #10: specific 400s so the caller knows exactly what to fix
    if (!job)                               return res.status(404).json({ error: "Job not found" });
    if (!job.details)                       return res.status(400).json({ error: "Job details missing — add a description and requirements first" });
    if (!job.details.description?.trim())   return res.status(400).json({ error: "Job description is empty" });

    await populateJobQuestions(
      job.id,
      job.title,
      job.details.description,
      job.details.requirements ?? []
    );

    const grouped = await getJobQuestions(jobId);
    return res.status(200).json({ message: "Questions generated successfully", questions: grouped });

  } catch (error) {
    console.error("generateQuestions error:", error);
    res.status(500).json({ error: "Failed to generate questions", detail: error.message });
  }
};

// DELETE /jobs/:jobId/questions/:questionId
const deleteQuestion = async (req, res) => {
  try {
    // Fix #8
    const jobId      = parseInt(req.params.jobId);
    const questionId = parseInt(req.params.questionId);
    if (isNaN(jobId) || isNaN(questionId)) {
      return res.status(400).json({ error: "Invalid IDs — jobId and questionId must be numbers" });
    }

    const exists = await prisma.jobQuestion.findUnique({
      where: { jobId_questionId: { jobId, questionId } },
    });
    if (!exists) return res.status(404).json({ error: "Question not linked to this job" });

    await prisma.jobQuestion.delete({
      where: { jobId_questionId: { jobId, questionId } },
    });

    res.status(200).json({ message: "Question deleted successfully" });

  } catch (error) {
    console.error("deleteQuestion error:", error);
    res.status(500).json({ error: "Failed to delete question", detail: error.message });
  }
};

// PUT /jobs/:jobId/questions/:questionId/regenerate
const regenerateQuestionController = async (req, res) => {
  try {
    // Fix #8
    const jobId      = parseInt(req.params.jobId);
    const questionId = parseInt(req.params.questionId);
    if (isNaN(jobId) || isNaN(questionId)) {
      return res.status(400).json({ error: "Invalid IDs — jobId and questionId must be numbers" });
    }

    const jobQuestion = await prisma.jobQuestion.findUnique({
      where:   { jobId_questionId: { jobId, questionId } },
      include: { job: { include: { details: true } } },
    });

    if (!jobQuestion)             return res.status(404).json({ error: "Question not linked to this job" });
    if (!jobQuestion.job.details) return res.status(400).json({ error: "Job details missing" });

    const newQuestion = await regenerateQuestion(
      jobId,
      questionId,
      jobQuestion.job.details.description,
      jobQuestion.job.details.requirements ?? []
    );

    res.status(200).json({ message: "Question regenerated successfully", question: newQuestion });

  } catch (error) {
    console.error("regenerateQuestion error:", error);
    res.status(500).json({ error: "Failed to regenerate question", detail: error.message });
  }
};

// Fix #9: export using the correct name — old code exported regenerateQuestion
// pointing to the controller but named after the service function, which was confusing
module.exports = {
  generateQuestions,
  deleteQuestion,
  regenerateQuestion: regenerateQuestionController,
};

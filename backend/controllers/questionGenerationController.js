const { populateJobQuestions } = require("../services/questionGenerationService");
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

module.exports = {generateQuestions };
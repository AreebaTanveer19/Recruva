const prisma = require('../config/db');

const validateScoringConfig = ({ skillsWeight, experienceWeight, educationWeight, considerCGPA, minCGPA }) => {
  // 1. All weights must be present
  if (skillsWeight === undefined || experienceWeight === undefined || educationWeight === undefined) {
    throw new Error("All three weights (skillsWeight, experienceWeight, educationWeight) are required");
  }

  // 2. Each weight must be a number between 0 and 1
  const weights = { skillsWeight, experienceWeight, educationWeight };
  for (const [key, val] of Object.entries(weights)) {
    if (typeof val !== "number" || val < 0 || val > 1) {
      throw new Error(`${key} must be a number between 0.0 and 1.0`);
    }
  }

  // 3. Weights must sum to 1.0
  const weightSum = skillsWeight + experienceWeight + educationWeight;
  if (Math.abs(weightSum - 1.0) > 0.001) {
    throw new Error(`Weights must sum to 1.0, got ${weightSum.toFixed(3)}`);
  }

  // 4. CGPA logic
  if (considerCGPA) {
    if (minCGPA === null || minCGPA === undefined) {
      throw new Error("minCGPA is required when considerCGPA is true");
    }
    if (typeof minCGPA !== "number" || minCGPA < 0 || minCGPA > 4.0) {
      throw new Error("minCGPA must be a number between 0.0 and 4.0");
    }
  }
};


// POST /jobs/:jobId/scoring-config
const createScoringConfig = async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);
    const {
      skillsWeight,
      experienceWeight,
      educationWeight,
      considerCGPA = false,
      minCGPA = null,
    } = req.body;

    // Check job exists
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Check config doesn't already exist
    const existing = await prisma.jobScoringConfig.findUnique({ where: { jobId } });
    if (existing) {
      return res.status(409).json({ error: "Scoring config already exists for this job. Use PUT to update it." });
    }

    // Validate
    try {
      validateScoringConfig({ skillsWeight, experienceWeight, educationWeight, considerCGPA, minCGPA });
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const config = await prisma.jobScoringConfig.create({
      data: {
        jobId,
        skillsWeight,
        experienceWeight,
        educationWeight,
        considerCGPA,
        minCGPA: considerCGPA ? minCGPA : null,
      },
    });

    res.status(201).json({
      message: "Scoring config created successfully",
      config,
    });
  } catch (error) {
    console.error("Error creating scoring config:", error);
    res.status(500).json({ error: "Failed to create scoring config" });
  }
};


// GET /jobs/:jobId/scoring-config
const getScoringConfig = async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);

    const config = await prisma.jobScoringConfig.findUnique({ where: { jobId } });
    if (!config) {
      return res.status(404).json({ error: "No scoring config found for this job" });
    }

    res.status(200).json({
      message: "Scoring config retrieved successfully",
      config,
    });
  } catch (error) {
    console.error("Error fetching scoring config:", error);
    res.status(500).json({ error: "Failed to fetch scoring config" });
  }
};


// PUT /jobs/:jobId/scoring-config
const updateScoringConfig = async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);

    // Check config exists
    const existing = await prisma.jobScoringConfig.findUnique({ where: { jobId } });
    if (!existing) {
      return res.status(404).json({ error: "No scoring config found for this job. Use POST to create one." });
    }

    // Merge incoming fields with existing values so partial updates still pass validation
    const merged = {
      skillsWeight:     req.body.skillsWeight     ?? existing.skillsWeight,
      experienceWeight: req.body.experienceWeight ?? existing.experienceWeight,
      educationWeight:  req.body.educationWeight  ?? existing.educationWeight,
      considerCGPA:     req.body.considerCGPA     ?? existing.considerCGPA,
      minCGPA:          req.body.minCGPA          ?? existing.minCGPA,
    };

    // Validate merged result
    try {
      validateScoringConfig(merged);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    const config = await prisma.jobScoringConfig.update({
      where: { jobId },
      data: {
        ...merged,
        minCGPA: merged.considerCGPA ? merged.minCGPA : null, // clear minCGPA if considerCGPA turned off
      },
    });

    res.status(200).json({
      message: "Scoring config updated successfully",
      config,
    });
  } catch (error) {
    console.error("Error updating scoring config:", error);
    res.status(500).json({ error: "Failed to update scoring config" });
  }
};


// DELETE /jobs/:jobId/scoring-config
const deleteScoringConfig = async (req, res) => {
  try {
    const jobId = Number(req.params.jobId);

    const existing = await prisma.jobScoringConfig.findUnique({ where: { jobId } });
    if (!existing) {
      return res.status(404).json({ error: "No scoring config found for this job" });
    }

    await prisma.jobScoringConfig.delete({ where: { jobId } });

    res.status(200).json({ message: "Scoring config deleted successfully" });
  } catch (error) {
    console.error("Error deleting scoring config:", error);
    res.status(500).json({ error: "Failed to delete scoring config" });
  }
};


module.exports = { createScoringConfig, getScoringConfig, updateScoringConfig, deleteScoringConfig };
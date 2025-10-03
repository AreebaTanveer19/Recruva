const prisma = require("../config/db");

const createJob = async (req, res) => {
  try {
    const {
      title,
      department,
      location,
      employmentType,
      workMode,
      description,
      requirements,
      responsibilities,
      qualifications,
      experienceLevel,
      salaryMin,
      salaryMax,
      deadline
    } = req.body;

    const userId = req.user.id; 

    const job = await prisma.job.create({
      data: {
        title,
        department,
        location,
        employmentType,
        workMode,
        description,
        requirements,
        responsibilities,
        qualifications,
        experienceLevel,
        salaryMin,
        salaryMax,
        deadline,
        createdBy: userId, 
      },
    });

    res.status(201).json({
      message: "Job created successfully and is pending approval",
      job,
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
};

module.exports = { createJob };

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

const getPendingJobs = async (req, res) => {
  try {
    const pendingJobs = await prisma.job.findMany({
      where: { status: "Pending" },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Pending jobs retrieved successfully",
      jobs: pendingJobs,
    });
  } catch (error) {
    console.error("Error fetching pending jobs:", error);
    res.status(500).json({ error: "Failed to fetch pending jobs" });
  }
};


const getOpenJobs = async (req, res) => {
  try {
    const openJobs = await prisma.job.findMany({
      where: { status: "Open" },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      message: "Open jobs retrieved successfully",
      jobs: openJobs,
    });
  } catch (error) {
    console.error("Error fetching open jobs:", error);
    res.status(500).json({ error: "Failed to fetch open jobs" });
  }
};

module.exports =  { createJob, getPendingJobs, getOpenJobs };
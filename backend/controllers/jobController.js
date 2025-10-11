const prisma = require("../config/db");

const createJob = async (req, res) => {
  try {
    const userId = req.user.id; 
    const {
      title,
      department,
      location,
      employmentType,
      workMode,
      status,
      deadline,
      description,
      requirements,
      responsibilities,
      experienceLevel,
      salaryMin,
      salaryMax
    } = req.body;

    const job = await prisma.job.create({
      data: {
        title,
        department,
        location,
        employmentType,
        workMode,
        status: status || "Open",
        createdBy: userId,
        deadline: deadline ? new Date(deadline) : null,
        details: {
          create: {
            description,
            requirements,
            responsibilities,
            experienceLevel: Number(experienceLevel),
            salaryMin: Number(salaryMin),
            salaryMax: Number(salaryMax),
          }
        }
      },
      include: { details: true } 
    });

    res.status(201).json({
      message: "Job created successfully",
      job
    });
  } catch (error) {
    console.error("Error creating job:", error);
    res.status(500).json({ error: "Failed to create job" });
  }
};


const getOpenJobs = async (req, res) => {
  try {
    const openJobs = await prisma.job.findMany({
      where: { status: "Open" },
      orderBy: { createdAt: "desc" },
      include: {
        details: true, 
      },
    });

    const jobsWithFlatDetails = openJobs.map(job => {
      if (job.details) {
        const { details, ...jobWithoutDetails } = job;
        return { ...jobWithoutDetails, ...details };
      }
      return job;
    });

    res.status(200).json({
      message: "Open jobs retrieved successfully",
      jobs: jobsWithFlatDetails,
    });
  } catch (error) {
    console.error("Error fetching open jobs:", error);
    res.status(500).json({ error: "Failed to fetch open jobs" });
  }
};


const getJobsPostedByHR = async (req, res) => {
  try {
    const hrId = req.user.id;

    const jobs = await prisma.job.findMany({
      where: {
        posters: {
          some: { id: hrId },
        },
      },
      include: { details: true },
      orderBy: { createdAt: "desc" },
    });

    const flattenedJobs = jobs.map(job => ({
      ...job,
      description: job.details?.description,
      requirements: job.details?.requirements,
      responsibilities: job.details?.responsibilities,
      experienceLevel: job.details?.experienceLevel,
      salaryMin: job.details?.salaryMin,
      salaryMax: job.details?.salaryMax,
      details: undefined, 
    }));

    res.status(200).json({
      message: "Jobs already posted by you",
      jobs: flattenedJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs posted by HR:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};


const getJobsPendingForHR = async (req, res) => {
  try {
    const hrId = req.user.id;

    const jobs = await prisma.job.findMany({
      where: {
        posters: {
          none: { id: hrId },
        },
      },
      include: { details: true },
      orderBy: { createdAt: "desc" },
    });

    
    const flattenedJobs = jobs.map(job => ({
      ...job,
      description: job.details?.description,
      requirements: job.details?.requirements,
      responsibilities: job.details?.responsibilities,
      experienceLevel: job.details?.experienceLevel,
      salaryMin: job.details?.salaryMin,
      salaryMax: job.details?.salaryMax,
      details: undefined,
    }));

    res.status(200).json({
      message: "Jobs pending for your posting",
      jobs: flattenedJobs,
    });
  } catch (error) {
    console.error("Error fetching jobs pending for HR:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

const addJobPoster = async (req, res) => {
  try {
    const { jobId, userId } = req.body;

    if (!jobId || !userId) {
      return res.status(400).json({ error: "Job ID and User ID are required" });
    }

    const existingJob = await prisma.job.findUnique({
      where: { id: jobId },
      include: { posters: true, details: true },
    });

    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

    const alreadyPoster = existingJob.posters.some((poster) => poster.id === userId);
    if (alreadyPoster) {
      return res.status(400).json({ error: "User is already a poster for this job" });
    }

    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        posters: { connect: { id: userId } },
      },
      include: { posters: true, details: true },
    });

    const flattenedJob = {
      ...updatedJob,
      description: updatedJob.details?.description,
      requirements: updatedJob.details?.requirements,
      responsibilities: updatedJob.details?.responsibilities,
      experienceLevel: updatedJob.details?.experienceLevel,
      salaryMin: updatedJob.details?.salaryMin,
      salaryMax: updatedJob.details?.salaryMax,
      details: undefined,
    };

    res.status(200).json({
      message: "Job poster added successfully",
      job: flattenedJob,
    });
  } catch (error) {
    console.error("Error adding job poster:", error);
    res.status(500).json({ error: "Failed to add job poster" });
  }
};




module.exports =  { createJob, getOpenJobs, getJobsPostedByHR, getJobsPendingForHR, addJobPoster };
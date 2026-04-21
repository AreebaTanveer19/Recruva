const prisma = require('../config/db');
const { extractKeywords } = require("../services/questionGeneration/extractKeywordsService");
const { storeJobEmbeddings } = require('../services/scoring/qdrantService');

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
      salaryMax,
      minDegreeLevel,
      requiredDegrees
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
            minDegreeLevel: minDegreeLevel || "BSC",
            requiredDegrees: requiredDegrees || [],
          }
        }
      },
      include: { details: true }
    });

    const keywordObjects = await extractKeywords(
  job.title,
  job.details.description,
  job.details.requirements
);

const keywordNames = keywordObjects.map(k => k.name);

await prisma.job.update({
  where: { id: job.id },
  data: { keywords: keywordNames }
});

storeJobEmbeddings(job).catch(err =>
  console.error('Failed to store job embeddings:', err)
);


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
      minDegreeLevel: job.details?.minDegreeLevel,
      requiredDegrees: job.details?.requiredDegrees,
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
      minDegreeLevel: job.details?.minDegreeLevel,
      requiredDegrees: job.details?.requiredDegrees,
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
      minDegreeLevel: updatedJob.details?.minDegreeLevel,
      requiredDegrees: updatedJob.details?.requiredDegrees,
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

const getJobById = async (req, res) => {
  const { id } = req.params;

  try {
    const job = await prisma.job.findUnique({
      where: { id: parseInt(id) },
      include: {
        details: true, 
      },
    });

    if (!job) {
      return res.status(404).json({ message: "Job not found" });
    }

    // Flatten details
    const jobWithFlatDetails = job.details
      ? { ...job, ...job.details, details: undefined }
      : job;

    res.status(200).json({
      message: "Job retrieved successfully",
      job: jobWithFlatDetails,
    });
  } catch (error) {
    console.error("Error fetching job:", error);
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

const editJob = async (req, res) => {
  try {
    const { jobId } = req.params;

    const existingJob = await prisma.job.findUnique({
      where: { id: Number(jobId) },
      include: { details: true }
    });

    if (!existingJob) {
      return res.status(404).json({ error: "Job not found" });
    }

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
      salaryMax,
      minDegreeLevel,
      requiredDegrees
    } = req.body;

    // ✅ Build dynamic update object
    const jobData = {};
    if (title !== undefined) jobData.title = title;
    if (department !== undefined) jobData.department = department;
    if (location !== undefined) jobData.location = location;
    if (employmentType !== undefined) jobData.employmentType = employmentType;
    if (workMode !== undefined) jobData.workMode = workMode;
    if (status !== undefined) jobData.status = status;
    if (deadline !== undefined) {
      jobData.deadline = deadline ? new Date(deadline) : null;
    }

    // ✅ Nested details update (only provided fields)
    const detailsData = {};
    if (description !== undefined) detailsData.description = description;
    if (requirements !== undefined) detailsData.requirements = requirements;
    if (responsibilities !== undefined) detailsData.responsibilities = responsibilities;
    if (experienceLevel !== undefined) detailsData.experienceLevel = Number(experienceLevel);
    if (salaryMin !== undefined) detailsData.salaryMin = Number(salaryMin);
    if (salaryMax !== undefined) detailsData.salaryMax = Number(salaryMax);
    if (minDegreeLevel !== undefined) detailsData.minDegreeLevel = minDegreeLevel;
    if (requiredDegrees !== undefined) detailsData.requiredDegrees = requiredDegrees;

    if (Object.keys(detailsData).length > 0) {
      jobData.details = {
        update: detailsData
      };
    }

    const updatedJob = await prisma.job.update({
      where: { id: Number(jobId) },
      data: jobData,
      include: { details: true }
    });


    if (title || description || requirements) {
     const keywordObjects = await extractKeywords(
  updatedJob.title,
  updatedJob.details.description,
  updatedJob.details.requirements
);


const keywordNames = keywordObjects.map(k => k.name);

await prisma.job.update({
  where: { id: updatedJob.id },
  data: { keywords: keywordNames }
});
    }
    const flattenedJob = {
      ...updatedJob,
      description: updatedJob.details?.description,
      requirements: updatedJob.details?.requirements,
      responsibilities: updatedJob.details?.responsibilities,
      experienceLevel: updatedJob.details?.experienceLevel,
      salaryMin: updatedJob.details?.salaryMin,
      salaryMax: updatedJob.details?.salaryMax,
      minDegreeLevel: updatedJob.details?.minDegreeLevel,
      requiredDegrees: updatedJob.details?.requiredDegrees,
      details: undefined,
    };

    res.status(200).json({
      message: "Job updated successfully",
      job: flattenedJob,
    });

  } catch (error) {
    console.error("Error updating job:", error);
    res.status(500).json({ error: "Failed to update job" });
  }
};

const getClosedJobs = async (req, res) => {
  try {
    const now = new Date();

    const closedJobs = await prisma.job.findMany({
      where: {
        OR: [
          { status: "Closed" },
          {
            deadline: {
              lt: now,
            },
          },
        ],
      },
      orderBy: { createdAt: "desc" },
      include: { details: true },
    });

    const jobsWithFlatDetails = closedJobs.map((job) => {
      if (job.details) {
        const { details, ...jobWithoutDetails } = job;
        return { ...jobWithoutDetails, ...details };
      }
      return job;
    });

    res.status(200).json({
      message: "Closed jobs retrieved successfully",
      jobs: jobsWithFlatDetails,
    });
  } catch (error) {
    console.error("Error fetching closed jobs:", error);
    res.status(500).json({ error: "Failed to fetch closed jobs" });
  }
};

module.exports =  { createJob, getOpenJobs, getJobsPostedByHR, getJobsPendingForHR, addJobPoster, editJob, getJobById, getClosedJobs };
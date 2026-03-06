const fs = require('fs').promises;
const path = require('path');
const prisma = require('../config/db');
const { extractTextFromFile } = require('../utils/fileParser');
const { parseCVWithLLM } = require('../services/llmService');

/**
 * Check if candidate has already applied to a job
 * GET /api/application/check-status/:jobId
 */
const checkApplicationStatus = async (req, res) => {
  try {
    const { jobId } = req.params;
    const candidateId = req.user.id;

    const existing = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId: parseInt(jobId),
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already applied to this job',
        canApply: false,
        application: existing,
      });
    }

    res.json({
      success: true,
      message: 'Not applied yet',
      canApply: true,
    });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check application status',
      error: error.message,
    });
  }
};

/**
 * Get all resumes for the authenticated candidate
 * GET /api/application/resumes
 */
const getCandidateResumes = async (req, res) => {
  try {
    const candidateId = req.user.id;

    const resumes = await prisma.resume.findMany({
      where: { candidateId },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        uploadedAt: true,
        parsedData: true,
      },
    });

    res.json({ success: true, data: resumes });
  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resumes',
      error: error.message,
    });
  }
};

/**
 * Apply with an existing resume
 * POST /api/application/apply/existing
 */
const applyWithExistingResume = async (req, res) => {
  try {
    const { jobId, resumeId } = req.body;
    const candidateId = req.user.id;

    if (!jobId || !resumeId) {
      return res.status(400).json({
        success: false,
        message: 'jobId and resumeId are required',
      });
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId: parseInt(jobId),
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already applied to this job',
      });
    }

    // Verify resume belongs to candidate
    const resume = await prisma.resume.findFirst({
      where: { id: parseInt(resumeId), candidateId },
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found',
      });
    }

    // Verify job exists and is open
    const job = await prisma.job.findFirst({
      where: { id: parseInt(jobId), status: 'Open' },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer accepting applications',
      });
    }

    // Create application
    const application = await prisma.application.create({
      data: {
        candidateId,
        jobId: parseInt(jobId),
        resumeId: parseInt(resumeId),
      },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
        job: {
          select: { id: true, title: true, department: true },
        },
        resume: {
          select: { id: true, originalName: true, uploadedAt: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    console.error('Error applying with existing resume:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Already applied to this job',
      });
    }
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message,
    });
  }
};

/**
 * Apply with a new resume upload
 * POST /api/application/apply/new
 */
const applyWithNewResume = async (req, res) => {
  try {
    const { jobId } = req.body;
    const candidateId = req.user.id;

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'jobId is required',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Resume file is required',
      });
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        candidateId_jobId: {
          candidateId,
          jobId: parseInt(jobId),
        },
      },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Already applied to this job',
      });
    }

    // Verify job exists and is open
    const job = await prisma.job.findFirst({
      where: { id: parseInt(jobId), status: 'Open' },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer accepting applications',
      });
    }

    // Parse the uploaded resume
    const filePath = path.join(__dirname, '..', req.file.path);
    const text = await extractTextFromFile(filePath, req.file.mimetype);
    const parsedData = await parseCVWithLLM(text);

    const validatedData = {
      basicInfo: parsedData.basicInfo || { name: '', email: '', phone: '', location: '' },
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : [],
    };

    // Create resume and application in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const resume = await tx.resume.create({
        data: {
          originalName: req.file.originalname,
          parsedData: validatedData,
          candidateId,
        },
      });

      const application = await tx.application.create({
        data: {
          candidateId,
          jobId: parseInt(jobId),
          resumeId: resume.id,
        },
        include: {
          candidate: {
            select: { id: true, name: true, email: true },
          },
          job: {
            select: { id: true, title: true, department: true },
          },
          resume: {
            select: { id: true, originalName: true, uploadedAt: true },
          },
        },
      });

      return application;
    });

    // Clean up uploaded file
    await fs.unlink(filePath).catch(console.error);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error applying with new resume:', error);

    // Clean up file on error
    if (req.file) {
      const filePath = path.join(__dirname, '..', req.file.path);
      await fs.unlink(filePath).catch(console.error);
    }

    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Already applied to this job',
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message,
    });
  }
};

/**
 * Get all applications for the authenticated candidate
 * GET /api/application/my-applications
 */
const getMyApplications = async (req, res) => {
  try {
    const candidateId = req.user.id;

    const applications = await prisma.application.findMany({
      where: { candidateId },
      orderBy: { appliedAt: 'desc' },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            department: true,
            location: true,
            employmentType: true,
            workMode: true,
            status: true,
            deadline: true,
          },
        },
        resume: {
          select: {
            id: true,
            originalName: true,
            uploadedAt: true,
          },
        },
      },
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message,
    });
  }
};

/**
 * Get all applications for a specific job (HR only)
 * GET /api/application/job/:jobId
 */
const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await prisma.application.findMany({
      where: { jobId: parseInt(jobId) },
      orderBy: { appliedAt: 'desc' },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
          },
        },
        resume: {
          select: {
            id: true,
            originalName: true,
            uploadedAt: true,
            parsedData: true,
          },
        },
      },
    });

    res.json({ success: true, data: applications });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications',
      error: error.message,
    });
  }
};

/**
 * Update application status (HR only)
 * PATCH /api/application/:id/status
 */
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const application = await prisma.application.findUnique({
      where: { id: parseInt(id) },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    const updated = await prisma.application.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        candidate: {
          select: { id: true, name: true, email: true },
        },
        job: {
          select: { id: true, title: true, department: true },
        },
        resume: {
          select: { id: true, originalName: true, uploadedAt: true },
        },
      },
    });

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: updated,
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message,
    });
  }
};

module.exports = {
  checkApplicationStatus,
  getCandidateResumes,
  applyWithExistingResume,
  applyWithNewResume,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
};

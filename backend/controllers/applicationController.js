const fs = require('fs').promises;
const path = require('path');
const prisma = require('../config/db');
const { parseCVWithLLM } = require('../services/llmService');
const {
  ingestUploadedResume,
  normalizeParsedResumeData,
  syncCandidateCvData,
  uploadProfileSnapshot,
} = require('../services/resumeIngestionService');
const { deleteResumeObject } = require('../services/supabaseStorageService');

async function cleanupLocalUpload(file) {
  if (!file?.path) {
    return;
  }

  const localPath = path.resolve(__dirname, '..', file.path);
  await fs.unlink(localPath).catch(() => {});
}

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
        pdfUrl: true,
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
          select: { id: true, originalName: true, pdfUrl: true, uploadedAt: true },
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
  let storagePath;

  try {
    const { jobId } = req.body;
    const candidateId = req.user.id;
    const parsedJobId = parseInt(jobId, 10);

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'jobId is required',
      });
    }

    if (Number.isNaN(parsedJobId)) {
      return res.status(400).json({
        success: false,
        message: 'jobId must be a valid number',
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
          jobId: parsedJobId,
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
      where: { id: parsedJobId, status: 'Open' },
    });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or no longer accepting applications',
      });
    }

    const ingestion = await ingestUploadedResume({
      file: req.file,
      candidateId,
    });

    const { parsedData, pdfUrl } = ingestion;
    storagePath = ingestion.storagePath;

    // Create resume and application in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const resume = await tx.resume.create({
        data: {
          originalName: req.file.originalname,
          parsedData,
          pdfUrl,
          candidateId,
        },
      });

      await syncCandidateCvData(tx, candidateId, parsedData);

      const application = await tx.application.create({
        data: {
          candidateId,
          jobId: parsedJobId,
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
            select: { id: true, originalName: true, pdfUrl: true, uploadedAt: true },
          },
        },
      });

      return application;
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error applying with new resume:', error);

    await deleteResumeObject(storagePath);

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
  } finally {
    await cleanupLocalUpload(req.file);
  }
};

/**
 * Check if candidate has previous resumes
 * GET /api/application/has-previous-resume
 */
const checkHasPreviousResume = async (req, res) => {
  try {
    const candidateId = req.user.id;
    const resumeCount = await prisma.resume.count({ where: { candidateId } });
    res.json({ success: true, hasPrevious: resumeCount > 0 });
  } catch (error) {
    console.error('Error checking previous resumes:', error);
    res.status(500).json({ success: false, message: 'Failed to check previous resumes' });
  }
};

/**
 * Convert profile CvData to text for LLM parsing
 */
function convertProfileToText(cvData) {
  let text = '';

  if (cvData.candidate?.name) text += `${cvData.candidate.name}\n`;
  if (cvData.candidate?.email) text += `Email: ${cvData.candidate.email}\n`;
  if (cvData.phone) text += `Phone: ${cvData.phone}\n`;
  if (cvData.address) text += `Address: ${cvData.address}\n`;
  text += '\n';

  if (Array.isArray(cvData.education) && cvData.education.length > 0) {
    text += 'EDUCATION\n';
    cvData.education.forEach((edu) => {
      text += `${edu.degree || ''} - ${edu.institution || ''} (${edu.year || ''})\n`;
    });
    text += '\n';
  }

  if (Array.isArray(cvData.work_experience) && cvData.work_experience.length > 0) {
    text += 'EXPERIENCE\n';
    cvData.work_experience.forEach((exp) => {
      text += `${exp.role || exp.position || ''} at ${exp.company || ''}\n`;
      if (exp.startDate || exp.endDate) text += `${exp.startDate || ''} - ${exp.endDate || 'Present'}\n`;
      if (exp.description) text += `${exp.description}\n`;
      text += '\n';
    });
  }

  if (Array.isArray(cvData.skills) && cvData.skills.length > 0) {
    text += 'SKILLS\n';
    text += cvData.skills.join(', ') + '\n\n';
  }

  if (Array.isArray(cvData.projects) && cvData.projects.length > 0) {
    text += 'PROJECTS\n';
    cvData.projects.forEach((proj) => {
      text += `${proj.title || proj.name || ''}\n`;
      if (proj.description) text += `${proj.description}\n`;
      if (proj.link) text += `Link: ${proj.link}\n`;
      text += '\n';
    });
  }

  if (Array.isArray(cvData.certifications) && cvData.certifications.length > 0) {
    text += 'CERTIFICATIONS\n';
    cvData.certifications.forEach((cert) => {
      text += `${cert.name || ''} - ${cert.authority || cert.issuer || ''} (${cert.year || cert.date || ''})\n`;
    });
  }

  return text;
}

/**
 * Apply with candidate profile data (CvData)
 * POST /api/application/apply/profile
 */
const applyWithProfileData = async (req, res) => {
  let storagePath;

  try {
    const { jobId } = req.body;
    const candidateId = req.user.id;
    const parsedJobId = parseInt(jobId, 10);

    if (!jobId) {
      return res.status(400).json({ success: false, message: 'jobId is required' });
    }

    if (Number.isNaN(parsedJobId)) {
      return res.status(400).json({ success: false, message: 'jobId must be a valid number' });
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: { candidateId_jobId: { candidateId, jobId: parsedJobId } },
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }

    // Verify job exists and is open
    const job = await prisma.job.findFirst({
      where: { id: parsedJobId, status: 'Open' },
    });

    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found or no longer accepting applications' });
    }

    // Fetch profile data
    const cvData = await prisma.cvData.findUnique({
      where: { candidateId },
      include: { candidate: { select: { name: true, email: true } } },
    });

    if (!cvData) {
      return res.status(400).json({ success: false, message: 'No profile data found. Please fill in your profile first.' });
    }

    // Convert profile data to text and parse with LLM
    const profileText = convertProfileToText(cvData);
    const parsedData = await parseCVWithLLM(profileText);
    const normalizedParsedData = normalizeParsedResumeData(parsedData);

    const uploadResult = await uploadProfileSnapshot({
      candidateId,
      profileText,
    });
    const profilePdfUrl = uploadResult.pdfUrl;
    storagePath = uploadResult.storagePath;

    // Create resume and application in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const resume = await tx.resume.create({
        data: {
          originalName: 'Profile Data',
          parsedData: normalizedParsedData,
          pdfUrl: profilePdfUrl,
          candidateId,
        },
      });

      await syncCandidateCvData(tx, candidateId, normalizedParsedData);

      const application = await tx.application.create({
        data: {
          candidateId,
          jobId: parsedJobId,
          resumeId: resume.id,
        },
        include: {
          candidate: { select: { id: true, name: true, email: true } },
          job: { select: { id: true, title: true, department: true } },
          resume: { select: { id: true, originalName: true, pdfUrl: true, uploadedAt: true } },
        },
      });

      return application;
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error applying with profile data:', error);
    await deleteResumeObject(storagePath);
    if (error.code === 'P2002') {
      return res.status(400).json({ success: false, message: 'Already applied to this job' });
    }
    res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
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
            pdfUrl: true,
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
            pdfUrl: true,
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
          select: { id: true, originalName: true, pdfUrl: true, uploadedAt: true },
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
  checkHasPreviousResume,
  applyWithExistingResume,
  applyWithNewResume,
  applyWithProfileData,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
};

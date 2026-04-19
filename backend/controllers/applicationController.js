const fs = require('fs').promises;
const path = require('path');
const prisma = require('../config/db');
const { parseCVWithLLM } = require('../services/llmService');
const {
  ingestUploadedResume,
  normalizeParsedResumeData,
  uploadProfileSnapshot,
} = require('../services/resumeIngestionService');
const { deleteResumeObject } = require('../services/supabaseStorageService');
const { triggerApplicationScoring } = require('../services/scoring/triggerScoring');

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
      where: { candidateId, originalName: { not: 'Profile Data' } },
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

    triggerApplicationScoring(application.id, resume.parsedData).catch(console.error);

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

    triggerApplicationScoring(result.id, parsedData).catch(console.error);

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
    const resumeCount = await prisma.resume.count({ where: { candidateId, originalName: { not: 'Profile Data' } } });
    res.json({ success: true, hasPrevious: resumeCount > 0 });
  } catch (error) {
    console.error('Error checking previous resumes:', error);
    res.status(500).json({ success: false, message: 'Failed to check previous resumes' });
  }
};

/**
 * Generate experience summary from candidate's work experience and projects
 * Merges key roles, technologies, and achievements into a concise 2-3 sentence summary
 */
function generateExperienceSummary(cvData) {
  const experience = Array.isArray(cvData.work_experience) ? cvData.work_experience : [];
  const projects = Array.isArray(cvData.projects) ? cvData.projects : [];
  
  if (experience.length === 0 && projects.length === 0) {
    return '';
  }

  const summaryParts = [];

  // Extract key roles and companies from experience
  if (experience.length > 0) {
    const recentExperience = experience.slice(0, 2);
    const roles = recentExperience
      .map(exp => exp.role || exp.position || '')
      .filter(Boolean);
    
    const companies = recentExperience
      .map(exp => exp.company || '')
      .filter(Boolean);

    if (roles.length > 0) {
      const roleStr = roles.length > 1 ? roles.join(', ') : roles[0];
      const companyStr = companies.length > 0 ? ` at ${companies.join(', ')}` : '';
      summaryParts.push(`${roleStr}${companyStr}`);
    }
  }

  // Extract key technologies from projects and experience
  const technologies = new Set();
  
  experience.forEach(exp => {
    if (exp.technologies && typeof exp.technologies === 'string') {
      exp.technologies.split(',').forEach(tech => technologies.add(tech.trim()));
    }
  });
  
  projects.forEach(proj => {
    if (proj.technologies && typeof proj.technologies === 'string') {
      proj.technologies.split(',').forEach(tech => technologies.add(tech.trim()));
    }
  });

  const techArray = Array.from(technologies).slice(0, 5);
  if (techArray.length > 0) {
    summaryParts.push(`proficient in ${techArray.join(', ')}`);
  }

  // Extract key project achievements
  if (projects.length > 0) {
    const recentProject = projects[0];
    const projectName = recentProject.title || recentProject.name || '';
    if (projectName) {
      summaryParts.push(`developed ${projectName}`);
    }
  }

  // Combine into a concise summary (2-3 sentences)
  if (summaryParts.length === 0) return '';
  
  let summary = summaryParts[0];
  if (summaryParts.length >= 2) {
    summary += '. ' + summaryParts.slice(1).join(', ') + '.';
  } else {
    summary += '.';
  }

  return summary.substring(0, 500); // Limit to 500 characters
}

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
    const { jobId, reparse } = req.body;
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

    // If reparse is false, try to reuse the most recent profile-based resume
    if (reparse === false) {
      const previousProfileResume = await prisma.resume.findFirst({
        where: { candidateId, originalName: 'Profile Data' },
        orderBy: { uploadedAt: 'desc' },
      });

      if (previousProfileResume) {
        const result = await prisma.application.create({
          data: {
            candidateId,
            jobId: parsedJobId,
            resumeId: previousProfileResume.id,
          },
          include: {
            candidate: { select: { id: true, name: true, email: true } },
            job: { select: { id: true, title: true, department: true } },
            resume: { select: { id: true, originalName: true, pdfUrl: true, uploadedAt: true } },
          },
        });

        return res.status(201).json({
          success: true,
          message: 'Application submitted successfully',
          data: result,
        });
      }
      // If no previous profile resume exists, fall through to re-parse
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
    let normalizedParsedData = normalizeParsedResumeData(parsedData);

    // Ensure experience summary is included by merging candidate's work_experience and projects
    const generatedSummary = generateExperienceSummary(cvData);
    if (generatedSummary && !normalizedParsedData.experienceSummary) {
      normalizedParsedData.experienceSummary = generatedSummary;
    } else if (generatedSummary && normalizedParsedData.experienceSummary) {
      // If both LLM and generated summary exist, prefer LLM but fallback to generated if LLM is too short
      if (normalizedParsedData.experienceSummary.length < 50) {
        normalizedParsedData.experienceSummary = generatedSummary;
      }
    }

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

    triggerApplicationScoring(result.id, normalizedParsedData).catch(console.error);

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

const getAllJobApplications = async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      orderBy: {
        appliedAt: 'desc'
      },
      select: {
        id: true,
        status: true,
        appliedAt: true,
        score:true,
        candidate: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            department: true
          }
        },
        resume: {
          select: {
            id: true,
            originalName: true,
            pdfUrl: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      applications
    });

  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications'
    });
  }
};

/**
 * Get the most recent "Profile Data" resume snapshot and current CvData
 * GET /api/application/previous-profile-data
 */
const getPreviousProfileData = async (req, res) => {
  try {
    const candidateId = req.user.id;

    // Get the most recent "Profile Data" resume
    const previousResume = await prisma.resume.findFirst({
      where: { candidateId, originalName: 'Profile Data' },
      orderBy: { uploadedAt: 'desc' },
      select: { parsedData: true, uploadedAt: true },
    });

    // Get current CvData
    const currentCv = await prisma.cvData.findUnique({
      where: { candidateId },
      include: { candidate: { select: { name: true, email: true } } },
    });

    const currentData = currentCv
      ? {
          name: currentCv.candidate?.name,
          email: currentCv.candidate?.email,
          phone: currentCv.phone,
          address: currentCv.address,
          education: currentCv.education || [],
          work_experience: currentCv.work_experience || [],
          skills: currentCv.skills || [],
          projects: currentCv.projects || [],
          certifications: currentCv.certifications || [],
        }
      : null;

    res.json({
      success: true,
      previousData: previousResume?.parsedData || null,
      previousSubmittedAt: previousResume?.uploadedAt || null,
      currentData,
    });
  } catch (error) {
    console.error('Error fetching previous profile data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch previous profile data',
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
  getAllJobApplications,
  getPreviousProfileData,
};

// backend/controllers/resumeController.js
const fs = require('fs').promises;
const path = require('path');
const prisma = require('../config/db');
const { ingestUploadedResume, syncCandidateCvData } = require('../services/resumeIngestionService');
const { deleteResumeObject, extractStoragePathFromSupabaseUrl } = require('../services/supabaseStorageService');

async function cleanupLocalUpload(file) {
  if (!file?.path) {
    return;
  }

  const localPath = path.resolve(__dirname, '..', file.path);
  await fs.unlink(localPath).catch(() => {});
}

const uploadResume = async (req, res) => {
  let storagePath;

  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    const ingestion = await ingestUploadedResume({
      file: req.file,
      candidateId: req.user.id,
    });

    const { parsedData, pdfUrl } = ingestion;
    storagePath = ingestion.storagePath;

    const resume = await prisma.$transaction(async (tx) => {
      const createdResume = await tx.resume.create({
        data: {
          originalName: req.file.originalname,
          parsedData,
          pdfUrl,
          candidateId: req.user.id,
        },
      });

      await syncCandidateCvData(tx, req.user.id, parsedData);

      return createdResume;
    });

    res.status(201).json({
      success: true,
      data: resume
    });

  } catch (error) {
    console.error('Error uploading resume:', error);
    await deleteResumeObject(storagePath);

    res.status(500).json({
      success: false,
      message: 'Failed to process resume',
      error: error.message
    });
  } finally {
    await cleanupLocalUpload(req.file);
  }
};
const getResume = async (req, res) => {
  try {
    const { id } = req.params;
    const resume = await prisma.resume.findFirst({
      where: { 
        id: parseInt(id),
        candidateId: req.user.id 
      }
    });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    res.status(200).json({
      success: true,
      data: resume
    });
  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * Delete a resume
 */
const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    // First find the resume to verify ownership
    const resume = await prisma.resume.findFirst({
      where: { 
        id: parseInt(id),
        candidateId: req.user.id
      }
    });
    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }
    // Delete the resume
    await prisma.resume.delete({
      where: { id: parseInt(id) }
    });

    // Best-effort cleanup for resumes stored in Supabase.
    // We only store URL in DB, so derive the object path when possible.
    if (resume.pdfUrl) {
      const storagePath = extractStoragePathFromSupabaseUrl(resume.pdfUrl);
      if (storagePath) {
        await deleteResumeObject(storagePath);
      }
    }

    // If you're storing files on disk, you would delete them here
    // Example: await fs.unlink(path.join(__dirname, '..', 'uploads', resume.filename));
    res.status(200).json({
      success: true,
      message: 'Resume deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete resume',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
/**
 * List all resumes for the authenticated user
 */
const listResumes = async (req, res) => {
  try {
    const resumes = await prisma.resume.findMany({
      where: { candidateId: req.user.id },
      orderBy: { uploadedAt: 'desc' },
      select: {
        id: true,
        originalName: true,
        pdfUrl: true,
        uploadedAt: true,
        parsedData: true,
      },
    });

    res.status(200).json({
      success: true,
      data: resumes
    });
  } catch (error) {
    console.error('Error listing resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to list resumes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
module.exports = {
  uploadResume,
  getResume,
  deleteResume,
  listResumes,
};

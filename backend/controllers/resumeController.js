// backend/controllers/resumeController.js
const fs = require('fs').promises;
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { extractTextFromFile } = require('../utils/fileParser');
const { parseCVWithLLM } = require('../services/llmService');

const prisma = new PrismaClient();

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded' 
      });
    }

    // Extract text from the uploaded file
    const filePath = path.join(__dirname, '..', req.file.path);
    const text = await extractTextFromFile(filePath, req.file.mimetype);

    // Parse the extracted text using LLM
    const parsedData = await parseCVWithLLM(text);
    
    // Validate the parsed data structure
    if (!parsedData || typeof parsedData !== 'object') {
      throw new Error('Invalid parsed data structure from LLM');
    }
    
    // Ensure all required fields exist in correct order
    const validatedData = {
      basicInfo: parsedData.basicInfo || { name: '', email: '', phone: '', location: '' },
      education: Array.isArray(parsedData.education) ? parsedData.education : [],
      experience: Array.isArray(parsedData.experience) ? parsedData.experience : [],
      projects: Array.isArray(parsedData.projects) ? parsedData.projects : [],
      skills: Array.isArray(parsedData.skills) ? parsedData.skills : [],
      certifications: Array.isArray(parsedData.certifications) ? parsedData.certifications : []
    };

    // Save to database
    const resume = await prisma.resume.create({
      data: {
        originalName: req.file.originalname,
        parsedData: validatedData,
        candidateId: req.user.id
      }
    });

    // Clean up the uploaded file
    await fs.unlink(filePath).catch(console.error);

    res.status(201).json({
      success: true,
      data: resume
    });

  } catch (error) {
    console.error('Error uploading resume:', error);
    
    // Clean up file if it exists
    if (req.file) {
      const filePath = path.join(__dirname, '..', req.file.path);
      await fs.unlink(filePath).catch(console.error);
    }

    res.status(500).json({
      success: false,
      message: 'Failed to process resume',
      error: error.message
    });
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
    uploadedAt: true,
    parsedData: true
  }
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
  listResumes
};
// ... rest of the controller functions (getResume, deleteResume) ...
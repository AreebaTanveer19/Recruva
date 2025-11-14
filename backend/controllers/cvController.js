const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { auth } = require('../middleware/auth');

// Save or update CV data
const saveCVData = async (req, res) => {
  const candidateId = req.user.id;
  const {
    name,
    email,
    phone,
    address,
    education,
    work_experience,
    skills,
    projects,
    certifications
  } = req.body;

  try {
    // First, update the basic candidate info
    await prisma.candidate.update({
      where: { id: candidateId },
      data: {
        name,
        email,
        phone,
        address
      }
    });

    // Then, update or create the CV data
    const cvData = await prisma.cVData.upsert({
      where: { candidateId },
      update: {
        education: education || [],
        work_experience: work_experience || [],
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || []
      },
      create: {
        candidateId,
        education: education || [],
        work_experience: work_experience || [],
        skills: skills || [],
        projects: projects || [],
        certifications: certifications || []
      }
    });

    res.status(200).json({
      success: true,
      message: 'CV data saved successfully',
      data: cvData
    });
  } catch (error) {
    console.error('Error saving CV data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save CV data',
      error: error.message
    });
  }
};

// Get CV data for a candidate
const getCVData = async (req, res) => {
  const candidateId = req.user.id;

  try {
    const cvData = await prisma.cVData.findUnique({
      where: { candidateId },
      include: {
        candidate: {
          select: {
            name: true,
            email: true,
            phone: true,
            address: true
          }
        }
      }
    });

    if (!cvData) {
      return res.status(404).json({
        success: false,
        message: 'CV data not found'
      });
    }

    // Combine candidate info with CV data
    const response = {
      ...cvData.candidate,
      education: cvData.education,
      work_experience: cvData.work_experience,
      skills: cvData.skills,
      projects: cvData.projects,
      certifications: cvData.certifications
    };

    res.status(200).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Error fetching CV data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch CV data',
      error: error.message
    });
  }
};

module.exports = {
  saveCVData,
  getCVData
};

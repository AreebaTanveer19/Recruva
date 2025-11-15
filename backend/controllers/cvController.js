const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Save or update CV data
const saveCVData = async (req, res) => {
  try {
    console.log("[saveCVData] prisma delegates:", Object.keys(prisma));
    console.log("[saveCVData] prisma.cvData type:", typeof prisma.cvData);
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const candidateId = req.user.id;

    let {
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

    const safeParse = (value) => {
      try {
        if (!value) return [];
        return Array.isArray(value) ? value : JSON.parse(value);
      } catch {
        return [];
      }
    };

    education = safeParse(education);
    work_experience = safeParse(work_experience);
    projects = safeParse(projects);
    certifications = safeParse(certifications);

    // Convert skills into string[]
    if (Array.isArray(skills)) {
      skills = skills.map(s => typeof s === "string" ? s : s.name);
    } else {
      skills = [];
    }

    // Update candidate (only provided fields)
    const candidateUpdate = {};
    if (name) candidateUpdate.name = name;
    if (email) candidateUpdate.email = email;

    await prisma.candidate.update({
      where: { id: candidateId },
      data: candidateUpdate
    });

    // Upsert CV
    const cvData = await prisma.cvData.upsert({
      where: { candidateId },
      update: {
        phone,
        address,
        education,
        work_experience,
        skills,
        projects,
        certifications
      },
      create: {
        candidateId,
        phone,
        address,
        education,
        work_experience,
        skills,
        projects,
        certifications
      }
    });

    res.status(200).json({
      success: true,
      message: "CV data saved successfully",
      data: cvData
    });

  } catch (error) {
    console.error("Error saving CV data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save CV data",
      error: error.message,
      stack: error.stack
    });
  }
};



// Get CV data
const getCVData = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const candidateId = req.user.id;

    const cvData = await prisma.cvData.findUnique({
      where: { candidateId },
      include: {
        candidate: { select: { name: true, email: true } }
      }
    });

    if (!cvData) {
      // Return "no data" instead of default arrays
      return res.status(200).json({ success: true, data: null });
    }

    // Check if cvData actually has info
    const hasData = 
      (cvData.education && cvData.education.length > 0) ||
      (cvData.work_experience && cvData.work_experience.length > 0) ||
      (cvData.projects && cvData.projects.length > 0) ||
      (cvData.certifications && cvData.certifications.length > 0) ||
      (cvData.skills && cvData.skills.length > 0) ||
      cvData.phone || cvData.address;

    if (!hasData) {
      return res.status(200).json({ success: true, data: null });
    }

    const response = {
      name: cvData.candidate?.name,
      email: cvData.candidate?.email,
      phone: cvData.phone,
      address: cvData.address,
      education: cvData.education,
      work_experience: cvData.work_experience,
      skills: cvData.skills,
      projects: cvData.projects,
      certifications: cvData.certifications
    };

    res.status(200).json({ success: true, data: response });

  } catch (error) {
    console.error('Error fetching CV data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch CV data', error: error.message });
  }
};



module.exports = { saveCVData, getCVData };

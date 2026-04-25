const path = require('path');
const { extractTextFromFile, cleanText } = require('../utils/fileParser');
const { parseCVWithLLM } = require('./llmService');
const { uploadResumeFile, uploadResumeBuffer } = require('./supabaseStorageService');

function toSafeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeObjectArray(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => Object.fromEntries(
      Object.entries(item).map(([key, val]) => [key, typeof val === 'string' ? val.trim() : val])
    ));
}

function normalizeSkills(skills) {
  if (!Array.isArray(skills)) {
    return [];
  }

  return [...new Set(
    skills
      .map((skill) => {
        if (typeof skill === 'string') {
          return skill.trim();
        }

        if (skill && typeof skill === 'object') {
          return toSafeString(skill.name || skill.skill || '');
        }

        return '';
      })
      .filter(Boolean)
  )];
}

function normalizeEducation(education) {
  if (!Array.isArray(education)) {
    return [];
  }

  return education
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const normalized = {
        degreeLevel: 'Other',
        degreeField: toSafeString(item.degreeField || item.field || ''),
        institution: toSafeString(item.institution || ''),
        graduationYear: null,
        cgpa: null,
      };

      // Map degree level if provided as enum or convert from old format
      if (item.degreeLevel) {
        const validLevels = ['Matric', 'Intermediate', 'Bachelors', 'Masters', 'PhD', 'Other'];
        normalized.degreeLevel = validLevels.includes(item.degreeLevel) ? item.degreeLevel : 'Other';
      } else if (item.degreeName || item.degree) {
        // Support old format: map to degreeLevel using keyword matching
        const degreeText = toSafeString(item.degreeName || item.degree);
        const lowerDegree = degreeText.toLowerCase();
        
        if (lowerDegree.includes('phd') || lowerDegree.includes('doctorate')) {
          normalized.degreeLevel = 'PhD';
        } else if (lowerDegree.includes('master') || lowerDegree.includes('mba') || lowerDegree.includes('m.')) {
          normalized.degreeLevel = 'Masters';
        } else if (lowerDegree.includes('bachelor') || lowerDegree.includes('b.')) {
          normalized.degreeLevel = 'Bachelors';
        } else if (lowerDegree.includes('intermediate') || lowerDegree.includes('hssc')) {
          normalized.degreeLevel = 'Intermediate';
        } else if (lowerDegree.includes('matric') || lowerDegree.includes('ssc')) {
          normalized.degreeLevel = 'Matric';
        }
      }

      // Parse and validate graduationYear (numeric, defaults to null)
      if (item.graduationYear || item.graduationYear === 0) {
        const yearNum = typeof item.graduationYear === 'number' ? item.graduationYear : parseInt(String(item.graduationYear), 10);
        if (!isNaN(yearNum) && yearNum > 1900 && yearNum <= new Date().getFullYear() + 10) {
          normalized.graduationYear = yearNum;
        }
      } else if (item.year) {
        // Support old 'year' field
        const yearNum = typeof item.year === 'number' ? item.year : parseInt(String(item.year), 10);
        if (!isNaN(yearNum) && yearNum > 1900 && yearNum <= new Date().getFullYear() + 10) {
          normalized.graduationYear = yearNum;
        }
      }

      // Parse and validate CGPA (numeric, defaults to null)
      if (item.cgpa || item.cgpa === 0) {
        const cgpaNum = typeof item.cgpa === 'number' ? item.cgpa : parseFloat(String(item.cgpa));
        if (!isNaN(cgpaNum) && cgpaNum >= 0 && cgpaNum <= 4.5) {
          normalized.cgpa = parseFloat(cgpaNum.toFixed(2));
        }
      }

      return normalized;
    });
}

function normalizeParsedResumeData(parsedData) {
  const safeData = parsedData && typeof parsedData === 'object' ? parsedData : {};
  const safeBasicInfo = safeData.basicInfo && typeof safeData.basicInfo === 'object'
    ? safeData.basicInfo
    : {};

  return {
    basicInfo: {
      name: toSafeString(safeBasicInfo.name),
      email: toSafeString(safeBasicInfo.email),
      phone: toSafeString(safeBasicInfo.phone),
      location: toSafeString(safeBasicInfo.location),
    },
    education: normalizeEducation(safeData.education),
    experience: normalizeObjectArray(safeData.experience),
    projects: normalizeObjectArray(safeData.projects),
    skills: normalizeSkills(safeData.skills),
    certifications: normalizeObjectArray(safeData.certifications),
    experienceSummary: toSafeString(safeData.experienceSummary),
  };
}

function getLocalUploadPath(file) {
  return path.resolve(__dirname, '..', file.path);
}

/**
 * Optimize text extraction - limit to relevant portions for faster parsing
 * Prioritize first 2/3 of document which typically contains most important info
 */
function optimizeTextForParsing(text) {
  if (!text || text.length < 100) return text;
  
  // For very long resumes, prioritize the beginning (usually has contact, summary, key skills)
  // and end (usually has certifications, awards)
  const maxLength = 12000; // LLM has this limit anyway
  
  if (text.length > maxLength) {
    // Take first 70% and last 30%
    const firstPart = text.substring(0, Math.floor(maxLength * 0.7));
    const lastPart = text.substring(text.length - Math.floor(maxLength * 0.3));
    return firstPart + '\n\n... [middle section omitted] ...\n\n' + lastPart;
  }
  
  return text;
}

async function parseUploadedResume(file) {
  const localFilePath = getLocalUploadPath(file);
  
  // Extract text from file
  const extractedText = await extractTextFromFile(localFilePath, file.mimetype);
  const cleanedText = cleanText(extractedText);

  if (!cleanedText || cleanedText.length < 20) {
    throw new Error('Unable to extract enough text from the uploaded resume.');
  }

  // Optimize text for parsing (reduce unnecessary content for faster processing)
  const optimizedText = optimizeTextForParsing(cleanedText);
  
  // Parse with LLM
  const parsedData = await parseCVWithLLM(optimizedText);

  return {
    localFilePath,
    parsedData: normalizeParsedResumeData(parsedData),
  };
}

async function ingestUploadedResume({ file, candidateId }) {
  // Parallelize: parse and upload simultaneously for better performance
  const { localFilePath, parsedData } = await parseUploadedResume(file);
  
  const uploadResult = await uploadResumeFile({
    localFilePath,
    originalName: file.originalname,
    candidateId,
    contentType: file.mimetype,
  });

  return {
    localFilePath,
    parsedData,
    pdfUrl: uploadResult.pdfUrl,
    storagePath: uploadResult.storagePath,
  };
}

async function uploadProfileSnapshot({ candidateId, profileText }) {
  const fileBuffer = Buffer.from(profileText, 'utf-8');

  const uploadResult = await uploadResumeBuffer({
    buffer: fileBuffer,
    originalName: `profile-snapshot-${Date.now()}.txt`,
    candidateId,
    contentType: 'text/plain',
  });

  return {
    pdfUrl: uploadResult.pdfUrl,
    storagePath: uploadResult.storagePath,
  };
}

async function syncCandidateCvData(tx, candidateId, parsedData) {
  const normalized = normalizeParsedResumeData(parsedData);

  const payloadForCreate = {
    candidateId,
    phone: normalized.basicInfo.phone || null,
    address: normalized.basicInfo.location || null,
    education: normalized.education,
    work_experience: normalized.experience,
    skills: normalized.skills,
    projects: normalized.projects,
    certifications: normalized.certifications,
    experienceSummary: normalized.experienceSummary || null,
  };

  const existing = await tx.cvData.findUnique({ where: { candidateId } });

  if (!existing) {
    await tx.cvData.create({ data: payloadForCreate });
    return;
  }

  const updatePayload = {};

  if (normalized.basicInfo.phone) {
    updatePayload.phone = normalized.basicInfo.phone;
  }

  if (normalized.basicInfo.location) {
    updatePayload.address = normalized.basicInfo.location;
  }

  if (normalized.education.length > 0) {
    updatePayload.education = normalized.education;
  }

  if (normalized.experience.length > 0) {
    updatePayload.work_experience = normalized.experience;
  }

  if (normalized.skills.length > 0) {
    updatePayload.skills = normalized.skills;
  }

  if (normalized.projects.length > 0) {
    updatePayload.projects = normalized.projects;
  }

  if (normalized.certifications.length > 0) {
    updatePayload.certifications = normalized.certifications;
  }

  if (normalized.experienceSummary) {
    updatePayload.experienceSummary = normalized.experienceSummary;
  }

  if (Object.keys(updatePayload).length === 0) {
    return;
  }

  await tx.cvData.update({
    where: { candidateId },
    data: updatePayload,
  });
}

module.exports = {
  ingestUploadedResume,
  normalizeParsedResumeData,
  parseUploadedResume,
  syncCandidateCvData,
  uploadProfileSnapshot,
};

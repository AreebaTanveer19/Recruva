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
        degree: toSafeString(item.degree),
        institution: toSafeString(item.institution),
        year: toSafeString(item.year),
      };

      // Safely parse and validate CGPA
      if (item.cgpa) {
        const cgpaStr = toSafeString(item.cgpa);
        // Validate CGPA is a valid number between 0-4
        const cgpaNum = parseFloat(cgpaStr);
        if (!isNaN(cgpaNum) && cgpaNum >= 0 && cgpaNum <= 4.5) {
          normalized.cgpa = cgpaNum.toFixed(2);
        } else if (cgpaStr) {
          normalized.cgpa = cgpaStr;
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

async function parseUploadedResume(file) {
  const localFilePath = getLocalUploadPath(file);
  const extractedText = await extractTextFromFile(localFilePath, file.mimetype);
  const cleanedText = cleanText(extractedText);

  if (!cleanedText || cleanedText.length < 20) {
    throw new Error('Unable to extract enough text from the uploaded resume.');
  }

  const parsedData = await parseCVWithLLM(cleanedText);

  return {
    localFilePath,
    parsedData: normalizeParsedResumeData(parsedData),
  };
}

async function ingestUploadedResume({ file, candidateId }) {
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

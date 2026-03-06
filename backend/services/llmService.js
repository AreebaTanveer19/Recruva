const axios = require('axios');

/**
 * Parse CV text using LLM with strict JSON output.
 * @param {string} cvText - Extracted text from CV
 * @returns {Promise<Object>} - Parsed CV data as JSON object
 */
async function parseCVWithLLM(cvText) {
  try {
    const cleanCVText = String(cvText || '').slice(0, 12000);

    if (!cleanCVText.trim()) {
      return getEmptyStructure();
    }

    const prompt = `Extract data from this resume and return ONLY valid JSON with this exact shape:
{
  "basicInfo": { "name": "", "email": "", "phone": "", "location": "" },
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "experience": [{ "company": "", "position": "", "duration": "", "description": "" }],
  "skills": [""],
  "projects": [{ "name": "", "description": "", "technologies": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }]
}

Rules:
- Return only one JSON object (no markdown/code fences/explanations).
- Keep unknown fields as empty strings.
- Keep missing sections as empty arrays.
- Extract as many real values as possible from the resume text.

Resume text:
${cleanCVText}`;

    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: process.env.GROQ_RESUME_MODEL || 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are a strict JSON resume parser. Return only valid JSON.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2500,
        response_format: {
          type: 'json_object',
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const llmResponse = response.data.choices?.[0]?.message?.content;

    if (!llmResponse) {
      throw new Error('Empty response from LLM');
    }

    return validateAndApplyFallbacks(parseJSONResponse(llmResponse), cleanCVText);

  } catch (error) {
    console.error('LLM parsing failed, using regex fallback:', error.message);
    return extractDataWithRegex(cvText);
  }
}

/**
 * Parse JSON response from LLM, handling formatting noise.
 * @param {string} response - Raw response from LLM
 * @returns {Object} - Parsed JSON object
 */
function parseJSONResponse(response) {
  if (response && typeof response === 'object') {
    return response;
  }

  if (typeof response !== 'string') {
    return getEmptyStructure();
  }

  try {
    let cleanResponse = response.trim();

    cleanResponse = cleanResponse.replace(/^```json\s*/i, '');
    cleanResponse = cleanResponse.replace(/^```\s*/, '');
    cleanResponse = cleanResponse.replace(/\s*```$/, '');
    cleanResponse = cleanResponse.trim();

    return JSON.parse(cleanResponse);
  } catch (error) {
    const firstCurly = response.indexOf('{');
    const lastCurly = response.lastIndexOf('}');

    if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
      try {
        return JSON.parse(response.slice(firstCurly, lastCurly + 1));
      } catch (parseError) {
        return getEmptyStructure();
      }
    }

    return getEmptyStructure();
  }
}

/**
 * Validate parsed data and apply fallbacks for missing critical fields.
 * @param {Object} data - Parsed data from LLM
 * @param {string} originalText - Original CV text for regex extraction
 * @returns {Object} - Validated and enhanced data
 */
function validateAndApplyFallbacks(data, originalText) {
  const result = getOrderedStructure(data || {});

  const totalItems =
    result.education.length +
    result.experience.length +
    result.projects.length +
    result.skills.length +
    result.certifications.length;

  if (totalItems === 0) {
    const regexData = extractDataWithRegex(originalText);

    result.education = result.education.length > 0 ? result.education : regexData.education;
    result.experience = result.experience.length > 0 ? result.experience : regexData.experience;
    result.projects = result.projects.length > 0 ? result.projects : regexData.projects;
    result.skills = result.skills.length > 0 ? result.skills : regexData.skills;
    result.certifications = result.certifications.length > 0 ? result.certifications : regexData.certifications;

    if (!result.basicInfo.email) result.basicInfo.email = regexData.basicInfo.email;
    if (!result.basicInfo.phone) result.basicInfo.phone = regexData.basicInfo.phone;
    if (!result.basicInfo.name) result.basicInfo.name = regexData.basicInfo.name;
    if (!result.basicInfo.location) result.basicInfo.location = regexData.basicInfo.location;
  }

  if (!result.basicInfo.email) {
    const email = extractEmail(originalText);
    if (email) result.basicInfo.email = email;
  }

  if (!result.basicInfo.phone) {
    const phone = extractPhone(originalText);
    if (phone) result.basicInfo.phone = phone;
  }

  if (!result.basicInfo.name) {
    const name = extractName(originalText);
    if (name) result.basicInfo.name = name;
  }

  result.skills = [...new Set(result.skills.map((skill) => String(skill).trim()).filter(Boolean))];

  return result;
}

/**
 * Regex-based extraction fallback.
 * @param {string} text - CV text
 * @returns {Object} - Extracted information
 */
function extractDataWithRegex(text) {
  const sourceText = String(text || '');
  const lines = sourceText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result = getOrderedStructure({});

  result.basicInfo.email = extractEmail(sourceText) || '';
  result.basicInfo.phone = extractPhone(sourceText) || '';
  result.basicInfo.name = extractName(sourceText) || '';

  const skillsHeaderIndex = lines.findIndex((line) => /^(skills|technical skills|tech stack)\b/i.test(line));
  if (skillsHeaderIndex >= 0) {
    const nextLines = lines.slice(skillsHeaderIndex, skillsHeaderIndex + 8);
    const skillText = nextLines.join(', ');
    result.skills = skillText
      .split(/[,|/]/)
      .map((skill) => skill.replace(/^skills:?/i, '').trim())
      .filter((skill) => skill.length > 1);
  }

  if (result.skills.length === 0) {
    const commonTechKeywords = [
      'javascript', 'typescript', 'react', 'next.js', 'node.js', 'express', 'python',
      'java', 'sql', 'postgresql', 'mysql', 'mongodb', 'aws', 'docker', 'kubernetes',
      'git', 'tailwind', 'redux', 'prisma'
    ];

    result.skills = commonTechKeywords
      .filter((keyword) => new RegExp(`\\b${escapeRegExp(keyword)}\\b`, 'i').test(sourceText))
      .map((keyword) => keyword.replace(/\b\w/g, (char) => char.toUpperCase()));
  }

  lines.forEach((line) => {
    if (/(bachelor|master|phd|diploma|university|college)/i.test(line)) {
      const yearMatch = line.match(/\b(19|20)\d{2}\b/);
      result.education.push({
        degree: line,
        institution: line,
        year: yearMatch ? yearMatch[0] : '',
      });
    }

    if (/(intern|engineer|developer|manager|analyst|consultant)/i.test(line) && /\b(19|20)\d{2}\b/.test(line)) {
      result.experience.push({
        company: '',
        position: line,
        duration: line.match(/\b(19|20)\d{2}\b[\s\-–to]*(present|\b(19|20)\d{2}\b)?/i)?.[0] || '',
        description: '',
      });
    }

    if (/\b(project|built|developed)\b/i.test(line)) {
      result.projects.push({
        name: line.slice(0, 80),
        description: line,
        technologies: '',
      });
    }

    if (/(certified|certification|aws|google cloud|azure)/i.test(line)) {
      result.certifications.push({
        name: line,
        issuer: '',
        date: line.match(/\b(19|20)\d{2}\b/)?.[0] || '',
      });
    }
  });

  result.education = dedupeObjectArray(result.education, 'degree');
  result.experience = dedupeObjectArray(result.experience, 'position');
  result.projects = dedupeObjectArray(result.projects, 'name');
  result.certifications = dedupeObjectArray(result.certifications, 'name');
  result.skills = [...new Set(result.skills.map((skill) => skill.trim()).filter((skill) => skill.length > 1))];
  
  return result;
}

function dedupeObjectArray(items, key) {
  const seen = new Set();

  return items.filter((item) => {
    const value = (item?.[key] || '').toLowerCase();
    if (!value || seen.has(value)) {
      return false;
    }

    seen.add(value);
    return true;
  });
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extract email using regex
 * @param {string} text - Text to search
 * @returns {string|null} - Found email or null
 */
function extractEmail(text) {
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  const matches = text.match(emailRegex);
  return matches ? matches[0] : null;
}

/**
 * Extract phone number using regex
 * @param {string} text - Text to search
 * @returns {string|null} - Found phone or null
 */
function extractPhone(text) {
  const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g;
  const matches = text.match(phoneRegex);
  return matches ? matches[0] : null;
}

/**
 * Extract name using basic heuristics
 * @param {string} text - Text to search
 * @returns {string|null} - Found name or null
 */
function extractName(text) {
  // Look for common patterns at the beginning of the document
  const lines = text.split('\n').filter(line => line.trim());

  // First non-empty line is often the name
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Basic validation: should contain 2-4 words, mostly letters
    if (firstLine.split(' ').length >= 2 && firstLine.split(' ').length <= 4) {
      const hasNumbers = /\d/.test(firstLine);
      const hasEmail = /@/.test(firstLine);
      if (!hasNumbers && !hasEmail) {
        return firstLine;
      }
    }
  }

  return null;
}

/**
 * Get empty structure for parsed CV data
 * @returns {Object} - Empty CV structure
 */
function getEmptyStructure() {
  return {
    basicInfo: {
      name: '',
      email: '',
      phone: '',
      location: ''
    },
    education: [],
    experience: [],
    projects: [],
    skills: [],
    certifications: []
  };
}

function getOrderedStructure(data) {
  const safeData = data && typeof data === 'object' ? data : {};
  const safeBasicInfo = safeData.basicInfo && typeof safeData.basicInfo === 'object' ? safeData.basicInfo : {};

  return {
    basicInfo: {
      name: typeof safeBasicInfo.name === 'string' ? safeBasicInfo.name.trim() : '',
      email: typeof safeBasicInfo.email === 'string' ? safeBasicInfo.email.trim() : '',
      phone: typeof safeBasicInfo.phone === 'string' ? safeBasicInfo.phone.trim() : '',
      location: typeof safeBasicInfo.location === 'string' ? safeBasicInfo.location.trim() : ''
    },
    education: Array.isArray(safeData.education) ? safeData.education : [],
    experience: Array.isArray(safeData.experience) ? safeData.experience : [],
    projects: Array.isArray(safeData.projects) ? safeData.projects : [],
    skills: Array.isArray(safeData.skills)
      ? safeData.skills.map((skill) => String(skill).trim()).filter(Boolean)
      : [],
    certifications: Array.isArray(safeData.certifications) ? safeData.certifications : []
  };
}

module.exports = {
  parseCVWithLLM,
  parseJSONResponse,
  validateAndApplyFallbacks,
  extractDataWithRegex
};

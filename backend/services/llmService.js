const axios = require('axios');

/**
 * Degree abbreviation to degree level mapping
 * Maps common degree abbreviations to their level: ["Matric", "Intermediate", "Bachelors", "Masters", "PhD", "Other"]
 */
const degreeAbbreviationToLevelMapping = {
  // Bachelor's Degrees
  'BA': 'Bachelors',
  'BS': 'Bachelors',
  'BSCS': 'Bachelors',
  'BSC': 'Bachelors',
  'B.Sc': 'Bachelors',
  'BE': 'Bachelors',
  'B.E': 'Bachelors',
  'BEng': 'Bachelors',
  'B.Eng': 'Bachelors',
  'B.Tech': 'Bachelors',
  'BTECH': 'Bachelors',
  'BCA': 'Bachelors',
  'B.Com': 'Bachelors',
  'BCOM': 'Bachelors',
  'B.A': 'Bachelors',
  'B.A.': 'Bachelors',
  'B.S.': 'Bachelors',
  'BBA': 'Bachelors',
  'Bachelor': 'Bachelors',
  
  // Master's Degrees
  'MA': 'Masters',
  'M.A': 'Masters',
  'M.A.': 'Masters',
  'MS': 'Masters',
  'M.S': 'Masters',
  'M.S.': 'Masters',
  'MSC': 'Masters',
  'M.Sc': 'Masters',
  'M.Tech': 'Masters',
  'MTECH': 'Masters',
  'MBA': 'Masters',
  'MCA': 'Masters',
  'M.Phil': 'Masters',
  'MPHIL': 'Masters',
  'MEng': 'Masters',
  'M.Eng': 'Masters',
  'M.E': 'Masters',
  'ME': 'Masters',
  'Master': 'Masters',
  
  // PhD/Doctorate
  'PhD': 'PhD',
  'PHD': 'PhD',
  'Ph.D': 'PhD',
  'Ph.D.': 'PhD',
  'DPhil': 'PhD',
  'D.Phil': 'PhD',
  'Doctorate': 'PhD',
  
  // Intermediate
  'Intermediate': 'Intermediate',
  'Inter': 'Intermediate',
  'A.Levels': 'Intermediate',
  'A-Levels': 'Intermediate',
  'HSSC': 'Intermediate',
  'HSC': 'Intermediate',
  
  // Matric
  'Matric': 'Matric',
  'SSC': 'Matric',
  'S.Sc': 'Matric',
  'High School': 'Matric',
  
  // Diploma
  'Diploma': 'Other',
  'Dip': 'Other',
};

/**
 * Generate a basic experience summary from extracted resume data
 * Used as fallback when LLM doesn't generate one
 * @param {Object} data - Parsed resume data
 * @returns {string} - Generated summary
 */
function generateFallbackExperienceSummary(data) {
  if (!data) return '';
  
  const parts = [];
  
  // Try to extract professional title from experience or create one from skills
  let title = '';
  if (Array.isArray(data.experience) && data.experience.length > 0) {
    const latestExp = data.experience[0];
    if (latestExp.position) {
      title = latestExp.position;
    }
  }
  
  if (!title && Array.isArray(data.skills) && data.skills.length > 0) {
    // Create title from top skills
    const skillsStr = data.skills.slice(0, 3).join(', ');
    title = `Skilled in ${skillsStr}`;
  }
  
  if (title) {
    parts.push(title);
  }
  
  // Add core technologies from skills
  if (Array.isArray(data.skills) && data.skills.length > 0) {
    const skills = data.skills.slice(0, 5).join(', ');
    parts.push(`with proficiency in ${skills}`);
  }
  
  // Add key projects if available
  if (Array.isArray(data.projects) && data.projects.length > 0) {
    const projectNames = data.projects
      .slice(0, 2)
      .map(p => p.name || p.title)
      .filter(Boolean)
      .join(', ');
    if (projectNames) {
      parts.push(`Developed projects including ${projectNames}`);
    }
  }
  
  // Add experience if available
  if (Array.isArray(data.experience) && data.experience.length > 0) {
    const expCount = data.experience.length;
    const companies = data.experience
      .slice(0, 2)
      .map(e => e.company)
      .filter(Boolean)
      .join(', ');
    if (companies) {
      parts.push(`with experience at ${companies}`);
    } else {
      parts.push(`with ${expCount} role${expCount > 1 ? 's' : ''} in professional settings`);
    }
  }
  
  return parts.join('. ').trim() || '';
}

/**
 * Map degree abbreviations and full forms to degree level
 * @param {string} degreeText - Degree abbreviation or name
 * @returns {string} - Degree level: "Matric", "Intermediate", "Bachelors", "Masters", "PhD", "Other"
 */
function mapDegreeToDegreeLevel(degreeText) {
  if (!degreeText) return 'Other';
  
  const trimmed = degreeText.trim();
  
  // Direct match
  if (degreeAbbreviationToLevelMapping[trimmed]) {
    return degreeAbbreviationToLevelMapping[trimmed];
  }
  
  // Try case-insensitive match
  for (const [abbr, level] of Object.entries(degreeAbbreviationToLevelMapping)) {
    if (abbr.toLowerCase() === trimmed.toLowerCase()) {
      return level;
    }
  }
  
  // Keyword-based detection as fallback
  const lowerDegree = trimmed.toLowerCase();
  if (lowerDegree.includes('phd') || lowerDegree.includes('doctorate')) {
    return 'PhD';
  }
  if (lowerDegree.includes('master') || lowerDegree.includes('m.') || lowerDegree.includes('mba')) {
    return 'Masters';
  }
  if (lowerDegree.includes('bachelor') || lowerDegree.includes('b.')) {
    return 'Bachelors';
  }
  if (lowerDegree.includes('intermediate') || lowerDegree.includes('a.level') || lowerDegree.includes('hssc')) {
    return 'Intermediate';
  }
  if (lowerDegree.includes('matric') || lowerDegree.includes('ssc') || lowerDegree.includes('high school')) {
    return 'Matric';
  }
  
  return 'Other';
}

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
  "education": [{ 
    "degreeLevel": "Bachelors", 
    "degreeField": "", 
    "institution": "", 
    "graduationYear": null, 
    "cgpa": null 
  }],
  "experience": [{ "company": "", "position": "", "duration": "", "description": "" }],
  "skills": [""],
  "projects": [{ "name": "", "description": "", "technologies": "" }],
  "certifications": [{ "name": "", "issuer": "", "date": "" }],
  "experienceSummary": ""
}

CRITICAL RULES FOR EDUCATION EXTRACTION:
1. Extract ONLY the HIGHEST and LATEST degree level from the resume.
2. "degreeLevel": Must be ONE of these values: "Matric", "Intermediate", "Bachelors", "Masters", "PhD", "Other"
   Map these:
   - BS, BE, BCS, B.Sc, Bachelor → "Bachelors"
   - MS, MSc, M.Phil, MBA, MCS, M.Tech → "Masters"
   - PhD, Ph.D, Doctorate → "PhD"
   - Intermediate, A-Levels, HSSC, HSC → "Intermediate"
   - Matric, SSC, S.Sc → "Matric"
   - If unknown → "Other"
3. "degreeField": Extract the specific field or major of the HIGHEST degree
   - Write the raw field as it appears in CV (e.g., "Computer Science", "Data Science", "Software Engineering", "Electrical Engineering")
   - Do NOT abbreviate. If the CV says "CS" only, infer it as "Computer Science"
   - If no field mentioned, use empty string
4. "institution": Name of the institution for the HIGHEST degree
5. "graduationYear": Extract graduation or expected graduation year as a NUMBER (e.g., 2023). If not available, use null (NOT 0)
6. "cgpa": Extract CGPA or percentage score as a NUMBER (e.g., 3.8 or 85). If not available, use null (NOT 0)
7. If multiple degrees exist, always select the highest level: PhD > Masters > Bachelors > Intermediate > Matric > Other
8. If same degree level exists, pick the most recent one.

Other Rules:
- Return only one JSON object (no markdown/code fences/explanations).
- Keep unknown fields as empty strings or null as specified above.
- Keep missing sections as empty arrays.
- Extract as many real values as possible from the resume text.
- For experienceSummary: Generate a single-paragraph professional summary following this exact format:
  1. Start with a strong professional title (e.g., "Full Stack Developer experienced in...").
  2. List core technologies in one sentence (React, Node.js, Express.js, databases, etc.).
  3. Mention additional tools/frameworks separately using "with additional proficiency in...".
  4. Include 2-3 key projects with stack names (e.g., PERN, MERN, Django+React) and their purpose.
  5. Highlight professional experience (internship/trainee level) with real-world contributions: frontend UI development, backend workflows, API integration, or production-level work.
  6. Use concise, formal, impactful language without unnecessary adjectives.
  7. Keep it in ONE paragraph with no bullet points.
  8. Avoid repetition and ensure ATS-friendly, professional tone.

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
      const cgpaMatch = line.match(/(?:cgpa|gpa|grade)[\s:]*([0-4]\.\d{1,2}|[0-9]\.?[0-9]?)/i);
      
      const graduationYear = yearMatch ? parseInt(yearMatch[0], 10) : null;
      const cgpa = cgpaMatch ? parseFloat(cgpaMatch[1]) : null;
      
      // Extract degree level and field
      let degreeLevel = 'Other';
      let degreeField = '';
      let degreeText = line;
      
      // Detect degree level
      if (/phd|doctorate/i.test(line)) {
        degreeLevel = 'PhD';
      } else if (/master|m\.?tech|mtech|msc|ms|m\.?a|mba|mca|mphil/i.test(line)) {
        degreeLevel = 'Masters';
      } else if (/bachelor|bscs|b\.?tech|btech|bsc|bs|bca|b\.?com|bba|ba/i.test(line)) {
        degreeLevel = 'Bachelors';
      } else if (/intermediate|a\.?level|hssc|hsc/i.test(line)) {
        degreeLevel = 'Intermediate';
      } else if (/matric|ssc|high school/i.test(line)) {
        degreeLevel = 'Matric';
      }
      
      // Try to extract field from the line
      const fieldMatch = line.match(/(?:in|of)\s+([A-Za-z\s]+?)(?:\s+(?:from|university|college|institute)|$)/i);
      if (fieldMatch) {
        degreeField = fieldMatch[1].trim();
      }
      
      result.education.push({
        degreeLevel,
        degreeField,
        institution: line,
        graduationYear,
        cgpa
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
    certifications: [],
    experienceSummary: ''
  };
}

/**
 * Get empty education entry with proper defaults
 * @returns {Object} - Empty education entry
 */
function getEmptyEducationEntry() {
  return {
    degreeLevel: 'Other',
    degreeField: '',
    institution: '',
    graduationYear: null,
    cgpa: null
  };
}

function getOrderedStructure(data) {
  const safeData = data && typeof data === 'object' ? data : {};
  const safeBasicInfo = safeData.basicInfo && typeof safeData.basicInfo === 'object' ? safeData.basicInfo : {};

  // Process education array with new structure
  const processedEducation = Array.isArray(safeData.education)
    ? safeData.education.map((edu) => {
        const eduObj = edu && typeof edu === 'object' ? edu : {};
        
        let degreeLevel = 'Other';
        let graduationYear = null;
        let cgpa = null;
        
        // Map degree name or level to degreeLevel enum
        if (eduObj.degreeLevel) {
          // If already a degree level, validate it
          const validLevels = ['Matric', 'Intermediate', 'Bachelors', 'Masters', 'PhD', 'Other'];
          degreeLevel = validLevels.includes(eduObj.degreeLevel) ? eduObj.degreeLevel : 'Other';
        } else if (eduObj.degreeName || eduObj.degree) {
          // Convert old format to new level format
          degreeLevel = mapDegreeToDegreeLevel(eduObj.degreeName || eduObj.degree);
        }
        
        // Convert graduationYear to number, default to null
        if (eduObj.graduationYear) {
          const yearNum = typeof eduObj.graduationYear === 'number' ? eduObj.graduationYear : parseInt(String(eduObj.graduationYear), 10);
          graduationYear = !isNaN(yearNum) && yearNum > 1900 && yearNum <= new Date().getFullYear() + 10 ? yearNum : null;
        } else if (eduObj.year) {
          // Support old 'year' field
          const yearNum = typeof eduObj.year === 'number' ? eduObj.year : parseInt(String(eduObj.year), 10);
          graduationYear = !isNaN(yearNum) && yearNum > 1900 && yearNum <= new Date().getFullYear() + 10 ? yearNum : null;
        }
        
        // Convert CGPA to number, default to null
        if (eduObj.cgpa || eduObj.cgpa === 0) {
          const cgpaNum = typeof eduObj.cgpa === 'number' ? eduObj.cgpa : parseFloat(String(eduObj.cgpa));
          cgpa = !isNaN(cgpaNum) && cgpaNum >= 0 && cgpaNum <= 4.5 ? parseFloat(cgpaNum.toFixed(2)) : null;
        }
        
        // Extract field, preferring degreeField over old fields
        let degreeField = '';
        if (typeof eduObj.degreeField === 'string') {
          degreeField = eduObj.degreeField.trim();
        } else if (typeof eduObj.field === 'string') {
          degreeField = eduObj.field.trim();
        }
        
        return {
          degreeLevel,
          degreeField,
          institution: typeof eduObj.institution === 'string' ? eduObj.institution.trim() : '',
          graduationYear,
          cgpa
        };
      })
    : [];

  const result = {
    basicInfo: {
      name: typeof safeBasicInfo.name === 'string' ? safeBasicInfo.name.trim() : '',
      email: typeof safeBasicInfo.email === 'string' ? safeBasicInfo.email.trim() : '',
      phone: typeof safeBasicInfo.phone === 'string' ? safeBasicInfo.phone.trim() : '',
      location: typeof safeBasicInfo.location === 'string' ? safeBasicInfo.location.trim() : ''
    },
    education: processedEducation,
    experience: Array.isArray(safeData.experience) ? safeData.experience : [],
    projects: Array.isArray(safeData.projects) ? safeData.projects : [],
    skills: Array.isArray(safeData.skills)
      ? safeData.skills.map((skill) => String(skill).trim()).filter(Boolean)
      : [],
    certifications: Array.isArray(safeData.certifications) ? safeData.certifications : [],
    experienceSummary: typeof safeData.experienceSummary === 'string' ? safeData.experienceSummary.trim() : ''
  };

  // Generate fallback experience summary if not provided by LLM
  if (!result.experienceSummary) {
    result.experienceSummary = generateFallbackExperienceSummary(result);
  }

  return result;
}

module.exports = {
  parseCVWithLLM,
  parseJSONResponse,
  validateAndApplyFallbacks,
  extractDataWithRegex,
  mapDegreeToDegreeLevel,
  generateFallbackExperienceSummary
};


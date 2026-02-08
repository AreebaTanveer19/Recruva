const axios = require('axios');

/**
 * Parse CV text using LLM with strict JSON output
 * @param {string} cvText - Extracted text from CV
 * @returns {Promise<Object>} - Parsed CV data as JSON object
 */
async function parseCVWithLLM(cvText) {
  try {
    // Clean and prepare the text
    const cleanCVText = cvText.substring(0, 8000);

    const prompt = `You are a resume parser. Extract ALL information from following CV into a valid JSON object. 
You MUST return ONLY raw JSON - no markdown, no code blocks, no explanations.

CRITICAL: Follow this exact structure:
{
  "basicInfo": { "name": "", "email": "", "phone": "", "location": "" },
  "education": [
    { "degree": "Bachelor of Science in Computer Science", "institution": "University Name", "year": "2020" }
  ],
  "experience": [
    { "company": "Company Name", "position": "Job Title", "duration": "2020-Present", "description": "Job responsibilities and achievements" }
  ],
  "skills": ["JavaScript", "React", "Node.js"],
  "projects": [
    { "name": "Project Name", "description": "Project description", "technologies": "React, Node.js" }
  ],
  "certifications": [
    { "name": "Certification Name", "issuer": "Issuing Organization", "date": "2023" }
  ]
}

- For education: look for degrees, institutions, graduation years
- For experience: find companies, positions, dates, descriptions
- For skills: extract all technical skills, tools, technologies
- For projects: find project names, descriptions, technologies used
- For certifications: look for certification names, issuers, dates
- Return ONLY JSON object - no surrounding text

Resume text to parse:
${cleanCVText}`;

    // Make API call to LLM using correct endpoint
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'openai/gpt-oss-120b',
        messages: [
          {
            role: 'system',
            content: 'You are a resume parser. Return ONLY valid JSON without any markdown formatting or explanations. Follow exact structure provided.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 9000,
        temperature: 0.1
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Extract content from correct response structure
    const llmResponse = response.data.choices?.[0]?.message?.content;

    if (!llmResponse) {
      throw new Error('Empty response from LLM');
    }

    // Parse the JSON response
    const parsedData = parseJSONResponse(llmResponse);

    // Validate and apply fallbacks if needed
    const result = validateAndApplyFallbacks(parsedData, cvText);

    return result;

  } catch (error) {
    // If LLM fails, try enhanced regex extraction
    return extractDataWithRegex(cvText);
  }
}

/**
 * Parse JSON response from LLM, handling potential formatting issues
 * @param {string} response - Raw response from LLM
 * @returns {Object} - Parsed JSON object
 */
function parseJSONResponse(response) {
  try {
    // Clean response - remove markdown code blocks if present
    let cleanResponse = response.trim();
    
    // Remove markdown code blocks (```json ... ```)
    cleanResponse = cleanResponse.replace(/^```json\s*/i, '');
    cleanResponse = cleanResponse.replace(/^```\s*/, '');
    cleanResponse = cleanResponse.replace(/\s*```$/, '');
    
    // Remove any leading/trailing whitespace again
    cleanResponse = cleanResponse.trim();
    
    // Try to parse directly
    return JSON.parse(cleanResponse);
  } catch (error) {
    // Try to extract JSON from response using regex
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      } catch (e) {
        // Continue to fallback
      }
    }

    // If all fails, return empty structure
    return getEmptyStructure();
  }
}

/**
 * Validate parsed data and apply regex fallbacks for missing critical fields
 * @param {Object} data - Parsed data from LLM
 * @param {string} originalText - Original CV text for regex extraction
 * @returns {Object} - Validated and enhanced data
 */
function validateAndApplyFallbacks(data, originalText) {
  // Start with ordered structure
  const result = getOrderedStructure({});

  // Merge LLM data - preserve non-empty arrays from parsed data
  if (data) {
    // Basic info merge
    result.basicInfo = { ...result.basicInfo, ...data.basicInfo };
    
    // Preserve arrays if they have content
    result.education = Array.isArray(data.education) && data.education.length > 0 ? data.education : [];
    result.experience = Array.isArray(data.experience) && data.experience.length > 0 ? data.experience : [];
    result.projects = Array.isArray(data.projects) && data.projects.length > 0 ? data.projects : [];
    result.skills = Array.isArray(data.skills) && data.skills.length > 0 ? data.skills : [];
    result.certifications = Array.isArray(data.certifications) && data.certifications.length > 0 ? data.certifications : [];
  }

  // If LLM returned mostly empty arrays, use regex extraction as fallback
  const totalItems = result.education.length + result.experience.length + result.projects.length + result.skills.length + result.certifications.length;
  
  if (totalItems === 0) { // Only use regex fallback if absolutely nothing was extracted
    const regexData = extractDataWithRegex(originalText);
    
    // Merge regex data, but don't overwrite existing basic info
    result.education = result.education.length > 0 ? result.education : regexData.education;
    result.experience = result.experience.length > 0 ? result.experience : regexData.experience;
    result.projects = result.projects.length > 0 ? result.projects : regexData.projects;
    result.skills = result.skills.length > 0 ? result.skills : regexData.skills;
    result.certifications = result.certifications.length > 0 ? result.certifications : regexData.certifications;
    
    // Fill in missing basic info from regex
    if (!result.basicInfo.email) result.basicInfo.email = regexData.basicInfo.email;
    if (!result.basicInfo.phone) result.basicInfo.phone = regexData.basicInfo.phone;
    if (!result.basicInfo.name) result.basicInfo.name = regexData.basicInfo.name;
  }

  // Apply regex fallbacks for missing critical info only
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

  return result;
}

/**
 * Enhanced regex-based extraction as fallback
 * @param {string} text - CV text
 * @returns {Object} - Extracted information
 */
function extractDataWithRegex(text) {
  // Start with ordered structure
  const result = getOrderedStructure({});
  
  // Basic info
  result.basicInfo.email = extractEmail(text);
  result.basicInfo.phone = extractPhone(text);
  result.basicInfo.name = extractName(text);
  
  // Extract skills (improved patterns)
  const skillsPatterns = [
    /(?:skills|technical skills|core competencies|technologies|tools|frameworks)[:\s]*([^\n]*?)(?=\n\n|\n[A-Z]|\n[0-9]|\Z)/i,
    /(?:skills|technical skills)[:\s]*\n((?:[^\n]*[,，;\/][^\n]*\n?)*)/i
  ];
  
  for (const pattern of skillsPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const skillsText = match[1];
      const skills = skillsText.split(/[,，;\/\n]/).map(s => s.trim()).filter(s => s.length > 2 && !s.match(/^\d+$/));
      result.skills = [...result.skills, ...skills];
    }
  }
  
  // Extract education (improved pattern)
  const educationPatterns = [
    /(?:education|academic background|qualifications)[:\s]*\n([\s\S]*?)(?=\n\s*\n|\nexperience|\nskills|\nprojects|\ncertifications|\Z)/i,
    /(?:bachelor|master|phd|associate|diploma|certificate)[\s\S]*?(?:university|college|institute)[\s\S]*?(?:\d{4}|\d{2}|\Z)/gi
  ];
  
  for (const pattern of educationPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.trim();
        if (cleanMatch.length > 20) {
          // Try to extract degree and institution
          const degreeMatch = cleanMatch.match(/(bachelor|master|phd|associate|diploma|certificate)[^\\n]*/i);
          const institutionMatch = cleanMatch.match(/(university|college|institute|academy)[^\\n]*/i);
          const yearMatch = cleanMatch.match(/\b(19|20)\d{2}\b/);
          
          result.education.push({
            degree: degreeMatch ? degreeMatch[0] : "Degree not specified",
            institution: institutionMatch ? institutionMatch[0] : cleanMatch.substring(0, 100),
            year: yearMatch ? yearMatch[0] : ""
          });
        }
      });
    }
  }
  
  // Extract experience (much improved pattern)
  const experiencePatterns = [
    // Pattern for date ranges followed by job details
    /(\d{4}\s*[-–]\s*(?:present|\d{4})|\d{4}\s*[-–]\s*present|present)[\s\S]*?(?=\n\d{4}|\n\s*\n|\n[A-Z][A-Z]|\Z)/gi,
    // Pattern for "Experience" section
    /(?:experience|work history|employment|professional experience)[:\s]*\n([\s\S]*?)(?=\n\s*\n|\n[A-Z][A-Z]|\nskills|\neducation|\nprojects|\ncertifications|\Z)/i,
    // Pattern for job titles with companies
    /(?:senior|junior|lead|principal|software|engineer|developer|manager|director)[^\\n]*[|\\-][^\\n]*\n[\s\S]*?(?=\n\n|\n\d|\n[A-Z]|\Z)/gi
  ];
  
  for (const pattern of experiencePatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.trim();
        if (cleanMatch.length > 30) {
          // Try to extract company, position, and duration
          const lines = cleanMatch.split('\n').filter(line => line.trim());
          
          let company = "Company not specified";
          let position = "Position not specified";
          let duration = "Duration not specified";
          let description = "";
          
          // Extract duration from first line if it contains dates
          const durationMatch = lines[0]?.match(/(\d{4}\s*[-–]\s*(?:present|\d{4})|present)/i);
          if (durationMatch) {
            duration = durationMatch[0];
          }
          
          // Extract position from first line
          if (lines[0] && !durationMatch) {
            position = lines[0].trim();
          } else if (lines[0] && durationMatch) {
            const parts = lines[0].split(durationMatch[0]);
            if (parts[0]) position = parts[0].replace(/[|\\-]/, '').trim();
            if (parts[1]) company = parts[1].replace(/[|\\-]/, '').trim();
          }
          
          // Extract company from second line if not found
          if (company === "Company not specified" && lines[1]) {
            company = lines[1].trim();
          }
          
          // Description is everything else
          description = lines.slice(1).join(' ').substring(0, 300);
          
          result.experience.push({
            company: company || "Company not specified",
            position: position || "Position not specified", 
            duration: duration || "Duration not specified",
            description: description || cleanMatch.substring(0, 200) + "..."
          });
        }
      });
    }
  }
  
  // Extract projects (improved pattern)
  const projectPatterns = [
    /(?:projects|personal projects|portfolio)[:\s]*\n([\s\S]*?)(?=\n\s*\n|\nexperience|\nskills|\neducation|\ncertifications|\Z)/i,
    /(?:project|application|system|platform|website)[^\\n]*\n[\s\S]*?(?=\n\n|\nproject|\n\d|\Z)/gi
  ];
  
  for (const pattern of projectPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.trim();
        if (cleanMatch.length > 20) {
          const lines = cleanMatch.split('\n').filter(line => line.trim());
          
          let projectName = "Project not specified";
          let description = "";
          let technologies = "";
          
          if (lines[0]) {
            projectName = lines[0].trim();
          }
          
          // Look for technologies in description
          const techMatch = cleanMatch.match(/(?:technologies|tech stack|tools|built with)[:\s]*([^\n]*)/i);
          if (techMatch) {
            technologies = techMatch[1];
          }
          
          description = lines.slice(1).join(' ').substring(0, 250);
          
          result.projects.push({
            name: projectName,
            description: description || "Project description not available",
            technologies: technologies || "Technologies not specified"
          });
        }
      });
    }
  }
  
  // Extract certifications (improved pattern)
  const certificationPatterns = [
    /(?:certifications|certificates|credentials)[:\s]*\n([\s\S]*?)(?=\n\s*\n|\nexperience|\nskills|\neducation|\nprojects|\Z)/i,
    /(certified|aws|google|microsoft|oracle|cisco|pmp)[\s\S]*?(?:\d{4}|\Z)/gi
  ];
  
  for (const pattern of certificationPatterns) {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const cleanMatch = match.trim();
        if (cleanMatch.length > 10) {
          result.certifications.push({
            name: cleanMatch,
            issuer: "Issuer not specified",
            date: ""
          });
        }
      });
    }
  }
  
  // Remove duplicates and clean up
  result.skills = [...new Set(result.skills)].filter(skill => skill.length > 2);
  
  return result;
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
  return {
    basicInfo: data.basicInfo || {
      name: '',
      email: '',
      phone: '',
      location: ''
    },
    education: Array.isArray(data.education) ? data.education : [],
    experience: Array.isArray(data.experience) ? data.experience : [],
    projects: Array.isArray(data.projects) ? data.projects : [],
    skills: Array.isArray(data.skills) ? data.skills : [],
    certifications: Array.isArray(data.certifications) ? data.certifications : []
  };
}

module.exports = {
  parseCVWithLLM,
  parseJSONResponse,
  validateAndApplyFallbacks,
  extractDataWithRegex
};

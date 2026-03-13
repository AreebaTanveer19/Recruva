const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// TITLE → KEYWORD MAP

const TITLE_KEYWORD_MAP = {
  // Frontend
  "react":          ["React", "Frontend", "JavaScript"],
  "angular":        ["Angular", "Frontend", "TypeScript"],
  "vue":            ["Vue", "Frontend", "JavaScript"],
  "frontend":       ["Frontend", "JavaScript", "HTML", "CSS"],
  "ui":             ["Frontend", "HTML", "CSS", "JavaScript"],

  // Backend
  "node":           ["Node.js", "Backend", "JavaScript", "REST API"],
  "express":        ["Node.js", "Backend", "REST API"],
  "django":         ["Python", "Django", "Backend"],
  "flask":          ["Python", "Flask", "Backend"],
  "spring":         ["Java", "Spring Boot", "Backend"],
  "laravel":        ["PHP", "Laravel", "Backend"],
  "backend":        ["Backend", "REST API", "Databases"],

  // Fullstack
  "fullstack":      ["React", "Node.js", "Databases", "REST API"],
  "full stack":     ["React", "Node.js", "Databases", "REST API"],
  "full-stack":     ["React", "Node.js", "Databases", "REST API"],
  "mern":           ["MongoDB", "React", "Node.js", "REST API"],
  "mean":           ["MongoDB", "Angular", "Node.js", "REST API"],

  // Mobile
  "mobile":         ["React Native", "Mobile", "JavaScript"],
  "android":        ["Android", "Java", "Kotlin", "Mobile"],
  "ios":            ["iOS", "Swift", "Mobile"],
  "flutter":        ["Flutter", "Dart", "Mobile"],
  "react native":   ["React Native", "Mobile", "JavaScript"],

  // DevOps / Cloud
  "devops":         ["Docker", "Kubernetes", "CI/CD", "Linux"],
  "cloud":          ["AWS", "Cloud", "DevOps"],
  "aws":            ["AWS", "Cloud", "DevOps"],
  "azure":          ["Azure", "Cloud", "DevOps"],
  "docker":         ["Docker", "DevOps", "Kubernetes"],
  "kubernetes":     ["Kubernetes", "DevOps", "Docker"],

  // Data / AI / ML
  "data":           ["Python", "SQL", "Data Structures"],
  "machine learning": ["Machine Learning", "Python", "DSA"],
  "ml":             ["Machine Learning", "Python", "DSA"],
  "ai":             ["Machine Learning", "Python", "Algorithms"],
  "data science":   ["Python", "SQL", "Machine Learning"],
  "data engineer":  ["Python", "SQL", "ETL", "Databases"],

  // Languages
  "python":         ["Python", "Backend"],
  "java":           ["Java", "OOP", "Backend"],
  "golang":         ["Go", "Backend", "Concurrency"],
  "rust":           ["Rust", "Systems Programming"],
  "typescript":     ["TypeScript", "JavaScript", "Frontend"],
  "php":            ["PHP", "Backend"],

  // Other
  "security":       ["Cybersecurity", "Networking", "Linux"],
  "blockchain":     ["Blockchain", "Solidity", "Web3"],
  "qa":             ["Testing", "QA", "Automation"],
  "embedded":       ["C", "C++", "Embedded Systems"],
  "game":           ["C++", "Unity", "Game Development"],
};

// ─────────────────────────────────────────────────────────────
// COMMON FILLER WORDS TO IGNORE FROM REQUIREMENTS
// ─────────────────────────────────────────────────────────────
const IGNORE_WORDS = [
  "experience", "years", "knowledge", "understanding", "familiarity",
  "ability", "skills", "strong", "good", "excellent", "proficiency",
  "must", "required", "preferred", "plus", "degree", "bachelor",
  "master", "working", "proven", "demonstrated", "solid", "hands-on",
  "minimum", "least", "with", "the", "and", "or", "in", "of",
];

// LOCAL EXTRACTION

function extractKeywordsLocally(jobTitle = "", requirements = []) {
  const keywords = new Set();

  // 1. Match from job title
  const titleLower = jobTitle.toLowerCase();
  for (const [key, tags] of Object.entries(TITLE_KEYWORD_MAP)) {
    if (titleLower.includes(key)) {
      tags.forEach(t => keywords.add(t));
    }
  }

  // 2. Extract from requirements array
  requirements.forEach(req => {
    const cleaned = req
      .toLowerCase()
      .replace(/\.js$/i, "")          
      .replace(/\(.*?\)/g, "")        
      .replace(/[^a-zA-Z0-9\s\+\#]/g, " ") 
      .trim();

    // Short entries are likely clean keywords — use directly
    const wordCount = cleaned.split(/\s+/).length;
    if (wordCount <= 3) {
      const isFillerWord = IGNORE_WORDS.some(w => cleaned === w);
      if (!isFillerWord && cleaned.length > 1) {
        // Capitalize first letter of each word for consistency
        const formatted = cleaned
          .split(/\s+/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        keywords.add(formatted);
      }
    }

    // Long sentences — try to pull known tech names from them
    if (wordCount > 3) {
      for (const [key, tags] of Object.entries(TITLE_KEYWORD_MAP)) {
        if (cleaned.includes(key)) {
          tags.forEach(t => keywords.add(t));
        }
      }
    }
  });

  return [...keywords];
}


// LLM EXTRACTION 

async function extractKeywordsViaLLM(jobDescription = "", requirements = []) {
  const requirementsText = requirements.length > 0
    ? `\nJob Requirements:\n${requirements.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
    : "";

  const prompt = `Extract 6-10 skill keywords from this job posting.

RULES:
- Short keywords only (1-3 words max)
- Ignore: years of experience, soft skills, education, salary, location
- Use standard names (examples below)

STANDARDIZATION:
- ReactJS → "React"
- NodeJS → "Node.js"  
- TypeScript/TS → "TypeScript"
- RESTful API → "REST API"
- K8s → "Kubernetes"
- Amazon cloud → "AWS"
- Google cloud → "GCP"

CATEGORY MAPPING (extract the category keyword when you see these topics):
- Programming languages (Python, Java, PHP, Go, Rust) → use the language name as-is
- Frontend (React, Angular, Vue, HTML, CSS) → use tool name + add "Frontend"
- Backend (Node.js, Django, Spring, Laravel) → use tool name + add "Backend"
- Databases (PostgreSQL, MongoDB, MySQL, Redis) → use db name + add "Databases"
- DevOps (Docker, Kubernetes, CI/CD, Linux) → use tool name + add "DevOps"
- Cloud (AWS, Azure, GCP) → use cloud name + add "Cloud"
- Mobile (React Native, Flutter, Swift, Kotlin) → use tool name + add "Mobile"
- Software Development (Agile, Scrum, Git, SDLC, TDD) → use term + add "Software Development"
- Project Management (Jira, Trello, Asana, PMP, Kanban) → use term + add "Project Management"
- System Design (Microservices, Architecture, Scalability) → use term + add "System Design"
- Data & AI (Machine Learning, NLP, Data Science, TensorFlow) → use term + add "Machine Learning"
- Security (OAuth, JWT, Cybersecurity, Penetration Testing) → use term + add "Security"
- Testing (Jest, Selenium, TDD, Unit Testing) → use term + add "Testing"
- OOP concepts (Inheritance, Design Patterns, SOLID) → use term + add "OOP"
- DSA concepts (Algorithms, Data Structures, Big O) → use term + add "DSA"

${requirementsText}

Job Description:
${jobDescription}

Return ONLY a valid JSON array of strings. No markdown, no explanation.
Example output for a React Developer role: ["React", "Frontend", "TypeScript", "Node.js", "Backend", "REST API", "PostgreSQL", "Databases", "Git", "Software Development"]`;

  const result = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,  
    max_tokens: 200,  
  });

  const raw = result.choices[0].message.content.trim()
    .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  return JSON.parse(raw);
}

// MAIN EXPORT — tries local first, falls back to LLM

const extractKeywords = async (jobTitle = "", jobDescription = "", requirements = []) => {

  // Step 1 — Try local extraction first 
  const localKeywords = extractKeywordsLocally(jobTitle, requirements);
  console.log(`🔍 Local extraction found ${localKeywords.length} keywords:`, localKeywords);

  // If local found enough keywords — use them, skip LLM
  if (localKeywords.length >= 4) {
    console.log(" Local extraction sufficient — 0 API calls used");
    return localKeywords;
  }

  // Step 2 — Local didn't find enough, fall back to LLM
  console.log(`Only ${localKeywords.length} keywords locally — falling back to LLM`);
  const llmKeywords = await extractKeywordsViaLLM(jobDescription, requirements);
  console.log(`LLM extraction found ${llmKeywords.length} keywords:`, llmKeywords);

  // Merge both — local + LLM, deduplicated
  const merged = [...new Set([...localKeywords, ...llmKeywords])];
  console.log(`🔀 Merged keywords (${merged.length}):`, merged);

  return merged;
}

module.exports = { extractKeywords };
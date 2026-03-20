const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// TITLE → KEYWORD MAP

// const TITLE_KEYWORD_MAP = {
//   // Frontend
//   "react":          ["React", "Frontend", "JavaScript"],
//   "angular":        ["Angular", "Frontend", "TypeScript"],
//   "vue":            ["Vue", "Frontend", "JavaScript"],
//   "frontend":       ["Frontend", "JavaScript"],
//   "ui":             ["Frontend"],

//   // Backend
//   "node":           ["Node.js", "Backend", "JavaScript", "REST API"],
//   "express":        ["Node.js", "Backend", "REST API"],
//   "django":         ["Python", "Django", "Backend"],
//   "flask":          ["Python", "Flask", "Backend"],
//   "spring":         ["Java", "Spring Boot", "Backend"],
//   "laravel":        ["PHP", "Laravel", "Backend"],
//   "backend":        ["Backend", "REST API", "Databases"],

//   // Fullstack
//   "fullstack":      ["React", "Node.js", "Databases", "REST API"],
//   "full stack":     ["React", "Node.js", "Databases", "REST API"],
//   "full-stack":     ["React", "Node.js", "Databases", "REST API"],
//   "mern":           ["MongoDB", "React", "Node.js", "REST API"],
//   "mean":           ["MongoDB", "Angular", "Node.js", "REST API"],

//   // Mobile
//   "mobile":         ["React Native", "Mobile", "JavaScript"],
//   "android":        ["Android", "Java", "Kotlin", "Mobile"],
//   "ios":            ["iOS", "Swift", "Mobile"],
//   "flutter":        ["Flutter", "Dart", "Mobile"],
//   "react native":   ["React Native", "Mobile", "JavaScript"],

//   // DevOps / Cloud
//   "devops":         ["Docker", "Kubernetes", "CI/CD", "Linux"],
//   "cloud":          ["AWS", "Cloud", "DevOps"],
//   "aws":            ["AWS", "Cloud", "DevOps"],
//   "azure":          ["Azure", "Cloud", "DevOps"],
//   "docker":         ["Docker", "DevOps", "Kubernetes"],
//   "kubernetes":     ["Kubernetes", "DevOps", "Docker"],

//   // Data / AI / ML
//   "data":           ["Python", "SQL", "Data Structures"],
//   "machine learning": ["Machine Learning", "Python", "DSA"],
//   "ml":             ["Machine Learning", "Python", "DSA"],
//   "ai":             ["Machine Learning", "Python", "Algorithms"],
//   "data science":   ["Python", "SQL", "Machine Learning"],
//   "data engineer":  ["Python", "SQL", "ETL", "Databases"],

//   // Languages
//   "python":         ["Python", "Backend"],
//   "java":           ["Java", "OOP", "Backend"],
//   "golang":         ["Go", "Backend", "Concurrency"],
//   "rust":           ["Rust", "Systems Programming"],
//   "typescript":     ["TypeScript", "JavaScript", "Frontend"],
//   "php":            ["PHP", "Backend"],

//   // Other
//   "security":       ["Cybersecurity", "Networking", "Linux"],
//   "blockchain":     ["Blockchain", "Solidity", "Web3"],
//   "qa":             ["Testing", "QA", "Automation"],
//   "embedded":       ["C", "C++", "Embedded Systems"],
//   "game":           ["C++", "Unity", "Game Development"],
// };

const TITLE_KEYWORD_MAP = {
  // ─── Frontend ────────────────────────────────────────────────
  "react":             ["React", "JavaScript", "Frontend", "HTML", "CSS"],
  "angular":           ["Angular", "TypeScript", "Frontend", "RxJS", "HTML"],
  "vue":               ["Vue", "JavaScript", "Frontend", "HTML", "CSS"],
  "svelte":            ["Svelte", "JavaScript", "Frontend", "HTML"],
  "next":              ["Next.js", "React", "JavaScript", "SSR", "Frontend"],
  "nuxt":              ["Nuxt.js", "Vue", "JavaScript", "SSR", "Frontend"],
  "frontend":          ["JavaScript", "HTML", "CSS", "Frontend", "REST API"],
  "ui":                ["Frontend", "HTML", "CSS", "Accessibility"],
  "ux":                ["Frontend", "Accessibility", "Design Systems"],

  // ─── Backend ─────────────────────────────────────────────────
  "node":              ["Node.js", "JavaScript", "Backend", "REST API", "Databases"],
  "express":           ["Node.js", "Express", "Backend", "REST API", "Middleware"],
  "nestjs":            ["NestJS", "TypeScript", "Node.js", "Backend", "REST API"],
  "django":            ["Django", "Python", "Backend", "REST API", "ORM"],
  "flask":             ["Flask", "Python", "Backend", "REST API"],
  "fastapi":           ["FastAPI", "Python", "Backend", "REST API", "Async"],
  "spring":            ["Spring Boot", "Java", "Backend", "REST API", "Microservices"],
  "laravel":           ["Laravel", "PHP", "Backend", "REST API", "ORM"],
  "rails":             ["Ruby on Rails", "Ruby", "Backend", "REST API", "MVC"],
  "dotnet":            [".NET", "C#", "Backend", "REST API", "Microservices"],
  "asp.net":           ["ASP.NET", "C#", "Backend", "REST API"],
  "golang":            ["Go", "Backend", "Concurrency", "Microservices", "REST API"],
  "rust":              ["Rust", "Systems Programming", "Concurrency", "Backend"],
  "backend":           ["Backend", "REST API", "Databases", "Authentication", "Caching"],

  // ─── Fullstack ────────────────────────────────────────────────
  "fullstack":         ["JavaScript", "React", "Node.js", "Databases", "REST API"],
  "full stack":        ["JavaScript", "React", "Node.js", "Databases", "REST API"],
  "full-stack":        ["JavaScript", "React", "Node.js", "Databases", "REST API"],
  "mern":              ["MongoDB", "Express", "React", "Node.js", "REST API"],
  "mean":              ["MongoDB", "Express", "Angular", "Node.js", "REST API"],
  "mevn":              ["MongoDB", "Express", "Vue", "Node.js", "REST API"],
  "t3":                ["Next.js", "TypeScript", "Prisma", "tRPC", "Tailwind"],

  // ─── Mobile ───────────────────────────────────────────────────
  "mobile":            ["React Native", "Mobile", "JavaScript", "iOS", "Android"],
  "android":           ["Android", "Kotlin", "Java", "Mobile", "Jetpack Compose"],
  "ios":               ["iOS", "Swift", "SwiftUI", "Mobile", "Xcode"],
  "flutter":           ["Flutter", "Dart", "Mobile", "iOS", "Android"],
  "react native":      ["React Native", "JavaScript", "Mobile", "iOS", "Android"],
  "kotlin":            ["Kotlin", "Android", "Mobile", "Coroutines"],
  "swift":             ["Swift", "iOS", "SwiftUI", "Mobile"],

  // ─── DevOps / Cloud / Infrastructure ─────────────────────────
  "devops":            ["CI/CD", "Docker", "Kubernetes", "Linux", "Monitoring"],
  "cloud":             ["AWS", "Cloud Architecture", "DevOps", "Serverless", "IaC"],
  "aws":               ["AWS", "Cloud Architecture", "Serverless", "DevOps", "IaC"],
  "azure":             ["Azure", "Cloud Architecture", "DevOps", "IaC"],
  "gcp":               ["GCP", "Cloud Architecture", "DevOps", "Serverless"],
  "docker":            ["Docker", "Containers", "DevOps", "Kubernetes", "CI/CD"],
  "kubernetes":        ["Kubernetes", "Containers", "DevOps", "Docker", "Microservices"],
  "terraform":         ["Terraform", "IaC", "DevOps", "Cloud Architecture"],
  "sre":               ["SRE", "Linux", "Monitoring", "Incident Management", "DevOps"],
  "platform":          ["DevOps", "Kubernetes", "CI/CD", "IaC", "Cloud Architecture"],

  // ─── Databases ────────────────────────────────────────────────
  "database":          ["Databases", "SQL", "Query Optimization", "Indexing", "ORM"],
  "dba":               ["Databases", "SQL", "Query Optimization", "Replication", "Backup"],
  "postgres":          ["PostgreSQL", "SQL", "Databases", "Query Optimization"],
  "mysql":             ["MySQL", "SQL", "Databases", "Query Optimization"],
  "mongodb":           ["MongoDB", "NoSQL", "Databases", "Aggregation"],
  "redis":             ["Redis", "Caching", "Databases", "Pub/Sub"],
  "elasticsearch":     ["Elasticsearch", "Search", "Databases", "Indexing"],
  "cassandra":         ["Cassandra", "NoSQL", "Databases", "Distributed Systems"],

  // ─── Data / AI / ML ──────────────────────────────────────────
  "data scientist":    ["Python", "Machine Learning", "Statistics", "SQL", "Data Visualization"],
  "data analyst":      ["SQL", "Python", "Data Visualization", "Excel", "Statistics"],
  "data engineer":     ["Python", "SQL", "ETL", "Databases", "Distributed Systems"],
  "machine learning":  ["Machine Learning", "Python", "Deep Learning", "Statistics", "DSA"],
  "ml engineer":       ["Machine Learning", "Python", "MLOps", "Deep Learning", "APIs"],
  "ai engineer":       ["Machine Learning", "Python", "LLMs", "Prompt Engineering", "APIs"],
  "mlops":             ["MLOps", "Python", "Docker", "CI/CD", "Cloud Architecture"],
  "nlp":               ["NLP", "Python", "Machine Learning", "Deep Learning", "Transformers"],
  "computer vision":   ["Computer Vision", "Python", "Deep Learning", "OpenCV"],
  "data":              ["Python", "SQL", "Data Structures", "Statistics"],
  "ml":                ["Machine Learning", "Python", "Deep Learning", "DSA"],
  "ai":                ["Machine Learning", "Python", "LLMs", "Deep Learning"],

  // ─── Languages (role-agnostic) ────────────────────────────────
  "python":            ["Python", "OOP", "Backend", "Scripting"],
  "java":              ["Java", "OOP", "Backend", "Spring Boot", "Multithreading"],
  "typescript":        ["TypeScript", "JavaScript", "OOP", "Frontend", "Backend"],
  "javascript":        ["JavaScript", "Node.js", "Frontend", "Async", "OOP"],
  "php":               ["PHP", "Backend", "Laravel", "OOP"],
  "c#":                ["C#", ".NET", "OOP", "Backend"],
  "cpp":               ["C++", "OOP", "Systems Programming", "Memory Management"],
  "scala":             ["Scala", "Functional Programming", "Backend", "Spark"],

  // ─── Architecture / Systems ───────────────────────────────────
  "microservices":     ["Microservices", "REST API", "Docker", "Kubernetes", "Event-Driven"],
  "architect":         ["System Design", "Microservices", "Databases", "Cloud Architecture", "Security"],
  "system design":     ["System Design", "Databases", "Caching", "Load Balancing", "Scalability"],
  "distributed":       ["Distributed Systems", "Databases", "Concurrency", "Consistency", "Networking"],

  // ─── Security ─────────────────────────────────────────────────
  "security":          ["Cybersecurity", "Authentication", "Networking", "Linux", "Penetration Testing"],
  "cybersecurity":     ["Cybersecurity", "Networking", "Linux", "Penetration Testing", "Cryptography"],
  "appsec":            ["Cybersecurity", "Authentication", "OWASP", "Secure Coding"],

  // ─── QA / Testing ─────────────────────────────────────────────
  "qa":                ["Testing", "QA", "Automation", "CI/CD", "Test Design"],
  "sdet":              ["Testing", "Automation", "QA", "CI/CD", "Scripting"],
  "test":              ["Testing", "QA", "Test Design", "Automation"],

  // ─── Specialised ──────────────────────────────────────────────
  "blockchain":        ["Blockchain", "Solidity", "Web3", "Smart Contracts", "Cryptography"],
  "web3":              ["Web3", "Blockchain", "Solidity", "Smart Contracts", "JavaScript"],
  "game":              ["C++", "Unity", "Game Development", "Graphics", "Physics"],
  "graphics":          ["OpenGL", "WebGL", "C++", "Shaders", "Graphics"],
  "embedded":          ["C", "C++", "Embedded Systems", "RTOS", "Hardware Interfaces"],
  "firmware":          ["C", "C++", "Embedded Systems", "RTOS", "Debugging"],
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

function matchesKey(text, key) {
  if (key.length <= 4) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    return regex.test(text);
  }
  return text.includes(key);
}


function extractKeywordsLocally(jobTitle = "", requirements = []) {
  const keywords = new Set();

  // 1. Match from job title
  const titleLower = jobTitle.toLowerCase();
  // AFTER
  for (const [key, tags] of Object.entries(TITLE_KEYWORD_MAP)) {
    if (matchesKey(titleLower, key)) {
      tags.forEach(t => keywords.add(t));
    }
  }
  // for (const [key, tags] of Object.entries(TITLE_KEYWORD_MAP)) {
  //   if (titleLower.includes(key)) {
  //     tags.forEach(t => keywords.add(t));
  //   }
  // }

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
    // if (wordCount > 3) {
    //   for (const [key, tags] of Object.entries(TITLE_KEYWORD_MAP)) {
    //     if (cleaned.includes(key)) {
    //       tags.forEach(t => keywords.add(t));
    //     }
    //   }
    // }
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

  // AFTER
  const titleMatched = Object.keys(TITLE_KEYWORD_MAP)
    .some(k => jobTitle.toLowerCase().includes(k));

  if (titleMatched && localKeywords.length >= 4) {
    console.log("Local extraction sufficient — 0 API calls used");
    return localKeywords;
  }

  // Step 2 — Title not recognized or insufficient keywords — fall back to LLM
  console.log(`Title not recognized or insufficient keywords — falling back to LLM`);
  // if (localKeywords.length >= 4) {
  //   console.log(" Local extraction sufficient — 0 API calls used");
  //   return localKeywords;
  // }

  // // Step 2 — Local didn't find enough, fall back to LLM
  // console.log(`Only ${localKeywords.length} keywords locally — falling back to LLM`);
  const llmKeywords = await extractKeywordsViaLLM(jobDescription, requirements);
  console.log(`LLM extraction found ${llmKeywords.length} keywords:`, llmKeywords);

  // Merge both — local + LLM, deduplicated
  const merged = [...new Set([...localKeywords, ...llmKeywords])];
  console.log(`🔀 Merged keywords (${merged.length}):`, merged);

  return merged;
}

module.exports = { extractKeywords };
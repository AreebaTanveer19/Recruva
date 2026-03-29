const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// CONFIG: SKILL METADATA


const SKILL_META = {
  "React": { weight: 5, type: "core" },
  "Node.js": { weight: 5, type: "core" },
  "Python": { weight: 5, type: "core" },

  "MongoDB": { weight: 3, type: "support" },
  "REST API": { weight: 3, type: "support" },
  "Databases": { weight: 3, type: "support" },

  "HTML": { weight: 2, type: "basic" },
  "CSS": { weight: 2, type: "basic" },
};

// TITLE → KEYWORD MAP

const TITLE_KEYWORD_MAP = {
  // ─── Frontend ────────────────────────────────────────────────
  "react": [
    { name: "React", weight: 1.0 },
    { name: "JavaScript", weight: 0.8 },
    { name: "Frontend", weight: 0.6 }
  ],
  "angular": [
    { name: "Angular", weight: 1.0 },
    { name: "TypeScript", weight: 0.8 },
    { name: "Frontend", weight: 0.6 },
    { name: "RxJS", weight: 0.8 },
  ],
  "vue": [
    { name: "Vue", weight: 1.0 },
    { name: "JavaScript", weight: 0.8 },
    { name: "Frontend", weight: 0.6 },

  ],
  "next": [
    { name: "Next.js", weight: 1.0 },
    { name: "React", weight: 0.8 },
    { name: "JavaScript", weight: 0.8 },
    { name: "SSR", weight: 0.6 },
    { name: "Frontend", weight: 0.6 },
  ],
  "frontend": [
    { name: "JavaScript", weight: 1.0 },
    { name: "Frontend", weight: 0.6 },
  ],

  // ─── Backend ─────────────────────────────────────────────────
  "node": [
    { name: "Node.js", weight: 1.0 },
    { name: "JavaScript", weight: 0.8 },
    { name: "Backend", weight: 0.6 },
    { name: "REST API", weight: 0.8 },
  ],
  "express": [
    { name: "Express", weight: 1.0 },
    { name: "Node.js", weight: 0.8 },
    { name: "Backend", weight: 0.6 },
    { name: "REST API", weight: 0.8 },
    { name: "Middleware", weight: 0.6 },
  ],
  "django": [
    { name: "Django", weight: 1.0 },
    { name: "Python", weight: 0.8 },
    { name: "Backend", weight: 0.6 },
    { name: "REST API", weight: 0.8 },
    { name: "ORM", weight: 0.6 },
  ],
  "spring": [
    { name: "Spring Boot", weight: 1.0 },
    { name: "Java", weight: 0.8 },
    { name: "Microservices", weight: 0.8 },
  ],
  "backend": [
    { name: "Backend", weight: 1.0 },
    { name: "REST API", weight: 0.8 },
    { name: "Authentication", weight: 0.6 },
    { name: "Caching", weight: 0.6 },
  ],

  // ─── Fullstack ────────────────────────────────────────────────
  "mern": [
    { name: "MongoDB", weight: 1.0 },
    { name: "Express", weight: 0.9 },
    { name: "React", weight: 0.9 },
    { name: "Node.js", weight: 0.9 },
    { name: "REST API", weight: 0.7 },
  ],
  "fullstack": [
    { name: "JavaScript", weight: 1.0 },
    { name: "React", weight: 0.9 },
    { name: "Node.js", weight: 0.9 },
    { name: "Databases", weight: 0.7 },
    { name: "REST API", weight: 0.7 },
  ],

  // ─── Mobile ───────────────────────────────────────────────────
  "android": [
    { name: "Android", weight: 1.0 },
    { name: "Kotlin", weight: 0.9 },
  ],
  "ios": [
    { name: "iOS", weight: 1.0 },
    { name: "Swift", weight: 0.9 },
    { name: "SwiftUI", weight: 0.7 },
  ],
  "flutter": [
    { name: "Flutter", weight: 1.0 },
    { name: "Dart", weight: 0.9 },
  ],

  // ─── DevOps ──────────────────────────────────────────────────
  "devops": [
    { name: "Docker", weight: 1.0 },
    { name: "Kubernetes", weight: 0.9 },
    { name: "CI/CD", weight: 0.9 },
    { name: "Linux", weight: 0.7 },
    { name: "Monitoring", weight: 0.6 },
  ],
  "aws": [
    { name: "AWS", weight: 1.0 },
    { name: "Cloud Architecture", weight: 0.9 },
    { name: "Serverless", weight: 0.7 },
    { name: "DevOps", weight: 0.6 },
  ],

  // ─── Databases ────────────────────────────────────────────────
  "mongodb": [
    { name: "MongoDB", weight: 1.0 },
    { name: "NoSQL", weight: 0.8 },
    { name: "Databases", weight: 0.6 },
    { name: "Aggregation", weight: 0.7 },
  ],
  "postgres": [
    { name: "PostgreSQL", weight: 1.0 },
    { name: "SQL", weight: 0.9 },
    { name: "Databases", weight: 0.6 },
  ],

  // ─── AI / ML ─────────────────────────────────────────────────
  "machine learning": [
    { name: "Machine Learning", weight: 1.0 },
    { name: "Python", weight: 0.9 },
    { name: "Deep Learning", weight: 0.8 },
    { name: "Statistics", weight: 0.7 },
  ],
  "ai": [
    { name: "Machine Learning", weight: 1.0 },
    { name: "Python", weight: 0.9 },
    { name: "LLMs", weight: 0.9 },
    { name: "Deep Learning", weight: 0.8 },
  ],

  // ─── Languages ────────────────────────────────────────────────
  "python": [
    { name: "Python", weight: 1.0 },
    { name: "OOP", weight: 0.7 },
  ],
  "java": [
    { name: "Java", weight: 1.0 },
    { name: "OOP", weight: 0.7 },
    { name: "Spring Boot", weight: 0.8 },
  ],

  // ─── Systems ─────────────────────────────────────────────────
  "system design": [
    { name: "System Design", weight: 1.0 },
    { name: "Scalability", weight: 0.9 },
    { name: "Load Balancing", weight: 0.8 },
    { name: "Databases", weight: 0.7 },
  ],

  // ─── Security ─────────────────────────────────────────────────
  "security": [
    { name: "Cybersecurity", weight: 1.0 },
    { name: "Authentication", weight: 0.9 },
    { name: "Networking", weight: 0.7 },
  ],

  // ─── QA ───────────────────────────────────────────────────────
  "qa": [
    { name: "Testing", weight: 1.0 },
    { name: "Automation", weight: 0.9 },
    { name: "CI/CD", weight: 0.7 },
  ],
};

// IGNORE WORDS


const IGNORE_WORDS = [
  "experience", "years", "knowledge", "understanding",
  "skills", "strong", "good", "excellent", "proficiency",
  "must", "required", "preferred", "degree",
  "with", "the", "and", "or", "in", "of",
];


// SMART MATCHING FUNCTION


function matchesKey(text, key) {
  if (key.length <= 4) {
    const regex = new RegExp(`\\b${key}\\b`, "i");
    return regex.test(text);
  }
  return text.includes(key);
}

// LOCAL EXTRACTION


function extractKeywordsLocally(jobTitle = "", requirements = []) {
  const keywords = new Set();
  const titleLower = jobTitle.toLowerCase();

  // 1. Match job title
  for (const [key, tags] of Object.entries(TITLE_KEYWORD_MAP)) {
    if (matchesKey(titleLower, key)) {
      tags.forEach(t => keywords.add(t.name));
    }
  }

  // 2. Extract from requirements
  requirements.forEach(req => {
    const cleaned = req
      .toLowerCase()
      .replace(/\.js$/i, "")
      .replace(/\(.*?\)/g, "")
      .replace(/[^a-zA-Z0-9\s\+\#]/g, " ")
      .trim();

    const wordCount = cleaned.split(/\s+/).length;

    // Short keywords (direct add)
    if (wordCount <= 3) {
      const isFiller = IGNORE_WORDS.includes(cleaned);
      if (!isFiller && cleaned.length > 1) {
        const formatted = cleaned
          .split(/\s+/)
          .map(w => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" ");
        keywords.add(formatted);
      }
    }

    // LONG TEXT MATCHING 
    if (wordCount > 3) {
      for (const [key, tags] of Object.entries(TITLE_KEYWORD_MAP)) {
        if (matchesKey(cleaned, key)) {
          tags.forEach(t => keywords.add(t.name));
        }
      }
    }
  });

  return [...keywords];
}


// ENRICH KEYWORDS


function enrichKeywords(keywords) {
  return keywords.map(k => ({
    name: k,
    weight: SKILL_META[k]?.weight || 2,
    type: SKILL_META[k]?.type || "basic",
  }));
}


// CLEAN KEYWORDS (REMOVE DUPES / GENERIC)


function cleanKeywords(keywords) {
  const set = new Set(keywords);

  if (set.has("React")) set.delete("Frontend");
  if (set.has("Node.js")) set.delete("Backend");

  return [...set];
}

//  MAIN FUNCTION


async function extractKeywords(jobTitle = "", jobDescription = "", requirements = []) {
  // Local extraction
  let localKeywords = extractKeywordsLocally(jobTitle, requirements);
  console.log("🔍 Local keywords:", localKeywords);

  const titleMatched = Object.keys(TITLE_KEYWORD_MAP)
    .some(k => matchesKey(jobTitle.toLowerCase(), k));

  // If local extraction is strong enough, return
  if (titleMatched && localKeywords.length >= 4) {
    console.log("Using local extraction");
    const cleaned = cleanKeywords(localKeywords);
    return enrichKeywords(cleaned);
  }

  // 3️⃣ Otherwise, use LLM fallback
  console.log(" Falling back to LLM for keyword extraction");

 const prompt = `Extract key skills and technologies.

STRICT RULES:
- Return ONLY valid JSON
- Do NOT include any explanation
- Do NOT include markdown or code blocks
- Do NOT include text before or after JSON

Format:
[
  { "name": "React", "weight": 5, "type": "core" }
]

Job Title: ${jobTitle}
Job Description: ${jobDescription}
Requirements: ${requirements.slice(0, 10).join(", ")}
`;
  try {
    const result = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
    });
let llmKeywords = [];
const rawContent = result.choices[0].message.content;

try {
  // 🔥 Extract ONLY JSON array from response
  const match = rawContent.match(/\[\s*{[\s\S]*}\s*\]/);

  if (!match) {
    throw new Error("No valid JSON array found");
  }

  llmKeywords = JSON.parse(match[0]);

  console.log("💡 LLM keywords:", llmKeywords);

} catch (err) {
  console.warn("⚠️ Failed to parse LLM keywords, using local only");
  llmKeywords = [];
}
    // Merge local + LLM keywords, dedupe by name (keep max weight)
    const mergedMap = new Map();
    [...localKeywords.map(k => enrichKeywords([k])[0]), ...llmKeywords].forEach(k => {
      if (!mergedMap.has(k.name) || mergedMap.get(k.name).weight < k.weight) {
        mergedMap.set(k.name, k);
      }
    });

    const merged = cleanKeywords(Array.from(mergedMap.values()).map(k => k.name))
      .map(name => mergedMap.get(name));

    return merged;

  } catch (err) {
    console.error("LLM keyword extraction failed:", err.message);
    // fallback: return enriched local keywords only
    const cleaned = cleanKeywords(localKeywords);
    return enrichKeywords(cleaned);
  }
}


module.exports = { extractKeywords };
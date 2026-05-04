const groq = require("../../config/groq");
const { SKILL_META, TITLE_KEYWORD_MAP, IGNORE_WORDS } = require("./keywords.js");
const { SPECIFIC_OVERRIDES } = require("./helperFunctions.js");

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

  for (const [generic, specifics] of Object.entries(SPECIFIC_OVERRIDES)) {
    if (specifics.some(s => set.has(s))) {
      set.delete(generic);
    }
  }

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

// ─── Helper: extract significant words for similarity comparison ──
function getSignificantWords(text) {
  const stopWords = new Set([
    "what", "is", "the", "a", "an", "of", "in", "and", "or", "how",
    "do", "does", "can", "you", "for", "to", "are", "with", "this",
    "that", "your", "explain", "describe", "define", "give", "between"
  ]);
  return new Set(
    text.toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w))
  );
}

// ─── Helper: deduplicate weighted keywords by name ────────────────
function dedupeKeywords(weightedKeywords) {
  const map = new Map();
  weightedKeywords.forEach(k => {
    if (!map.has(k.name) || map.get(k.name).weight < k.weight) {
      map.set(k.name, k);
    }
  });
  return Array.from(map.values());
}

// ─── Helper: convert keyword names to weighted format ─────────────
function convertToWeightedKeywords(keywords) {
  return keywords.map((k, index) => ({
    name:   k,
    weight: keywords.length - index,
  }));
}

// ─── Helper: check if two questions are too similar ───────────────
function isTooSimilar(q1, q2, threshold = 0.6) {
  const words1  = getSignificantWords(q1);
  const words2  = getSignificantWords(q2);
  const smaller = Math.min(words1.size, words2.size);
  if (smaller === 0) return false;
  let overlap = 0;
  for (const w of words1) { if (words2.has(w)) overlap++; }
  return (overlap / smaller) >= threshold;
}

// ─── Helper: filter out similar questions, keeping first unique ───
function deduplicateQuestions(questions, limit) {
  const picked = [];
  for (const q of questions) {
    if (picked.length >= limit) break;
    const isDuplicate = picked.some(p => isTooSimilar(p.question, q.question));
    if (!isDuplicate) picked.push(q);
  }
  return picked;
}

// ─── Helper: check candidate against existing for similarity ──────
function isQuestionDuplicate(newQuestion, existingSignificantWords) {
  const newWords = getSignificantWords(newQuestion);
  return existingSignificantWords.some(({ words }) => {
    const smaller = Math.min(words.size, newWords.size);
    if (smaller === 0) return false;
    let overlap = 0;
    for (const w of newWords) { if (words.has(w)) overlap++; }
    return (overlap / smaller) >= 0.6;
  });
}

// ─── Map: remove generic labels when specific skills are present ─────
const SPECIFIC_OVERRIDES = {
  // Web
  Frontend:             ["React", "Angular", "Vue", "Next.js", "Svelte", "Nuxt.js"],
  Backend:              ["Node.js", "Express", "Django", "Spring Boot", "FastAPI", "Laravel", "Ruby on Rails", "ASP.NET"],

  // Data storage
  Databases:            ["MongoDB", "PostgreSQL", "MySQL", "Redis", "SQLite", "DynamoDB", "Cassandra", "MariaDB"],
  NoSQL:                ["MongoDB", "DynamoDB", "Cassandra", "Firebase", "CouchDB"],
  Caching:              ["Redis", "Memcached"],
  ORM:                  ["Prisma", "Sequelize", "TypeORM", "Hibernate", "SQLAlchemy"],

  // Infrastructure
  DevOps:               ["Docker", "Kubernetes", "CI/CD", "Jenkins", "Ansible", "Terraform"],
  "Cloud Architecture": ["AWS", "Azure", "GCP", "Google Cloud", "Serverless"],
  Monitoring:           ["Grafana", "Prometheus", "Datadog", "New Relic", "ELK Stack"],
  Networking:           ["Nginx", "Apache", "Load Balancer", "TCP/IP", "DNS"],

  // Mobile
  Mobile:               ["React Native", "Flutter", "Android", "iOS", "Swift", "Kotlin", "Xamarin"],

  // Testing
  Testing:              ["Jest", "Mocha", "Cypress", "Selenium", "JUnit", "PyTest", "Vitest", "Playwright"],

  // AI / ML
  "Machine Learning":   ["TensorFlow", "PyTorch", "Keras", "scikit-learn", "XGBoost"],
  "Deep Learning":      ["TensorFlow", "PyTorch", "Keras"],
  "Data Science":       ["Pandas", "NumPy", "Matplotlib", "Jupyter", "scikit-learn"],

  // Messaging / async
  "Message Queue":      ["Kafka", "RabbitMQ", "AWS SQS", "Azure Service Bus"],

  // Security
  Authentication:       ["OAuth", "JWT", "SAML", "Keycloak", "Auth0"],
  Security:             ["OAuth", "JWT", "SSL/TLS", "OWASP", "Penetration Testing"],

  // Version control
  "Version Control":    ["Git", "GitHub", "GitLab", "Bitbucket"],
};

module.exports = {
  getSignificantWords,
  dedupeKeywords,
  convertToWeightedKeywords,
  isTooSimilar,
  deduplicateQuestions,
  isQuestionDuplicate,
  SPECIFIC_OVERRIDES,
};

const SKILL_META = {
  // ─── Core: Languages ──────────────────────────────────────────
  "JavaScript":       { weight: 5, type: "core" },
  "TypeScript":       { weight: 5, type: "core" },
  "Python":           { weight: 5, type: "core" },
  "Java":             { weight: 5, type: "core" },
  "Go":               { weight: 5, type: "core" },
  "C#":               { weight: 5, type: "core" },
  "PHP":              { weight: 4, type: "core" },
  "Ruby":             { weight: 4, type: "core" },
  "Swift":            { weight: 5, type: "core" },
  "Kotlin":           { weight: 5, type: "core" },
  "Dart":             { weight: 4, type: "core" },

  // ─── Core: Frontend ───────────────────────────────────────────
  "React":            { weight: 5, type: "core" },
  "Angular":          { weight: 5, type: "core" },
  "Vue":              { weight: 5, type: "core" },
  "Next.js":          { weight: 5, type: "core" },
  "Nuxt.js":          { weight: 4, type: "core" },
  "Svelte":           { weight: 4, type: "core" },

  // ─── Core: Backend ────────────────────────────────────────────
  "Node.js":          { weight: 5, type: "core" },
  "Express":          { weight: 4, type: "core" },
  "Django":           { weight: 5, type: "core" },
  "FastAPI":          { weight: 4, type: "core" },
  "Spring Boot":      { weight: 5, type: "core" },
  "Laravel":          { weight: 4, type: "core" },
  "Ruby on Rails":    { weight: 4, type: "core" },
  "ASP.NET":          { weight: 4, type: "core" },

  // ─── Core: Mobile ─────────────────────────────────────────────
  "Flutter":          { weight: 5, type: "core" },
  "React Native":     { weight: 5, type: "core" },
  "Android":          { weight: 4, type: "core" },
  "iOS":              { weight: 4, type: "core" },
  "SwiftUI":          { weight: 4, type: "core" },

  // ─── Core: Infrastructure ─────────────────────────────────────
  "Docker":           { weight: 5, type: "core" },
  "Kubernetes":       { weight: 5, type: "core" },
  "AWS":              { weight: 5, type: "core" },
  "Azure":            { weight: 5, type: "core" },
  "GCP":              { weight: 5, type: "core" },
  "Terraform":        { weight: 4, type: "core" },
  "Ansible":          { weight: 4, type: "core" },

  // ─── Core: AI / ML ────────────────────────────────────────────
  "TensorFlow":       { weight: 5, type: "core" },
  "PyTorch":          { weight: 5, type: "core" },
  "Machine Learning": { weight: 5, type: "core" },
  "Deep Learning":    { weight: 5, type: "core" },
  "LLMs":             { weight: 5, type: "core" },
  "Keras":            { weight: 4, type: "core" },
  "scikit-learn":     { weight: 4, type: "core" },
  "XGBoost":          { weight: 3, type: "support" },

  // ─── Support: Databases ───────────────────────────────────────
  "MongoDB":          { weight: 3, type: "support" },
  "PostgreSQL":       { weight: 3, type: "support" },
  "MySQL":            { weight: 3, type: "support" },
  "SQLite":           { weight: 2, type: "support" },
  "Redis":            { weight: 3, type: "support" },
  "DynamoDB":         { weight: 3, type: "support" },
  "Cassandra":        { weight: 3, type: "support" },
  "Firebase":         { weight: 3, type: "support" },
  "Databases":        { weight: 2, type: "support" },
  "SQL":              { weight: 2, type: "support" },
  "NoSQL":            { weight: 2, type: "support" },

  // ─── Support: APIs & Communication ────────────────────────────
  "REST API":         { weight: 3, type: "support" },
  "GraphQL":          { weight: 3, type: "support" },
  "gRPC":             { weight: 3, type: "support" },
  "WebSockets":       { weight: 3, type: "support" },
  "Microservices":    { weight: 4, type: "support" },

  // ─── Support: DevOps / CI ─────────────────────────────────────
  "CI/CD":            { weight: 3, type: "support" },
  "Jenkins":          { weight: 3, type: "support" },
  "Linux":            { weight: 3, type: "support" },
  "Nginx":            { weight: 3, type: "support" },
  "Serverless":       { weight: 3, type: "support" },
  "Monitoring":       { weight: 2, type: "support" },
  "Kafka":            { weight: 3, type: "support" },
  "RabbitMQ":         { weight: 3, type: "support" },

  // ─── Support: Auth & Security ─────────────────────────────────
  "Authentication":   { weight: 3, type: "support" },
  "OAuth":            { weight: 3, type: "support" },
  "JWT":              { weight: 3, type: "support" },
  "Cybersecurity":    { weight: 4, type: "support" },

  // ─── Support: Testing ─────────────────────────────────────────
  "Jest":             { weight: 3, type: "support" },
  "Cypress":          { weight: 3, type: "support" },
  "Selenium":         { weight: 3, type: "support" },
  "PyTest":           { weight: 3, type: "support" },
  "Testing":          { weight: 2, type: "support" },

  // ─── Support: ORM / Data ──────────────────────────────────────
  "Prisma":           { weight: 3, type: "support" },
  "Sequelize":        { weight: 3, type: "support" },
  "TypeORM":          { weight: 3, type: "support" },
  "SQLAlchemy":       { weight: 3, type: "support" },
  "Pandas":           { weight: 3, type: "support" },
  "NumPy":            { weight: 3, type: "support" },

  // ─── Support: Version Control ─────────────────────────────────
  "Git":              { weight: 2, type: "support" },
  "GitHub":           { weight: 2, type: "support" },
  "GitLab":           { weight: 2, type: "support" },

  // ─── Basic: Concepts ──────────────────────────────────────────
  "HTML":             { weight: 1, type: "basic" },
  "CSS":              { weight: 1, type: "basic" },
  "OOP":              { weight: 3, type: "basic" },
  "Data Structures":  { weight: 3, type: "basic" },
  "Algorithms":       { weight: 3, type: "basic" },
  "System Design":    { weight: 3, type: "basic" },
  "Scalability":      { weight: 3, type: "basic" },
  "Caching":          { weight: 2, type: "basic" },
  "Agile":            { weight: 2, type: "basic" },
  "RxJS":             { weight: 2, type: "basic" },
  "SSR":              { weight: 2, type: "basic" },
  "Statistics":       { weight: 2, type: "basic" },
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

const IGNORE_WORDS = [
  "experience", "years", "knowledge", "understanding",
  "skills", "strong", "good", "excellent", "proficiency",
  "must", "required", "preferred", "degree",
  "with", "the", "and", "or", "in", "of",
];

module.exports = { SKILL_META, TITLE_KEYWORD_MAP, IGNORE_WORDS };

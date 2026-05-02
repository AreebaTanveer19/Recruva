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

const IGNORE_WORDS = [
  "experience", "years", "knowledge", "understanding",
  "skills", "strong", "good", "excellent", "proficiency",
  "must", "required", "preferred", "degree",
  "with", "the", "and", "or", "in", "of",
];

module.exports = { SKILL_META, TITLE_KEYWORD_MAP, IGNORE_WORDS };

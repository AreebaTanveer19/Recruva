// fix_empty_tags.js
// Run ONCE to backfill tags for questions that have empty tags
// Usage: node fix_empty_tags.js

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const Groq = require('groq-sdk');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const BATCH_SIZE = 20;
const DELAY_MS = 60000;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function tagBatch(questions) {
  const numbered = questions
    .map((q, i) => `${i + 1}. ${q.question}`)
    .join("\n");

    const prompt = `You are tagging software engineering interview questions for a hiring platform.

For each question, return 3-6 tags mixing BOTH a broad category tag AND specific topic tags.

BROAD CATEGORY RULES (always include when topic matches):
- OOP concepts → always include "OOP" + "Object Oriented Programming"
- Design Patterns → always include "OOP" + "Object Oriented Programming" + "Design Patterns"
- DSA concepts → always include "DSA" + "Data Structures and Algorithms"
- React concepts → always include "React" + "Frontend"
- JavaScript concepts → always include "JavaScript" + "Frontend"
- System Design → always include "System Design"
- Databases → always include "Databases"
- Testing → always include "Testing"

THEN add 1-2 specific topic tags on top:
- OOP question about polymorphism → ["OOP", "Object Oriented Programming", "Polymorphism"]
- DSA question about trees → ["DSA", "Data Structures and Algorithms", "Binary Tree"]
- React question about hooks → ["React", "Frontend", "Hooks"]
- Design pattern question → ["OOP", "Object Oriented Programming", "Design Patterns", "Singleton"]
- System design question about caching → ["System Design", "Caching", "Scalability"]
- Database question about indexing → ["Databases", "Indexing", "Query Optimization"]

EXAMPLES:
Q: "What is polymorphism and how does it work?"
Tags: ["OOP", "Object Oriented Programming", "Polymorphism", "Inheritance"]

Q: "Explain the Observer design pattern"
Tags: ["OOP", "Object Oriented Programming", "Design Patterns", "Observer Pattern"]

Q: "Find the longest common subsequence"
Tags: ["DSA", "Data Structures and Algorithms", "Dynamic Programming"]

Q: "What are React hooks and why were they introduced?"
Tags: ["React", "Frontend", "Hooks", "State Management"]

Q: "Design a distributed cache like Redis"
Tags: ["System Design", "Caching", "Scalability", "Distributed Systems"]

Q: "What is database indexing and when should you use it?"
Tags: ["Databases", "Indexing", "Query Optimization", "SQL"]

Q: "Explain closures in JavaScript"
Tags: ["JavaScript", "Frontend", "Closures", "Scope"]

Q: "Write a binary search algorithm"
Tags: ["DSA", "Data Structures and Algorithms", "Binary Search", "Algorithms"]

Questions:
${numbered}

Return ONLY a valid JSON array with exactly ${questions.length} objects, each with a "tags" key. No markdown, no explanation.`;

const result = await groq.chat.completions.create({
  model: "llama-3.3-70b-versatile",
  messages: [{ role: "user", content: prompt }],
  temperature: 0.3,
});
const raw = result.choices[0].message.content.trim()
  .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  return JSON.parse(raw);
}

async function fillTags() {
  console.log("🔧 Tag Backfill Script");
  console.log("======================\n");

  // Find all questions with empty tags
  const untagged = await prisma.questionBank.findMany({
    where: { tags: { equals: [] } },
    select: { id: true, question: true },
  });

  if (untagged.length === 0) {
    console.log(" All questions already have tags. Nothing to do.");
    await prisma.$disconnect();
    return;
  }

  console.log(`Found ${untagged.length} questions with empty tags.\n`);

  const totalBatches = Math.ceil(untagged.length / BATCH_SIZE);
  let updated = 0;
  let failed = 0;

  for (let i = 0; i < untagged.length; i += BATCH_SIZE) {
    const batch = untagged.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;

    process.stdout.write(
      `  Batch ${batchNum}/${totalBatches} (${i + 1}–${Math.min(i + BATCH_SIZE, untagged.length)})... `
    );

    let tagged;
    let attempts = 0;

    while (attempts < 3) {
      try {
        tagged = await tagBatch(batch);
        console.log("Success");
        break;
    } catch (err) {
        attempts++;
        console.log(`\nActual error: ${err.message}`);  
        if (attempts === 3) {
          console.log(`Failed — skipping batch`);
          tagged = batch.map(() => ({ tags: [] }));
        } else {
          process.stdout.write(`Retry ${attempts}... `);
          await sleep(35000);
        }
      }
    }

    for (let j = 0; j < batch.length; j++) {
      const tags = tagged[j]?.tags || [];
      if (tags.length === 0) { failed++; continue; }

      try {
        await prisma.questionBank.update({
          where: { id: batch[j].id },
          data:  { tags },
        });
        updated++;
      } catch (err) {
        failed++;
      }
    }

    if (i + BATCH_SIZE < untagged.length) await sleep(DELAY_MS);
  }

  console.log(`\n Updated: ${updated}`);
  if (failed > 0) console.log(`Failed:  ${failed}`);

  // Verify
  const stillEmpty = await prisma.questionBank.count({
    where: { tags: { equals: [] } },
  });
  console.log(`\n Questions still with empty tags: ${stillEmpty}`);

}

module.exports = { fillTags };
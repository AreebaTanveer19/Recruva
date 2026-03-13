// seed_question_bank.js
// Run ONCE to clean, classify, and seed your question bank
// Usage: node seed_question_bank.js

const { PrismaClient } = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const {fillTags} = require("./fillTags");
const CSV_PATH = "./dataset.csv";              

const prisma = new PrismaClient();

// STEP 1: Load & Inspect CSV

function loadCSV(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");

  const records = parse(raw, {
    columns: true,          
    skip_empty_lines: true,
    trim: true,
  });

  // Print columns so you can verify
  console.log("\n📋 CSV Columns found:", Object.keys(records[0]));
  console.log(`📦 Total rows: ${records.length}\n`);

  return records;
}

// STEP 2: Clean the data

function cleanData(records) {
  // Normalize column names to lowercase + underscores
  const normalized = records.map((row) => {
    const clean = {};
    for (const key of Object.keys(row)) {
      clean[key.toLowerCase().trim().replace(/\s+/g, "_")] = row[key];
    }
    return clean;
  });

  // Map known columns from this specific dataset
  const cleaned = normalized
    .map((row) => ({
      question:    row["question"]?.trim(),
      briefAnswer: row["answer"]?.trim() || null,
      category:    normalizeCategory(row["category"]?.trim()),
      difficulty:  normalizeDifficulty(row["difficulty"]?.trim()),
    }))
    .filter((row) => row.question && typeof row.question === "string")
    .filter((row) => row.question.length > 20)
    .filter((row) => row.question.length < 1000);

  // Remove exact duplicate questions
  const seen = new Set();
  const deduped = cleaned.filter((row) => {
    if (seen.has(row.question)) return false;
    seen.add(row.question);
    return true;
  });

  console.log(`After cleaning: ${deduped.length} questions`);
  return deduped;
}

// Dataset difficulty is always "Hard" — but normalize just in case
function normalizeDifficulty(val) {
  if (!val) return "hard";
  const v = val.toLowerCase();
  if (v === "easy") return "easy";
  if (v === "medium") return "medium";
  return "hard"; // default — dataset is all hard
}

// Normalize category to our standard types
function normalizeCategory(val) {
  if (!val) return "Technical";
  const v = val.toLowerCase();
  if (v.includes("behav")) return "Behavioral";
  if (v.includes("situat")) return "Situational";
  if (v.includes("hr") || v.includes("human")) return "HR";
  return "Technical"; // algorithms, system design, data structures etc → Technical
}


// STEP 3: Save to DB via Prisma

async function seedToDB(classified) {
  console.log(`\n💾 Saving to database...\n`);

  let inserted = 0;
  let failed = 0;

  // Insert in chunks of 100 for speed
  const chunkSize = 100;

  for (let i = 0; i < classified.length; i += chunkSize) {
    const chunk = classified.slice(i, i + chunkSize);

    for (const row of chunk) {
      try {
        await prisma.questionBank.upsert({
          where: { question: row.question },
          update: {},            
          create: {
            question:    row.question,
            briefAnswer: row.briefAnswer,
            difficulty:  row.difficulty,
            category:    row.category,
            tags:        row.tags,
          },
        });
        inserted++;
      } catch (err) {
        failed++;
      }
    }

    console.log(
      `  Saved ${Math.min(i + chunkSize, classified.length)}/${classified.length}`
    );
  }

  console.log(`\n Inserted: ${inserted}`);
  if (failed > 0) console.log(`Failed: ${failed}`);
}

// Print summary 

async function printStats() {
  const total = await prisma.questionBank.count();
  const byDifficulty = await prisma.questionBank.groupBy({
    by: ["difficulty"],
    _count: true,
  });
  const byCategory = await prisma.questionBank.groupBy({
    by: ["category"],
    _count: true,
  });

  console.log(`\n Question Bank Stats:`);
  console.log(`   Total: ${total}`);
  console.log(`\n   By Difficulty:`);
  byDifficulty.forEach((d) =>
    console.log(`     ${d.difficulty}: ${d._count}`)
  );
  console.log(`\n   By Category:`);
  byCategory.forEach((c) => console.log(`     ${c.category}: ${c._count}`));
}

// UTILS

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// MAIN
async function main() {
  console.log(" Question Bank Seeder");
  console.log("=======================\n");

  if (!fs.existsSync(CSV_PATH)) {
    console.error(` CSV file not found at: ${CSV_PATH}`);
    console.error(` Download from Kaggle and place it as: ${path.resolve(CSV_PATH)}`);
    process.exit(1);
  }

  // Run pipeline
  const raw = loadCSV(CSV_PATH);
  const cleaned = cleanData(raw);

  console.log(`Ready to seed ${cleaned.length} questions.`);
  // Small preview
  console.log("Sample questions:");
  cleaned.slice(0, 3).forEach((q, i) => console.log(`   ${i + 1}. ${q.question.substring(0, 80)}...`));

  await sleep(3000);

  const classified = cleaned.map(q => ({ ...q, tags: [] }));
  await seedToDB(classified);
  await fillTags();
  await printStats();

  console.log("\n Done! Question bank is ready. Never run this script again.");
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("Fatal error:", err);
  await prisma.$disconnect();
  process.exit(1);
});
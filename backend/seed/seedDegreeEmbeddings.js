// scripts/seedDegreeEmbeddings.js
const { PrismaClient } = require("@prisma/client");
const { getEmbedding } = require("../services/scoring/embeddingService");

const prisma = new PrismaClient();

const degrees = [
  "Computer Science",
  "Software Engineering",
  "Data Science",
  "Information Technology",
  "Artificial Intelligence",
  "Cybersecurity",
];

async function main() {
  for (const degree of degrees) {
    const enriched = `University academic degree program in ${degree}, covering related coursework, skills and knowledge`;
    const embedding = await getEmbedding(enriched);

    await prisma.degreeEmbedding.upsert({
      where: { degree },
      update: { embedding },
      create: { degree, embedding },
    });

    console.log(`✅ Seeded: ${degree}`);
  }

  console.log("🎉 All degrees seeded!");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
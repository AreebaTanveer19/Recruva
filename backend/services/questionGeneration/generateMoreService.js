const prisma = require("../../config/db");
const groq   = require("../../config/groq");
const { extractSeniority, getSeniorityPromptContext } = require("../../utils/seniority");

const VALID_DIFFICULTIES = ["easy", "medium", "hard"];

function buildDistribution(count, difficulty) {
  if (difficulty !== "any") {
    return { easy: 0, medium: 0, hard: 0, [difficulty]: count };
  }
  const base = Math.floor(count / 3);
  const rem  = count % 3;
  return {
    easy:   base + (rem > 0 ? 1 : 0),
    medium: base + (rem > 1 ? 1 : 0),
    hard:   base,
  };
}

async function generateAdditionalQuestions(jobId, count, difficulty, extraKeywords = [], targetKeyword = null) {
  const job = await prisma.job.findUnique({
    where:   { id: jobId },
    include: { details: true },
  });

  if (!job || !job.details) throw new Error("Job or job details not found");

  const jobKeywords = job.keywords?.length > 0 ? job.keywords : [];

  const allKeywords = [
    ...new Set([
      ...jobKeywords,
      ...extraKeywords.map(k => k.trim()).filter(Boolean),
    ]),
  ];
  if (allKeywords.length === 0) allKeywords.push("general");

  const seniority = extractSeniority(job.title);
  const dist      = buildDistribution(count, difficulty);

  const existingLinks = await prisma.jobQuestion.findMany({
    where:   { jobId },
    include: { question: { select: { question: true, id: true } } },
  });

  const existingIds = new Set(existingLinks.map(l => l.questionId));

  const existingQuestionsText = existingLinks
    .map(l => `- ${l.question.question}`)
    .join("\n");

  const gapList = Object.entries(dist)
    .filter(([, c]) => c > 0)
    .map(([d, c]) => `- ${c} ${d} question${c > 1 ? "s" : ""}`)
    .join("\n");

  if (!gapList) throw new Error("No questions requested");

  const seniorityCtx    = getSeniorityPromptContext(seniority);
  const tagInstructions = targetKeyword
    ? `First tag MUST be exactly "${targetKeyword}" so questions group correctly.`
    : "First tag MUST be the specific technology (e.g. 'Node.js' NOT 'Backend')";
  const focusedKeywords = extraKeywords.length > 0
    ? `FOCUSED SKILLS (Generate questions SPECIFICALLY about these): ${extraKeywords.join(", ")}. Other available tech stack: ${allKeywords.join(", ")}`
    : `Tech Stack: ${allKeywords.join(", ")}`;

  const prompt = `You are a technical interviewer generating additional interview questions for:
Job Title: ${job.title}
Seniority: ${seniority.toUpperCase()}
${focusedKeywords}

${seniorityCtx}

Job Description: ${job.details.description}

Generate exactly:
${gapList}

RULES:
${extraKeywords.length > 0 ? `1. EVERY question MUST be specifically about one of these focused skills: ${extraKeywords.join(", ")}. Generate questions testing deep knowledge of these exact technologies/concepts.` : `1. Generate questions covering the tech stack.`}
2. TAGGING IS CRITICAL — tags drive future reuse:
   - ${tagInstructions}
   - Include 3–6 tags: [specificTech, broadCategory, topic, subtopic]
3. Match depth and complexity strictly to ${seniority.toUpperCase()} level.
4. Do NOT generate questions similar to these already in this interview:
${existingQuestionsText || "  (none yet)"}
5. briefAnswer: 1–2 sentences only.

Return ONLY a valid JSON array. Each element:
{
  "question":    string,
  "difficulty":  "easy" | "medium" | "hard",
  "category":    "Technical" | "Behavioral" | "Situational" | "HR",
  "tags":        string[],
  "briefAnswer": string
}
No markdown, no explanation, no preamble.`;

  const result = await groq.chat.completions.create({
    model:       "llama-3.3-70b-versatile",
    messages:    [{ role: "user", content: prompt }],
    temperature: 0.7,
  });

  const raw = result.choices[0].message.content.trim()
    .replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

  let rawGenerated = [];
  try {
    const match = raw.match(/\[\s*\{[\s\S]*\}\s*\]/);
    if (!match) throw new Error("No JSON array found in LLM response");
    rawGenerated = JSON.parse(match[0]);
  } catch (err) {
    console.error("Failed to parse generated questions:", err.message);
    throw new Error("Failed to parse generated questions from LLM");
  }

  // Validate LLM output before writing to DB
  const validated = rawGenerated.filter(q =>
    typeof q.question === "string" &&
    q.question.trim().length > 10 &&
    VALID_DIFFICULTIES.includes(q.difficulty?.toLowerCase())
  ).map(q => ({ ...q, difficulty: q.difficulty.toLowerCase() }));

  if (validated.length < rawGenerated.length) {
    console.warn(`generateMore: ${rawGenerated.length - validated.length} questions rejected by validator for job ${jobId}`);
  }

  // Persist merged keywords back to the job so getJobQuestions groups correctly
  if (extraKeywords.length > 0) {
    await prisma.job.update({
      where: { id: jobId },
      data:  { keywords: allKeywords },
    });
  }

  const saved = await Promise.all(
    validated.map(q =>
      prisma.questionBank.upsert({
        where:  { question: q.question },
        update: {},
        create: {
          question:    q.question,
          briefAnswer: q.briefAnswer || null,
          difficulty:  q.difficulty,
          category:    q.category || "Technical",
          tags:        Array.isArray(q.tags) ? q.tags : [],
        },
      })
    )
  );

  const newToLink = saved.filter(q => !existingIds.has(q.id));

  await prisma.jobQuestion.createMany({
    data: newToLink.map(q => ({ jobId, questionId: q.id, status: "saved" })),
    skipDuplicates: true,
  });

  console.log(`Generated ${saved.length} additional questions for job ${jobId}`);
  return saved.map(q => q.id);
}

module.exports = { generateAdditionalQuestions };

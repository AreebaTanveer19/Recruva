const { getEmbedding, prepareJobText, prepareCandidateText } = require('./embeddingService');
const {getJobEmbeddings, getCandidateEmbeddings} = require ('./qdrantService');
const prisma = require('../../config/db');

function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  if (normA === 0 || normB === 0) return 0;
  return dot / (normA * normB);
}

function toScore(similarity, type = 'skills') {
  const ranges = {
    skills:     { min: 0.40, max: 0.75 },
    experience: { min: 0.30, max: 0.65 },
  };
  const { min, max } = ranges[type] || ranges.skills;
  const clamped = Math.max(min, Math.min(max, similarity));
  return Math.min(Math.round(((clamped - min) / (max - min)) * 100), 90);
}

async function computeEducationScore(requiredDegrees, candidateDegreeField) {
  if (!candidateDegreeField || candidateDegreeField.trim() === '') {
    return 0;
  }

  // Fetch all required degree embeddings from DB
  const degreeEmbeddings = await prisma.degreeEmbedding.findMany({
    where: { degree: { in: requiredDegrees } },
  });

  if (degreeEmbeddings.length === 0) {
    console.warn(`⚠️ No embeddings found for required degrees: ${requiredDegrees}`);
    return 0;
  }

  // Embed candidate's degree field on the fly
  let candidateEmb;
  try {
    const enriched = `University academic degree program in ${candidateDegreeField}, covering related coursework, skills and knowledge`;
    candidateEmb = await getEmbedding(enriched);
  } catch (err) {
    console.error(`❌ Failed to embed candidate degree field "${candidateDegreeField}":`, err);
    return 0; // degrade gracefully
  }

  // Compare against each required degree, take max
  let maxSimilarity = 0;
  for (const { degree, embedding } of degreeEmbeddings) {
    const sim = cosineSimilarity(candidateEmb, embedding);
    console.log(`🎓 Degree similarity — candidate: "${candidateDegreeField}" vs required: "${degree}" = ${sim.toFixed(4)}`);
    if (sim > maxSimilarity) maxSimilarity = sim;
  }

  // Clamp to [0, 1] — perfect match stays 1
  return Math.min(1, Math.max(0, maxSimilarity));
}

async function scoreCandidate(job, parsedData, applicationId, resumeId) {
  //const jobText = prepareJobText(job);
  const config = job.scoringConfig || {};

  if (config.considerCGPA && config.minCGPA) {
    const cgpa = parsedData.education?.[0]?.cgpa;
  const candidateCGPA = parseFloat(cgpa);
    if (!candidateCGPA || isNaN(candidateCGPA) || candidateCGPA < config.minCGPA) {
      console.log(`❌ Candidate CGPA ${candidateCGPA} below minimum ${config.minCGPA} for application ${applicationId}`);
      return {
        applicationId,
        finalScore: -1,
        breakdown: {
          reason: isNaN(candidateCGPA) 
          ? `CGPA not mentioned, minimum requirement is ${config.minCGPA}`
          : `CGPA ${candidateCGPA} below minimum requirement of ${config.minCGPA}`,
        },
      };
    }
  }

  // ── Degree Level Gate ──────────────────────────────────────────────────────
if (job.details?.minDegreeLevel) {
  const DEGREE_RANK = { Bachelors: 1, Masters: 2, PhD: 3 };

  const requiredRank    = DEGREE_RANK[job.details.minDegreeLevel];
  const candidateDegree = parsedData.education?.[0]?.degreeLevel;
  const candidateRank   = DEGREE_RANK[candidateDegree];
  console.log(`🎓 Degree check — required: ${job.details.minDegreeLevel} (${requiredRank}), candidate: ${candidateDegree} (${candidateRank})`);

  if (!candidateRank || candidateRank < requiredRank) {
    console.log(`❌ Candidate degree "${candidateDegree}" below minimum "${job.details.minDegreeLevel}" for application ${applicationId}`);
    return {
      applicationId,
      finalScore: -1,
      breakdown: {
        reason: !candidateRank
          ? `Degree level not mentioned, minimum requirement is ${job.details.minDegreeLevel}`
          : `Degree "${candidateDegree}" does not meet minimum requirement of ${job.details.minDegreeLevel}`,
      },
    };
  }
}

  const weights = {
    skills:     config.skillsWeight     ?? 0.5,
    experience: config.experienceWeight ?? 0.5,
    education:  config.educationWeight  ?? 0,
  };

  const candidateText = prepareCandidateText(parsedData);

   const [
    { requirementsEmb, experienceEmb },
    { skillsCandEmb, experienceCandEmb },
  ] = await Promise.all([
    getJobEmbeddings(job),
    getCandidateEmbeddings(resumeId, candidateText), // ✅ pass resumeId
  ]);

  const skillsScore = toScore(cosineSimilarity(requirementsEmb, skillsCandEmb), 'skills');

  let experienceScore = 0;
  if (candidateText.experienceText !== 'No experience listed.') {
    experienceScore = toScore(cosineSimilarity(experienceEmb, experienceCandEmb), 'experience');
  }

  let educationScore = 0;
  const requiredDegrees = job.details?.requiredDegrees ?? [];

  if (weights.education > 0 && requiredDegrees.length > 0) {
    const candidateDegreeField = parsedData.education?.[0]?.degreeField;
    educationScore = await computeEducationScore(requiredDegrees, candidateDegreeField);
    educationScore = Math.round(educationScore * 100);
    console.log(`📚 Education score: ${educationScore.toFixed(4)} (weight: ${weights.education})`);
  }

  const finalScore = Math.round(
    skillsScore     * weights.skills +
    experienceScore * weights.experience +
    educationScore  * weights.education
  );

  return {
    applicationId,
    finalScore,
    breakdown: {
      skills:     { score: skillsScore,     weight: weights.skills },
      experience: { score: experienceScore, weight: weights.experience },
      education:  { score: educationScore,  weight: weights.education },
    },
  };
}

module.exports = { scoreCandidate };
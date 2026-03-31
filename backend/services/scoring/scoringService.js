const { getEmbedding, prepareJobText, prepareCandidateText } = require('./embeddingService');

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

async function scoreCandidate(job, parsedData, applicationId) {
  const jobText = prepareJobText(job);
  const candidateText = prepareCandidateText(parsedData);

  const config = job.scoringConfig || {};
  const weights = {
    skills:     config.skillsWeight     ?? 0.5,
    experience: config.experienceWeight ?? 0.5,
  };

  // Skills scoring
  const [skillsJobEmb, skillsCandEmb] = await Promise.all([
    getEmbedding(jobText.requirementsText),
    getEmbedding(candidateText.skillsText),
  ]);
  const skillsScore = toScore(cosineSimilarity(skillsJobEmb, skillsCandEmb), 'skills');

  // Experience scoring
  let experienceScore = 0;
  if (candidateText.experienceText !== 'No experience listed.') {
    const [expJobEmb, expCandEmb] = await Promise.all([
      getEmbedding(jobText.experienceMatchText),
      getEmbedding(candidateText.experienceText),
    ]);
    experienceScore = toScore(cosineSimilarity(expJobEmb, expCandEmb), 'experience');
  }

  const finalScore = Math.round(
    skillsScore     * weights.skills +
    experienceScore * weights.experience
  );

  return {
    applicationId,
    finalScore,
    breakdown: {
      skills:     { score: skillsScore,     weight: weights.skills },
      experience: { score: experienceScore, weight: weights.experience },
    },
  };
}

module.exports = { scoreCandidate };
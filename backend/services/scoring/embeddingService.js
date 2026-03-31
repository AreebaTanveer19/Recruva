const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getEmbedding(text) {
  const result = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return result.data[0].embedding;
}

function prepareJobText(job) {
  const d = job.details;
  return {
    requirementsText: `Job: ${job.title}. Required skills and qualifications: ${d.requirements.join(', ')}.`,
    experienceMatchText: `
      Job Title: ${job.title}.
      Required skills: ${d.requirements.join(', ')}.
      Responsibilities: ${d.responsibilities.join('. ')}
      Job description: ${d.description}
    `.trim(),
  };
}

function prepareCandidateText(parsedData) {
  const skillsText = `Candidate skills: ${parsedData.skills.join(', ')}.`;

  let experienceText = 'No experience listed.';

  if (parsedData.experienceSummary) {
    experienceText = parsedData.experienceSummary;
  } else if (parsedData.experience?.length > 0 || parsedData.projects?.length > 0) {
    const expText = (parsedData.experience || [])
      .map(e => `${e.position}: ${e.description}`).join(' ');
    const projText = (parsedData.projects || [])
      .map(p => `${p.name} using ${p.technologies}: ${p.description}`).join(' ');
    experienceText = `${expText} ${projText}`.trim();
  }

  return { skillsText, experienceText };
}

module.exports = { getEmbedding, prepareJobText, prepareCandidateText };
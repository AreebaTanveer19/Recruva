const { QdrantClient } = require('@qdrant/js-client-rest');
const { getEmbedding, prepareJobText } = require('./embeddingService');

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const JOB_COLLECTION = 'job_embeddings';
const CANDIDATE_COLLECTION = 'candidate_embeddings';
const VECTOR_SIZE = 1536; // text-embedding-3-small
const COLLECTION='name of collection';//use when initiaising new cluster

// Call once on server startup
async function initQdrantCollection() {
  const collections = await qdrant.getCollections();
  const exists = collections.collections.some(c => c.name === COLLECTION);

  if (!exists) {
    await qdrant.createCollection(COLLECTION, {
      vectors: {
        skills:     { size: VECTOR_SIZE, distance: 'Cosine' },
        experience: { size: VECTOR_SIZE, distance: 'Cosine' },
      },
    });
    console.log(`✅ Qdrant collection '${COLLECTION}' created`);
  }
}

// Call when a job is created/published
async function storeJobEmbeddings(job) {
  const jobText = prepareJobText(job);

  const [skillsVec, experienceVec] = await Promise.all([
    getEmbedding(jobText.requirementsText),
    getEmbedding(jobText.experienceMatchText),
  ]);

  await qdrant.upsert(JOB_COLLECTION, {
    points: [{
      id:      job.id,
      payload: { jobId: job.id, title: job.title, department: job.department },
      vector:  { skills: skillsVec, experience: experienceVec },
    }],
  });

  console.log(`✅ Job ${job.id} embeddings stored in Qdrant`);
  return { requirementsEmb: skillsVec, experienceEmb: experienceVec };
}

// Add this to your existing qdrantService.js

async function getJobEmbeddings(job) {
  try {
    const result = await qdrant.retrieve(JOB_COLLECTION, {
      ids: [job.id],
      with_vector: true,
    });

    if (result.length) {
      return {
        requirementsEmb: result[0].vector.skills,
        experienceEmb:   result[0].vector.experience,
      };
    }
  } catch (err) {
    console.warn(`⚠️ Qdrant retrieve failed for job ${job.id}:`, err?.message);
  }

  console.warn(`⚠️ No embeddings found for job ${job.id}, computing now...`);
  return storeJobEmbeddings(job);
}

async function storeCandidateEmbeddings(resumeId, candidateText) {
    console.log('skillsText length:', candidateText.skillsText?.length);
  console.log('experienceText length:', candidateText.experienceText?.length);
  const [skillsVec, experienceVec] = await Promise.all([
    getEmbedding(candidateText.skillsText),
    getEmbedding(candidateText.experienceText),
  ]);

  console.log('skillsVec size:', skillsVec?.length);
  console.log('experienceVec size:', experienceVec?.length);

    try {
  await qdrant.upsert(CANDIDATE_COLLECTION, {
    points: [{
      id:      resumeId,
      payload: { resumeId },
      vector:  { skills: skillsVec, experience: experienceVec },
    }],
  });
  } catch (err) {
     console.error('Qdrant upsert error:', JSON.stringify(err?.data || err?.message));
    throw err;
  }

  console.log(`✅ Candidate embeddings stored for resume ${resumeId}`);
  return { skillsCandEmb: skillsVec, experienceCandEmb: experienceVec };
}

async function getCandidateEmbeddings(resumeId, candidateText) {
  try{
  const result = await qdrant.retrieve(CANDIDATE_COLLECTION, {
    ids: [resumeId],
    with_vector: true,
  });

  if (result.length) {
    console.log(`✅ Candidate embeddings found for resume ${resumeId}`);
    return {
      skillsCandEmb:     result[0].vector.skills,
      experienceCandEmb: result[0].vector.experience,
    };
  }

    } catch (err) {
    console.warn(`⚠️ Qdrant retrieve failed for resume ${resumeId}, computing now...`);
  }
  return storeCandidateEmbeddings(resumeId, candidateText);
}



module.exports = { 
  initQdrantCollection, 
  storeJobEmbeddings, 
  getJobEmbeddings, 
  storeCandidateEmbeddings,
  getCandidateEmbeddings, };
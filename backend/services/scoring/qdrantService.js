const { QdrantClient } = require('@qdrant/js-client-rest');
const { getEmbedding, prepareJobText } = require('./embeddingService');

const qdrant = new QdrantClient({
  url: process.env.QDRANT_URL,
  apiKey: process.env.QDRANT_API_KEY,
});

const COLLECTION = 'job_embeddings';
const VECTOR_SIZE = 1536; // text-embedding-3-small

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

  await qdrant.upsert(COLLECTION, {
    points: [{
      id:      job.id,
      payload: { jobId: job.id, title: job.title, department: job.department },
      vector:  { skills: skillsVec, experience: experienceVec },
    }],
  });

  console.log(`✅ Job ${job.id} embeddings stored in Qdrant`);
}

module.exports = { initQdrantCollection, storeJobEmbeddings };
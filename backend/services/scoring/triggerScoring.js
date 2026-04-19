const { scoreCandidate } = require('./scoringService');
const prisma = require('../../config/db');// adjust path

async function triggerApplicationScoring(applicationId, parsedData) {
  try {
    // Fetch job with details and scoring config
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: { details: true, scoringConfig: true },
        },
      },
    });

    if (!application?.job?.details) {
      console.warn(`Scoring skipped — job details missing for application ${applicationId}`);
      return;
    }

    const result = await scoreCandidate(application.job, parsedData, applicationId, application.resumeId);

    await prisma.application.update({
      where: { id: applicationId },
      data: {
        score:          result.finalScore,
        scoreBreakdown: result.breakdown,
      },
    });

    console.log(`✅ Application ${applicationId} scored: ${result.finalScore}/100`);
  } catch (err) {
    console.error(`❌ Scoring failed for application ${applicationId}:`, err.message);
  }
}

module.exports = { triggerApplicationScoring };
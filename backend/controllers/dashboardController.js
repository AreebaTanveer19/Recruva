const prisma = require('../config/db');

const getDashboardJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        department: true,
        status: true,
        employmentType: true,
        _count: {
          select: { applications: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ jobs });
  } catch (error) {
    console.error("Error fetching dashboard jobs:", error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// GET /api/interview/upcoming
const getUpcomingInterviews = async (req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      where: {
        status: "scheduled",
        startTime: { gte: new Date() },
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
      take: 4,
    });

    const formatted = interviews.map((i) => ({
  id: i.id,
  startTime: i.startTime,
  endTime: i.endTime,
  candidateName: i.application.candidate.name,
  candidateEmail: i.application.candidate.email,
  position: i.application.job.title,
  mode: i.mode,
  meetLink: i.meetLink,
  status: i.status,
}));

res.json({ success: true, data: formatted });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

module.exports={getDashboardJobs, getUpcomingInterviews}
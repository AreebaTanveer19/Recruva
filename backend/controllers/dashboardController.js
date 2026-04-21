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

module.exports={getDashboardJobs}
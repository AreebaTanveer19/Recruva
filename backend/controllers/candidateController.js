const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

/**
 * Get all shortlisted candidates
 * Can be filtered by jobId and/or status
 * Only accessible to HR users
 */
const getShortlistedCandidates = async (req, res) => {
  try {
    // Check if user is HR
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (user?.role !== "HR") {
      return res.status(403).json({
        success: false,
        message: "Only HR users can access shortlisted candidates",
      });
    }

    const { jobId, status } = req.query;

    // Build status filter - default to shortlisted only
    // Valid statuses are: pending, reviewed, shortlisted, rejected, accepted
    // Note: "scheduled" status has been moved to Interview model
    let statusFilter = ["shortlisted"];
    if (status) {
      // Support comma-separated status values, but only valid ApplicationStatus values
      const requestedStatuses = status.split(",").map(s => s.trim());
      const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];
      statusFilter = requestedStatuses.filter(s => validStatuses.includes(s));

      // If no valid statuses found, default to shortlisted
      if (statusFilter.length === 0) {
        statusFilter = ["shortlisted"];
      }
    }

    const applications = await prisma.application.findMany({
      where: {
        status: {
          in: statusFilter,
        },
        ...(jobId && { jobId: parseInt(jobId) }),
      },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        appliedAt: "desc",
      },
    });

    // Format response
    const shortlistedCandidates = applications.map((app) => ({
      id: app.candidate.id,
      name: app.candidate.name,
      email: app.candidate.email,
      position: app.job.title,
      status: app.status,
      applicationId: app.id,
      jobId: app.job.id,
      appliedAt: app.appliedAt,
    }));

    res.status(200).json({
      success: true,
      count: shortlistedCandidates.length,
      data: shortlistedCandidates,
    });
  } catch (error) {
    console.error("Error fetching shortlisted candidates:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch shortlisted candidates",
      error: error.message,
    });
  }
};

/**
 * Update candidate application status
 * Only accessible to HR users
 */
const updateCandidateApplicationStatus = async (req, res) => {
  try {
    // Check if user is HR
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (user?.role !== "HR") {
      return res.status(403).json({
        success: false,
        message: "Only HR users can update candidate status",
      });
    }

    const { applicationId, status } = req.body;

    // Validate required fields
    if (!applicationId || !status) {
      return res.status(400).json({
        success: false,
        message: "Application ID and status are required",
      });
    }

    // Validate status is a valid enum value
    const validStatuses = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Check if application exists
    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    // Update application status
    const updatedApplication = await prisma.application.update({
      where: { id: parseInt(applicationId) },
      data: { status },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: `Application status updated to ${status}`,
      data: updatedApplication,
    });
  } catch (error) {
    console.error("Error updating candidate application status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application status",
      error: error.message,
    });
  }
};

/**
 * Get users by role (HR or DEPARTMENT)
 * Only accessible to HR users
 */
const getUsersByRole = async (req, res) => {
  try {
    // Check if user is HR
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true },
    });

    if (user?.role !== "HR") {
      return res.status(403).json({
        success: false,
        message: "Only HR users can access user list",
      });
    }

    const { role } = req.query;

    // Validate role parameter
    if (!role || !["HR", "DEPARTMENT"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Role parameter is required and must be 'HR' or 'DEPARTMENT'",
      });
    }

    const users = await prisma.user.findMany({
      where: {
        role,
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users by role:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

module.exports = {
  getShortlistedCandidates,
  updateCandidateApplicationStatus,
  getUsersByRole,
};

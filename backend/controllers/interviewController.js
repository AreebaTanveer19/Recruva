const dayjs = require("dayjs");
const { oauth2Client, calendar } = require("../config/googleAuth");
const nodemailer = require("nodemailer");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const sendInterviewEmail = async ({
  to,
  candidateName,
  interviewerName,
  dateTime,
  meetLink,
  mode,
  notes,
  jobPosition,
}) => {
  // Create a transporter using App Password
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Compose email
  const mailOptions = {
    from: `"${interviewerName}" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Interview Scheduled - Recruva",
html: `
<div style="font-family: Arial, sans-serif; font-size: 15px; color: #000; line-height: 1.6; max-width: 600px;">

  <p>Dear ${candidateName},</p>

  <p>We are pleased to inform you that your interview has been scheduled for the position of <b>${jobPosition}</b>. Please find the details below:</p>

  <p>
    <b>Position:</b> ${jobPosition}<br/>
    <b>Date & Time:</b> ${dateTime}<br/>
    <b>Mode:</b> ${mode}<br/>
    ${meetLink ? `<b>Google Meet Link:</b> <a href="${meetLink}">${meetLink}</a><br/>` : ""}
    ${notes ? `<b>Notes:</b> ${notes}<br/>` : ""}
  </p>

  <p>Please acknowledge this email to confirm your availability. We recommend joining 5 minutes before the scheduled time to avoid any inconvenience.</p>

  <p>Good luck with your interview!</p>

  <p>
    Regards,<br/>
    ${interviewerName}
  </p>

</div>
`,

  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Interview email sent successfully to", to);
  } catch (error) {
    console.error("Error sending interview email:", error);
    throw new Error("Failed to send interview email");
  }
};

const sendInterviewerEmail = async ({
  to,
  candidateName,
  candidateEmail,
  dateTime,
  meetLink,
  mode,
  notes,
  hrEmail,
  jobPosition,
}) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Recruva" <${process.env.EMAIL_USER}>`,
    to,
    subject: "New Interview Assignment - Recruva",
html: `
<div style="font-family: Arial, sans-serif; font-size: 15px; color: #000; line-height: 1.6; max-width: 600px;">

  <p>Hi,</p>

  <p>You have been assigned to conduct an interview for the position of <b>${jobPosition}</b>. Please find the candidate and session details below:</p>

  <p>
    <b>Position:</b> ${jobPosition}<br/>
    <b>Candidate Name:</b> ${candidateName}<br/>
    <b>Candidate Email:</b> <a href="mailto:${candidateEmail}">${candidateEmail}</a><br/>
    <b>Date & Time:</b> ${dateTime}<br/>
    <b>Mode:</b> ${mode}<br/>
    ${meetLink ? `<b>Google Meet Link:</b> <a href="${meetLink}">${meetLink}</a><br/>` : ""}
    ${notes ? `<b>Notes:</b> ${notes}<br/>` : ""}
    <b>Scheduled By:</b> ${hrEmail}<br/>
  </p>

  <p>Please ensure you are available at the scheduled time. If you have any concerns, kindly reach out to the HR team.</p>

  <p>
    Regards,<br/>
    Recruva Team
  </p>

</div>
`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Interviewer email sent successfully to", to);
  } catch (error) {
    console.error("Error sending interviewer email:", error);
    throw new Error("Failed to send interviewer email");
  }
};

/**
 * Redirect HR / Hiring Manager to Google OAuth
 */

const googleAuth = async (req, res) => {
  try {
    const userId = req.user.id;

    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar"],
      prompt: "consent",
      state: userId.toString(),
    });

    res.status(200).json({ url });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate Google authentication",
    });
  }
};

/**
 * Google OAuth Redirect Callback
 */

const googleRedirect = async (req, res) => {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res
        .status(400)
        .json({ success: false, message: "Authorization code missing" });
    }

    if (!state) {
      return res
        .status(400)
        .json({ success: false, message: "User ID missing in state" });
    }
    console.log(state);
    const userId = Number(state);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const { tokens } = await oauth2Client.getToken(code);

    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: tokens.access_token,
        googleRefreshToken: tokens.refresh_token || user.googleRefreshToken,
        googleTokenExpiry: new Date(tokens.expiry_date),
      },
    });

    oauth2Client.setCredentials(tokens);

    // 5. Redirect to frontend
    res.redirect(
      "http://localhost:5173/hr/shortlisted-candidates?calendar=connected",
    );
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    res.status(500).json({
      success: false,
      message: "Google OAuth failed",
      error: error.message,
    });
  }
};


const scheduleInterview = async (req, res) => {
  try {
    const { applicationId, date, startTime, mode, notes, assignedToId } = req.body;

    // Validate required fields
    if (!applicationId || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Application ID, date, and start time are required",
      });
    }

    // Fetch the application with candidate and job details
    const application = await prisma.application.findUnique({
      where: { id: parseInt(applicationId) },
      include: {
        candidate: true,
        job: true,
      },
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user?.googleRefreshToken) {
      return res.status(400).json({
        success: false,
        message: "Google Calendar not connected",
      });
    }

    oauth2Client.setCredentials({
      access_token: user.googleAccessToken,
      refresh_token: user.googleRefreshToken,
      expiry_date: user.googleTokenExpiry?.getTime(),
    });

    const [hours, minutes] = startTime.split(":").map(Number);
    const startDateTime = dayjs(date).hour(hours).minute(minutes);
    const endDateTime = startDateTime.add(1, "hour");

    const response = await calendar.events.insert({
      calendarId: "primary",
      sendUpdates: "all",
      conferenceDataVersion: 1,
      requestBody: {
        summary: "Recruva Interview",
        description: `Position: ${application.job.title}\nMode: ${mode}\nNotes: ${notes || "N/A"}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: "Asia/Karachi",
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: "Asia/Karachi",
        },
        attendees: [{ email: application.candidate.email }],
        conferenceData:
          mode === "google_meet"
            ? {
                createRequest: {
                  requestId: Date.now().toString(),
                  conferenceSolutionKey: { type: "hangoutsMeet" },
                },
              }
            : undefined,
      },
    });

    // Create interview linked to application
    const interview = await prisma.interview.create({
      data: {
        applicationId: parseInt(applicationId),
        scheduledBy: req.user.id,
        assignedToId: assignedToId ? parseInt(assignedToId) : null,
        startTime: startDateTime.toDate(),
        endTime: endDateTime.toDate(),
        mode: mode === "google_meet" ? "google_meet" : "on_site",
        meetLink: response.data.hangoutLink,
        notes,
        status: "scheduled",
      },
      include: {
        application: {
          include: { candidate: true, job: true },
        },
      },
    });

    // Send email to candidate
    await sendInterviewEmail({
      to: application.candidate.email,
      candidateName: application.candidate.name,
      interviewerName: user.email,
      dateTime: startDateTime.format("DD MMM YYYY, hh:mm A"),
      meetLink: response.data.hangoutLink,
      mode: mode === "google_meet" ? "Google Meet" : "On-site",
      notes,
      jobPosition: application.job.title,
    });

    // Send email to assigned interviewer if assignedToId is provided
    if (assignedToId) {
      try {
        const interviewerUser = await prisma.user.findUnique({
          where: { id: parseInt(assignedToId) },
          select: { email: true },
        });

        if (interviewerUser) {
          await sendInterviewerEmail({
            to: interviewerUser.email,
            candidateName: application.candidate.name,
            candidateEmail: application.candidate.email,
            dateTime: startDateTime.format("DD MMM YYYY, hh:mm A"),
            meetLink: response.data.hangoutLink,
            mode: mode === "google_meet" ? "Google Meet" : "On-site",
            notes,
            hrEmail: user.email,
            jobPosition: application.job.title,
          });
        }
      } catch (emailError) {
        console.error("Failed to send interviewer email:", emailError);
      }
    }

    res.status(200).json({
      success: true,
      meetLink: response.data.hangoutLink,
      interviewId: interview.id,
    });
  } catch (error) {
    console.error("Schedule Interview Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to schedule interview",
      error: error.message,
    });
  }
};

const disconnectCalendar = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Clear Google tokens from DB
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleAccessToken: null,
        googleRefreshToken: null,
        googleTokenExpiry: null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Google Calendar disconnected successfully",
    });
  } catch (err) {
    console.error("Disconnect Calendar Error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to disconnect calendar" });
  }
};

// GET /api/interview
const getAllInterviews = async (req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        scheduler: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Format interviews with flattened data for frontend
    const formattedInterviews = interviews.map((interview) => ({
      id: interview.id,
      jobId: interview.application.job.id,
      date: interview.startTime,
      startTime: interview.startTime,
      endTime: interview.endTime,
      time: `${new Date(interview.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(interview.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      candidateName: interview.application.candidate.name,
      candidateEmail: interview.application.candidate.email,
      position: interview.application.job.title,
      mode: interview.mode,
      meetLink: interview.meetLink,
      status: interview.status,
      notes: interview.notes,
      applicationId: interview.applicationId,
      scheduledBy: interview.scheduler,
      assignedToId: interview.assignedToId,
    }));

    res.status(200).json({
      success: true,
      data: formattedInterviews,
    });
  } catch (error) {
    console.error("Error fetching interviews:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interviews",
    });
  }
};

// GET /api/interviews/:id

const getInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    const interview = await prisma.interview.findUnique({
      where: {
        id: parseInt(id),
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        scheduler: true,
      },
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Format with flattened data
    const formattedInterview = {
      id: interview.id,
      jobId: interview.application.job.id,
      date: interview.startTime,
      startTime: interview.startTime,
      endTime: interview.endTime,
      time: `${new Date(interview.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(interview.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      candidateName: interview.application.candidate.name,
      candidateEmail: interview.application.candidate.email,
      position: interview.application.job.title,
      mode: interview.mode,
      meetLink: interview.meetLink,
      status: interview.status,
      notes: interview.notes,
      applicationId: interview.applicationId,
      scheduledBy: interview.scheduler,
      assignedToId: interview.assignedToId,
    };

    res.status(200).json({
      success: true,
      data: formattedInterview,
    });
  } catch (error) {
    console.error("Error fetching interview:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching interview",
    });
  }
};

// GET /api/interview?status=scheduled&jobId=1&candidateEmail=...
const getFilteredInterviews = async (req, res) => {
  try {
    const { status, jobId, candidateEmail, startDate, endDate } = req.query;

    const interviews = await prisma.interview.findMany({
      where: {
        ...(status && { status }),
        ...(jobId && { application: { jobId: parseInt(jobId) } }),
        ...(candidateEmail && {
          application: {
            candidate: {
              email: {
                contains: candidateEmail,
                mode: "insensitive",
              },
            },
          },
        }),
        ...(startDate &&
          endDate && {
            startTime: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
        scheduler: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });

    // Format interviews with flattened data for frontend
    const formattedInterviews = interviews.map((interview) => ({
      id: interview.id,
      jobId: interview.application.job.id,
      date: interview.startTime,
      startTime: interview.startTime,
      endTime: interview.endTime,
      time: `${new Date(interview.startTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })} - ${new Date(interview.endTime).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
      candidateName: interview.application.candidate.name,
      candidateEmail: interview.application.candidate.email,
      position: interview.application.job.title,
      mode: interview.mode,
      meetLink: interview.meetLink,
      status: interview.status,
      notes: interview.notes,
      applicationId: interview.applicationId,
      scheduledBy: interview.scheduler,
      assignedToId: interview.assignedToId,
    }));

    res.status(200).json({
      success: true,
      count: formattedInterviews.length,
      data: formattedInterviews,
    });
  } catch (error) {
    console.error("Error fetching filtered interviews:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching interviews",
    });
  }
};

const getCalendarStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { googleRefreshToken: true },
    });

    res.status(200).json({
      connected: !!user?.googleRefreshToken,
    });
  } catch (err) {
    res.status(500).json({ connected: false });
  }
};

// Finish interview and update interview status with decision
const finishInterview = async (req, res) => {
  try {
    const { interviewId, interviewFeedback, interviewStatus } = req.body;

    // Validate required fields
    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "Interview ID is required",
      });
    }

    // Find the interview
    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(interviewId) },
      include: {
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    // Validate status if provided
    const validStatuses = ["scheduled", "interviewed", "accepted", "rejected"];
    if (interviewStatus && !validStatuses.includes(interviewStatus)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

    // Update interview with feedback and status
    const updatedInterview = await prisma.interview.update({
      where: { id: parseInt(interviewId) },
      data: {
        status: interviewStatus || "interviewed",
        interviewFeedback: interviewFeedback || null,
      },
    });

    res.status(200).json({
      success: true,
      message: "Interview completed",
      data: {
        interview: updatedInterview,
      },
    });
  } catch (error) {
    console.error("Finish Interview Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to finish interview",
      error: error.message,
    });
  }
};

// Get interview feedback
const getInterviewFeedback = async (req, res) => {
  try {
    const { interviewId } = req.params;

    if (!interviewId) {
      return res.status(400).json({
        success: false,
        message: "Interview ID is required",
      });
    }

    const interview = await prisma.interview.findUnique({
      where: { id: parseInt(interviewId) },
      select: {
        id: true,
        interviewFeedback: true,
        status: true,
        application: {
          include: {
            candidate: true,
            job: true,
          },
        },
      },
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found",
      });
    }

    res.status(200).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Get Interview Feedback Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch interview feedback",
      error: error.message,
    });
  }
};

module.exports = {
  googleAuth,
  googleRedirect,
  scheduleInterview,
  disconnectCalendar,
  getAllInterviews,
  getInterviewById,
  getFilteredInterviews,
  getCalendarStatus,
  finishInterview,
  getInterviewFeedback,
};

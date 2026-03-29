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
  <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: #1a73e8; color: #fff; padding: 16px; text-align: center; font-size: 18px; font-weight: bold;">
      Interview Scheduled
    </div>

    <!-- Body -->
    <div style="padding: 24px;">
      <p>Hi ${candidateName},</p>

      <p>Congratulations! Your interview has been successfully scheduled. Please find the details below:</p>

      <div style="background-color: #f5f5f5; padding: 16px; border-radius: 8px; margin: 16px 0;">
        <ul style="list-style: none; padding: 0; margin: 0;">
          <li><b>Date & Time:</b> ${dateTime}</li>
          <li><b>Mode:</b> ${mode}</li>
          ${meetLink ? `<li><b>Google Meet Link:</b> <a href="${meetLink}" style="color: #1a73e8;">${meetLink}</a></li>` : ""}
          ${notes ? `<li>${notes}</li>` : ""}
        </ul>
      </div>

      <p>We look forward to speaking with you and wish you the best for your interview.</p>

      <p>Best regards,<br/>${interviewerName}</p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f0f0f0; padding: 12px; text-align: center; font-size: 12px; color: #555;">
      This is an automated email from Recruva. Please do not reply.
    </div>
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
      "http://localhost:5173/dept/dashboard/shortlisted-candidates?calendar=connected",
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
    const {candidateName, candidateEmail, date, startTime, mode, notes } = req.body;

    if (!candidateEmail || !date || !startTime) {
      return res.status(400).json({
        success: false,
        message: "Candidate email, date, and start time are required",
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
        description: `Mode: ${mode}\nNotes: ${notes || "N/A"}`,
        start: {
          dateTime: startDateTime.toISOString(),
          timeZone: "Asia/Karachi",
        },
        end: {
          dateTime: endDateTime.toISOString(),
          timeZone: "Asia/Karachi",
        },
        attendees: [{ email: candidateEmail }],
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

    const interview = await prisma.interview.create({
      data: {
        candidateEmail,
        scheduledBy: req.user.id,
        date: startDateTime.toDate(),
        startTime: startDateTime.toDate(),
        endTime: endDateTime.toDate(),
        mode: mode === "google_meet" ? "google_meet" : "on_site",
        meetLink: response.data.hangoutLink,
        notes,
        candidateName
      },
    });

    await sendInterviewEmail({
      to: candidateEmail,
      candidateName: candidateName, 
      interviewerName: user.email, 
      dateTime: startDateTime.format("DD MMM YYYY, hh:mm A"),
      meetLink: response.data.hangoutLink,
      mode: mode === "google_meet" ? "Google Meet" : "On-site",
      notes,
      refreshToken: user.googleRefreshToken,
    });

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

// GET /api/interviews
const getAllInterviews = async (req, res) => {
  try {
    const interviews = await prisma.interview.findMany({
      include: {
        scheduler: {
          select: {
            id: true,
            // name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    res.status(200).json({
      success: true,
      data: interviews,
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
        scheduler: true,
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
    console.error("Error fetching interview:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching interview",
    });
  }
};

// GET /api/interviews?status=scheduled&jobId=1

const getFilteredInterviews = async (req, res) => {
  try {
    const { status, jobId, candidateEmail, startDate, endDate } = req.query;

    const interviews = await prisma.interview.findMany({
      where: {
        ...(status && { status }),
        ...(jobId && { jobId: parseInt(jobId) }),
        ...(candidateEmail && {
          candidateEmail: {
            contains: candidateEmail,
            mode: "insensitive",
          },
        }),
        ...(startDate &&
          endDate && {
            date: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
      },
      include: {
        scheduler: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        date: "asc",
      },
    });

    res.status(200).json({
      success: true,
      count: interviews.length,
      data: interviews,
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

module.exports = {
  googleAuth,
  googleRedirect,
  scheduleInterview,
  disconnectCalendar,
  getAllInterviews,
  getInterviewById,
  getFilteredInterviews,
  getCalendarStatus
};

const dayjs = require("dayjs");
const { oauth2Client, calendar } = require("../config/googleAuth");

/**
 * Redirect HR / Hiring Manager to Google OAuth
 */
const googleAuth = async (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/calendar"],
    });

    return res.status(200).json({
      success: true,
      authUrl: url,
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
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
    const { code } = req.query;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Authorization code missing",
      });
    }

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.status(200).json({
      success: true,
      message: "Google Calendar connected successfully",
    });
  } catch (error) {
    console.error("OAuth Callback Error:", error);
    res.status(500).json({
      success: false,
      message: "Google OAuth failed",
      error: error.message,
    });
  }
};

/**
 * Schedule Interview & Send Calendar Invite
 */
const scheduleInterview = async (req, res) => {
  try {
  //  const { candidateEmail } = req.body;

    // if (!candidateEmail) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "Candidate email is required",
    //   });
    // }

    const response = await calendar.events.insert({
      calendarId: "primary",
      conferenceDataVersion: 1,
      sendUpdates: "all",
      requestBody: {
        summary: "Recruva Interview",
        description: `
Dear Candidate,

You have been shortlisted for an interview at Recruva.

Interview Details:
• Mode: Online (Google Meet)
• Duration: 1 Hour

Best regards,
Recruva Recruitment Team
        `,
        start: {
          dateTime: dayjs().add(1, "day").hour(10).minute(0).second(0).toISOString(),
          timeZone: "Asia/Karachi",
        },
        end: {
          dateTime: dayjs().add(1, "day").hour(11).minute(0).second(0).toISOString(),
          timeZone: "Asia/Karachi",
        },
        attendees: [{ email: "waleeja.ali25@gmail.com" }],
        conferenceData: {
          createRequest: {
            requestId: Date.now().toString(),
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Interview scheduled and invite sent successfully",
      meetLink: response.data.hangoutLink,
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

module.exports = {
  googleAuth,
  googleRedirect,
  scheduleInterview,
};

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth")

const {
  googleAuth,
  googleRedirect,
  scheduleInterview,
  disconnectCalendar,
  getAllInterviews,
  getInterviewById,
  getFilteredInterviews,
  getCalendarStatus,
  getUserCalendarStatus,
  finishInterview,
  getInterviewFeedback,
  getInterviewResults,
} = require("../controllers/interviewController");

router.get("/google-auth", auth, googleAuth);
router.get("/google/redirect", googleRedirect);
router.post("/schedule-event", auth, scheduleInterview);
router.post("/disconnect-calendar", auth, disconnectCalendar);
router.post("/finish-interview", auth, finishInterview);
router.get("/feedback/:interviewId", auth, getInterviewFeedback);
router.get("/calendar-status", auth, getCalendarStatus);
router.get("/user-calendar-status/:userId", auth, getUserCalendarStatus);
router.get("/results", auth, getInterviewResults);
router.get("/:id", getInterviewById);
router.get("/", auth, getAllInterviews);

module.exports = router;

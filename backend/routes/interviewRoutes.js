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
  getCalendarStatus
} = require("../controllers/interviewController");

router.get("/google-auth", auth, googleAuth); 
router.get("/google/redirect", googleRedirect);
router.post("/schedule-event", auth, scheduleInterview); 
router.post("/disconnect-calendar", auth, disconnectCalendar); 
router.get("/calendar-status", auth,getCalendarStatus); 
router.get("/:id", getInterviewById);
router.get("/", getAllInterviews); 

module.exports = router;

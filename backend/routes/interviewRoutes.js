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
  getFilteredInterviews
} = require("../controllers/interviewController");

router.get("/google-auth", auth, googleAuth); 
router.get("/google/redirect", googleRedirect);
router.post("/schedule-event", auth, scheduleInterview); 
router.post("/disconnect-calendar", auth, disconnectCalendar); 
router.get("/", getAllInterviews); // better to use filtered
router.get("/:id", getInterviewById);

module.exports = router;

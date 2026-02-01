const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth")

const {
  googleAuth,
  googleRedirect,
  scheduleInterview,
  disconnectCalendar
} = require("../controllers/interviewController");

router.get("/google-auth", auth, googleAuth); 
router.get("/google/redirect", googleRedirect);
router.post("/schedule-event", auth, scheduleInterview); 
router.post("/disconnect-calendar", auth, disconnectCalendar); 

module.exports = router;

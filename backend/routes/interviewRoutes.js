const express = require("express");
const router = express.Router();

const {
  googleAuth,
  googleRedirect,
  scheduleInterview,
} = require("../controllers/interviewController");

router.get("/google", googleAuth);
router.get("/google/redirect", googleRedirect);
router.get("/schedule-event", scheduleInterview);

module.exports = router;

const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const {
  getShortlistedCandidates,
  updateCandidateApplicationStatus,
  getUsersByRole
} = require("../controllers/candidateController");

router.get("/shortlisted", auth, getShortlistedCandidates);
router.put("/application/:applicationId/status", auth, updateCandidateApplicationStatus);
router.get("/by-role", auth, getUsersByRole);

module.exports = router;

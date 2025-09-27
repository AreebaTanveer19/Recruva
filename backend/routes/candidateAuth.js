const express = require("express");
const { 
  registerCandidate, 
  loginCandidate, 
  getCandidateProfile, 
  updateCandidateProfile,
  verifyCandidateEmail 
} = require("../controllers/candidateAuthController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", registerCandidate);
router.post("/login", loginCandidate);
router.post("/verify-email", verifyCandidateEmail);

// Protected routes (require authentication)
router.get("/profile", auth, getCandidateProfile);
router.put("/profile", auth, updateCandidateProfile);

module.exports = router;

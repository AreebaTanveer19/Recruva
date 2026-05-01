const express = require("express");
const { 
  registerCandidate, 
  loginCandidate, 
  getCandidateProfile, 
  updateCandidateProfile,
  verifyCandidateEmail,
  googleAuthCandidate,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  resendResetOtp
} = require("../controllers/candidateAuthController");
const { auth } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/register", registerCandidate);
router.post("/login", loginCandidate);
router.post("/verify-email", verifyCandidateEmail);
router.post("/google-auth", googleAuthCandidate);

// Password reset routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);
router.post("/resend-reset-otp", resendResetOtp);

// Protected routes (require authentication)
router.get("/profile", auth, getCandidateProfile);
router.put("/profile", auth, updateCandidateProfile);

module.exports = router;

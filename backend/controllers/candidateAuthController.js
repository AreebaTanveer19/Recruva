const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const { generateToken } = require("../middleware/auth");

const JWT_SECRET = process.env.JWT_SECRET;

// Register a new candidate
const registerCandidate = async (req, res) => {
  const { name, email, password } = req.body;
  
  try {
    // Check if candidate already exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { email }
    });

    if (existingCandidate) {
      return res.status(400).json({ 
        success: false, 
        message: "Candidate with this email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new candidate
    const candidate = await prisma.candidate.create({
      data: { 
        name, 
        email, 
        password: hashedPassword 
      },
    });

    // Generate JWT token
    const token = generateToken({
      id: candidate.id,
      email: candidate.email,
      name: candidate.name,
      role: 'candidate'
    });

    res.json({
      success: true,
      message: "Candidate registered successfully",
      token,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email
      }
    });
  } catch (err) {
    console.error("Candidate registration error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Registration failed", 
      error: err.message 
    });
  }
};

// Login candidate
const loginCandidate = async (req, res) => {
  const { email, password } = req.body;
  
  try {
    // Find candidate by email
    const candidate = await prisma.candidate.findUnique({ 
      where: { email } 
    });

    if (!candidate) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, candidate.password);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: "Invalid credentials" 
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: candidate.id,
      email: candidate.email,
      name: candidate.name,
      role: 'candidate'
    });

    res.json({
      success: true,
      message: "Login successful",
      token,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email
      }
    });
  } catch (err) {
    console.error("Candidate login error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Login failed", 
      error: err.message 
    });
  }
};

// Get candidate profile
const getCandidateProfile = async (req, res) => {
  try {
    const candidateId = req.user.id;
    
    const candidate = await prisma.candidate.findUnique({
      where: { id: candidateId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true
      }
    });

    if (!candidate) {
      return res.status(404).json({ 
        success: false, 
        message: "Candidate not found" 
      });
    }

    res.json({
      success: true,
      candidate
    });
  } catch (err) {
    console.error("Get candidate profile error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to get profile", 
      error: err.message 
    });
  }
};

// Update candidate profile
const updateCandidateProfile = async (req, res) => {
  const { name } = req.body;
  const candidateId = req.user.id;
  
  try {
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidateId },
      data: { name },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    res.json({
      success: true,
      message: "Profile updated successfully",
      candidate: updatedCandidate
    });
  } catch (err) {
    console.error("Update candidate profile error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to update profile", 
      error: err.message 
    });
  }
};

// Verify candidate email (after OTP verification)
const verifyCandidateEmail = async (req, res) => {
  const { email } = req.body;
  
  try {
    const candidate = await prisma.candidate.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    if (!candidate) {
      return res.status(404).json({ 
        success: false, 
        message: "Candidate not found" 
      });
    }

    // Generate JWT token for the verified candidate
    const token = generateToken({
      id: candidate.id,
      email: candidate.email,
      name: candidate.name,
      role: 'candidate'
    });

    res.json({
      success: true,
      message: "Email verified successfully",
      token,
      candidate
    });
  } catch (err) {
    console.error("Verify candidate email error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to verify email", 
      error: err.message 
    });
  }
};

// Google OAuth login/signup via Supabase
const googleAuthCandidate = async (req, res) => {
  const { email, name, googleId } = req.body;

  if (!email || !googleId) {
    return res.status(400).json({
      success: false,
      message: "Email and Google ID are required"
    });
  }

  try {
    // Check if candidate exists by email or googleId
    let candidate = await prisma.candidate.findFirst({
      where: {
        OR: [
          { email },
          { googleId }
        ]
      }
    });

    if (candidate) {
      // Update googleId and authProvider if not set (linking existing account)
      if (!candidate.googleId) {
        candidate = await prisma.candidate.update({
          where: { id: candidate.id },
          data: { googleId, authProvider: "google" }
        });
      }
    } else {
      // Create new candidate
      candidate = await prisma.candidate.create({
        data: {
          name: name || email.split("@")[0],
          email,
          googleId,
          authProvider: "google"
        }
      });
    }

    // Generate JWT token
    const token = generateToken({
      id: candidate.id,
      email: candidate.email,
      name: candidate.name,
      role: "candidate"
    });

    res.json({
      success: true,
      message: "Google authentication successful",
      token,
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email
      }
    });
  } catch (err) {
    console.error("Google auth error:", err);
    res.status(500).json({
      success: false,
      message: "Google authentication failed",
      error: err.message
    });
  }
};

// In-memory OTP storage: { email: { otp, expiry, attempts } }
const otpStore = new Map();

// Forgot password - send OTP to email
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    // Check if candidate exists
    const candidate = await prisma.candidate.findUnique({
      where: { email }
    });

    if (!candidate) {
      // Don't reveal if email exists for security
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, an OTP will be sent"
      });
    }

    // Check if account has password (Google OAuth accounts can't reset)
    if (!candidate.password) {
      return res.status(400).json({
        success: false,
        message: "This account uses Google Sign-In. Please use Google to reset password."
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store OTP in memory
    otpStore.set(email, {
      otp,
      expiry,
      attempts: 0
    });

    // Send OTP email
    const { sendPasswordResetOtpEmail } = require("../emailService");
    const emailResult = await sendPasswordResetOtpEmail(email, otp, candidate.name);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please try again."
      });
    }

    res.json({
      success: true,
      message: "OTP sent to your email. Check your inbox.",
      email: email
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to process forgot password request",
      error: err.message
    });
  }
};

// Verify reset OTP
const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required"
    });
  }

  try {
    const storedOtp = otpStore.get(email);

    if (!storedOtp) {
      return res.status(401).json({
        success: false,
        message: "No OTP found. Please request a new one."
      });
    }

    // Check if OTP expired
    if (Date.now() > storedOtp.expiry) {
      otpStore.delete(email);
      return res.status(401).json({
        success: false,
        message: "OTP has expired. Please request a new one."
      });
    }

    // Check OTP value
    if (storedOtp.otp !== otp) {
      storedOtp.attempts += 1;

      if (storedOtp.attempts >= 3) {
        otpStore.delete(email);
        return res.status(401).json({
          success: false,
          message: "Maximum OTP attempts exceeded. Please request a new OTP."
        });
      }

      return res.status(401).json({
        success: false,
        message: `Invalid OTP. ${3 - storedOtp.attempts} attempts remaining.`
      });
    }

    // OTP is valid - generate reset token
    const candidate = await prisma.candidate.findUnique({
      where: { email }
    });

    const resetToken = jwt.sign(
      { id: candidate.id, email: candidate.email, purpose: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    res.json({
      success: true,
      message: "OTP verified successfully",
      resetToken,
      candidateId: candidate.id
    });
  } catch (err) {
    console.error("Verify reset OTP error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: err.message
    });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  const { email, newPassword, resetToken } = req.body;

  if (!email || !newPassword || !resetToken) {
    return res.status(400).json({
      success: false,
      message: "Email, new password, and reset token are required"
    });
  }

  // Validate password strength
  if (newPassword.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must be at least 6 characters long"
    });
  }

  try {
    // Verify reset token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new OTP."
      });
    }

    // Check token purpose
    if (decoded.purpose !== 'password_reset') {
      return res.status(401).json({
        success: false,
        message: "Invalid token purpose"
      });
    }

    // Get candidate
    const candidate = await prisma.candidate.findUnique({
      where: { email }
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: "Candidate not found"
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password in database
    const updatedCandidate = await prisma.candidate.update({
      where: { id: candidate.id },
      data: {
        password: hashedPassword
      },
      select: {
        id: true,
        name: true,
        email: true
      }
    });

    // Clear OTP from memory
    otpStore.delete(email);

    // Send confirmation email
    const { sendPasswordResetConfirmationEmail } = require("../emailService");
    await sendPasswordResetConfirmationEmail(email, candidate.name);

    res.json({
      success: true,
      message: "Password reset successfully. You can now login with your new password.",
      candidate: updatedCandidate
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to reset password",
      error: err.message
    });
  }
};

// Resend OTP for password reset
const resendResetOtp = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    const candidate = await prisma.candidate.findUnique({
      where: { email }
    });

    if (!candidate) {
      return res.status(200).json({
        success: true,
        message: "If an account exists with this email, an OTP will be sent"
      });
    }

    // Generate new OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, {
      otp,
      expiry,
      attempts: 0
    });

    // Send OTP email
    const { sendPasswordResetOtpEmail } = require("../emailService");
    const emailResult = await sendPasswordResetOtpEmail(email, otp, candidate.name);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email"
      });
    }

    res.json({
      success: true,
      message: "OTP resent to your email"
    });
  } catch (err) {
    console.error("Resend reset OTP error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
      error: err.message
    });
  }
};

module.exports = {
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
};

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

module.exports = {
  registerCandidate,
  loginCandidate,
  getCandidateProfile,
  updateCandidateProfile,
  verifyCandidateEmail
};

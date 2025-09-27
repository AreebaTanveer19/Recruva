const express = require("express");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const prisma = require("../config/db");

const router = express.Router();

// HR dashboard route
router.get("/hr-dashboard", auth, roleCheck("HR"), (req, res) => {
  res.json({ success: true, message: "Welcome HR" });
});

// Department dashboard route
router.get("/department-dashboard", auth, roleCheck("DEPARTMENT"), (req, res) => {
  res.json({ success: true, message: "Welcome Department" });
});

// Candidate dashboard route
router.get("/candidate-dashboard", auth, async (req, res) => {
  try {
    // Check if user is a candidate
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Candidate role required." 
      });
    }

    // Get candidate details
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
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
      message: "Welcome to Candidate Dashboard",
      candidate 
    });
  } catch (error) {
    console.error('Candidate dashboard error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

// Candidate profile route
router.get("/candidate-profile", auth, async (req, res) => {
  try {
    // Check if user is a candidate
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ 
        success: false, 
        message: "Access denied. Candidate role required." 
      });
    }

    // Get candidate details
    const candidate = await prisma.candidate.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        createdAt: true,
        updatedAt: true
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
  } catch (error) {
    console.error('Candidate profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: "Internal server error" 
    });
  }
});

module.exports = router;

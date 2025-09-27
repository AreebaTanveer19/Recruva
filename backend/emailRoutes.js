const express = require('express');
const { sendOtpEmail, verifyEmailConfig } = require('./emailService');
const prisma = require('./config/db');
const { verifyCandidateEmail } = require('./controllers/candidateAuthController');

const router = express.Router();

// In-memory OTP store (in production, use a database or Redis)
const otpStore = new Map();
const pendingRegistrations = new Map(); // Store pending candidate registrations

// Send OTP endpoint (only for signup verification)
router.post('/send-otp', async (req, res) => {
  try {
    const { email, name, password } = req.body;
    
    if (!email || !name || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email, name, and password are required' 
      });
    }

    // Check if candidate already exists
    const existingCandidate = await prisma.candidate.findUnique({
      where: { email }
    });

    if (existingCandidate) {
      return res.status(400).json({ 
        success: false, 
        message: 'Candidate with this email already exists' 
      });
    }

    // Store pending registration data
    pendingRegistrations.set(email, { name, password });

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store OTP with expiration (5 minutes)
    const expirationTime = Date.now() + 5 * 60 * 1000; // 5 minutes
    otpStore.set(email, { otp, expirationTime });
    
    console.log(`Generated OTP for ${email}: ${otp}`);
    
    // Send OTP email
    const emailResult = await sendOtpEmail(email, otp);
    
    if (emailResult.success) {
      res.json({ 
        success: true, 
        message: 'OTP sent successfully for email verification',
        otp: otp // Return OTP for testing (remove in production)
      });
    } else {
      // Clean up pending registration if email fails
      pendingRegistrations.delete(email);
      res.status(500).json({ 
        success: false, 
        message: 'Failed to send OTP',
        error: emailResult.error
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Verify OTP endpoint (only for signup completion)
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and OTP are required' 
      });
    }

    const storedOtpData = otpStore.get(email);
    
    if (!storedOtpData) {
      return res.status(400).json({ 
        success: false, 
        message: 'No OTP found for this email' 
      });
    }

    const { otp: storedOtp, expirationTime } = storedOtpData;
    
    // Check if OTP has expired
    if (Date.now() > expirationTime) {
      otpStore.delete(email);
      pendingRegistrations.delete(email); // Clean up pending registration
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    // Verify OTP
    if (otp === storedOtp) {
      otpStore.delete(email); // Clean up verified OTP
      
      // Get pending registration data
      const pendingData = pendingRegistrations.get(email);
      
      if (pendingData) {
        const { name, password } = pendingData;
        const bcrypt = require('bcryptjs');
        
        try {
          // Hash password
          const hashedPassword = await bcrypt.hash(password, 10);
          
          // Create candidate
          const candidate = await prisma.candidate.create({
            data: { 
              name, 
              email, 
              password: hashedPassword
            }
          });
          
          // Clean up pending registration
          pendingRegistrations.delete(email);
          
          // Generate JWT token
          const { generateToken } = require('./middleware/auth');
          const token = generateToken({
            id: candidate.id,
            email: candidate.email,
            name: candidate.name,
            role: 'candidate'
          });
          
          res.json({ 
            success: true, 
            message: 'Email verified and candidate registered successfully',
            token,
            candidate: {
              id: candidate.id,
              name: candidate.name,
              email: candidate.email
            }
          });
        } catch (error) {
          console.error('Candidate creation error:', error);
          pendingRegistrations.delete(email);
          res.status(500).json({ 
            success: false, 
            message: 'Failed to create candidate account',
            error: error.message
          });
        }
      } else {
        res.status(400).json({ 
          success: false, 
          message: 'Registration data not found' 
        });
      }
    } else {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid OTP' 
      });
    }
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Health check endpoint for email service
router.get('/health', (req, res) => {
  const emailConfig = verifyEmailConfig();
  res.json({ 
    success: true, 
    message: 'Email service is running',
    config: {
      emailConfigured: emailConfig.configured,
      emailHost: emailConfig.host ? 'Configured' : 'Not configured',
      emailPort: emailConfig.port || 'Not configured',
      emailUser: emailConfig.user ? 'Configured' : 'Not configured'
    }
  });
});

module.exports = router;

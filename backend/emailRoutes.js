const express = require('express');
const { sendOtpEmail, verifyEmailConfig } = require('./emailService');

const router = express.Router();

// In-memory OTP store (in production, use a database)
const otpStore = new Map();

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

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
        message: 'OTP sent successfully',
        otp: otp // Return OTP for testing (remove in production)
      });
    } else {
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

// Verify OTP endpoint
router.post('/verify-otp', (req, res) => {
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
      otpStore.delete(email); // Clean up expired OTP
      return res.status(400).json({ 
        success: false, 
        message: 'OTP has expired' 
      });
    }

    // Verify OTP
    if (otp === storedOtp) {
      otpStore.delete(email); // Clean up verified OTP
      res.json({ 
        success: true, 
        message: 'OTP verified successfully' 
      });
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
      emailUser: emailConfig.user ? 'Configured' : 'Not configured'
    },
    otpStoreSize: otpStore.size
  });
});

module.exports = router;

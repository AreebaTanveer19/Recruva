const express = require ('express');
const cors = require('cors');
require('dotenv').config();
const { verifyEmailConfig } = require('./emailService');
const emailRoutes = require('./emailRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Use email routes
app.use('/api', emailRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Recruva OTP Service API',
    version: '1.0.0',
    endpoints: {
      'POST /api/send-otp': 'Send OTP to email',
      'POST /api/verify-otp': 'Verify OTP',
      'GET /api/health': 'Health check'
    }
  });
});

// Start server
app.listen(port, async () => {
  console.log(`🚀 OTP Server running on port ${port}`);
  
  // Verify email configuration on startup
  const emailConfigValid = await verifyEmailConfig();
  if (emailConfigValid) {
    console.log('✅ Email configuration verified successfully');
  } else {
    console.log('❌ Email configuration failed - check your .env file');
  }
});
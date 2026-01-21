const express = require ('express');
const cors = require('cors');
require('dotenv').config();
const { verifyEmailConfig } = require('./emailService');
const emailRoutes = require('./emailRoutes');
const authRoutes = require("./routes/auth");
const candidateAuthRoutes = require("./routes/candidateAuth");
const protectedRoutes = require("./routes/protected");
const jobRoutes = require("./routes/job");
const linkedinRoutes = require("./routes/linkedinRoutes.js");
const interviewRoutes = require("./routes/interviewRoutes.js");
const cvRoutes = require("./routes/cv");

const app = express();
const port = process.env.PORT || 3000;
const prisma = require("./config/db")

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
app.use("/api/auth", authRoutes);
app.use("/api/candidate", candidateAuthRoutes);
app.use("/api", protectedRoutes);
app.use("/api", jobRoutes);
app.use("/auth/linkedin", linkedinRoutes);
app.use("/api/cv", cvRoutes);
app.use("/api/interview", interviewRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Recruva Authentication API',
    version: '1.0.0',
    endpoints: {
      'POST /api/send-otp': 'Send OTP to email',
      'POST /api/verify-otp': 'Verify OTP',
      'POST /api/candidate/register': 'Register new candidate',
      'POST /api/candidate/login': 'Login candidate',
      'POST /api/candidate/verify-email': 'Verify candidate email',
      'GET /api/candidate/profile': 'Get candidate profile (protected)',
      'PUT /api/candidate/profile': 'Update candidate profile (protected)',
      'GET /api/cv': 'Get CV data (protected)',
      'POST /api/cv': 'Save CV data (protected)',
      'GET /api/health': 'Health check'
    }
  });
});

// Start server
app.listen(port, async () => {
  console.log(`🚀 Recruva Authentication Server running on port ${port}`);
  
  // Verify email configuration on startup
  const emailConfigValid = await verifyEmailConfig();
  if (emailConfigValid) {
    console.log('✅ Email configuration verified successfully');
  } else {
    console.log('❌ Email configuration failed - check your .env file');
  }
  try {
    await prisma.$connect();
    console.log('✅ Prisma connected to the database');
  } catch (err) {
    console.error('❌ Prisma failed to connect:', err);
  }
});

// process.on('SIGINT', async () => {
//   await prisma.$disconnect();
//   console.log('👋 Prisma disconnected. Server shutting down.');
//   process.exit(0);
// });

// process.on('SIGTERM', async () => {
//   await prisma.$disconnect();
//   console.log('👋 Prisma disconnected. Server shutting down.');
//   process.exit(0);
// });
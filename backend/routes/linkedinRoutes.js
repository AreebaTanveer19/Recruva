const express = require("express");
const axios = require("axios");
const prisma = require("../config/db");// adjust path if needed
const { encrypt, decrypt } = require("../utils/encryption");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const jwt = require("jsonwebtoken");
const {addJobPoster} = require("../controllers/jobController");

const router = express.Router();

const LINKEDIN_CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
const LINKEDIN_CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDIRECT_URI; // backend callback URL

// ----------------------------
// Step 1: Redirect HR to LinkedIn for authorization
// ----------------------------
router.get("/auth", async (req, res, next) => {
  const token = req.query.token;
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next(); // pass control to the existing /auth handler
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
}, roleCheck("HR"), async (req, res) => {
  try {
    const hrId = req.user.id; // comes from verifyToken middleware
    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${LINKEDIN_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      REDIRECT_URI
    )}&scope=openid%20profile%20email%20w_member_social&state=${hrId}`;

    res.redirect(authUrl);
  } catch (err) {
    console.error("LinkedIn auth redirect error:", err);
    res.status(500).send("Failed to start LinkedIn authentication");
  }
});

// ----------------------------
// Step 2: Handle LinkedIn callback & store tokens in DB
// ----------------------------
router.get("/callback", async (req, res) => {
  const { code, state: hrId } = req.query;
  if (!code || !hrId) return res.status(400).send("Missing code or HR ID");

  try {
    // Exchange code for access token
    const tokenRes = await axios.post(
      "https://www.linkedin.com/oauth/v2/accessToken",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: LINKEDIN_CLIENT_ID,
        client_secret: LINKEDIN_CLIENT_SECRET,
      }).toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const { access_token, expires_in } = tokenRes.data;

    // Fetch LinkedIn user info
    const userInfoRes = await axios.get("https://api.linkedin.com/v2/userinfo", {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const { sub: linkedinId, name, email } = userInfoRes.data;

    // Store LinkedIn info in database
    await prisma.user.update({
    where: { id: parseInt(hrId) },
    data: {
    linkedinId,
    linkedinToken: encrypt(access_token), // 🔐 encrypted before saving
    linkedinExpires: new Date(Date.now() + expires_in * 1000),
    },
    });

    res.redirect("http://localhost:5173/hr/open-jobs");
  } catch (error) {
    console.error("LinkedIn callback error:", error.response?.data || error);
    res.status(500).send("LinkedIn auth failed");
  }
});

// ----------------------------
// Step 3: Post job to LinkedIn
// ----------------------------
router.post("/post/:jobId", auth , roleCheck("HR"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user || !user.linkedinToken) {
      return res.status(400).json({ error: "LinkedIn not connected" });
    }

    const job = await prisma.job.findUnique({
      where: { id: parseInt(req.params.jobId) },
      include: { details: true },
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    // Build LinkedIn post content
    let postText = `🚀 Project Demo: Sample Job Posting \n\⚠️ This post does NOT represent an actual job opportunity.\n\n`;

  // Description at the top
  if (job.details?.description) {
    postText += `${job.details?.description}\n\n`;
  }

  // Key job details with emojis
  if (job.title) postText += `📌 Position: ${job.title}\n`;
  if (job.department) postText += `🏢 Department: ${job.department}\n`;
  if (job.location) postText += `📍 Location: ${job.location}\n`;
  if (job.employmentType || job.workMode)
    postText += `🕒 Type: ${job.employmentType || "N/A"} | Work Mode: ${job.workMode || "N/A"}\n`;
  if (job.details?.experienceLevel)
    postText += `🎓 Experience: ${job.details.experienceLevel}+ years\n`;

  // Optional: Salary
  if (job.details?.salaryMin && job.details?.salaryMax)
    postText += `💰 Salary Range: $${job.details.salaryMin} – $${job.details.salaryMax}\n`;

  // Application link
  postText += `\n📩 Apply here 👉 https://yourjobportal.com/jobs/${job.id}`;

const postContent = {
  author: `urn:li:person:${user.linkedinId}`,
  lifecycleState: "PUBLISHED",
  specificContent: {
    "com.linkedin.ugc.ShareContent": {
      shareCommentary: { text: postText },
      shareMediaCategory: "NONE",
    },
  },
  visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
};


    const encryptedToken = user.linkedinToken;
    const accessToken = decrypt(encryptedToken);

    await axios.post("https://api.linkedin.com/v2/ugcPosts", postContent, {
    headers: {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
    "x-restli-protocol-version": "2.0.0",
    },
    });

    await prisma.job.update({
      where: { id: job.id },
      data: {
        posters: { connect: { id: user.id } },
      },
      include: { posters: true, details: true },
    });

    res.json({ success: true, message: "Posted to LinkedIn successfully" });
  } catch (error) {
    console.error("LinkedIn post error:", error.response?.data || error);
    res.status(500).json({ error: "Failed to post on LinkedIn" });
  }
});

router.get("/status", auth , roleCheck("HR"), async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { linkedinToken: true, linkedinExpires: true },
    });

    if (!user || !user.linkedinToken) return res.json({ connected: false });

    const isExpired = user.linkedinExpires && user.linkedinExpires < new Date();
    res.json({ connected: !isExpired });
  } catch (err) {
    console.error("LinkedIn status error:", err);
    res.status(500).json({ connected: false });
  }
});


module.exports = router;

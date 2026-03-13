const express = require("express");
const { generateQuestions } = require("../controllers/questionGenerationController");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const router = express.Router();

router.post("/jobs/:jobId/generate-questions", generateQuestions);

module.exports = router;
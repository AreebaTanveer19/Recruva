const express = require("express");
const { generateQuestions, deleteQuestion, regenerateQuestion } = require("../controllers/questionGenerationController");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const router = express.Router();

router.post("/jobs/:jobId/generate-questions", generateQuestions);
router.delete("/jobs/:jobId/questions/:questionId/delete", deleteQuestion);
router.put("/jobs/:jobId/questions/:questionId/regenerate", regenerateQuestion);
module.exports = router;
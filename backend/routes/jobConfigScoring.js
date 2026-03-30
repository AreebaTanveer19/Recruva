const express = require("express");

const {
  createScoringConfig,
  getScoringConfig,
  updateScoringConfig,
  deleteScoringConfig
} = require("../controllers/jobScoringConfigController");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");

const router = express.Router();



// ─── Scoring Config Routes ────────────────────────────────────
router.post("/:jobId/scoring-config",   auth, roleCheck("DEPARTMENT"), createScoringConfig);
router.get("/:jobId/scoring-config",    auth, roleCheck("HR"), getScoringConfig);
router.put("/:jobId/scoring-config",    auth, roleCheck("DEPARTMENT"), updateScoringConfig);
router.delete("/:jobId/scoring-config", auth, roleCheck("DEPARTMENT"), deleteScoringConfig);

module.exports = router;
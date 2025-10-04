const express = require("express");
const {createJob, getPendingJobs, getOpenJobs} = require("../controllers/jobController");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const router = express.Router();

router.post("/createJob", auth, roleCheck("DEPARTMENT"), createJob);
router.get("/pendingJobs", auth, roleCheck("DEPARTMENT", "HR"), getPendingJobs);
router.get("/openJobs", auth, getOpenJobs);

module.exports = router;
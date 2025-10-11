const express = require("express");
const {createJob,getOpenJobs, getJobsPendingForHR, getJobsPostedByHR,addJobPoster} = require("../controllers/jobController");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const router = express.Router();

router.post("/createJob", auth, roleCheck("DEPARTMENT"), createJob);
router.get("/openJobs", auth, getOpenJobs);
router.get("/posted-jobs", auth , roleCheck("HR"),getJobsPostedByHR);
router.get("/pending-post", auth, roleCheck("HR"), getJobsPendingForHR);
router.post("/add-poster", auth, addJobPoster);


module.exports = router;
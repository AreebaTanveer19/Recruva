const express = require("express");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const router = express.Router();
const {getDashboardJobs} = require('./../controllers/dashboardController')
const { getUpcomingInterviews } = require("../controllers/dashboardController");

router.get("/dashboard-jobs" , auth ,roleCheck("HR"), getDashboardJobs);
router.get("/upcoming", auth, getUpcomingInterviews);

module.exports = router;
const express = require("express");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const router = express.Router();
const {getDashboardJobs} = require('./../controllers/dashboardController')

router.get("/dashboard-jobs" , auth ,roleCheck("HR"), getDashboardJobs);

module.exports = router;
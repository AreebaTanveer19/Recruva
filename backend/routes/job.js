const express = require("express");
const {createJob} = require("../controllers/jobController");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");
const router = express.Router();

router.post("/createJob", auth, roleCheck("DEPARTMENT"), createJob);

module.exports = router;
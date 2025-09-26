const express = require("express");
const { auth } = require("../middleware/auth");
const roleCheck = require("../middleware/role");

const router = express.Router();

// HR dashboard route
router.get("/hr-dashboard", auth, roleCheck("HR"), (req, res) => {
  res.json({ success: true, message: "Welcome HR" });
});

// Department dashboard route
router.get("/department-dashboard", auth, roleCheck("DEPARTMENT"), (req, res) => {
  res.json({ success: true, message: "Welcome Department" });
});

module.exports = router;

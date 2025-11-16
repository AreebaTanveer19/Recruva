const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { saveCVData, getCVData } = require('../controllers/cvController');

// Protected routes (require authentication)
router.get('/', auth, getCVData);
router.post('/', auth, saveCVData);

module.exports = router;

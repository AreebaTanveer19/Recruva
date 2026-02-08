// backend/routes/resumeRoutes.js
const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { 
  uploadResume,
  getResume,
  deleteResume
} = require('../controllers/resumeController');

// Upload resume (single file)
router.post('/upload', auth, upload.single('resume'), uploadResume);

// Get user's resume
router.get('/:id', auth, getResume);

// Delete resume
router.delete('/:id', auth, deleteResume);

module.exports = router;
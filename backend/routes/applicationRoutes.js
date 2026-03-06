const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/role');
const { upload } = require('../middleware/upload');
const {
  checkApplicationStatus,
  getCandidateResumes,
  applyWithExistingResume,
  applyWithNewResume,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
} = require('../controllers/applicationController');

// Candidate routes
router.get('/check-status/:jobId', auth, checkApplicationStatus);
router.get('/resumes', auth, getCandidateResumes);
router.post('/apply/existing', auth, applyWithExistingResume);
router.post('/apply/new', auth, upload.single('resume'), applyWithNewResume);
router.get('/my-applications', auth, getMyApplications);

// HR-only routes
router.get('/job/:jobId', auth, roleCheck('HR'), getJobApplications);
router.patch('/:id/status', auth, roleCheck('HR'), updateApplicationStatus);

module.exports = router;

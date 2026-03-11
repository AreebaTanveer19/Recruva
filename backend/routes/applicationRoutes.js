const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const roleCheck = require('../middleware/role');
const { upload } = require('../middleware/upload');
const {
  checkApplicationStatus,
  getCandidateResumes,
  checkHasPreviousResume,
  applyWithExistingResume,
  applyWithNewResume,
  applyWithProfileData,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getAllJobApplications,
  getPreviousProfileData,
} = require('../controllers/applicationController');

// Candidate routes
router.get('/check-status/:jobId', auth, checkApplicationStatus);
router.get('/resumes', auth, getCandidateResumes);
router.get('/has-previous-resume', auth, checkHasPreviousResume);
router.get('/previous-profile-data', auth, getPreviousProfileData);
router.post('/apply/existing', auth, applyWithExistingResume);
router.post('/apply/new', auth, upload.single('resume'), applyWithNewResume);
router.post('/apply/profile', auth, applyWithProfileData);
router.get('/my-applications', auth, getMyApplications);

// HR-only routes
router.get('/job/:jobId', auth, roleCheck('HR'), getJobApplications);
router.patch('/:id/status', auth, roleCheck('HR'), updateApplicationStatus);
router.get('/',auth,roleCheck('HR'),getAllJobApplications);

module.exports = router;

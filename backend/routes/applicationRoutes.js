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
  previewResumeUpload,
  applyWithProfileData,
  getMyApplications,
  getJobApplications,
  updateApplicationStatus,
  getAllJobApplications,
  getPreviousProfileData,
  bulkUpdateStatus,
  getApplicationById,
  decideApplication,
  getFinalisedCandidates,
  getResumeProfile,
  rescoreApplication,
} = require('../controllers/applicationController');

// Candidate routes
router.get('/check-status/:jobId', auth, checkApplicationStatus);
router.get('/resumes', auth, getCandidateResumes);
router.get('/has-previous-resume', auth, checkHasPreviousResume);
router.get('/previous-profile-data', auth, getPreviousProfileData);
router.post('/apply/existing', auth, applyWithExistingResume);
router.post('/preview-resume', auth, upload.single('resume'), previewResumeUpload);
router.post('/apply/new', auth, upload.single('resume'), applyWithNewResume);
router.post('/apply/profile', auth, applyWithProfileData);
router.get('/my-applications', auth, getMyApplications);

// HR-only routes
router.get('/job/:jobId', auth, roleCheck('HR'), getJobApplications);
router.patch('/bulk-status', auth, roleCheck('HR'), bulkUpdateStatus);
router.post('/:id/rescore', auth, roleCheck('HR'), rescoreApplication);
router.get("/finalised", auth, roleCheck('HR'), getFinalisedCandidates);
router.get("/resume/:resumeId/profile", auth, roleCheck('HR', 'DEPARTMENT'), getResumeProfile);
router.patch("/:id/decide", auth,roleCheck('HR'), decideApplication);
router.patch('/:id/status', auth, roleCheck('HR'), updateApplicationStatus);
router.get('/:id', auth, roleCheck('HR'), getApplicationById);
router.get('/',auth,roleCheck('HR'),getAllJobApplications);

module.exports = router;

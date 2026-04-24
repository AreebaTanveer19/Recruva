import api from './api';

// Check if candidate has already applied to a job
export const checkApplicationStatus = async (jobId) => {
  const response = await api.get(`/application/check-status/${jobId}`);
  return response.data;
};

// Get all resumes for the authenticated candidate
export const getCandidateResumes = async () => {
  const response = await api.get('/application/resumes');
  return response.data;
};

// Check if candidate has any previous resumes
export const checkHasPreviousResume = async () => {
  const response = await api.get('/application/has-previous-resume');
  return response.data;
};

// Preview resume upload (parse and store without creating application)
export const previewResumeUpload = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  const response = await api.post('/application/preview-resume', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Apply with an existing resume
export const applyWithExistingResume = async (jobId, resumeId) => {
  const response = await api.post('/application/apply/existing', { jobId, resumeId });
  return response.data;
};

// Apply with a new resume upload
export const applyWithNewResume = async (jobId, file) => {
  const formData = new FormData();
  formData.append('jobId', jobId);
  formData.append('resume', file);
  const response = await api.post('/application/apply/new', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

// Apply with profile data (CvData)
export const applyWithProfileData = async (jobId, reparse = true) => {
  const response = await api.post('/application/apply/profile', { jobId, reparse });
  return response.data;
};

// Get previous profile snapshot and current data for comparison
export const getPreviousProfileData = async () => {
  const response = await api.get('/application/previous-profile-data');
  return response.data;
};

// Get candidate's applications
export const getMyApplications = async () => {
  const response = await api.get('/application/my-applications');
  return response.data;
};

// Get applications for a job (HR only)
export const getJobApplications = async (jobId) => {
  const response = await api.get(`/application/job/${jobId}`);
  return response.data;
};

// Update application status (HR only)
export const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.patch(`/application/${applicationId}/status`, { status });
  return response.data;
};

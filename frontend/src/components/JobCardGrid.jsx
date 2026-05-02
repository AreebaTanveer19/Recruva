import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ConfirmDialog } from "./ConfirmDialog";
import api from "../api";

const JobCardGrid = ({ jobs = [], isLinkedInConnected, postingJobId, postToLinkedIn,variant, detailRoute }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    jobId: null,
    loading: false,
  });
  const [jobsList, setJobsList] = useState(jobs);

  React.useEffect(() => {
    setJobsList(jobs);
  }, [jobs]);

  const handleCloseJobClick = (jobId) => {
    setConfirmDialog({
      open: true,
      jobId,
      loading: false,
    });
  };

  const handleConfirmClose = async () => {
    try {
      setConfirmDialog((prev) => ({ ...prev, loading: true }));
      
      await api.patch(`/close-job/${confirmDialog.jobId}`);
      
      // Remove the job from the list
      setJobsList((prev) => prev.filter((job) => job.id !== confirmDialog.jobId));
      
      setConfirmDialog({
        open: false,
        jobId: null,
        loading: false,
      });
    } catch (error) {
      console.error("Error closing job:", error);
      alert(error.response?.data?.error || "Failed to close job");
      setConfirmDialog((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleCancelClose = () => {
    setConfirmDialog({
      open: false,
      jobId: null,
      loading: false,
    });
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {jobsList.map((job) => (
          <div
            key={job.id}
            className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-gray-400 transition-all transform hover:-translate-y-1 flex flex-col"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold text-gray-900 flex-1">{job.title}</h3>
              {variant === "hr" && (
                <button
                  onClick={() => handleCloseJobClick(job.id)}
                  title="Close/Archive Job"
                  className="ml-2 p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-2">
              {job.department} • {job.location}
            </p>

            <p className="mt-3 text-gray-600 text-sm line-clamp-3 flex-1">
              {job.description}
            </p>

            {/* Extra Job Details */}
            <div className="mt-4 space-y-1 text-sm text-gray-700">
              <p>
                <span className="font-semibold">Employment Type:</span> {job.employmentType}
              </p>
              <p>
                <span className="font-semibold">Work Mode:</span> {job.workMode}
              </p>
              <p>
                <span className="font-semibold">Salary Range:</span> {job.salaryMin} - {job.salaryMax}
              </p>

          {variant === "dept" && (
               <button
                  onClick={() => navigate(`${detailRoute}/${job.id}`)}
                  className="flex-1 w-full bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-black transition mt-4"
                >
                  View Details
                </button>
          )}


            </div>

            {/* Buttons (only if route is HR) */}
            {variant === "hr" && (
              <div className="mt-5 flex flex-col sm:flex-col lg:flex-row gap-2">
                           <button
                  onClick={() => navigate(`${detailRoute}/${job.id}`)}
                  className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-black transition"
                >
                  View Details
                </button>
                <button
                  onClick={() => postToLinkedIn(job.id)}
                  disabled={!isLinkedInConnected || postingJobId === job.id}
                  className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition ${
                    isLinkedInConnected
                      ? "bg-gray-800 hover:bg-black text-white"
                      : "bg-gray-300 cursor-not-allowed text-gray-500"
                  }`}
                >
                  {postingJobId === job.id ? "Posting..." : "Post to LinkedIn"}
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        title="Close Job Position"
        message="Are you sure you want to close this job position? This action will archive the job and it will no longer be visible to candidates."
        confirmText="Close Job"
        cancelText="Cancel"
        confirmColor="error"
        loading={confirmDialog.loading}
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />
    </>
  );
};

export default JobCardGrid;

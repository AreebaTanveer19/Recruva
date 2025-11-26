import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

const JobCardGrid = ({ jobs = [], isLinkedInConnected, postingJobId, postToLinkedIn }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const route = location.pathname.includes("/hr") ? "hr" : "dept";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
      {jobs.map((job) => (
        <div
          key={job.id}
          className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-gray-400 transition-all transform hover:-translate-y-1 flex flex-col"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-2">{job.title}</h3>
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

        {route === "dept" && (
             <button
                onClick={() => navigate(`/open-jobs/${job.id}`)}
                className="flex-1 w-full bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-black transition"
              >
                View Details
              </button>
        )}


          </div>

          {/* Buttons (only if route is HR) */}
          {route === "hr" && (
            <div className="mt-5 flex flex-col sm:flex-col lg:flex-row gap-2">
                         <button
                onClick={() => navigate(`/open-jobs/${job.id}`)}
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
  );
};

export default JobCardGrid;

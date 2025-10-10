import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./../../api";
import HRSidebar from "./../../components/HRSidebar";

function OpenJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/openJobs");
        setJobs(res.data.jobs);
      } catch (error) {
        console.error("Error fetching open jobs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black to-gray-800 text-white">
      <HRSidebar />

      <div className="flex-1 py-10 px-6 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center min-h-screen text-white">
            <p className="text-lg animate-pulse">Loading open jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex items-center justify-center min-h-screen text-gray-300">
            <p>No open jobs available.</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold mb-8 text-center text-white">
              Open Job Positions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-gray-900 border border-gray-700 rounded-2xl p-5 shadow-lg hover:shadow-xl transition-transform transform hover:-translate-y-1"
                >
                  <h3 className="text-xl font-bold text-white mb-2">
                    {job.title}
                  </h3>
                  <p className="text-gray-400 text-sm mb-2">
                    {job.department} • {job.location}
                  </p>

                  <div className="text-sm text-gray-300 space-y-1">
                    <p>
                      <strong>Employment Type:</strong> {job.employmentType}
                    </p>
                    <p>
                      <strong>Work Mode:</strong> {job.workMode}
                    </p>
                    <p>
                      <strong>Experience Level:</strong> {job.experienceLevel}+ years
                    </p>
                    <p>
                      <strong>Salary:</strong> PKR{" "}
                      {job.salaryMin.toLocaleString()} -{" "}
                      {job.salaryMax.toLocaleString()}
                    </p>
                  </div>

                  <p className="mt-3 text-gray-400 text-sm line-clamp-3">
                    {job.description}
                  </p>

                  {job.deadline && (
                    <p className="text-xs text-gray-500 mt-3">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  )}

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => navigate(`/open-jobs/${job.id}`)}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      View Details
                    </button>

                    <button
                      className="flex items-center justify-center gap-2 px-3 py-2 bg-[#0077b5] text-white rounded-lg font-semibold hover:bg-[#006097] transition"
                      title="Post to LinkedIn"
                    >
                      <span className="hidden sm:inline">Post to LinkedIn</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default OpenJobs;

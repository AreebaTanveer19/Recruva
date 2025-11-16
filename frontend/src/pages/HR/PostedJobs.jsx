import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./../../api";
import HRSidebar from "./../../components/HRSidebar";
import axios from "axios";
import { ACCESS_TOKEN } from "./../../constants";

function PostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  // ------------------------
  // Fetch open jobs
  // ------------------------
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/posted-jobs");
        setJobs(res.data.jobs);
      } catch (error) {
        console.error("Error fetching open jobs:", error);
        setJobs([]);
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
            <p className="text-lg animate-pulse">Loading posted jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex items-center justify-center min-h-screen text-gray-300">
            <p>No jobs posted yet.</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold mb-8 text-center text-white">
              Posted Job Positions
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

                  <p className="mt-3 text-gray-400 text-sm line-clamp-3">
                    {job.description}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => navigate(`/posted-jobs/${job.id}`)}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      View Details
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

export default PostedJobs;

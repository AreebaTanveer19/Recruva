import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./../../api";
import HRSidebar from "./../../components/HRSidebar";
import axios from "axios";
import { ACCESS_TOKEN } from "./../../constants";

function OpenJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLinkedInConnected, setIsLinkedInConnected] = useState(false);
  const navigate = useNavigate();
  const [postingJobId, setPostingJobId] = useState(null);

  // ------------------------
  // Fetch open jobs
  // ------------------------
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

  // ------------------------
  // Check LinkedIn connection
  // ------------------------

  useEffect(() => {
    const checkLinkedInStatus = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);

        const res = await axios.get(
          "http://localhost:3000/auth/linkedin/status",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setIsLinkedInConnected(res.data.connected);
      } catch (err) {
        console.error("Failed to check LinkedIn status:", err);
        setIsLinkedInConnected(false);
      }
    };

    checkLinkedInStatus();
  }, []);

  // ------------------------
  // Handlers
  // ------------------------
  const connectLinkedIn = () => {
    const token = localStorage.getItem("ACCESS_TOKEN");
    window.location.href = `http://localhost:3000/auth/linkedin/auth?token=${token}`;
  };

  const postToLinkedIn = async (jobId) => {
    try {
      setPostingJobId(jobId);
      const token = localStorage.getItem("ACCESS_TOKEN");

      const res = await axios.post(
        `http://localhost:3000/auth/linkedin/post/${jobId}`,
        {}, // empty body if not sending anything
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(res.data.message || "Posted successfully!");
    } catch (err) {
      console.error("Post error:", err);
      alert("Failed to post on LinkedIn. Please reconnect your LinkedIn.");
    } finally {
      setPostingJobId(null);
    }
  };

  // ------------------------
  // UI
  // ------------------------
  return (
    <div className="flex min-h-screen bg-gradient-to-b from-black to-gray-800 text-white">
      <HRSidebar />

      <div className="flex-1 py-10 px-6 overflow-y-auto">
        <div className="flex justify-end mb-6">
          <button
            onClick={connectLinkedIn}
            disabled={isLinkedInConnected}
            className={`px-4 py-2 rounded-lg font-semibold transition ${
              isLinkedInConnected
                ? "bg-green-600 cursor-not-allowed"
                : "bg-[#0077b5] hover:bg-[#006097]"
            } text-white`}
          >
            {isLinkedInConnected
              ? "Connected to LinkedIn ✅"
              : "Connect LinkedIn"}
          </button>
        </div>

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

                  <p className="mt-3 text-gray-400 text-sm line-clamp-3">
                    {job.description}
                  </p>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => navigate(`/open-jobs/${job.id}`)}
                      className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-2 rounded-lg font-semibold hover:opacity-90 transition"
                    >
                      View Details
                    </button>

                    <button
                      onClick={() => postToLinkedIn(job.id)}
                      disabled={!isLinkedInConnected || postingJobId === job.id}
                      className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg font-semibold transition ${
                        isLinkedInConnected
                          ? "bg-[#0077b5] hover:bg-[#006097] text-white"
                          : "bg-gray-600 cursor-not-allowed text-gray-300"
                      }`}
                    >
                      {postingJobId === job.id
                        ? "Posting..."
                        : "Post to LinkedIn"}
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

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import api from "./../api";
import { useLocation } from "react-router-dom";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const showLinkedInButton = /^\/open-jobs\/\d+$/.test(location.pathname);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await api.get("/openJobs");
        const jobData = res.data.jobs.find((j) => j.id === parseInt(id));
        setJob(jobData);
      } catch (error) {
        console.error("Error fetching job details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-800 text-white">
        <p className="text-lg animate-pulse">Loading job details...</p>
      </div>
    );

  if (!job)
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-black to-gray-800 text-gray-300">
        <p>Job not found.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-100 py-8 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-gray-300 hover:text-white transition"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>

        {/* Job Header */}
        <div className="bg-gradient-to-r from-indigo-600/90 to-purple-700/90 p-6 sm:p-7 rounded-2xl shadow-lg text-white">
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">{job.title}</h1>
          <p className="text-gray-200 mb-3">
            {job.department} • {job.location}
          </p>

          <div className="flex flex-wrap gap-3 text-sm sm:text-base">
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
              <strong>Type:</strong> {job.employmentType}
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
              <strong>Work Mode:</strong> {job.workMode}
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
              <strong>Experience:</strong> {job.experienceLevel}+ years
            </div>
            <div className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-lg">
              <strong>Salary:</strong> PKR {job.salaryMin.toLocaleString()} -{" "}
              {job.salaryMax.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Job Description */}
        <div className="mt-6 bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-lg space-y-6">
          <section className="p-0">
            <h2 className="text-xl font-semibold text-white mb-2">
              Job Description
            </h2>
            <p className="text-gray-300 leading-relaxed">{job.description}</p>
          </section>

          {job.requirements?.length > 0 && (
            <section className="p-0">
              <h2 className="text-xl font-semibold text-white mb-2">
                Requirements
              </h2>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {job.requirements.map((req, idx) => (
                  <li key={idx}>{req}</li>
                ))}
              </ul>
            </section>
          )}

          {job.responsibilities?.length > 0 && (
            <section className="p-0">
              <h2 className="text-xl font-semibold text-white mb-2">
                Responsibilities
              </h2>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {job.responsibilities.map((res, idx) => (
                  <li key={idx}>{res}</li>
                ))}
              </ul>
            </section>
          )}

          {job.qualifications?.length > 0 && (
            <section className="p-0">
              <h2 className="text-xl font-semibold text-white mb-2">
                Qualifications
              </h2>
              <ul className="list-disc list-inside text-gray-300 space-y-1">
                {job.qualifications.map((qual, idx) => (
                  <li key={idx}>{qual}</li>
                ))}
              </ul>
            </section>
          )}

          {job.deadline && (
            <p className="text-sm text-gray-400 mt-2 italic">
              Application Deadline:{" "}
              {new Date(job.deadline).toLocaleDateString()}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 mt-5">
            {showLinkedInButton && (
              <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0077b5] rounded-lg text-white font-semibold hover:bg-[#006097] transition">
                Share to LinkedIn
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;

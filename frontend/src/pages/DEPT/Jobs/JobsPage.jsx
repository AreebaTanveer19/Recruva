import React from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";
import api from '../../../api'
import { useState, useEffect } from "react";

// const JobsPage = () => {
//   const navigate = useNavigate();

//   const handleCreateJob = () => {
//     navigate("/dept/dashboard/jobs/createjob");
//   };

//   return (
//     <div className="p-8 flex-1">
//       {/* Page Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
//         <button
//           onClick={handleCreateJob}
//           className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
//         >
//           <MdAdd size={20} />
//           Create Job
//         </button>
//       </div>

//       {/* Jobs List Placeholder */}
//       <div className="grid gap-4">
//         {/* Replace with JobCard components */}
//         <div className="p-4 bg-white rounded shadow">Job 1</div>
//         <div className="p-4 bg-white rounded shadow">Job 2</div>
//         <div className="p-4 bg-white rounded shadow">Job 3</div>
//       </div>
//     </div>
//   );
// };

// export default JobsPage;

const JobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch open jobs on mount
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/openJobs"); // assuming your route is /api/jobs/open
        setJobs(res.data.jobs);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleCreateJob = () => {
    navigate("/dept/dashboard/jobs/createjob");
  };

  if (loading) {
    return <div className="p-8">Loading jobs...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

 
  return (
    <div className="p-8 flex-1">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Jobs</h1>
        <button
          onClick={handleCreateJob}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          <MdAdd size={20} />
          Create Job
        </button>
      </div>

      {/* Jobs List */}
      <div className="grid gap-6">
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <div
              key={job.id}
              className="p-6 bg-white rounded-xl shadow hover:shadow-lg transition-all cursor-pointer"
              onClick={() => navigate(`/dept/dashboard/jobs/${job.id}`)}
            >
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">{job.title}</h2>
              <div className="flex flex-wrap gap-3 text-sm text-gray-600 mb-3">
                <span>📍 {job.location || "N/A"}</span>
                <span>🏢 {job.department || "No Department"}</span>
                <span>💼 {job.employmentType || "N/A"}</span>
                <span>🌐 {job.workMode || "N/A"}</span>
              </div>

              <p className="text-gray-700 mb-3">{job.description}</p>

              <div className="mb-3">
                <h3 className="font-semibold text-gray-800">Requirements:</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {job.requirements?.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </div>

              <div className="mb-3">
                <h3 className="font-semibold text-gray-800">Responsibilities:</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {job.responsibilities?.map((res, i) => <li key={i}>{res}</li>)}
                </ul>
              </div>

              <div className="mb-3">
                <h3 className="font-semibold text-gray-800">Qualifications:</h3>
                <ul className="list-disc list-inside text-gray-700">
                  {job.qualifications?.map((q, i) => <li key={i}>{q}</li>)}
                </ul>
              </div>

              <p className="text-gray-700 mb-1">
                <strong>Experience Level:</strong> {job.experienceLevel || "N/A"} years
              </p>
              <p className="text-gray-700 mb-1">
                <strong>Salary Range:</strong> ${job.salaryMin} - ${job.salaryMax}
              </p>
              <p className="text-gray-500 text-sm">
                🕒 Deadline: {new Date(job.deadline).toLocaleDateString()}
              </p>

              <hr className="my-4" />
              <p className="text-sm text-gray-400">
                Posted on {new Date(job.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div className="text-gray-600 italic">No open jobs found.</div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;
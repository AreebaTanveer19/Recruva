import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DeptSideBar from "../components/DeptSideBar";
import api from "../../../api";
import JobCard from "../../../components/JobCard";
import { Plus } from "lucide-react";

const JobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [expandedId, setExpandedId] = useState(null);

const toggleExpand = (id) => {
  setExpandedId(expandedId === id ? null : id);
};


  // Fetch jobs
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/openJobs");
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

  return (
    <div className="flex bg-gray-50 min-h-screen ">
      {/* Sidebar */}
      <DeptSideBar />

      {/* Main Content */}
      <div className="flex-1 p-10 ml-72">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-3 tracking-tight">
              Job Openings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage and review all active postings for your department • {jobs.length} open positions
            </p>
          </div>
          <button
            onClick={handleCreateJob}
            className="flex items-center gap-2 bg-black text-white px-5 py-2 rounded-md hover:bg-gray-800 transition-colors"
          >
            <Plus size={20} />
            Create Job
          </button>
        </div>

        {/* Jobs Grid / Loading / Error */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-black dark:border-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 rounded shadow p-6 text-center dark:bg-red-900 dark:text-red-400">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job}   isExpanded={expandedId === job.id}
  toggleExpand={() => toggleExpand(job.id)}/>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsPage;

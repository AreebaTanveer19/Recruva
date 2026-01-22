import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOpenJobs } from "../../../helper";
import { Plus } from "lucide-react";
import JobCardGrid from "../../../components/JobCardGrid";

const JobsPage = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const jobsData = await fetchOpenJobs();
        setJobs(jobsData);
      } catch (err) {
        console.error("Error fetching jobs:", err);
        setError("Failed to load jobs.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const handleCreateJob = () => {
    navigate("/dept/dashboard/jobs/createjob");
  };

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <div className="flex-1 p-8 ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-3 tracking-tight">
              Job Openings
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Manage and review all active postings for your department •{" "}
              {jobs.length} open positions
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-black dark:border-gray-600 rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 rounded shadow p-6 text-center dark:bg-red-900 dark:text-red-400">
            {error}
          </div>
        ) : (
          <JobCardGrid
            jobs={jobs}
            isLinkedInConnected={false}
            postingJobId={null}
            postToLinkedIn={() => {}}
            variant="dept"
            detailRoute="dept/dashboard/open-jobs"
          />
        )}
      </div>
    </div>
  );
};

export default JobsPage;

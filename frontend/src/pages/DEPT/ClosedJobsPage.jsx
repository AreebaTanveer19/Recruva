import { useEffect, useState } from "react";
import api from "../../api";
import JobCardGrid from "../../components/JobCardGrid";

export default function ClosedJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClosedJobsData = async () => {
      setLoading(true);
      try {
        const jobRes = await api.get("/closedJobs");
        setJobs(jobRes.data.jobs || []);
      } catch (err) {
        console.error("Error fetching closed jobs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchClosedJobsData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 animate-pulse text-sm">Loading closed jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-6 md:px-10 overflow-y-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Closed Job Postings</h1>
        <p className="text-gray-600 mt-2">View completed and closed positions</p>
      </div>

      {/* Jobs Grid */}
      {jobs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center">
          <p className="text-gray-500 text-sm">No closed jobs yet</p>
        </div>
      ) : (
        <JobCardGrid
          jobs={jobs}
          variant="dept"
          detailRoute="/dept/dashboard/archived-jobs"
        />
      )}
    </div>
  );
}

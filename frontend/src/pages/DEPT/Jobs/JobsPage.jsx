import React from "react";
import { useNavigate } from "react-router-dom";
import { MdAdd } from "react-icons/md";

const JobsPage = () => {
  const navigate = useNavigate();

  const handleCreateJob = () => {
    navigate("/dept/dashboard/jobs/createjob");
  };

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

      {/* Jobs List Placeholder */}
      <div className="grid gap-4">
        {/* Replace with JobCard components */}
        <div className="p-4 bg-white rounded shadow">Job 1</div>
        <div className="p-4 bg-white rounded shadow">Job 2</div>
        <div className="p-4 bg-white rounded shadow">Job 3</div>
      </div>
    </div>
  );
};

export default JobsPage;

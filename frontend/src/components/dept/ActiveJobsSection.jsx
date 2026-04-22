import { MoreVertical } from "lucide-react";

export default function ActiveJobsSection({ jobs }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Active job openings</h3>
        <a href="/dept/dashboard/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          See all jobs
        </a>
      </div>

      <div className="divide-y divide-gray-100">
        {jobs.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-400">No active jobs</p>
          </div>
        ) : (
          jobs.slice(0, 5).map((job) => (
            <div key={job.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">{job.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{job.department}</p>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
               
                {/* Interviewed */}
                <div className="px-2.5 py-1 bg-purple-50 rounded-full">
                  <span className="text-xs font-semibold text-purple-600">{job.interviewedCount || 0} Interviewed</span>
                </div>

                {/* Rejected */}
                <div className="px-2.5 py-1 bg-red-50 rounded-full">
                  <span className="text-xs font-semibold text-red-600">{job.rejectedCount || 0} Rejected</span>
                </div>

                {/* Hired */}
                <div className="px-2.5 py-1 bg-green-50 rounded-full">
                  <span className="text-xs font-semibold text-green-600">{job.hiredCount || 0} Hired</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const BADGE_JOB_STATUS = {
  Open:   "bg-green-100 text-green-800 border border-green-200",
  Closed: "bg-red-100 text-red-800 border border-red-200",
};

const BADGE_EMP_TYPE = "bg-gray-100 text-gray-600 border border-gray-200";

function JobRow({ job }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-50 last:border-b-0">
      <div>
        <p className="text-sm font-medium text-gray-900 leading-snug">{job.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">{job.department}</p>
      </div>
      <div className="flex items-center gap-2 ml-3 flex-shrink-0">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${BADGE_EMP_TYPE}`}>
          {job.employmentType}
        </span>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
            BADGE_JOB_STATUS[job.status] ?? ""
          }`}
        >
          {job.status}
        </span>
        <span className="text-xs text-gray-400 whitespace-nowrap">
          {job._count?.applications ?? 0} applicants
        </span>
      </div>
    </div>
  );
}

export default JobRow;
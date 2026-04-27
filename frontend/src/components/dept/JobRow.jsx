export default function JobRow({ job }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {job.department || job.location || "Open position"}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full
          ${job.status === "OPEN"
            ? "bg-green-50 text-green-600"
            : job.status === "CLOSED"
              ? "bg-red-50 text-red-500"
              : "bg-gray-100 text-gray-500"
          }`}>
          {job.status ?? "Unknown"}
        </span>
        {job.pendingInterviews > 0 ? (
          <span className="text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
            {job.pendingInterviews} pending {job.pendingInterviews === 1 ? "interview" : "interviews"}
          </span>
        ) : (
          <span className="text-xs text-gray-300">0 pending interviews</span>
        )}
      </div>
    </div>
  );
}

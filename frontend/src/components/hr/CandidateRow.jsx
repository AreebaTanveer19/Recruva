const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const scoreColor = (s) => {
  if (s >= 80) return "#16a34a";
  if (s >= 60) return "#ca8a04";
  return "#dc2626";
};

function CandidateRow({ app }) {
  // app.score is expected as 0–1 float. If your API returns 0–100, remove * 100.
  const score = app.score != null ? Math.round(app.score) : null;

  return (
    <div className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-b-0">
      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
        {initials(app.candidate?.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {app.candidate?.name}
        </p>
        <p className="text-xs text-gray-400 truncate">{app.job?.title}</p>
      </div>
      {score != null ? (
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-14 h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${score}%`, backgroundColor: scoreColor(score) }}
            />
          </div>
          <span className="text-xs font-semibold text-gray-800 w-8 text-right">
            {score}%
          </span>
        </div>
      ) : (
        <span className="text-xs text-gray-400 italic">—</span>
      )}
    </div>
  );
}

export default CandidateRow;
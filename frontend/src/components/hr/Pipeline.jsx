const PIPE_STYLES = {
  pending:     { bg: "bg-yellow-50",  num: "text-yellow-800", lbl: "text-yellow-700" },
  shortlisted: { bg: "bg-green-50",   num: "text-green-800",  lbl: "text-green-700"  },
  rejected:    { bg: "bg-red-50",     num: "text-red-800",    lbl: "text-red-700"    },
  accepted:    { bg: "bg-purple-50",  num: "text-purple-800", lbl: "text-purple-700" },
};

const STATUSES = ["pending", "shortlisted", "rejected", "accepted"];

function Pipeline({ counts }) {
  return (
    <div className="flex rounded-xl overflow-hidden border border-gray-100">
      {STATUSES.map((s, i) => {
        const { bg, num, lbl } = PIPE_STYLES[s];
        return (
          <div
            key={s}
            className={`flex-1 flex flex-col items-center py-3 ${bg} ${
              i < STATUSES.length - 1 ? "border-r border-white border-opacity-60" : ""
            }`}
          >
            <span className={`text-xl font-bold leading-none ${num}`}>
              {counts[s] ?? 0}
            </span>
            <span className={`text-xs mt-1 font-medium capitalize ${lbl}`}>{s}</span>
          </div>
        );
      })}
    </div>
  );
}

export default Pipeline;
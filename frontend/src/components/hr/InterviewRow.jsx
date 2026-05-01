function InterviewRow({ interview }) {
  const d = new Date(interview.startTime);
  const day = d.getDate();
  const mon = d.toLocaleString("en-US", { month: "short" });
  const time = d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  const isGMeet = interview.mode === "google_meet";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-b-0">
      <div className="bg-gray-900 text-white rounded-lg px-2.5 py-1.5 text-center flex-shrink-0 min-w-[42px]">
        <div className="text-base font-bold leading-none">{day}</div>
        <div className="text-[9px] uppercase tracking-wider opacity-60 mt-0.5">{mon}</div>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {interview.candidateName}
        </p>
        <p className="text-xs text-gray-400 truncate">
          {interview.position ?? "—"}
        </p>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs text-gray-500">{time}</p>
        <span
          className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium mt-0.5 inline-block ${
            isGMeet
              ? "bg-blue-50 text-blue-700 border border-blue-200"
              : "bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          {isGMeet ? "Google Meet" : "On-site"}
        </span>
      </div>
    </div>
  );
}

export default InterviewRow;
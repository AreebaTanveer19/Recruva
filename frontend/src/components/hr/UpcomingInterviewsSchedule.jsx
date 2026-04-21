import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { format } from "date-fns";

export default function UpcomingInterviewsSchedule({ interviews }) {
  const getInterviewTimeColor = (time) => {
    const hour = new Date(time).getHours();
    if (hour < 12) return "bg-blue-50 border-l-4 border-blue-500";
    if (hour < 15) return "bg-yellow-50 border-l-4 border-yellow-500";
    return "bg-purple-50 border-l-4 border-purple-500";
  };

  const formatInterviewTime = (time) => {
    return format(new Date(time), "hh:mm a");
  };

  const formatInterviewDate = (time) => {
    return format(new Date(time), "EEEE, MMM dd");
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden h-fit sticky top-6">
      <div className="px-6 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <CalendarIcon size={18} className="text-gray-600" />
          <h3 className="text-base font-semibold text-gray-900">Today's Schedule</h3>
        </div>
        <p className="text-xs text-gray-500 ml-6">{formatInterviewDate(new Date())}</p>
      </div>

      <div className="px-6 py-4 max-h-96 overflow-y-auto">
        {interviews.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-400">No interviews scheduled today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview, idx) => (
              <div key={idx} className={`p-3 rounded-lg ${getInterviewTimeColor(interview.startTime)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-xs font-semibold text-gray-600 mb-1">
                      {formatInterviewTime(interview.startTime)}
                    </p>
                    <p className="text-sm font-semibold text-gray-900">
                      Interview with {interview.candidateName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600 mt-2">
                  <Clock size={14} />
                  <span>{interview.mode === "google_meet" ? "Google Meet" : "On-site"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {interviews.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
          <a href="/hr/interviews" className="text-xs text-blue-600 hover:text-blue-700 font-semibold">
            View all interviews →
          </a>
        </div>
      )}
    </div>
  );
}

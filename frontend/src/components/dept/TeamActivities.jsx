import { format } from "date-fns";
import { CheckCircle, User, FileText, MessageSquare } from "lucide-react";

export default function TeamActivities({ activities }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case "shortlist":
        return <CheckCircle size={16} className="text-green-600" />;
      case "interview":
        return <MessageSquare size={16} className="text-blue-600" />;
      case "offer":
        return <FileText size={16} className="text-purple-600" />;
      default:
        return <User size={16} className="text-gray-600" />;
    }
  };

  const getActivityColor = (type) => {
    switch (type) {
      case "shortlist":
        return "bg-green-50 border-l-4 border-green-500";
      case "interview":
        return "bg-blue-50 border-l-4 border-blue-500";
      case "offer":
        return "bg-purple-50 border-l-4 border-purple-500";
      default:
        return "bg-gray-50 border-l-4 border-gray-500";
    }
  };

  const getActivityLabel = (type) => {
    switch (type) {
      case "shortlist":
        return "Candidate shortlisted";
      case "interview":
        return "Interview scheduled";
      case "offer":
        return "Offer extended";
      default:
        return "Activity";
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">Team activities</h3>
        <a href="/dept/dashboard/jobs" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          See all jobs
        </a>
      </div>

      <div className="divide-y divide-gray-100 max-h-72 overflow-y-auto">
        {activities.length === 0 ? (
          <div className="px-6 py-8 text-center">
            <p className="text-sm text-gray-400">No recent activities</p>
          </div>
        ) : (
          activities.slice(0, 8).map((activity, idx) => (
            <div key={idx} className={`px-6 py-4 ${getActivityColor(activity.type)}`}>
              <div className="flex items-start gap-3">
                <div className="mt-1">{getActivityIcon(activity.type)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {getActivityLabel(activity.type)} - {activity.candidateName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    For {activity.jobTitle}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {format(new Date(activity.createdAt), "MMM dd, hh:mm a")}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

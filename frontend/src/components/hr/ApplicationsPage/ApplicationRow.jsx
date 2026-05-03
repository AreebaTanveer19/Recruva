import { useNavigate } from "react-router-dom";
import { FileText, User, AlertTriangle } from "lucide-react";
import { useState } from "react";
import api from "../../../api";

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-800 border border-yellow-300",
  shortlisted: "bg-green-100 text-green-800 border border-green-300",
  rejected:    "bg-red-100 text-red-800 border border-red-300",
  accepted:    "bg-purple-100 text-purple-800 border border-purple-300",
};

const scoreColor = (s) => {
  if (s === -2) return "bg-violet-500";
  if (s === -1) return "bg-red-500";
  if (s >= 80) return "bg-green-500";
  if (s >= 60) return "bg-yellow-400";
  return "bg-red-400";
};

const scoreTextColor = (s) => {
  if (s === -2) return "text-violet-700";
  if (s === -1) return "text-red-700";
  if (s >= 80) return "text-green-700";
  if (s >= 60) return "text-yellow-700";
  return "text-red-600";
};

function ApplicationRow({ app, idx, isChecked, toggleOne }) {
  const navigate = useNavigate();
  const score = app.score != null ? Math.round(app.score) : null;
  const isProfileData = app.resume?.originalName === "Profile Data";
  const [rescoring, setRescoring] = useState(false);

  const handleRescore = async (e) => {
    e.stopPropagation();
    setRescoring(true);
    try {
      await api.post(`/application/${app.id}/rescore`);
      // Optionally refresh or show success message
      window.location.reload();
    } catch (error) {
      console.error("Rescore failed:", error);
    } finally {
      setRescoring(false);
    }
  };

  return (
    <tr
      key={app.id}
      onClick={() => navigate(`/hr/applications/${app.id}`)}
      className={`border-t border-gray-100 cursor-pointer transition hover:bg-blue-50/40 ${
        isChecked ? "bg-blue-50" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
      }`}
    >
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isChecked}
          onClick={(e) => e.stopPropagation()}
          onChange={() => toggleOne(app.id)}
          className="accent-gray-800 cursor-pointer"
        />
      </td>
      <td className="px-3 py-4 font-medium truncate">{app.candidate.name}</td>
      <td className="px-3 py-4 text-gray-500 truncate">{app.candidate.email}</td>
      <td className="px-3 py-4 truncate">{app.job.title}</td>
      <td className="px-3 py-4 text-gray-500 truncate">{app.job.department}</td>
      <td className="px-3 py-4">
        {score != null ? (
          score === -2 ? (
            <button
              onClick={handleRescore}
              disabled={rescoring}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-violet-100 text-violet-700 border border-violet-200 hover:bg-violet-200 transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              <AlertTriangle className="w-3 h-3" />
              {rescoring ? "Rescoring..." : "Error"}
            </button>
          ) : score === -1 ? (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200 whitespace-nowrap inline-block">
              Unmet
            </span>
          ) : (
            <div className="flex items-center gap-1.5">
              <div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                <div
                  className={`h-full rounded-full ${scoreColor(score)}`}
                  style={{ width: `${score}%` }}
                />
              </div>
              <span className={`text-xs font-semibold ${scoreTextColor(score)}`}>
                {score}%
              </span>
            </div>
          )
        ) : (
          <span className="text-xs text-gray-400 italic">—</span>
        )}
      </td>
      <td className="px-3 py-4">
        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
          STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-700 border border-gray-300"
        }`}>
          {app.status}
        </span>
      </td>
      <td className="px-3 py-4 text-gray-500 truncate">
        {new Date(app.appliedAt).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric",
        })}
      </td>
      <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
        {isProfileData ? (
          <button
            onClick={() => navigate(`/hr/candidates/profile/${app.resume.id}`)}
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition whitespace-nowrap"
          >
            <User className="w-3 h-3" /> View
          </button>
        ) : app.resume?.pdfUrl ? (
          <a
            href={app.resume.pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition whitespace-nowrap"
          >
            <FileText className="w-3 h-3" /> View
          </a>
        ) : (
          <span className="text-gray-400 italic">N/A</span>
        )}
      </td>
    </tr>
  );
}

export default ApplicationRow;
import { useNavigate } from "react-router-dom";
import { FileText, User, AlertTriangle } from "lucide-react";
import { useState } from "react";
import ApplicationRow from "./ApplicationRow";
import api from "../../../api";

function ApplicationsTable({ filteredApplications, selected, toggleOne, allSelected, toggleAll }) {
  const navigate = useNavigate();
  const [rescoring, setRescoring] = useState(new Set());

  const handleCardClick = (appId) => {
    // Programmatically navigate to the application detail page
    navigate(`/hr/applications/${appId}`);
  };

  const handleRescore = async (e, appId) => {
    e.stopPropagation();
    setRescoring((prev) => new Set([...prev, appId]));
    try {
      await api.post(`/application/${appId}/rescore`);
      // Optionally refresh or show success message
      window.location.reload();
    } catch (error) {
      console.error("Rescore failed:", error);
      setRescoring((prev) => {
        const next = new Set(prev);
        next.delete(appId);
        return next;
      });
    }
  };

  const isProfileData = (app) => app.resume?.originalName === "Profile Data";

  const STATUS_COLORS = {
    pending:     "bg-yellow-100 text-yellow-800 border border-yellow-300",
    reviewed:    "bg-blue-100 text-blue-800 border border-blue-300",
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

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-2xl shadow-sm bg-white border border-gray-200">
        <table className="w-full text-sm text-gray-800" style={{ tableLayout: "fixed", minWidth: "720px" }}>
          <colgroup>
            <col style={{ width: "40px" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "18%" }} />
            <col style={{ width: "13%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
            <col style={{ width: "10%" }} />
          </colgroup>
          <thead>
            <tr className="bg-gray-900 text-white text-left">
              <th className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="accent-white cursor-pointer"
                />
              </th>
              <th className="px-3 py-3 font-semibold">Candidate</th>
              <th className="px-3 py-3 font-semibold">Email</th>
              <th className="px-3 py-3 font-semibold">Job</th>
              <th className="px-3 py-3 font-semibold">Department</th>
              <th className="px-3 py-3 font-semibold">Score</th>
              <th className="px-3 py-3 font-semibold">Status</th>
              <th className="px-3 py-3 font-semibold">Applied</th>
              <th className="px-3 py-3 font-semibold">Resume/<br />Profile</th>
            </tr>
          </thead>
          <tbody>
            {filteredApplications.map((app, idx) => (
              <ApplicationRow
                key={app.id}
                app={app}
                idx={idx}
                isChecked={selected.has(app.id)}
                toggleOne={toggleOne}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden grid grid-cols-1 gap-3">
        {filteredApplications.map((app) => {
          const score = app.score != null ? Math.round(app.score) : null;
          const isChecked = selected.has(app.id);

          return (
            <div
              key={app.id}
              className={`rounded-lg border-2 p-4 transition cursor-pointer ${
                isChecked
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
              onClick={() => handleCardClick(app.id)}
            >
              {/* Checkbox */}
              <div className="flex items-start justify-between mb-3">
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleOne(app.id)}
                    className="accent-gray-800 cursor-pointer w-5 h-5"
                  />
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  STATUS_COLORS[app.status] ?? "bg-gray-100 text-gray-700 border border-gray-300"
                }`}>
                  {app.status}
                </span>
              </div>

              {/* Candidate Info */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <h3 className="font-semibold text-gray-900 text-sm line-clamp-1">
                  {app.candidate.name}
                </h3>
                <p className="text-xs text-gray-500 line-clamp-1">
                  {app.candidate.email}
                </p>
              </div>

              {/* Job & Department */}
              <div className="mb-3 space-y-2 text-xs">
                <div>
                  <p className="text-gray-500 font-medium mb-0.5">Job Position</p>
                  <p className="text-gray-900 font-medium line-clamp-2">
                    {app.job.title}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 font-medium mb-0.5">Department</p>
                  <p className="text-gray-900 font-medium">
                    {app.job.department}
                  </p>
                </div>
              </div>

              {/* Score */}
              <div className="mb-3 pb-3 border-b border-gray-100">
                <p className="text-xs text-gray-500 font-medium mb-2">Scoring</p>
                {score != null ? (
                  score === -2 ? (
                    <button
                      onClick={(e) => handleRescore(e, app.id)}
                      disabled={rescoring.has(app.id)}
                      className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-violet-50 text-violet-700 border border-violet-200 hover:bg-violet-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      {rescoring.has(app.id) ? "Rescoring..." : "Scoring Error"}
                    </button>
                  ) : score === -1 ? (
                    <div className="px-3 py-2 rounded-lg bg-red-50 border border-red-200">
                      <span className="text-xs font-semibold text-red-700">Did not meet minimum criteria</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${scoreColor(score)}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold ${scoreTextColor(score)}`}>
                        {score}%
                      </span>
                    </div>
                  )
                ) : (
                  <span className="text-xs text-gray-400 italic">—</span>
                )}
              </div>

              {/* Applied Date & Resume */}
              <div className="flex items-center justify-between text-xs">
                <div>
                  <p className="text-gray-500 font-medium mb-0.5">Applied</p>
                  <p className="text-gray-900 font-medium">
                    {new Date(app.appliedAt).toLocaleDateString("en-US", {
                      month: "short", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
                {isProfileData(app) ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/hr/candidates/profile/${app.resume.id}`);
                    }}
                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition whitespace-nowrap"
                  >
                    <User className="w-3 h-3" /> View
                  </button>
                ) : app.resume?.pdfUrl && (
                  <a
                    href={app.resume.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-md transition whitespace-nowrap"
                  >
                    <FileText className="w-3 h-3" /> View
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

export default ApplicationsTable;
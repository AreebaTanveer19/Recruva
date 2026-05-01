import { useEffect, useState, useMemo } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { MessageSquare, Loader2 } from "lucide-react";
import api from "./../../api";
import { FeedbackViewerModal } from "../../components/hr/FeedbackViewerModal";

const VERDICT_COLORS = {
  accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border border-rose-200",
};

const scoreColor = (s) => {
  if (s >= 80) return "bg-emerald-500";
  if (s >= 60) return "bg-amber-400";
  return "bg-rose-500";
};

const scoreTextColor = (s) => {
  if (s >= 80) return "text-emerald-700";
  if (s >= 60) return "text-amber-700";
  return "text-rose-600";
};

function InterviewResultsPage() {
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // applicationId being acted on
  const [search, setSearch]           = useState("");
  const [filterDept, setFilterDept]   = useState("");
  const [filterVerdict, setFilterVerdict] = useState("");
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await api.get("/interview/results");
      setResults(res.data.results);
    } catch (err) {
      console.error("Error fetching interview results:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResults(); }, []);

  const departments = useMemo(
    () => [...new Set(results.map((r) => r.application.job.department))].sort(),
    [results]
  );

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const name  = r.application.candidate.name.toLowerCase();
      const email = r.application.candidate.email.toLowerCase();
      const matchesSearch  = !search || name.includes(search.toLowerCase()) || email.includes(search.toLowerCase());
      const matchesDept    = !filterDept    || r.application.job.department === filterDept;
      const matchesVerdict = !filterVerdict || r.status === filterVerdict;
      return matchesSearch && matchesDept && matchesVerdict;
    });
  }, [results, search, filterDept, filterVerdict]);

  const clearFilters = () => {
    setSearch(""); setFilterDept(""); setFilterVerdict("");
  };
  const hasActiveFilters = search || filterDept || filterVerdict;

  const decide = async (applicationId, decision) => {
    setActionLoading(applicationId);
    try {
      await api.patch(`/application/${applicationId}/decide`, { decision });
      // remove from list optimistically
      setResults((prev) => prev.filter((r) => r.applicationId !== applicationId));
    } catch (err) {
      console.error("Decision failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <>
    <div className="flex-1 py-10 px-4 sm:px-6 md:px-8 overflow-y-auto bg-gray-100 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Results</h1>
        <p className="text-sm text-gray-600">
          Review department feedback and make final hiring decisions.
        </p>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-white border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm"
          />
          <select
            value={filterDept}
            onChange={(e) => setFilterDept(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm"
          >
            <option value="">All departments</option>
            {departments.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select
            value={filterVerdict}
            onChange={(e) => setFilterVerdict(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm"
          >
            <option value="">All verdicts</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold transition text-sm"
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>

      {!loading && (
        <p className="text-sm text-gray-600 mb-4">
          Showing <span className="font-semibold text-gray-900">{filtered.length}</span>
          {" "}of <span className="font-semibold text-gray-900">{results.length}</span> candidates
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-500 animate-pulse">Loading interview results...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-500">No interview results found.</p>
        </div>
      ) : (
        <div className="rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-gray-800">
              <colgroup>
                <col style={{ width: "140px" }} />
                <col style={{ width: "120px" }} />
                <col style={{ width: "110px" }} />
                <col style={{ width: "90px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "100px" }} />
                <col style={{ width: "200px" }} />
              </colgroup>
              <thead>
                <tr className="bg-gray-900 text-white text-left border-b border-gray-200">
                  <th className="px-4 py-4 font-semibold">Candidate</th>
                  <th className="px-4 py-4 font-semibold">Email</th>
                  <th className="px-4 py-4 font-semibold">Job</th>
                  <th className="px-4 py-4 font-semibold text-center">Score</th>
                  <th className="px-4 py-4 font-semibold">Verdict</th>
                  <th className="px-4 py-4 font-semibold">Feedback</th>
                  <th className="px-4 py-4 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((r, idx) => {
                  const app     = r.application;
                  const score   = app.score != null ? Math.round(app.score) : null;
                  const loading = actionLoading === app.id;

                  return (
                    <tr
                      key={r.id}
                      className={`transition ${
                        idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"
                      } hover:bg-gray-100/60`}
                    >
                      {/* Candidate */}
                      <td className="px-4 py-4 font-medium text-gray-900 truncate">
                        {app.candidate.name}
                      </td>

                      {/* Email */}
                      <td className="px-4 py-4 text-gray-600 truncate text-xs">
                        {app.candidate.email}
                      </td>

                      {/* Job */}
                      <td className="px-4 py-4 text-gray-900 truncate text-xs">
                        {app.job.title}
                      </td>

                      {/* Score */}
                      <td className="px-4 py-4">
                        {score != null ? (
                          <div className="flex items-center justify-center gap-1">
                            <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${scoreColor(score)}`}
                                style={{ width: `${score}%` }}
                              />
                            </div>
                            <span className={`text-xs font-bold ${scoreTextColor(score)}`}>
                              {score}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">—</span>
                        )}
                      </td>

                      {/* Dept verdict */}
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                          VERDICT_COLORS[r.status] ?? "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}>
                          {r.status === "accepted" ? (
                            <>
                              <CheckCircleIcon className="w-3 h-3" />
                              Accept
                            </>
                          ) : (
                            <>
                              <XCircleIcon className="w-3 h-3" />
                              Reject
                            </>
                          )}
                        </span>
                      </td>

                      {/* Feedback */}
                      <td className="px-4 py-4">
                        {r.interviewFeedback ? (
                          <button
                            onClick={() => {
                              setSelectedInterview(r);
                              setFeedbackModalOpen(true);
                            }}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-md transition whitespace-nowrap"
                          >
                            <MessageSquare className="w-3 h-3" />
                            View
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-4">
                        {r.status === "accepted" ? (
                          <button
                            disabled={loading}
                            onClick={() => decide(app.id, r.status)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-500 text-white font-semibold transition disabled:cursor-not-allowed whitespace-nowrap inline-flex items-center gap-1.5"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Processing
                              </>
                            ) : (
                              "Finalise & Send Offer"
                            )}
                          </button>
                        ) : (
                          <button
                            disabled={loading}
                            onClick={() => decide(app.id, r.status)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:bg-rose-500 text-white font-semibold transition disabled:cursor-not-allowed whitespace-nowrap inline-flex items-center gap-1.5"
                          >
                            {loading ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin" />
                                Processing
                              </>
                            ) : (
                              "Confirm & Notify"
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>

    {selectedInterview && (
      <FeedbackViewerModal
        open={feedbackModalOpen}
        onClose={() => {
          setFeedbackModalOpen(false);
          setSelectedInterview(null);
        }}
        interviewId={selectedInterview.id}
        candidateName={selectedInterview.application.candidate.name}
        position={selectedInterview.application.job.title}
      />
    )}
    </>
  );
}

export default InterviewResultsPage;
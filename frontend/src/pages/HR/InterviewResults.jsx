import { useEffect, useState, useMemo } from "react";
import api from "./../../api";

const VERDICT_COLORS = {
  accepted: "bg-green-100 text-green-800 border border-green-300",
  rejected: "bg-red-100 text-red-800 border border-red-300",
};

const scoreColor = (s) => {
  if (s >= 80) return "bg-green-500";
  if (s >= 60) return "bg-yellow-400";
  return "bg-red-400";
};

const scoreTextColor = (s) => {
  if (s >= 80) return "text-green-700";
  if (s >= 60) return "text-yellow-700";
  return "text-red-600";
};

function InterviewResultsPage() {
  const [results, setResults]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [actionLoading, setActionLoading] = useState(null); // applicationId being acted on
  const [search, setSearch]           = useState("");
  const [filterDept, setFilterDept]   = useState("");
  const [filterVerdict, setFilterVerdict] = useState("");

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
    <div className="flex-1 py-10 px-4 sm:px-6 md:px-8 overflow-y-auto bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-1 text-gray-900">Interview Results</h2>
      <p className="text-sm text-gray-500 mb-6">
        Review department feedback and make final hiring decisions.
      </p>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 flex flex-wrap gap-3 items-center mb-4 shadow-sm">
        <input
          type="text"
          placeholder="Search candidate or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-400 w-56"
        />
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">All departments</option>
          {departments.map((d) => <option key={d}>{d}</option>)}
        </select>
        <select
          value={filterVerdict}
          onChange={(e) => setFilterVerdict(e.target.value)}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 text-gray-700 focus:outline-none focus:ring-1 focus:ring-gray-400"
        >
          <option value="">All dept verdicts</option>
          <option value="accepted">Dept accepted</option>
          <option value="rejected">Dept rejected</option>
        </select>
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-gray-500 hover:text-gray-800 border border-gray-200 rounded-lg px-3 py-1.5 bg-transparent transition"
          >
            Clear filters
          </button>
        )}
      </div>

      {!loading && (
        <p className="text-sm text-gray-500 mb-3">
          Showing <span className="font-semibold text-gray-700">{filtered.length}</span>
          {" "}of <span className="font-semibold text-gray-700">{results.length}</span> results
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-500 animate-pulse">Loading interview results...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p className="text-sm">No interview results found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-sm bg-white border border-gray-200">
          <table
            className="w-full text-sm text-gray-800"
            style={{ tableLayout: "fixed", minWidth: "900px" }}
          >
            <colgroup>
              <col style={{ width: "13%" }} />
              <col style={{ width: "17%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "8%"  }} />
              <col style={{ width: "11%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "6%"  }} />
            </colgroup>
            <thead>
              <tr className="bg-gray-900 text-white text-left">
                <th className="px-3 py-3 font-semibold">Candidate</th>
                <th className="px-3 py-3 font-semibold">Email</th>
                <th className="px-3 py-3 font-semibold">Job</th>
                <th className="px-3 py-3 font-semibold">Department</th>
                <th className="px-3 py-3 font-semibold">Score</th>
                <th className="px-3 py-3 font-semibold">Dept verdict</th>
                <th className="px-3 py-3 font-semibold">Feedback</th>
                <th className="px-3 py-3 font-semibold">Resume</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, idx) => {
                const app     = r.application;
                const score   = app.score != null ? Math.round(app.score) : null;
                const loading = actionLoading === app.id;

                return (
                  <tr
                    key={r.id}
                    className={`border-t border-gray-100 transition ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                    } hover:bg-blue-50/40`}
                  >
                    {/* Candidate */}
                    <td className="px-3 py-4 font-medium truncate">
                      {app.candidate.name}
                    </td>

                    {/* Email */}
                    <td className="px-3 py-4 text-gray-500 truncate">
                      {app.candidate.email}
                    </td>

                    {/* Job */}
                    <td className="px-3 py-4 truncate">{app.job.title}</td>

                    {/* Department */}
                    <td className="px-3 py-4 text-gray-500 truncate">
                      {app.job.department}
                    </td>

                    {/* Score */}
                    <td className="px-3 py-4">
                      {score != null ? (
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
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* Dept verdict */}
                    <td className="px-3 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        VERDICT_COLORS[r.status] ?? "bg-gray-100 text-gray-700 border border-gray-300"
                      }`}>
                        {r.status === "accepted" ? "Accepted" : "Rejected"}
                      </span>
                    </td>

                    {/* Feedback + actions */}
                    <td className="px-3 py-4">
                      {r.interviewFeedback && (
                        <p
                          className="text-xs text-gray-400 italic truncate mb-2"
                          title={r.interviewFeedback}
                        >
                          {r.interviewFeedback}
                        </p>
                      )}
                      <div className="flex gap-2 flex-wrap">
                        {r.status === "accepted" ? (
                          <>
                            <button
                              disabled={loading}
                              onClick={() => decide(app.id, "accepted")}
                              className="text-xs px-3 py-1 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-700 transition disabled:opacity-50"
                            >
                              {loading ? "..." : "Selected"}
                            </button>
                            <button
                              disabled={loading}
                              onClick={() => decide(app.id, "rejected")}
                              className="text-xs px-3 py-1 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50"
                            >
                              {loading ? "..." : "Not Selected"}
                            </button>
                          </>
                        ) : (
                          <button
                            disabled={loading}
                            onClick={() => decide(app.id, "rejected")}
                            className="text-xs px-3 py-1 rounded-lg bg-gray-500 text-white font-medium hover:bg-gray-600 transition disabled:opacity-50"
                          >
                            {loading ? "..." : "Mark not selected"}
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Resume */}
                    <td className="px-3 py-4" onClick={(e) => e.stopPropagation()}>
                      {app.resume?.pdfUrl ? (
                        <a
                          href={app.resume.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 underline underline-offset-2 font-medium hover:text-black transition"
                        >
                          View
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default InterviewResultsPage;
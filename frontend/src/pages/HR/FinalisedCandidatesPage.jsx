// src/pages/hr/FinalisedCandidatesPage.jsx

import { useEffect, useState, useMemo } from "react";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/solid";
import { FileText, User } from "lucide-react";
import api from "./../../api";
import FinalisedStatsRow from "../../components/hr/FinalisedStatsRow";
import FinalisedFilterBar from "../../components/hr/FinalisedFilterBar";
import { useNavigate } from "react-router-dom";
// ── badge helpers ──────────────────────────────────────────────────────────────
const DEPT_COLORS = {
  accepted: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  rejected:  "bg-rose-50 text-rose-700 border border-rose-200",
};

const HR_COLORS = {
  accepted: "bg-blue-50 text-blue-700 border border-blue-200",
  rejected:  "bg-gray-100 text-gray-600 border border-gray-300",
};

const scoreColor     = (s) => s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-amber-400" : "bg-rose-500";
const scoreTextColor = (s) => s >= 80 ? "text-emerald-700" : s >= 60 ? "text-amber-700" : "text-rose-600";

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

// ── main component ─────────────────────────────────────────────────────────────
export default function FinalisedCandidatesPage() {
  const [results, setResults]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [search, setSearch]                 = useState("");
  const [filterDept, setFilterDept]         = useState("");
  const [filterDecision, setFilterDecision] = useState("");
    const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get("/application/finalised");
        setResults(res.data.data);
      } catch (err) {
        console.error("Error fetching finalised candidates:", err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const departments = useMemo(
    () => [...new Set(results.map((r) => r.job.department))].sort(),
    [results]
  );

  const filtered = useMemo(() => {
    return results.filter((r) => {
      const name  = r.candidate.name.toLowerCase();
      const email = r.candidate.email.toLowerCase();
      const term  = search.toLowerCase();
      const matchesSearch   = !search   || name.includes(term) || email.includes(term);
      const matchesDept     = !filterDept     || r.job.department === filterDept;
      const matchesDecision = !filterDecision || r.status === filterDecision;
      return matchesSearch && matchesDept && matchesDecision;
    });
  }, [results, search, filterDept, filterDecision]);

  const stats = useMemo(() => ({
    total:    results.length,
    offered:  results.filter((r) => r.status === "accepted").length,
    rejected: results.filter((r) => r.status === "rejected").length,
  }), [results]);

  const hasActiveFilters = search || filterDept || filterDecision;
  const clearFilters = () => { setSearch(""); setFilterDept(""); setFilterDecision(""); };

  const isProfileData = (r) => r.resume?.originalName === "Profile Data";

  return (
    <>
      <div className="flex-1 py-10 px-4 sm:px-6 md:px-8 overflow-y-auto bg-gray-100 min-h-screen">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Finalised Candidates</h1>
          <p className="text-sm text-gray-500">
            Complete record of all hiring decisions.
          </p>
        </div>

        {/* Stats */}
        <FinalisedStatsRow stats={stats} />

        {/* Filters */}
        <FinalisedFilterBar
          search={search}
          setSearch={setSearch}
          filterDept={filterDept}
          setFilterDept={setFilterDept}
          filterDecision={filterDecision}
          setFilterDecision={setFilterDecision}
          departments={departments}
          hasActiveFilters={hasActiveFilters}
          clearFilters={clearFilters}
        />

        {!loading && (
          <p className="text-sm text-gray-500 mb-4">
            Showing <span className="font-semibold text-gray-900">{filtered.length}</span>
            {" "}of <span className="font-semibold text-gray-900">{results.length}</span> candidates
          </p>
        )}

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-400 animate-pulse">Loading finalised candidates...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-sm text-gray-400">No finalised candidates found.</p>
          </div>
        ) : (
          <div className="rounded-xl shadow-lg bg-white border border-gray-200 overflow-hidden">
            {/* ── Mobile cards ── */}
            <div className="lg:hidden divide-y divide-gray-100">
              {filtered.map((r) => {
                const score = r.score != null ? Math.round(r.score) : null;
                return (
                  <div key={r.id} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.candidate.name}</p>
                        <p className="text-xs text-gray-500">{r.candidate.email}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${HR_COLORS[r.status]}`}>
                        {r.status === "accepted"
                          ? <><CheckCircleIcon className="w-3 h-3" />Offered</>
                          : <><XCircleIcon className="w-3 h-3" />Rejected</>}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                      <div>
                        <p className="text-[10px] uppercase font-medium text-gray-400 tracking-wide">Job</p>
                        <p className="truncate">{r.job.title}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-medium text-gray-400 tracking-wide">Department</p>
                        <p>{r.job.department}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-medium text-gray-400 tracking-wide">Dept Verdict</p>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${DEPT_COLORS[r.interview?.status] ?? "bg-gray-100 text-gray-500"}`}>
                          {r.interview?.status === "accepted"
                            ? <><CheckCircleIcon className="w-3 h-3" />Accept</>
                            : <><XCircleIcon className="w-3 h-3" />Reject</>}
                        </span>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-medium text-gray-400 tracking-wide">Finalised</p>
                        <p>{formatDate(r.updatedAt)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      {score != null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
                          </div>
                          <span className={`text-xs font-bold ${scoreTextColor(score)}`}>{score}%</span>
                        </div>
                      ) : <span className="text-xs text-gray-400">—</span>}

                      {isProfileData(r) ? (
                        <button
                          onClick={() => window.open(`/hr/candidates/profile/${r.resume.id}`, "_blank")}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition"
                        >
                          <User className="w-3 h-3" /> View Profile
                        </button>
                      ) : (
                        <a
                          href={r.resume?.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition"
                        >
                          <FileText className="w-3 h-3" /> View Resume
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table ── */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm text-gray-800">
                <thead>
                  <tr className="bg-gray-900 text-white text-left">
                    {["Candidate", "Email", "Job", "Department", "Score", "Dept Verdict", "HR Decision", "Finalised", ""].map((h) => (
                      <th key={h} className="px-4 py-4 font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((r, idx) => {
                    const score = r.score != null ? Math.round(r.score) : null;
                    return (
                      <tr key={r.id} className={`transition hover:bg-gray-50 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                        <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{r.candidate.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-[160px] truncate">{r.candidate.email}</td>
                        <td className="px-4 py-3 text-xs text-gray-700 max-w-[140px] truncate">{r.job.title}</td>
                        <td className="px-4 py-3 text-xs text-gray-600">{r.job.department}</td>

                        {/* Score */}
                        <td className="px-4 py-3">
                          {score != null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${scoreColor(score)}`} style={{ width: `${score}%` }} />
                              </div>
                              <span className={`text-xs font-bold ${scoreTextColor(score)}`}>{score}%</span>
                            </div>
                          ) : <span className="text-xs text-gray-400">—</span>}
                        </td>

                        {/* Dept verdict */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${DEPT_COLORS[r.interview?.status] ?? "bg-gray-100 text-gray-500"}`}>
                            {r.interview?.status === "accepted"
                              ? <><CheckCircleIcon className="w-3 h-3" />Accept</>
                              : <><XCircleIcon className="w-3 h-3" />Reject</>}
                          </span>
                        </td>

                        {/* HR decision */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${HR_COLORS[r.status]}`}>
                            {r.status === "accepted"
                              ? <><CheckCircleIcon className="w-3 h-3" />Offered</>
                              : <><XCircleIcon className="w-3 h-3" />Rejected</>}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(r.updatedAt)}</td>

                        {/* Resume / Profile */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          {isProfileData(r) ? (
                            <button
                              onClick={() => window.open(`/hr/candidates/profile/${r.resume.id}`, "_blank")}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition"
                            >
                              <User className="w-3 h-3" /> View Profile
                            </button>
                          ) : (
                            <a
                              href={r.resume?.pdfUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-md transition"
                            >
                              <FileText className="w-3 h-3" /> View Resume
                            </a>
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
    </>
  );
}
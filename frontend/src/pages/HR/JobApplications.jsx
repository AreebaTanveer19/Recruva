import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "./../../api";

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-800 border border-yellow-300",
  reviewed:    "bg-blue-100 text-blue-800 border border-blue-300",
  shortlisted: "bg-green-100 text-green-800 border border-green-300",
  rejected:    "bg-red-100 text-red-800 border border-red-300",
  accepted:    "bg-purple-100 text-purple-800 border border-purple-300",
};

const STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

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

function AllJobApplications() {
  const navigate = useNavigate();

  const [applications, setApplications]   = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState("");
  const [filterStatus, setFilterStatus]   = useState("");
  const [filterJobId, setFilterJobId]     = useState("");
  const [filterDept, setFilterDept]       = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo]   = useState("");
  const [selected, setSelected]           = useState(new Set());
  const [bulkLoading, setBulkLoading]     = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await api.get("/application/");
      setApplications(res.data.applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchApplications(); }, []);

  const departments = useMemo(
    () => [...new Set(applications.map((a) => a.job.department))].sort(),
    [applications]
  );

  const jobs = useMemo(
    () =>
      [...new Map(applications.map((a) => [a.job.id, a.job])).values()].sort(
        (a, b) => a.title.localeCompare(b.title)
      ),
    [applications]
  );

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        !search ||
        app.candidate.name.toLowerCase().includes(search.toLowerCase()) ||
        app.candidate.email.toLowerCase().includes(search.toLowerCase());
      const matchesStatus  = !filterStatus || app.status === filterStatus;
      const matchesJobId   = !filterJobId  || app.job.id === Number(filterJobId);
      const matchesDept    = !filterDept   || app.job.department === filterDept;
      const appliedAt      = new Date(app.appliedAt);
      const matchesDateFrom = !filterDateFrom || appliedAt >= new Date(filterDateFrom);
      const matchesDateTo   = !filterDateTo   || appliedAt <= new Date(filterDateTo + "T23:59:59");
      return matchesSearch && matchesStatus && matchesJobId && matchesDept && matchesDateFrom && matchesDateTo;
    });
  }, [applications, search, filterStatus, filterJobId, filterDept, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setSearch(""); setFilterStatus(""); setFilterJobId("");
    setFilterDept(""); setFilterDateFrom(""); setFilterDateTo("");
  };
  const hasActiveFilters = search || filterStatus || filterJobId || filterDept || filterDateFrom || filterDateTo;

  // ── selection ──
  const allVisibleIds   = filteredApplications.map((a) => a.id);
  const allSelected     = allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id));
  const someSelected    = allVisibleIds.some((id) => selected.has(id));

  const toggleOne = (id) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleAll = () => {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        allVisibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...allVisibleIds]));
    }
  };

  // ── bulk status update ──
  const bulkUpdate = async (status) => {
    if (selected.size === 0) return;
    setBulkLoading(true);
    try {
      await api.patch("/application/bulk-status", {   // adjust endpoint
        ids: [...selected],
        status,
      });
      setSelected(new Set());
      await fetchApplications();
    } catch (err) {
      console.error("Bulk update failed:", err);
    } finally {
      setBulkLoading(false);
    }
  };

  const selectedCount = [...selected].filter((id) =>
    filteredApplications.some((a) => a.id === id)
  ).length;

  return (
    <div className="flex-1 py-10 px-4 sm:px-6 md:px-8 overflow-y-auto bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-1 text-gray-900">Job Applications</h2>
      <p className="text-sm text-gray-500 mb-6">Review, filter, and manage all candidate applications.</p>

      {/* ── filters ── */}
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center flex-wrap">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl bg-white border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm"
          >
            <option value="">All Statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed text-sm"
          >
            Clear Filters
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center flex-wrap">
          <select
            value={filterDept}
            onChange={(e) => { setFilterDept(e.target.value); setFilterJobId(""); }}
            className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm"
          >
            <option value="">All Departments</option>
            {departments.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
          <select
            value={filterJobId}
            onChange={(e) => setFilterJobId(e.target.value)}
            className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm"
          >
            <option value="">All Jobs</option>
            {jobs
              .filter((j) => !filterDept || j.department === filterDept)
              .map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={filterDateFrom} onChange={(e) => setFilterDateFrom(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm" />
            <span className="text-gray-400 text-sm">to</span>
            <input type="date" value={filterDateTo} onChange={(e) => setFilterDateTo(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 text-sm" />
          </div>
        </div>
      </div>

      {/* ── bulk action bar ── */}
      {someSelected && (
        <div className="mb-3 flex items-center gap-3 bg-gray-900 text-white px-4 py-2.5 rounded-xl">
          <span className="text-sm font-medium">{selectedCount} selected</span>
          <div className="flex gap-2 ml-2">
            <button
              onClick={() => bulkUpdate("shortlisted")}
              disabled={bulkLoading}
              className="px-3 py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              Shortlist
            </button>
            <button
              onClick={() => bulkUpdate("reviewed")}
              disabled={bulkLoading}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              Mark Reviewed
            </button>
            <button
              onClick={() => bulkUpdate("rejected")}
              disabled={bulkLoading}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              Reject
            </button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-gray-400 hover:text-white transition"
          >
            Clear selection
          </button>
        </div>
      )}

      {/* ── result count ── */}
      {!loading && (
        <p className="text-sm text-gray-500 mb-3">
          Showing <span className="font-semibold text-gray-700">{filteredApplications.length}</span>
          {" "}of <span className="font-semibold text-gray-700">{applications.length}</span> applications
        </p>
      )}

      {/* ── table ── */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-500 animate-pulse">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p className="text-sm">No applications found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl shadow-sm bg-white border border-gray-200">
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
                <th className="px-3 py-3 font-semibold">Resume</th>
              </tr>
            </thead>
            <tbody>
              {filteredApplications.map((app, idx) => {
                const score = app.score != null ? Math.round(app.score) : null;
                const isChecked = selected.has(app.id);
                return (
                  <tr
                    key={app.id}
                    onClick={() => navigate(`/hr/applications/${app.id}`)}
                    className={`border-t border-gray-100 cursor-pointer transition hover:bg-blue-50/40 ${
                      isChecked ? "bg-blue-50" : idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                    }`}
                  >
                    {/* checkbox — stopPropagation on the checkbox itself, not just the td */}
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
                      {app.resume?.pdfUrl ? (
                        <a
                          href={app.resume.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 underline underline-offset-2 font-medium hover:text-black transition truncate block"
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

export default AllJobApplications;
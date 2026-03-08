import { useEffect, useState, useMemo } from "react";
import api from "./../../api";

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-800 border border-yellow-300",
  reviewed:    "bg-blue-100 text-blue-800 border border-blue-300",
  shortlisted: "bg-green-100 text-green-800 border border-green-300",
  rejected:    "bg-red-100 text-red-800 border border-red-300",
  accepted:       "bg-purple-100 text-purple-800 border border-purple-300",
};

const STATUSES = ["PENDING", "REVIEWED", "SHORTLISTED", "REJECTED", "HIRED"];

function AllJobApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterJobId, setFilterJobId] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [filterDateFrom, setFilterDateFrom] = useState("");
  const [filterDateTo, setFilterDateTo] = useState("");

  useEffect(() => {
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
    fetchApplications();
  }, []);

  // Derive unique departments and jobs from data
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

      const matchesStatus = !filterStatus || app.status === filterStatus;

      const matchesJobId = !filterJobId || app.job.id === Number(filterJobId);

      const matchesDept = !filterDept || app.job.department === filterDept;

      const appliedAt = new Date(app.appliedAt);
      const matchesDateFrom = !filterDateFrom || appliedAt >= new Date(filterDateFrom);
      const matchesDateTo = !filterDateTo || appliedAt <= new Date(filterDateTo + "T23:59:59");

      return matchesSearch && matchesStatus && matchesJobId && matchesDept && matchesDateFrom && matchesDateTo;
    });
  }, [applications, search, filterStatus, filterJobId, filterDept, filterDateFrom, filterDateTo]);

  const clearFilters = () => {
    setSearch("");
    setFilterStatus("");
    setFilterJobId("");
    setFilterDept("");
    setFilterDateFrom("");
    setFilterDateTo("");
  };

  const hasActiveFilters = search || filterStatus || filterJobId || filterDept || filterDateFrom || filterDateTo;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
      <div className="flex-1 py-10 px-4 sm:px-6 md:px-8 overflow-y-auto bg-gray-100">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900">
          All Job Applications
        </h2>

        {/* Search & Filters */}
        <div className="mb-4 flex flex-col gap-3">
          {/* Row 1: search + status + clear */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center flex-wrap">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl bg-white border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
            />

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Clear Filters
            </button>
          </div>

          {/* Row 2: dept + job + date range */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center flex-wrap">
            <select
              value={filterDept}
              onChange={(e) => {
                setFilterDept(e.target.value);
                setFilterJobId(""); // reset job when dept changes
              }}
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>

            <select
              value={filterJobId}
              onChange={(e) => setFilterJobId(e.target.value)}
              className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
            >
              <option value="">All Jobs</option>
              {jobs
                .filter((j) => !filterDept || j.department === filterDept)
                .map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
            </select>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
              />
              <span className="text-gray-500 text-sm">to</span>
              <input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
              />
            </div>
          </div>
        </div>

        {/* Result count */}
        {!loading && (
          <p className="text-sm text-gray-500 mb-3">
            Showing{" "}
            <span className="font-semibold text-gray-700">{filteredApplications.length}</span>
            {" "}of{" "}
            <span className="font-semibold text-gray-700">{applications.length}</span>
            {" "}applications
          </p>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg animate-pulse">Loading applications...</p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-600">
            <p>No applications found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl shadow-sm bg-white border border-gray-200">
            <table className="min-w-full text-sm text-gray-800">
              <thead>
                <tr className="bg-gray-900 text-white text-left">
                  <th className="px-5 py-3 font-semibold">Candidate</th>
                  <th className="px-5 py-3 font-semibold">Email</th>
                  <th className="px-5 py-3 font-semibold">Job</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Applied At</th>
                  <th className="px-5 py-3 font-semibold">Resume</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app, idx) => (
                  <tr
                    key={app.id}
                    className={`border-t border-gray-100 transition hover:bg-gray-50 ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                    }`}
                  >
                    <td className="px-5 py-4 font-medium whitespace-nowrap">
                      {app.candidate.name}
                    </td>
                    <td className="px-5 py-4 text-gray-600 whitespace-nowrap">
                      {app.candidate.email}
                    </td>
                    <td className="px-5 py-4 max-w-[150px]">
                      {app.job.title}
                    </td>
                    <td className="px-5 py-4 text-gray-600 max-w-[120px]">
                      {app.job.department}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          STATUS_COLORS[app.status] ||
                          "bg-gray-100 text-gray-700 border border-gray-300"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 whitespace-nowrap">
                      {new Date(app.appliedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4">
                      {app.resume?.pdfUrl ? (
                        <a
                          href={app.resume.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-900 underline underline-offset-2 font-medium hover:text-black transition"
                        >
                          {app.resume.originalName || "View Resume"}
                        </a>
                      ) : (
                        <span className="text-gray-400 italic">N/A</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default AllJobApplications;
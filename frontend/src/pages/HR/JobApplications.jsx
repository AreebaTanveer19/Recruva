import { useEffect, useState, useMemo } from "react";
import api from "./../../api";
import ApplicationFilters from "./../../components/hr/ApplicationsPage/ApplicationFilters";
import BulkActionBar from "./../../components/hr/ApplicationsPage/BulkActionBar";
import ApplicationsTable from "./../../components/hr/ApplicationsPage/ApplicationsTable";

function AllJobApplications() {
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
  const allVisibleIds = filteredApplications.map((a) => a.id);
  const allSelected   = allVisibleIds.length > 0 && allVisibleIds.every((id) => selected.has(id));
  const someSelected  = allVisibleIds.some((id) => selected.has(id));

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
      await api.patch("/application/bulk-status", {
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
    <div className="flex-1 py-6 sm:py-10 px-3 sm:px-6 md:px-8 overflow-y-auto bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-semibold mb-1 text-gray-900">Job Applications</h2>
      <p className="text-sm text-gray-500 mb-6">Review, filter, and manage all candidate applications.</p>

      <ApplicationFilters
        search={search} setSearch={setSearch}
        filterStatus={filterStatus} setFilterStatus={setFilterStatus}
        filterJobId={filterJobId} setFilterJobId={setFilterJobId}
        filterDept={filterDept} setFilterDept={setFilterDept}
        filterDateFrom={filterDateFrom} setFilterDateFrom={setFilterDateFrom}
        filterDateTo={filterDateTo} setFilterDateTo={setFilterDateTo}
        departments={departments}
        jobs={jobs}
        clearFilters={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {someSelected && (
        <BulkActionBar
          selectedCount={selectedCount}
          bulkLoading={bulkLoading}
          bulkUpdate={bulkUpdate}
          clearSelection={() => setSelected(new Set())}
        />
      )}

      {!loading && (
        <p className="text-sm text-gray-500 mb-3">
          Showing <span className="font-semibold text-gray-700">{filteredApplications.length}</span>
          {" "}of <span className="font-semibold text-gray-700">{applications.length}</span> applications
        </p>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-gray-500 animate-pulse">Loading applications...</p>
        </div>
      ) : filteredApplications.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p className="text-sm">No applications found.</p>
        </div>
      ) : (
        <ApplicationsTable
          filteredApplications={filteredApplications}
          selected={selected}
          toggleOne={toggleOne}
          allSelected={allSelected}
          toggleAll={toggleAll}
        />
      )}
    </div>
  );
}

export default AllJobApplications;
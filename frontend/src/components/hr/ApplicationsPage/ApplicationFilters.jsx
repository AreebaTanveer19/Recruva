const STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

function ApplicationFilters({
  search, setSearch,
  filterStatus, setFilterStatus,
  filterJobId, setFilterJobId,
  filterDept, setFilterDept,
  filterDateFrom, setFilterDateFrom,
  filterDateTo, setFilterDateTo,
  departments,
  jobs,
  clearFilters,
  hasActiveFilters,
}) {
  return (
    <div className="mb-4 flex flex-col gap-2 sm:gap-3">
      {/* Search & Clear Row */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm"
        />
        <button
          onClick={clearFilters}
          disabled={!hasActiveFilters}
          className="px-4 py-2 rounded-lg bg-gray-900 hover:bg-black text-white font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed text-sm whitespace-nowrap"
        >
          Clear
        </button>
      </div>

      {/* Filters Grid */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-wrap">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="flex-1 min-w-[140px] px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select
          value={filterDept}
          onChange={(e) => { setFilterDept(e.target.value); setFilterJobId(""); }}
          className="flex-1 min-w-[140px] px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm"
        >
          <option value="">All Departments</option>
          {departments.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <select
          value={filterJobId}
          onChange={(e) => setFilterJobId(e.target.value)}
          className="flex-1 min-w-[140px] px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm"
        >
          <option value="">All Jobs</option>
          {jobs
            .filter((j) => !filterDept || j.department === filterDept)
            .map((j) => <option key={j.id} value={j.id}>{j.title}</option>)}
        </select>
      </div>

      {/* Date Range */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
        <input 
          type="date" 
          value={filterDateFrom} 
          onChange={(e) => setFilterDateFrom(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm" 
        />
        <span className="hidden sm:inline text-gray-400 text-sm px-2">to</span>
        <input 
          type="date" 
          value={filterDateTo} 
          onChange={(e) => setFilterDateTo(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition text-sm" 
        />
      </div>
    </div>
  );
}

export default ApplicationFilters;
// src/components/hr/FinalisedFilterBar.jsx

export default function FinalisedFilterBar({
  search, setSearch,
  filterDept, setFilterDept,
  filterDecision, setFilterDecision,
  departments,
  hasActiveFilters, clearFilters,
}) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
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
        className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 transition text-sm"
      >
        <option value="">All Departments</option>
        {departments.map((d) => <option key={d}>{d}</option>)}
      </select>
      <select
        value={filterDecision}
        onChange={(e) => setFilterDecision(e.target.value)}
        className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 transition text-sm"
      >
        <option value="">All Decisions</option>
        <option value="accepted">Offered</option>
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
  );
}
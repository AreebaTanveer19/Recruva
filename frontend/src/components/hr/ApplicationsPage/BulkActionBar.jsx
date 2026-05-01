function BulkActionBar({ selectedCount, bulkLoading, bulkUpdate, clearSelection }) {
  return (
    <div className="mb-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 bg-gray-900 text-white px-3 sm:px-4 py-2.5 rounded-xl">
      <span className="text-sm font-medium">{selectedCount} selected</span>
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap sm:gap-2">
        <button
          onClick={() => bulkUpdate("shortlisted")}
          disabled={bulkLoading}
          className="px-3 py-1.5 sm:py-1 rounded-lg bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition disabled:opacity-50 whitespace-nowrap"
        >
          Shortlist
        </button>
        <button
          onClick={() => bulkUpdate("reviewed")}
          disabled={bulkLoading}
          className="px-3 py-1.5 sm:py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition disabled:opacity-50 whitespace-nowrap"
        >
          Mark Reviewed
        </button>
        <button
          onClick={() => bulkUpdate("rejected")}
          disabled={bulkLoading}
          className="px-3 py-1.5 sm:py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition disabled:opacity-50 whitespace-nowrap"
        >
          Reject
        </button>
      </div>
      <button
        onClick={clearSelection}
        className="sm:ml-auto text-xs text-gray-400 hover:text-white transition text-left sm:text-right"
      >
        Clear selection
      </button>
    </div>
  );
}

export default BulkActionBar;
function BulkActionBar({ selectedCount, bulkLoading, bulkUpdate, clearSelection }) {
  return (
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
        onClick={clearSelection}
        className="ml-auto text-xs text-gray-400 hover:text-white transition"
      >
        Clear selection
      </button>
    </div>
  );
}

export default BulkActionBar;
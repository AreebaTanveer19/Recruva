const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const minDate = tomorrow.toISOString().split("T")[0];

const UnarchiveJobModal = ({ open, deadline, error, loading, onChange, onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Reopen Job Position</h2>
        <p className="text-gray-600 text-sm mb-4">Provide a new deadline to reopen this job for candidates.</p>

        <label className="block text-sm font-semibold text-gray-700 mb-1">New Deadline</label>
        <input
          type="date"
          min={minDate}
          value={deadline}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-800 mb-2"
        />

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <div className="flex gap-3 mt-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2 rounded-lg bg-gray-900 text-white font-semibold hover:bg-black transition"
          >
            {loading ? "Reopening..." : "Reopen Job"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnarchiveJobModal;
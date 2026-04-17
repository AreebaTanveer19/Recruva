const DeadlineSection = ({ register }) => (
  <div className="border-b border-gray-200 pb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Deadline</h3>
    <div>
      <label className="block text-sm font-medium text-gray-900 mb-2">Deadline Date</label>
      <input
        type="date"
        {...register("deadline")}
        className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
      />
      <p className="text-xs text-gray-500 mt-1.5">Optional: Set a deadline for applications</p>
    </div>
  </div>
);

export default DeadlineSection;
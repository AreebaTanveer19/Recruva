const ScoringSection = ({ register, errors, watch }) => {
  const considerCGPA   = watch("considerCGPA");
  const skillsWeight   = parseFloat(watch("skillsWeight") || 0);
  const experienceWeight = parseFloat(watch("experienceWeight") || 0);
  const educationWeight  = parseFloat(watch("educationWeight") || 0);
  const weightSum      = (skillsWeight + experienceWeight + educationWeight).toFixed(2);
  const weightsValid   = Math.abs(weightSum - 1.0) <= 0.001;

  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-1">Scoring Configuration</h3>
      <p className="text-sm text-gray-500 mb-4">
        Define how applicants will be scored. All three weights must sum to exactly 1.0
      </p>

      {/* Live weight sum indicator */}
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium mb-5 ${
        weightsValid ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
      }`}>
        <div className={`w-2 h-2 rounded-full ${weightsValid ? "bg-green-500" : "bg-red-500"}`} />
        Current sum: {weightSum} {weightsValid ? "✓" : `(need ${(1 - weightSum).toFixed(2)} more)`}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Skills Weight <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register("skillsWeight", { required: true, min: 0, max: 1, valueAsNumber: true })}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          {errors.skillsWeight && <p className="text-red-500 text-sm mt-1.5">Must be between 0 and 1</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Experience Weight <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register("experienceWeight", { required: true, min: 0, max: 1, valueAsNumber: true })}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          {errors.experienceWeight && <p className="text-red-500 text-sm mt-1.5">Must be between 0 and 1</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Education Weight <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            {...register("educationWeight", { required: true, min: 0, max: 1, valueAsNumber: true })}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          {errors.educationWeight && <p className="text-red-500 text-sm mt-1.5">Must be between 0 and 1</p>}
        </div>
      </div>

      {/* CGPA */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <input
            type="checkbox"
            id="considerCGPA"
            {...register("considerCGPA")}
            className="w-4 h-4 accent-gray-900"
          />
          <label htmlFor="considerCGPA" className="text-sm font-medium text-gray-900">
            Require minimum CGPA for this position
          </label>
        </div>
        {considerCGPA && (
          <div className="md:w-1/3">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Minimum CGPA <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              {...register("minCGPA", {
                required: considerCGPA ? "minCGPA is required" : false,
                min: { value: 0, message: "Min is 0" },
                max: { value: 4.0, message: "Max is 4.0" },
                valueAsNumber: true,
              })}
              placeholder="e.g., 3.0"
              className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
            />
            {errors.minCGPA && <p className="text-red-500 text-sm mt-1.5">{errors.minCGPA.message}</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoringSection;
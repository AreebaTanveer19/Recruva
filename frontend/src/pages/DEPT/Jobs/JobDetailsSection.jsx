const degreeLevels = ["BSC", "MSC", "PhD"];
const degreeTypes = ["CS", "SE", "IT", "DS", "AI"];

const JobDetailsSection = ({ register, errors, watch }) => {
  const requiredDegrees = watch("requiredDegrees") || [];

  return (
    <div className="border-b border-gray-200 pb-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Job Description <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("description", { required: true })}
            placeholder="Provide a concise summary of the position's purpose, responsibilities, and team environment..."
            rows={5}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
          />
          {errors.description && <p className="text-red-500 text-sm mt-1.5">Description is required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Requirements <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("requirements", { required: true })}
            placeholder="e.g., React; Node.js; TypeScript"
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1.5">Separate each requirement with a semicolon</p>
          {errors.requirements && <p className="text-red-500 text-sm mt-1.5">Requirements are required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Responsibilities <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            {...register("responsibilities", { required: true })}
            placeholder="e.g., Lead development; Code reviews"
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          <p className="text-xs text-gray-500 mt-1.5">Separate each responsibility with a semicolon</p>
          {errors.responsibilities && <p className="text-red-500 text-sm mt-1.5">Responsibilities are required</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Minimum Degree Level
          </label>
          <select
            {...register("minDegreeLevel")}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          >
            {degreeLevels.map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Required Degree Types
          </label>
          <div className="space-y-2.5">
            {degreeTypes.map(type => (
              <label key={type} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  value={type}
                  {...register("requiredDegrees")}
                  className="w-4 h-4 border-gray-300 rounded text-gray-900 focus:ring-2 focus:ring-gray-900 cursor-pointer"
                />
                <span className="ml-3 text-sm text-gray-700">{type}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsSection;

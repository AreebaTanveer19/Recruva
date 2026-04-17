const BasicInfoSection = ({ register, errors }) => (
  <div className="border-b border-gray-200 pb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
    <div className="grid grid-cols-1 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Job Title <span className="text-red-500">*</span>
        </label>
        <input
          {...register("title", { required: true })}
          placeholder="e.g., Senior Software Engineer"
          className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
        />
        {errors.title && <p className="text-red-500 text-sm mt-1.5">Title is required</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Department <span className="text-red-500">*</span>
          </label>
          <input
            {...register("department", { required: true })}
            placeholder="e.g., Engineering"
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          {errors.department && <p className="text-red-500 text-sm mt-1.5">Department is required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            {...register("location", { required: true })}
            placeholder="e.g., New York, NY"
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
          />
          {errors.location && <p className="text-red-500 text-sm mt-1.5">Location is required</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Employment Type <span className="text-red-500">*</span>
          </label>
          <select
            {...register("employmentType", { required: true })}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
          >
            <option value="" disabled>Select Employment Type</option>
            <option value="FullTime">FullTime</option>
            <option value="PartTime">PartTime</option>
            <option value="Internship">Internship</option>
          </select>
          {errors.employmentType && <p className="text-red-500 text-sm mt-1.5">Employment type is required</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">
            Work Mode <span className="text-red-500">*</span>
          </label>
          <select
            {...register("workMode", { required: true })}
            className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
          >
            <option value="" disabled>Select Work Mode</option>
            <option value="Onsite">Onsite</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
          {errors.workMode && <p className="text-red-500 text-sm mt-1.5">Work mode is required</p>}
        </div>
      </div>
    </div>
  </div>
);

export default BasicInfoSection;
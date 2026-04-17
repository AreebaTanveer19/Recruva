const CompensationSection = ({ register, errors }) => (
  <div className="border-b border-gray-200 pb-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Compensation & Experience</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Experience Level (years) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("experienceLevel", { required: true, min: 0 })}
          placeholder="0"
          className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
        />
        {errors.experienceLevel && <p className="text-red-500 text-sm mt-1.5">Experience level is required</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Minimum Salary (Rs) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("salaryMin", { required: true })}
          placeholder="50000"
          className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
        />
        {errors.salaryMin && <p className="text-red-500 text-sm mt-1.5">Minimum salary is required</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-900 mb-2">
          Maximum Salary (Rs) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          {...register("salaryMax", { required: true })}
          placeholder="100000"
          className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
        />
        {errors.salaryMax && <p className="text-red-500 text-sm mt-1.5">Maximum salary is required</p>}
      </div>
    </div>
  </div>
);

export default CompensationSection;
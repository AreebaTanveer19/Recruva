import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import alertDisplay from "../../../components/AlertDisplay";
import api from "../../../api";

const initialValues = {
  title: "",
  department: "",
  location: "",
  employmentType: "",
  workMode: "",
  description: "",
  requirements: "",
  responsibilities: "",
  experienceLevel: 0,
  salaryMin: 0,
  salaryMax: 0,
  deadline: "",
};

const JobCreationForm = ({
  defaultValues = {},
  onSubmit,
  formTitle = "Create Job",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const lastDefaultValues = useRef(null); // track last values

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: { ...initialValues, ...defaultValues },
  });

  // Reset only if defaultValues have actually changed
  useEffect(() => {
    const merged = { ...initialValues, ...defaultValues };
    const last = lastDefaultValues.current;

    if (!last || JSON.stringify(last) !== JSON.stringify(merged)) {
      reset(merged);
      lastDefaultValues.current = merged;
    }
  }, [defaultValues, reset]);

  const showAlert = (alertObj) => {
    setAlert(alertObj);
    setTimeout(() => setAlert(null), 7000);
  };
const internalSubmit = async (data) => {
  setIsSubmitting(true);
  try {
    const processedData = {
      ...data,
      title: data.title.trim(),
      department: data.department.trim(),
      location: data.location.trim(),
      description: data.description.trim(),
      requirements: data.requirements.split(";").map((i) => i.trim()),
      responsibilities: data.responsibilities.split(";").map((i) => i.trim()),
      experienceLevel: parseInt(data.experienceLevel, 10),
      salaryMin: parseInt(data.salaryMin, 10),
      salaryMax: parseInt(data.salaryMax, 10),
      deadline: data.deadline ? new Date(data.deadline) : null,
    };

    // Validate salary
    if (processedData.salaryMin > processedData.salaryMax) {
      showAlert({
        type: "error",
        title: "Error",
        message: "Minimum salary cannot exceed maximum salary",
      });
      setIsSubmitting(false);
      return;
    }

    // Submit either via parent onSubmit or API directly
    let successMessage = "";
    if (onSubmit) {
      await onSubmit(processedData);
      successMessage = formTitle.includes("Edit") ? "Job updated successfully" : "Job created successfully";
    } else {
      const token = localStorage.getItem("ACCESS_TOKEN");
      const res = await api.post("/createJob", processedData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.job) {
        successMessage = formTitle.includes("Edit") ? "Job updated successfully" : "Job created successfully";
      } else {
        showAlert({
          type: "error",
          title: "Error",
          message: res.data.error || "Failed to submit job",
        });
        setIsSubmitting(false);
        return;
      }
    }

    // Show success alert
    showAlert({
      type: "success",
      title: "Success",
      message: successMessage,
      color: "#a5d6a7",
    });

    // Reset only for Create Job
    if (!formTitle.includes("Edit")) {
      reset({ ...initialValues });
    } else {
      // Keep current form values for Edit Job
      reset({
        ...data,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
      });
    }

  } catch (err) {
    console.error(err);
    showAlert({
      type: "error",
      title: "Error",
      message: err.response?.data?.message || err.message || "Something went wrong",
    });
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div className="min-h-screen py-7 px-4 sm:px-6 lg:px-8 bg-gray-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-lg border border-gray-200 rounded-t-lg px-8 py-6">
          <h2 className="text-3xl font-bold text-gray-900">{formTitle}</h2>
          <p className="mt-2 text-sm text-gray-600">
            {formTitle.includes("Edit")
              ? "Update the details of this job opening below"
              : "Fill in the details below to create a new job opening"}
          </p>
        </div>

        {/* Alert */}
        {alert && (
          <div className="bg-white border-x border-gray-200 px-8 py-4">
            {alertDisplay(alert)}
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit(internalSubmit)}
          className="bg-white shadow-lg border border-gray-200 rounded-b-lg px-8 py-8 space-y-6"
        >
          {/* Basic Information Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 gap-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  {...register("title", { required: true })}
                  placeholder="e.g., Senior Software Engineer"
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1.5">
                    Title is required
                  </p>
                )}
              </div>

              {/* Department and Location */}
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
                  {errors.department && (
                    <p className="text-red-500 text-sm mt-1.5">
                      Department is required
                    </p>
                  )}
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
                  {errors.location && (
                    <p className="text-red-500 text-sm mt-1.5">
                      Location is required
                    </p>
                  )}
                </div>
              </div>

              {/* Employment Type and Work Mode */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Employment Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("employmentType", { required: true })}
                    defaultValue=""
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                  >
                    <option value="" disabled>
                      Select Employment Type
                    </option>
                    <option value="FullTime">FullTime</option>
                    <option value="PartTime">PartTime</option>
                    <option value="Internship">Internship</option>
                  </select>
                  {errors.employmentType && (
                    <p className="text-red-500 text-sm mt-1.5">
                      Employment type is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-2">
                    Work Mode <span className="text-red-500">*</span>
                  </label>
                  <select
                    {...register("workMode", { required: true })}
                    defaultValue=""
                    className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all bg-white"
                  >
                    <option value="" disabled>
                      Select Work Mode
                    </option>
                    <option value="Onsite">Onsite</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                  {errors.workMode && (
                    <p className="text-red-500 text-sm mt-1.5">
                      Work mode is required
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Job Details Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Job Details
            </h3>
            <div className="space-y-6">
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  {...register("description", { required: true })}
                  placeholder="Provide a concise summary of the position’s purpose, responsibilities, and team environment..."
                  rows={5}
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all resize-none"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1.5">
                    Description is required
                  </p>
                )}
              </div>

              {/* Requirements */}
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
                <p className="text-xs text-gray-500 mt-1.5">
                  Separate each requirement with a semicolon
                </p>
                {errors.requirements && (
                  <p className="text-red-500 text-sm mt-1.5">
                    Requirements are required
                  </p>
                )}
              </div>

              {/* Responsibilities */}
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
                <p className="text-xs text-gray-500 mt-1.5">
                  Separate each responsibility with a semicolon
                </p>
                {errors.responsibilities && (
                  <p className="text-red-500 text-sm mt-1.5">
                    Responsibilities are required
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Compensation & Experience Section */}
          <div className="border-b border-gray-200 pb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Compensation & Experience
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Experience Level (years){" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...register("experienceLevel", { required: true, min: 0 })}
                  placeholder="0"
                  className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
                />
                {errors.experienceLevel && (
                  <p className="text-red-500 text-sm mt-1.5">
                    Experience level is required
                  </p>
                )}
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
                {errors.salaryMin && (
                  <p className="text-red-500 text-sm mt-1.5">
                    Minimum salary is required
                  </p>
                )}
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
                {errors.salaryMax && (
                  <p className="text-red-500 text-sm mt-1.5">
                    Maximum salary is required
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Deadline Section */}
          <div className="pb-2">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Application Deadline
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Deadline Date
              </label>
              <input
                type="date"
                {...register("deadline")}
                className="w-full md:w-1/2 border border-gray-300 rounded-md px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Optional: Set a deadline for applications
              </p>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3.5 rounded-md font-semibold text-white transition-all duration-200 ${
                isValid && !isSubmitting
                  ? "bg-gray-900 hover:bg-gray-800 shadow-sm hover:shadow-md"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {formTitle.includes("Edit")
                    ? "Updating Job..."
                    : "Creating Job..."}
                </span>
              ) : (
                formTitle
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobCreationForm;

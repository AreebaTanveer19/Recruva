import { useForm } from "react-hook-form";
import { useState,useEffect } from "react";
import api from "../../api";
import alertDisplay from "../../components/AlertDisplay";

const JobCreationForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
  });

    useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

    const showAlert = (alertObj) => {
    setAlert(alertObj);
    setTimeout(() => {
      setAlert(null);
    }, 7000);
  };

 const onSubmit = async (data) => {
  setIsSubmitting(true);

  try {
    const processedData = {
      ...data,
      requirements: data.requirements.split(",").map((item) => item.trim()),
      responsibilities: data.responsibilities
        .split(",")
        .map((item) => item.trim()),
      qualifications: data.qualifications
        .split(",")
        .map((item) => item.trim()),
      experienceLevel: parseInt(data.experienceLevel, 10),
      salaryMin: parseInt(data.salaryMin, 10),
      salaryMax: parseInt(data.salaryMax, 10),
      deadline: data.deadline ? new Date(data.deadline) : null,
    };

    console.log("Processed Date", processedData);
    const token = localStorage.getItem("ACCESS_TOKEN");
    console.log("Token", token);
    const res = await api.post("/createJob", processedData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.data.job) {
        showAlert({
        type: "success",
        title: "Success",
        message: "Job Created successfully",
        color: "#a5d6a7",
      });
      reset();
      
    } else {
         showAlert({
          type: "error",
          title: "Error",
          message: "Failed to create job",
        });
      console.log(res.data.error);
    }
  } catch (err) {
    console.error("Error creating job:", err);
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
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create Job</h2>
      <div className="text-left w-full">{alert && alertDisplay(alert)}</div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Title:</label>
          <input
            {...register("title", { required: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">Title is required</p>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Department:
          </label>
          <input
            {...register("department", { required: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.department && (
            <p className="text-red-500 text-sm mt-1">Department is required</p>
          )}
        </div>

        {/* Location */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Location:
          </label>
          <input
            {...register("location", { required: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">Location is required</p>
          )}
        </div>

        {/* Employment Type */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Employment Type:
          </label>
          <select
            {...register("employmentType", { required: true })}
            defaultValue=""
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>
              --- Select Employment Type ---
            </option>
            <option value="FullTime">FullTime</option>
            <option value="PartTime">PartTime</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        {/* Work Mode */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Work Mode:
          </label>
          <select
            {...register("workMode", { required: true })}
            defaultValue=""
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="" disabled>
              ---Select Work Mode---
            </option>
            <option value="Onsite">Onsite</option>
            <option value="Remote">Remote</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Description:
          </label>
          <textarea
            {...register("description", { required: true })}
            className="w-full border rounded px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Comma-separated fields */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Requirements:
          </label>
          <input
            type="text"
            {...register("requirements", { required: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Responsibilities:
          </label>
          <input
            type="text"
            {...register("responsibilities", { required: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Qualifications:
          </label>
          <input
            type="text"
            {...register("qualifications", { required: true })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Experience and Salary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Experience (years):
            </label>
            <input
              type="number"
              {...register("experienceLevel", { required: true, min: 0 })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Salary Min:
            </label>
            <input
              type="number"
              {...register("salaryMin", { required: true })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Salary Max:
            </label>
            <input
              type="number"
              {...register("salaryMax", { required: true })}
              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        {/* Deadline */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Deadline:
          </label>
          <input
            type="date"
            {...register("deadline")}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className={`w-full py-2 mt-4 rounded font-semibold text-white ${
            isValid && !isSubmitting
              ? "bg-blue-500 hover:bg-blue-600"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? "Creating Job..." : "Create Job"}
        </button>
      </form>
    </div>
  );
};

export default JobCreationForm;

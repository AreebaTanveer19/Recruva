import { useForm } from "react-hook-form";
import { useState, useEffect, useRef } from "react";
import alertDisplay from "../../../components/AlertDisplay";
import api from "../../../api";
import BasicInfoSection from "./BasicInfoSection";
import JobDetailsSection from "./JobDetailsSection";
import CompensationSection from "./CompensationSection";
import DeadlineSection from "./DeadlineSection";
import ScoringSection from "./ScoringSection";

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
  minDegreeLevel: "BSC",
  requiredDegrees: [],
  skillsWeight: 0.4,
  experienceWeight: 0.4,
  educationWeight: 0.2,
  considerCGPA: false,
  minCGPA: "",
};

const JobCreationForm = ({
  defaultValues = {},
  defaultScoringValues = {},
  onSubmit,
  formTitle = "Create Job",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null);
  const lastDefaultValues = useRef(null);

  const mergedDefaults = {
    ...initialValues,
    ...defaultValues,
    skillsWeight:     defaultScoringValues.skillsWeight     ?? initialValues.skillsWeight,
    experienceWeight: defaultScoringValues.experienceWeight ?? initialValues.experienceWeight,
    educationWeight:  defaultScoringValues.educationWeight  ?? initialValues.educationWeight,
    considerCGPA:     defaultScoringValues.considerCGPA     ?? initialValues.considerCGPA,
    minCGPA:          defaultScoringValues.minCGPA          ?? initialValues.minCGPA,
  };

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    defaultValues: mergedDefaults,
  });

  // Derive weightsValid here so the submit button can use it
  const skillsWeight     = parseFloat(watch("skillsWeight") || 0);
  const experienceWeight = parseFloat(watch("experienceWeight") || 0);
  const educationWeight  = parseFloat(watch("educationWeight") || 0);
  const weightSum        = (skillsWeight + experienceWeight + educationWeight).toFixed(2);
  const weightsValid     = Math.abs(weightSum - 1.0) <= 0.001;

  useEffect(() => {
    const merged = mergedDefaults;
    const last = lastDefaultValues.current;
    if (!last || JSON.stringify(last) !== JSON.stringify(merged)) {
      reset(merged);
      lastDefaultValues.current = merged;
    }
  }, [defaultValues, defaultScoringValues, reset]);

  const showAlert = (alertObj) => {
    setAlert(alertObj);
    setTimeout(() => setAlert(null), 7000);
  };

  const internalSubmit = async (data) => {
    if (!weightsValid) {
      showAlert({
        type: "error",
        title: "Error",
        message: `Scoring weights must sum to 1.0, currently ${weightSum}`,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const processedData = {
        title:            data.title.trim(),
        department:       data.department.trim(),
        location:         data.location.trim(),
        employmentType:   data.employmentType,
        workMode:         data.workMode,
        description:      data.description.trim(),
        requirements:     data.requirements.split(";").map((i) => i.trim()),
        responsibilities: data.responsibilities.split(";").map((i) => i.trim()),
        experienceLevel:  parseInt(data.experienceLevel, 10),
        salaryMin:        parseInt(data.salaryMin, 10),
        salaryMax:        parseInt(data.salaryMax, 10),
        minDegreeLevel:   data.minDegreeLevel,
        requiredDegrees:  data.requiredDegrees || [],
        deadline:         data.deadline ? new Date(data.deadline) : null,
      };

      const scoringData = {
        skillsWeight:     parseFloat(data.skillsWeight),
        experienceWeight: parseFloat(data.experienceWeight),
        educationWeight:  parseFloat(data.educationWeight),
        considerCGPA:     data.considerCGPA,
        minCGPA:          data.considerCGPA ? parseFloat(data.minCGPA) : null,
      };

      if (processedData.salaryMin > processedData.salaryMax) {
        showAlert({ type: "error", title: "Error", message: "Minimum salary cannot exceed maximum salary" });
        setIsSubmitting(false);
        return;
      }

      if (onSubmit) {
        await onSubmit({ ...processedData, scoring: scoringData });
        showAlert({
          type: "success",
          title: "Success",
          message: formTitle.includes("Edit") ? "Job updated successfully" : "Job created successfully",
          color: "#a5d6a7",
        });
        if (!formTitle.includes("Edit")) {
          reset({ ...initialValues });
        } else {
          reset({ ...data, requirements: data.requirements, responsibilities: data.responsibilities });
        }
      } else {
        const token = localStorage.getItem("ACCESS_TOKEN");
        const res = await api.post("/createJob", processedData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data.job) {
          const jobId = res.data.job.id;
          await api.post(`/job-scoring/${jobId}/scoring-config`, scoringData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          showAlert({ type: "success", title: "Success", message: "Job and scoring config created successfully!", color: "#a5d6a7" });
          reset({ ...initialValues });
        } else {
          showAlert({ type: "error", title: "Error", message: res.data.error || "Failed to submit job" });
        }
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

        <form
          onSubmit={handleSubmit(internalSubmit)}
          className="bg-white shadow-lg border border-gray-200 rounded-b-lg px-8 py-8 space-y-6"
        >
          <BasicInfoSection   register={register} errors={errors} />
          <JobDetailsSection  register={register} errors={errors} watch={watch} />
          <CompensationSection register={register} errors={errors} />
          <DeadlineSection    register={register} />
          {!formTitle.includes("Edit") && (
  <ScoringSection register={register} errors={errors} watch={watch} />
)}

          {/* Submit */}
          <div className="pt-2">
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
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {formTitle.includes("Edit") ? "Updating Job..." : "Creating Job..."}
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
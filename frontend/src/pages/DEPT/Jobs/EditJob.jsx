import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import JobCreationForm from "./JobCreationForm";
import api from "../../../api";

const EditJob = () => {
  const { id } = useParams();
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch job by ID
  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await api.get(`openJob/${id}`);
        setJobData(res.data.job); 
      } catch (err) {
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  // Update job function
  const updateJob = async (data) => {
    try {
      const token = localStorage.getItem("ACCESS_TOKEN");
      if (!token) throw new Error("User not authenticated");

      await api.patch(`edit-job/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
    } catch (err) {
      console.error("Error updating job:", err);
    
    }
  };

if (loading)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-700 text-lg font-medium">Loading...</p>
      </div>
    </div>
  );

if (!jobData)
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500 text-lg font-medium">Job not found.</p>
    </div>
  );

  const formDefaults = {
    ...jobData,
    requirements: Array.isArray(jobData.requirements)
      ? jobData.requirements.join("; ")
      : jobData.requirements || "",
    responsibilities: Array.isArray(jobData.responsibilities)
      ? jobData.responsibilities.join("; ")
      : jobData.responsibilities || "",
  };

  return (
    <JobCreationForm
      defaultValues={formDefaults}
      onSubmit={updateJob}
      formTitle="Edit Job"
    />
  );
};

export default EditJob;
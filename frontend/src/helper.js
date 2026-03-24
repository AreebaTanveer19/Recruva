import api from "./api";

export const fetchOpenJobs = async () => {
  try {
    const res = await api.get("/openJobs");
    return res.data.jobs;
  } catch (error) {
    console.error("Error fetching jobs:", error);
    throw error; 
  }
};

export const formatDate = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

export const deleteQuestion = async (jobId, questionId) => {
  try {
    const res = await api.delete(`/jobs/${jobId}/questions/${questionId}/delete`);
    return res.data;
  } catch (error) {
    console.error("Error deleting question:", error);
    throw error;
  }
};

export const regenerateQuestion = async (jobId, questionId) => {
  try {
    const res = await api.put(`/jobs/${jobId}/questions/${questionId}/regenerate`);
    return res.data; // { message, question: newQuestion }
  } catch (error) {
    console.error("Error regenerating question:", error);
    throw error;
  }
};
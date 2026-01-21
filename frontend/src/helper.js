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
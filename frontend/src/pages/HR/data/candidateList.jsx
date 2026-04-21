import api from "../../../api";
import { ACCESS_TOKEN } from "../../../constants";

export const fetchShortlistedCandidates = async (jobId = null) => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN);
    const statusParam = "shortlisted,scheduled";
    const url = jobId
      ? `/candidates/shortlisted?jobId=${jobId}&status=${statusParam}`
      : `/candidates/shortlisted?status=${statusParam}`;

    const res = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error("Error fetching shortlisted candidates:", error);
    throw error;
  }
};

export const updateCandidateStatus = async (applicationId, newStatus) => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN);

    const res = await api.put(
      `/candidates/application/${applicationId}/status`,
      { applicationId, status: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    console.error("Error updating candidate status:", error);
    throw error;
  }
};

export const getUsersByRole = async (role) => {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN);

    const res = await api.get(`/candidates/by-role?role=${role}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.data;
  } catch (error) {
    console.error("Error fetching users by role:", error);
    throw error;
  }
};
export const statusStyles = {
  pending: "bg-gray-100 text-gray-800",
  reviewed: "bg-purple-100 text-purple-700",
  shortlisted: "bg-indigo-100 text-indigo-700",
  scheduled: "bg-blue-100 text-blue-600",
  rejected: "bg-red-100 text-red-700",
  accepted: "bg-green-100 text-green-800 border border-green-200",
};
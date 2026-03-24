import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";



export const getModeIcon = (mode) => {
  switch (mode) {
    case "google_meet":
      return <AccessTimeIcon className="!text-[16px]" />; // or video icon later
    case "on_site":
      return <LocationOnIcon className="!text-[16px]" />;
    default:
      return null;
  }
};

export const getModeLabel = (mode) => {
  switch (mode) {
    case "google_meet":
      return "Google Meet";
    case "on_site":
      return "On-Site";
    default:
      return "";
  }
};

export const interviewModes = [
  { value: "google_meet", label: "Google Meet" },
  { value: "on_site", label: "On-Site" },
];

export const meetingLinkTemplates = {
  "google_meet": "https://meet.google.com/xxx-xxxx-xxx",
  "on_site": "123 Office Street, Suite 456",
};


import { ACCESS_TOKEN } from "../../../constants";

export const scheduleInterviewApi = async (payload) => {
  const token = localStorage.getItem(ACCESS_TOKEN);

  const res = await fetch("http://localhost:3000/api/interview/schedule-event", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, 
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text(); 
    console.error("API Error:", text);
    throw new Error(`API request failed with status ${res.status}`);
  }
  return res.json();
};

// services/interviewApi.js

import api from "../../../api";

export const fetchInterviews = async () => {
  try {
    const res = await api.get("/interview");
    return res.data.data;

  } catch (error) {
    console.error("Error fetching interviews:", error);
    throw error;
  }
};
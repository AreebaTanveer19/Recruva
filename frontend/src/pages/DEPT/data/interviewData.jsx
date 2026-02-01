import LocationOnIcon from "@mui/icons-material/LocationOn";

export const interviewsData = [
  {
    id: "1",
    candidateName: "Sarah Johnson",
    position: "Senior Frontend Developer",
    date: new Date(),
    time: "10:00 AM",
    mode: "google_meet",
    meetingLink: "https://meet.google.com/abc-defg-hij",
  },
  {
    id: "2",
    candidateName: "Michael Chen",
    position: "Product Manager",
    date: new Date(),
    time: "2:00 PM",
    mode: "google_meet",
    meetingLink: "https://meet.google.com/xyz-uvwx-yz",
  },
  {
    id: "3",
    candidateName: "Emily Davis",
    position: "UX Designer",
    date: new Date(Date.now() + 86400000),
    time: "11:00 AM",
    mode: "onsite",
  },
  {
    id: "4",
    candidateName: "James Wilson",
    position: "Backend Engineer",
    date: new Date(Date.now() + 86400000 * 2),
    time: "3:30 PM",
    mode: "google_meet",
    meetingLink: "https://meet.google.com/xyz-uvwx-yz",
  },
];

export const getModeIcon = (mode) => {
  switch (mode) {
    case "google_meet":
    case "onsite":
      return <LocationOnIcon className="!text-[16px]" />;
    default:
      return null;
  }
};

export const getModeLabel = (mode) => {
  switch (mode) {
    case "google_meet":
      return "Google Meet";
    case "onsite":
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
  "on-site": "123 Office Street, Suite 456",
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

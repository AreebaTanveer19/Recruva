import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import CandidateTable from "./CandidateTable";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import { scheduleInterviewApi } from "../data/interviewData";
import api from "../../../api";
import { ACCESS_TOKEN } from "../../../constants";
import { candidatesList } from "../data/candidateList";

const stats = [
  { label: "Total Candidates", value: 120, change: "+5%" },
  { label: "Scheduled", value: 45, change: "+2%" },
  { label: "Interviewed", value: 30, change: "-1%" },
  { label: "Offered", value: 10, change: "+3%" },
];

export default function ShortlistedCandidates() {
  const [calendarStatus, setCalendarStatus] = useState("idle");
  const [openModal, setOpenModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);

  useEffect(() => {
    setCandidates(candidatesList);
  }, []);

  const connectCalendar = async () => {
    setCalendarStatus("connecting");

    try {
      const token = localStorage.getItem(ACCESS_TOKEN);

      const res = await api.get("/interview/google-auth", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        setCalendarStatus("failed");
        console.error("No URL returned from backend");
      }
    } catch (err) {
      console.error("Google Calendar connection failed:", err);
      setCalendarStatus("failed");
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("calendar") === "connected") {
      localStorage.setItem("calendarConnected", "true");
      setCalendarStatus("connected");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (localStorage.getItem("calendarConnected")) {
      setCalendarStatus("connected");
    }
  }, []);

  // Open modal
  const handleScheduleClick = (candidate) => {
    if (!localStorage.getItem("calendarConnected")) {
      alert("Please connect Google Calendar first");
      return;
    }

    setSelectedCandidate(candidate);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCandidate(null);
  };

  // Schedule interview
  const handleScheduleInterview = async (data) => {
    try {
      const res = await scheduleInterviewApi({
        candidateName: selectedCandidate.name,
        candidateEmail: selectedCandidate.email,
        ...data,
      });

      if (res.success) {
        alert(`Interview scheduled! Meet link: ${res.meetLink || "N/A"}`);

        setCandidates((prev) =>
          prev.map((c) =>
            c.id === selectedCandidate.id ? { ...c, status: "scheduled" } : c,
          ),
        );

        handleCloseModal();
      } else {
        alert("Failed to schedule interview");
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong");
    }
  };
  const [loading, setLoading] = useState(false);

  const handleDisconnect = async () => {
    const confirmDisconnect = window.confirm(
      "Are you sure you want to disconnect Google Calendar?",
    );
    if (!confirmDisconnect) return;

    try {
      setLoading(true);
      const token = localStorage.getItem(ACCESS_TOKEN);

      const res = await fetch(
        "http://localhost:3000/api/interview/disconnect-calendar",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (data.success) {
        alert("Google Calendar disconnected successfully!");
        setCalendarStatus("idle");
        localStorage.removeItem("calendarConnected");
      } else {
        alert(data.message || "Failed to disconnect Google Calendar");
      }
    } catch (err) {
      console.error("Disconnect Calendar Error:", err);
      alert("Something went wrong while disconnecting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Shortlisted Candidates
              </h2>
              <p className="text-sm text-gray-500">
                Manage and schedule interviews for qualified candidates
              </p>
            </div>

            <button
              onClick={connectCalendar}
              disabled={calendarStatus !== "idle"}
              className={`ml-auto px-4 py-2 rounded-lg transition-all bg-black text-white hover:bg-gray-800`}
            >
              {calendarStatus === "connecting"
                ? "Connecting..."
                : calendarStatus === "connected"
                  ? "✓ Connected to Google Calendar"
                  : "Connect Google Calendar"}
            </button>

            {calendarStatus === "connected" && (
              <button
                onClick={handleDisconnect}
                disabled={loading}
                className="bg-black text-white px-4 py-2 rounded ml-2"
              >
                {loading ? "Disconnecting..." : "Disconnect Google Calendar"}
              </button>
            )}
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search candidates..."
                className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>

            <button className="flex items-center gap-1.5 text-sm font-medium rounded-lg border px-3 py-3 hover:bg-gray-100">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="p-6 h-28 rounded-xl bg-white border shadow-sm"
            >
              <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Candidate Table */}
        <CandidateTable
          candidates={candidates}
          onScheduleInterview={handleScheduleClick}
        />

        {/* Schedule Modal */}
        <ScheduleInterviewModal
          open={openModal}
          onClose={handleCloseModal}
          candidate={selectedCandidate}
          onSchedule={handleScheduleInterview}
        />
      </main>
    </div>
  );
}

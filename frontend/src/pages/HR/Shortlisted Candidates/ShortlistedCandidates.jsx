import { useState, useEffect } from "react";
import { Search, Filter } from "lucide-react";
import CandidateTable from "./CandidateTable";
import ScheduledInterviewsTab from "./ScheduledInterviewsTab";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import { scheduleInterviewApi } from "../../../interviewData";
import api from "../../../api";
import { ACCESS_TOKEN } from "../../../constants";
import { fetchShortlistedCandidates } from "../data/candidateList.jsx";
import { fetchOpenJobs } from "../../../helper";

export default function ShortlistedCandidates() {
  const [activeTab, setActiveTab] = useState("shortlisted");
  const [calendarStatus, setCalendarStatus] = useState("idle");
  const [openModal, setOpenModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const generateStats = () => {
    const shortlistedCandidates = candidates.filter(
      (c) => !["scheduled", "accepted", "rejected"].includes(c.status)
    );
    const total = shortlistedCandidates.length;
    const pending = shortlistedCandidates.filter(c => c.status === "pending").length;
    const interviewed = shortlistedCandidates.filter(c => c.status === "interviewed").length;
    const offered = shortlistedCandidates.filter(c => c.status === "offered").length;

    return [
      { label: "Total Candidates", value: total, change: "+5%" },
      { label: "Pending", value: pending, change: "+2%" },
      { label: "Interviewed", value: interviewed, change: "-1%" },
      { label: "Offered", value: offered, change: "+3%" },
    ];
  };

  const stats = generateStats();

  useEffect(() => {
    const loadShortlistedCandidates = async () => {
      try {
        setLoadingCandidates(true);
        const data = await fetchShortlistedCandidates();
        setCandidates(data);
      } catch (err) {
        console.error("Failed to fetch shortlisted candidates", err);
        
      } finally {
        setLoadingCandidates(false);
      }
    };
    loadShortlistedCandidates();
  }, []);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        const openJobs = await fetchOpenJobs();
        setJobs(openJobs);
      } catch (err) {
        console.error("Failed to fetch open jobs", err);
      }
    };
    loadJobs();
  }, []);

  useEffect(() => {
    let filtered = [...candidates];

    // Exclude candidates who have an interview scheduled/completed
    filtered = filtered.filter(
      (c) => !["scheduled", "accepted", "rejected"].includes(c.status)
    );

    // Filter by job
    if (selectedJob) {
      filtered = filtered.filter((c) => c.position === selectedJob);
    }

    // Filter by status
    if (selectedStatus) {
      filtered = filtered.filter((c) => c.status === selectedStatus);
    }

    // Filter by search term (candidate name)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredCandidates(filtered);
  }, [candidates, selectedJob, selectedStatus, searchTerm]);

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

  // Just came back from OAuth redirect
  if (params.get("calendar") === "connected") {
    window.history.replaceState({}, "", window.location.pathname);
  }

  // Always check status from DB
  const checkStatus = async () => {
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      const res = await api.get("/interview/calendar-status", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCalendarStatus(res.data.connected ? "connected" : "idle");
    } catch (err) {
      console.error("Failed to check calendar status", err);
      setCalendarStatus("idle");
    }
  };

  checkStatus();
}, []);

  const handleScheduleClick = (candidate) => {

if (calendarStatus !== "connected") {
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

        // Remove the candidate from the local list immediately
        setCandidates((prev) =>
          prev.filter((c) => c.applicationId !== selectedCandidate.applicationId),
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
       // localStorage.removeItem("calendarConnected");
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

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("shortlisted")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "shortlisted"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Shortlisted Candidates
          </button>
          <button
            onClick={() => setActiveTab("scheduled")}
            className={`px-6 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === "scheduled"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Scheduled Interviews
          </button>
        </div>

        {/* Shortlisted Candidates Tab */}
        {activeTab === "shortlisted" && (
          <>
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row justify-between gap-4 mb-6 items-center">
              {/* Search */}
              <div className="relative flex-1 w-full">
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              </div>

              {/* Job Dropdown */}
              <div className="flex gap-3 mt-3 md:mt-0">
                <select
                  value={selectedJob}
                  onChange={(e) => setSelectedJob(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">All Jobs</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.title}>
                      {job.title}
                    </option>
                  ))}
                </select>

                {/* Status Dropdown */}
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-3 rounded-xl border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option>
                </select>
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
              candidates={filteredCandidates}
              onScheduleInterview={handleScheduleClick}
            />
          </>
        )}

        {/* Scheduled Interviews Tab */}
        {activeTab === "scheduled" && (
          <ScheduledInterviewsTab />
        )}

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

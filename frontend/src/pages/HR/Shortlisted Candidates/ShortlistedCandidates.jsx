import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import CandidateTable from "./CandidateTable";
import ScheduledInterviewsTab from "./ScheduledInterviewsTab";
import ScheduleInterviewModal from "./ScheduleInterviewModal";
import { scheduleInterviewApi } from "../../../interviewData";
import api from "../../../api";
import { fetchShortlistedCandidates } from "../data/candidateList.jsx";
import { fetchOpenJobs } from "../../../helper";
import AlertDisplay from "../../../components/AlertDisplay";

export default function ShortlistedCandidates() {
  const [activeTab, setActiveTab] = useState("shortlisted");
  const [calendarStatus, setCalendarStatus] = useState("idle");
  const [disconnecting, setDisconnecting] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [pageAlert, setPageAlert] = useState({ type: "", title: "", message: "" });
  const [openModal, setOpenModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const showPageAlert = (type, title, message) => {
    setPageAlert({ type, title, message });
    setTimeout(() => setPageAlert({ type: "", title: "", message: "" }), 5000);
  };

  const generateStats = () => {
    const shortlistedCandidates = candidates.filter(
      (c) => !["scheduled", "accepted", "rejected"].includes(c.status)
    );
    const total = shortlistedCandidates.length;
    const pending = shortlistedCandidates.filter((c) => c.status === "pending").length;
    const interviewed = shortlistedCandidates.filter((c) => c.status === "interviewed").length;
    const offered = shortlistedCandidates.filter((c) => c.status === "offered").length;
    return [
      { label: "Total Candidates", value: total },
      { label: "Pending", value: pending },
      { label: "Interviewed", value: interviewed },
      { label: "Offered", value: offered },
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
    filtered = filtered.filter(
      (c) => !["scheduled", "accepted", "rejected"].includes(c.status)
    );
    if (selectedJob) filtered = filtered.filter((c) => c.position === selectedJob);
    if (selectedStatus) filtered = filtered.filter((c) => c.status === selectedStatus);
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCandidates(filtered);
  }, [candidates, selectedJob, selectedStatus, searchTerm]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("calendar") === "connected") {
      window.history.replaceState({}, "", window.location.pathname);
    }
    const checkStatus = async () => {
      try {
        const res = await api.get("/interview/calendar-status");
        setCalendarStatus(res.data.connected ? "connected" : "idle");
      } catch {
        setCalendarStatus("idle");
      }
    };
    checkStatus();
  }, []);

  const connectCalendar = async () => {
    setCalendarStatus("connecting");
    try {
      const res = await api.get("/interview/google-auth");
      if (res.data.url) {
        window.location.href = res.data.url;
      } else {
        setCalendarStatus("idle");
      }
    } catch {
      setCalendarStatus("idle");
    }
  };

  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect Google Calendar?")) return;
    setDisconnecting(true);
    try {
      await api.post("/interview/disconnect-calendar", {});
      setCalendarStatus("idle");
    } catch {
      showPageAlert("error", "Disconnect Failed", "Failed to disconnect Google Calendar. Please try again.");
    } finally {
      setDisconnecting(false);
    }
  };

  const handleScheduleClick = (candidate) => {
    if (calendarStatus !== "connected") {
      showPageAlert(
        "warning",
        "Calendar Not Connected",
        "Please connect your Google Calendar before scheduling an interview."
      );
      return;
    }
    setSelectedCandidate(candidate);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCandidate(null);
  };

  const handleScheduleInterview = async (data) => {
    try {
      setScheduling(true);
      const res = await scheduleInterviewApi({
        candidateName: selectedCandidate.name,
        candidateEmail: selectedCandidate.email,
        ...data,
      });

      if (res.success) {
        setCandidates((prev) =>
          prev.filter((c) => c.applicationId !== selectedCandidate.applicationId)
        );
        handleCloseModal();
        showPageAlert(
          "success",
          "Interview Scheduled",
          res.meetLink
            ? `Interview scheduled successfully. Google Meet link: ${res.meetLink}`
            : "Interview scheduled successfully."
        );
      } else {
        showPageAlert("error", "Scheduling Failed", "Failed to schedule interview. Please try again.");
      }
    } catch (error) {
      console.error(error);
      const msg = error?.response?.data?.message || "Something went wrong while scheduling.";
      showPageAlert("error", "Scheduling Failed", msg);
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Shortlisted Candidates</h2>
              <p className="text-sm text-gray-500">
                Manage and schedule interviews for qualified candidates
              </p>
            </div>

            {/* Google Calendar connect/disconnect */}
            <div className="flex items-center gap-3">
              {calendarStatus === "connected" ? (
                <>
                  <span className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm font-medium">
                    <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                    Google Calendar Connected
                  </span>
                  <button
                    onClick={handleDisconnect}
                    disabled={disconnecting}
                    className="px-4 py-2 rounded-lg text-sm font-medium border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition disabled:opacity-50"
                  >
                    {disconnecting ? "Disconnecting..." : "Disconnect"}
                  </button>
                </>
              ) : (
                <button
                  onClick={connectCalendar}
                  disabled={calendarStatus === "connecting"}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {calendarStatus === "connecting" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    "Connect Google Calendar"
                  )}
                </button>
              )}
            </div>
          </div>

          {calendarStatus !== "connected" && (
            <p className="mt-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
              Connect your Google Calendar to schedule Google Meet interviews.
            </p>
          )}
        </div>

        {/* Page-level alerts */}
        {pageAlert.message && (
          <div className="mb-4">
            <AlertDisplay
              type={pageAlert.type}
              title={pageAlert.title}
              message={pageAlert.message}
            />
          </div>
        )}

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
                <div key={stat.label} className="p-6 h-28 rounded-xl bg-white border shadow-sm">
                  <p className="text-sm text-gray-500 mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <CandidateTable
              candidates={filteredCandidates}
              onScheduleInterview={handleScheduleClick}
            />
          </>
        )}

        {activeTab === "scheduled" && <ScheduledInterviewsTab />}

        <ScheduleInterviewModal
          open={openModal}
          onClose={handleCloseModal}
          candidate={selectedCandidate}
          onSchedule={handleScheduleInterview}
          isScheduling={scheduling}
        />
      </main>
    </div>
  );
}

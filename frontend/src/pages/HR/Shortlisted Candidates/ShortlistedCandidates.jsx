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
import { ConfirmDialog } from "../../../components/ConfirmDialog";

export default function ShortlistedCandidates() {
  const [activeTab, setActiveTab] = useState("shortlisted");
  const [calendarStatus, setCalendarStatus] = useState("idle");
  const [disconnecting, setDisconnecting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [pageAlert, setPageAlert] = useState({ type: "", title: "", message: "" });
  const [openModal, setOpenModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [filteredCandidates, setFilteredCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingCandidates, setLoadingCandidates] = useState(true);

  const showPageAlert = (type, title, message) => {
    setPageAlert({ type, title, message });
    setTimeout(() => setPageAlert({ type: "", title: "", message: "" }), 5000);
  };

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
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredCandidates(filtered);
  }, [candidates, selectedJob, searchTerm]);

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
    setDisconnecting(true);
    try {
      await api.post("/interview/disconnect-calendar", {});
      setCalendarStatus("idle");
    } catch {
      showPageAlert("error", "Disconnect Failed", "Failed to disconnect Google Calendar. Please try again.");
    } finally {
      setDisconnecting(false);
      setConfirmOpen(false);
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
            ? `Interview scheduled successfully.`
            : "Interview scheduled successfully."
        );
      } else {
        showPageAlert("error", "Scheduling Failed", "Failed to schedule interview. Please try again.");
      }
    } catch (error) {
      console.error(error);
      if (error?.code === "GOOGLE_AUTH_EXPIRED") {
        showPageAlert("error", "Google Calendar Disconnected", "Your Google Calendar access has expired. Please reconnect your Google account.");
      } else {
        const msg = error?.message || "Something went wrong while scheduling.";
        showPageAlert("error", "Scheduling Failed", msg);
      }
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Shortlisted Candidates</h2>
              <p className="text-sm text-gray-500">
                Manage and schedule interviews for qualified candidates
              </p>
            </div>

            {/* Google Calendar connect/disconnect */}
            <div className="flex flex-wrap items-center gap-2">
              {calendarStatus === "connected" ? (
                <>
                  <span className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs sm:text-sm font-medium whitespace-nowrap">
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    Google Calendar Connected
                  </span>
                  <button
                    onClick={() => setConfirmOpen(true)}
                    disabled={disconnecting}
                    className="px-3 py-2 rounded-lg text-xs sm:text-sm font-medium border border-neutral-300 text-neutral-600 hover:bg-neutral-100 transition disabled:opacity-50 whitespace-nowrap"
                  >
                    Disconnect
                  </button>
                </>
              ) : (
                <button
                  onClick={connectCalendar}
                  disabled={calendarStatus === "connecting"}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-black text-white text-xs sm:text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 whitespace-nowrap"
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
            <p className="mt-3 text-xs sm:text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
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

              
              </div>
            </div>

            {loadingCandidates ? (
              <div className="rounded-xl shadow-lg bg-white overflow-hidden animate-pulse">
                {/* skeleton header */}
                <div className="bg-gray-100 border-b border-gray-200 px-4 py-3 hidden lg:flex gap-6">
                  {[140, 180, 140, 80, 120].map((w, i) => (
                    <div key={i} className="h-3 rounded bg-gray-300" style={{ width: w }} />
                  ))}
                </div>
                {/* skeleton rows */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-4 py-4 border-b border-gray-100 flex flex-col lg:flex-row gap-3 lg:items-center lg:gap-6">
                    <div className="h-3 rounded bg-gray-200 w-36" />
                    <div className="h-3 rounded bg-gray-200 w-44" />
                    <div className="h-3 rounded bg-gray-200 w-32" />
                    <div className="h-5 rounded-full bg-gray-200 w-20" />
                    <div className="h-7 rounded-lg bg-gray-200 w-36" />
                  </div>
                ))}
              </div>
            ) : (
              <CandidateTable
                candidates={filteredCandidates}
                onScheduleInterview={handleScheduleClick}
              />
            )}
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

        <ConfirmDialog
          open={confirmOpen}
          title="Disconnect Google Calendar"
          message="Are you sure you want to disconnect your Google Calendar? You won't be able to schedule Google Meet interviews until you reconnect."
          confirmText="Disconnect"
          confirmColor="error"
          loading={disconnecting}
          onConfirm={handleDisconnect}
          onCancel={() => setConfirmOpen(false)}
        />
      </main>
    </div>
  );
}

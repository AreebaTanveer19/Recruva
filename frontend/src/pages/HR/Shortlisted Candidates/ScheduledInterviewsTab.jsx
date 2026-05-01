import { useState, useEffect } from "react";
import { CalendarIcon, ExternalLinkIcon, MessageSquare } from "lucide-react";
import api from "../../../api";
import { ACCESS_TOKEN } from "../../../constants";
import { FeedbackViewerModal } from "../../../components/hr/FeedbackViewerModal";

export default function ScheduledInterviewsTab() {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

  // Helper function to derive display status from DB status and startTime
  const getDisplayStatus = (dbStatus, startTime) => {
    const now = new Date();
    const interviewTime = new Date(startTime);
    const isFuture = interviewTime > now;

    if (dbStatus === "accepted") {
      return {
        label: "Accepted",
        colorClasses: "bg-emerald-100 text-emerald-800",
      };
    }

    if (dbStatus === "rejected") {
      return {
        label: "Rejected",
        colorClasses: "bg-red-100 text-red-800",
      };
    }

    if (dbStatus === "scheduled") {
      if (isFuture) {
        return {
          label: "Upcoming",
          colorClasses: "bg-amber-100 text-amber-800",
        };
      } else {
        return {
          label: "Awaiting Feedback",
          colorClasses: "bg-orange-100 text-orange-800",
        };
      }
    }

    // Fallback
    return {
      label: dbStatus,
      colorClasses: "bg-gray-100 text-gray-800",
    };
  };

  // Fetch scheduled interviews
  useEffect(() => {
    const fetchScheduledInterviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(ACCESS_TOKEN);

        const response = await api.get("/interview", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.success) {
          setInterviews(response.data.data);

          // Extract unique positions
          const uniquePositions = [...new Set(response.data.data.map((i) => i.position))];
          setPositions(uniquePositions);
        }
      } catch (err) {
        console.error("Failed to fetch scheduled interviews:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScheduledInterviews();
  }, []);

  // Filter interviews based on search, position, and derived status
  useEffect(() => {
    let filtered = [...interviews];

    // Filter by position
    if (selectedPosition) {
      filtered = filtered.filter((i) => i.position === selectedPosition);
    }

    // Filter by derived status
    if (selectedStatusFilter) {
      filtered = filtered.filter((i) => {
        const displayStatus = getDisplayStatus(i.status, i.startTime);
        return displayStatus.label === selectedStatusFilter;
      });
    }

    // Filter by search term (candidate name)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((i) =>
        i.candidateName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredInterviews(filtered);
  }, [interviews, selectedPosition, searchTerm, selectedStatusFilter]);



  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-600">Loading scheduled interviews...</div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Toolbar */}
      <div className="flex flex-col gap-4 mb-6">
        {/* Row 1: Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Row 2: Filters (Position + Status) */}
        <div className="flex flex-col md:flex-row gap-3">
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">All Positions</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>

          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">All Statuses</option>
            <option value="Upcoming">Upcoming</option>
            <option value="Awaiting Feedback">Awaiting Feedback</option>
            <option value="Accepted">Accepted</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Interviews — card list on mobile, table on lg+ */}
      <div className="rounded-xl shadow-lg bg-white overflow-hidden">
        {filteredInterviews.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">No scheduled interviews found</div>
          </div>
        ) : (
          <>
            {/* ── Mobile / tablet card layout (hidden on lg+) ── */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredInterviews.map((interview) => {
                const displayStatus = getDisplayStatus(interview.status, interview.startTime);
                return (
                  <div key={interview.id} className="p-4 space-y-3">
                    {/* Row 1: avatar + name + status */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-sm font-semibold text-gray-900 truncate">
                          {interview.candidateName}
                        </span>
                      </div>
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${displayStatus.colorClasses} flex-shrink-0`}
                      >
                        {displayStatus.label}
                      </span>
                    </div>

                    {/* Row 2: details grid */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                      <div>
                        <span className="font-medium text-gray-500 uppercase tracking-wide text-[10px]">Email</span>
                        <p className="truncate">{interview.candidateEmail}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 uppercase tracking-wide text-[10px]">Position</span>
                        <p className="truncate">{interview.position}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 uppercase tracking-wide text-[10px]">Interviewer</span>
                        <p className="truncate">{interview.interviewer?.email ?? "—"}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-500 uppercase tracking-wide text-[10px]">Date & Time</span>
                        <p>{formatDateTime(interview.startTime)}</p>
                      </div>
                    </div>

                    {/* Row 3: mode badge + feedback button */}
                    <div className="flex items-center justify-between">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          interview.mode === "google_meet"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {interview.mode === "google_meet" ? "Google Meet" : "On-site"}
                      </span>
                      {["accepted", "rejected"].includes(interview.status) ? (
                        <button
                          onClick={() => { setSelectedInterview(interview); setFeedbackModalOpen(true); }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md transition"
                        >
                          <MessageSquare className="w-3 h-3" />
                          View Feedback
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Desktop table (hidden below lg) ── */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Candidate</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Position</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Interviewer</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">Date & Time</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Mode</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredInterviews.map((interview) => {
                    const displayStatus = getDisplayStatus(interview.status, interview.startTime);
                    return (
                      <tr key={interview.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <span className="text-sm font-medium text-gray-900">{interview.candidateName}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[160px]">
                          <span className="text-sm text-gray-600 block truncate">{interview.candidateEmail}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[160px]">
                          <span className="text-sm text-gray-700 block truncate">{interview.position}</span>
                        </td>
                        <td className="px-4 py-3 max-w-[160px]">
                          <span className="text-sm text-gray-600 block truncate">
                            {interview.interviewer?.email ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-sm text-gray-600">{formatDateTime(interview.startTime)}</span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              interview.mode === "google_meet" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {interview.mode === "google_meet" ? "Google Meet" : "On-site"}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-semibold rounded-full ${displayStatus.colorClasses} max-w-[120px] text-center`}>
                            {displayStatus.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {["accepted", "rejected"].includes(interview.status) ? (
                            <button
                              onClick={() => { setSelectedInterview(interview); setFeedbackModalOpen(true); }}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md transition"
                            >
                              <MessageSquare className="w-3 h-3" />
                              View
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Feedback Modal */}
      {selectedInterview && (
        <FeedbackViewerModal
          open={feedbackModalOpen}
          onClose={() => {
            setFeedbackModalOpen(false);
            setSelectedInterview(null);
          }}
          interviewId={selectedInterview.id}
          candidateName={selectedInterview.candidateName}
          position={selectedInterview.position}
        />
      )}
    </div>
  );
}

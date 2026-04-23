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
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);

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

  // Filter interviews based on search and position
  useEffect(() => {
    let filtered = [...interviews];

    // Filter by position
    if (selectedPosition) {
      filtered = filtered.filter((i) => i.position === selectedPosition);
    }

    // Filter by search term (candidate name)
    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((i) =>
        i.candidateName.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredInterviews(filtered);
  }, [interviews, selectedPosition, searchTerm]);

  const getStatusColor = (status) => {
    const statusMap = {
      scheduled: "bg-blue-100 text-blue-800",
      interviewed: "bg-green-100 text-green-800",
      accepted: "bg-emerald-100 text-emerald-800",
      rejected: "bg-red-100 text-red-800",
      cancelled: "bg-gray-100 text-gray-500",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
  };

  const getStatusLabel = (status) => {
    const labelMap = {
      scheduled: "Scheduled",
      interviewed: "Interviewed",
      accepted: "Accepted",
      rejected: "Rejected",
      cancelled: "Cancelled",
    };
    return labelMap[status] || status;
  };

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

        {/* Position Dropdown */}
        <div className="flex gap-3 mt-3 md:mt-0">
          <select
            value={selectedPosition}
            onChange={(e) => setSelectedPosition(e.target.value)}
            className="px-4 py-3 rounded-xl border border-gray-300 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
          >
            <option value="">All Positions</option>
            {positions.map((position) => (
              <option key={position} value={position}>
                {position}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Interviews Table */}
      <div className="rounded-xl shadow-lg bg-white overflow-hidden">
        {filteredInterviews.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">No scheduled interviews found</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                    Candidate
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                    Position
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                    Date & Time
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide whitespace-nowrap">
                    Feedback
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInterviews.map((interview) => (
                  <tr key={interview.id} className="hover:bg-gray-50 transition-colors">
                    {/* Candidate Name */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-xs font-semibold text-gray-700 flex-shrink-0">
                          {interview.candidateName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {interview.candidateName}
                        </span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600 truncate max-w-xs">
                        {interview.candidateEmail}
                      </span>
                    </td>

                    {/* Position */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-700">
                        {interview.position}
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-sm text-gray-600">
                        {formatDateTime(interview.startTime)}
                      </span>
                    </td>

                    {/* Mode */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          interview.mode === "google_meet"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {interview.mode === "google_meet" ? "Google Meet" : "On-site"}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(interview.status)}`}
                      >
                        {getStatusLabel(interview.status)}
                      </span>
                    </td>

                    {/* Feedback Button */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {["interviewed", "accepted", "rejected"].includes(interview.status) ? (
                        <button
                          onClick={() => {
                            setSelectedInterview(interview);
                            setFeedbackModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 px-2 py-1 rounded-md transition whitespace-nowrap"
                        >
                          <MessageSquare className="w-3 h-3" />
                          View
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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

import { useState, useEffect } from "react";
import { CalendarIcon, ExternalLinkIcon } from "lucide-react";
import api from "../../../api";
import { ACCESS_TOKEN } from "../../../constants";

export default function ScheduledInterviewsTab() {
  const [interviews, setInterviews] = useState([]);
  const [filteredInterviews, setFilteredInterviews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPosition, setSelectedPosition] = useState("");
  const [loading, setLoading] = useState(true);
  const [positions, setPositions] = useState([]);

  // Fetch scheduled interviews
  useEffect(() => {
    const fetchScheduledInterviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem(ACCESS_TOKEN);

        const response = await api.get("/interview?status=scheduled", {
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
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return statusMap[status] || "bg-gray-100 text-gray-800";
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
      <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
        {filteredInterviews.length === 0 ? (
          <div className="flex justify-center items-center py-12">
            <div className="text-gray-600">No scheduled interviews found</div>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  Candidate Name
                </th>
                <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  Mode
                </th>
                <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
                  Meet Link
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInterviews.map((interview) => (
                <tr
                  key={interview.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                      {interview.candidateName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <span className="text-gray-900 font-medium">
                      {interview.candidateName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {interview.candidateEmail}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {interview.position}
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {formatDateTime(interview.startTime)}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-medium rounded-full ${
                        interview.mode === "google_meet"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {interview.mode === "google_meet" ? "Google Meet" : "On-site"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {interview.meetLink ? (
                      <a
                        href={interview.meetLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <ExternalLinkIcon className="w-4 h-4" />
                        Join
                      </a>
                    ) : (
                      <span className="text-gray-400">N/A</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

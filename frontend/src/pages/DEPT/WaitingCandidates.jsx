import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";

const WaitingCandidates = () => {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWaiting = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        const res = await api.get("/interview/waiting", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data.data || [];
        setCandidates(data);
        const initial = {};
        data.forEach((c) => { initial[c.id] = c.interviewFeedback || ""; });
        setFeedbacks(initial);
      } catch (err) {
        console.error(err);
        setError("Failed to load waiting candidates.");
      } finally {
        setLoading(false);
      }
    };
    fetchWaiting();
  }, []);

  const handleDecision = async (interviewId, status) => {
    setActionLoading(interviewId);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      await api.post(
        "/interview/finish-interview",
        {
          interviewId,
          interviewStatus: status,
          interviewFeedback: feedbacks[interviewId] || "",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCandidates((prev) => prev.filter((c) => c.id !== interviewId));
    } catch (err) {
      console.error("Decision failed:", err);
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight">
            Waiting Candidates
          </h1>
          <p className="text-neutral-500 text-[15px] mt-1">
            Review feedback and make a final decision — you can update the feedback before deciding
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 rounded-xl p-6 text-center">
            {error}
          </div>
        ) : candidates.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-lg font-semibold text-gray-700">No waiting candidates</p>
            <p className="text-sm text-gray-400 mt-1">
              Candidates you mark as "Waiting" after an interview will appear here.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center font-semibold text-gray-600 text-sm flex-shrink-0">
                      {candidate.candidateName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-900 text-base">
                        {candidate.candidateName}
                      </p>
                      <p className="text-sm text-gray-500">{candidate.candidateEmail}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-medium">
                      Waiting
                    </span>
                    {candidate.hasCvProfile && candidate.resumeId ? (
                      <button
                        onClick={() => navigate(`/dept/dashboard/candidates/profile/${candidate.resumeId}`)}
                        className="px-3 py-1 rounded-full border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition"
                      >
                        View Profile
                      </button>
                    ) : candidate.resumeUrl ? (
                      <a
                        href={candidate.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 rounded-full border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition"
                      >
                        View Resume
                      </a>
                    ) : null}
                  </div>
                </div>

                {/* Job Info */}
                <div className="flex flex-wrap gap-4 mb-5 text-sm text-gray-500">
                  <span>
                    <span className="font-medium text-gray-700">Position:</span>{" "}
                    {candidate.position}
                  </span>
                  <span>
                    <span className="font-medium text-gray-700">Department:</span>{" "}
                    {candidate.department}
                  </span>
                  <span>
                    <span className="font-medium text-gray-700">Interviewed:</span>{" "}
                    {new Date(candidate.scheduledAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Editable Feedback */}
                <div className="mb-5">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-2">
                    Interview Feedback
                  </label>
                  <textarea
                    rows={4}
                    value={feedbacks[candidate.id] ?? ""}
                    onChange={(e) =>
                      setFeedbacks((prev) => ({ ...prev, [candidate.id]: e.target.value }))
                    }
                    placeholder="Update your feedback before making a decision..."
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 leading-relaxed resize-none focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 transition"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2 justify-end">
                  <button
                    disabled={actionLoading === candidate.id}
                    onClick={() => handleDecision(candidate.id, "accepted")}
                    className="px-4 py-1.5 rounded-md border border-green-200 bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition disabled:opacity-50"
                  >
                    {actionLoading === candidate.id ? "Saving..." : "Accept"}
                  </button>
                  <button
                    disabled={actionLoading === candidate.id}
                    onClick={() => handleDecision(candidate.id, "rejected")}
                    className="px-4 py-1.5 rounded-md border border-red-200 bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition disabled:opacity-50"
                  >
                    {actionLoading === candidate.id ? "Saving..." : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WaitingCandidates;

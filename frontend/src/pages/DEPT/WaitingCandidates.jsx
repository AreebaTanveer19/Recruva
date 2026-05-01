import { useState, useEffect } from "react";
import { Dialog, DialogContent, IconButton, CircularProgress } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";

// ── Reusable profile sub-components ───────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="mb-10">
    <div className="flex items-center gap-4 mb-5">
      <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400">{title}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
    {children}
  </div>
);

const SkillChip = ({ label }) => (
  <span className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full">{label}</span>
);

const TimelineItem = ({ title, subtitle, meta, description }) => (
  <div className="relative pl-6 pb-8 last:pb-0">
    <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200" />
    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-gray-900 border-2 border-white ring-1 ring-gray-300" />
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <p className="font-semibold text-gray-900 text-sm leading-snug">{title}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {meta && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap">{meta}</span>}
    </div>
    {description && <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>}
  </div>
);

const ProjectCard = ({ project }) => (
  <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-gray-400 hover:shadow-md transition-all">
    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
      <p className="font-semibold text-gray-900 text-sm">{project.name || project.title}</p>
      <div className="flex items-center gap-2">
        {project.technologies && (
          <span className="text-[11px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">{project.technologies}</span>
        )}
        {project.link && (
          <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-gray-900 transition">
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
    {project.description && <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>}
  </div>
);

// ── Profile modal ──────────────────────────────────────────────────────────────
const CandidateProfileModal = ({ resumeId, onClose }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!resumeId) return;
    setLoading(true);
    setError(null);
    api.get(`/application/resume/${resumeId}/profile`)
      .then(res => setProfile(res.data.data))
      .catch(() => setError("Profile not found or unavailable."))
      .finally(() => setLoading(false));
  }, [resumeId]);

  const renderBody = () => {
    if (loading) return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress size={36} sx={{ color: "#000" }} />
      </div>
    );
    if (error || !profile) return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-gray-500">{error}</p>
      </div>
    );

    const { parsedData, candidateName } = profile;
    const { basicInfo, experienceSummary, skills = [], experience = [], education = [], projects = [], certifications = [] } = parsedData;
    const name     = basicInfo?.name || candidateName || "Candidate";
    const email    = basicInfo?.email;
    const phone    = basicInfo?.phone;
    const location = basicInfo?.location;

    return (
      <div className="py-6 px-4 sm:px-6">
        {/* Hero */}
        <div className="bg-gray-900 text-white rounded-2xl px-8 py-10 mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5" />
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold text-white mb-5">
              {name.split(" ").map(n => n[0]).slice(0, 2).join("")}
            </div>
            <h2 className="text-2xl font-bold tracking-tight mb-1">{name}</h2>
            <div className="flex flex-wrap gap-4 mt-3">
              {email    && <span className="inline-flex items-center gap-1.5 text-sm text-gray-300"><Mail    className="w-3.5 h-3.5" />{email}</span>}
              {phone    && <span className="inline-flex items-center gap-1.5 text-sm text-gray-300"><Phone   className="w-3.5 h-3.5" />{phone}</span>}
              {location && <span className="inline-flex items-center gap-1.5 text-sm text-gray-300"><MapPin  className="w-3.5 h-3.5" />{location}</span>}
            </div>
            {experienceSummary && (
              <p className="mt-5 text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-5">{experienceSummary}</p>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-10">
          {skills.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">{skills.map((s, i) => <SkillChip key={i} label={s} />)}</div>
            </Section>
          )}
          {experience.length > 0 && (
            <Section title="Experience">
              {experience.map((e, i) => <TimelineItem key={i} title={e.position || e.role} subtitle={e.company} meta={e.duration} description={e.description} />)}
            </Section>
          )}
          {education.length > 0 && (
            <Section title="Education">
              {education.map((e, i) => <TimelineItem key={i} title={e.degree} subtitle={e.institution} meta={e.year} />)}
            </Section>
          )}
          {projects.length > 0 && (
            <Section title="Projects">
              <div className="grid gap-4 sm:grid-cols-2">{projects.map((p, i) => <ProjectCard key={i} project={p} />)}</div>
            </Section>
          )}
          {certifications.length > 0 && (
            <Section title="Certifications">
              <div className="divide-y divide-gray-100">
                {certifications.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{c.name}</p>
                      <p className="text-xs text-gray-500">{c.issuer || c.authority}</p>
                    </div>
                    {(c.date || c.year) && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">{c.date || c.year}</span>}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={!!resumeId} onClose={onClose} fullWidth maxWidth="md" PaperProps={{ sx: { borderRadius: 3, maxHeight: "90vh" } }}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <p className="text-base font-semibold text-gray-900">Candidate Profile</p>
        <IconButton size="small" onClick={onClose}><CloseIcon fontSize="small" /></IconButton>
      </div>
      <DialogContent sx={{ p: 0, overflowY: "auto" }}>
        {renderBody()}
      </DialogContent>
    </Dialog>
  );
};

// ── Main page ──────────────────────────────────────────────────────────────────
const WaitingCandidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [feedbacks, setFeedbacks] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const [profileResumeId, setProfileResumeId] = useState(null);

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
                        onClick={() => setProfileResumeId(candidate.resumeId)}
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

      <CandidateProfileModal
        resumeId={profileResumeId}
        onClose={() => setProfileResumeId(null)}
      />
    </div>
  );
};

export default WaitingCandidates;

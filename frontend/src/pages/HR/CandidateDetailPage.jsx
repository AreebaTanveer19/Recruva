import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FileText, User } from "lucide-react";
import api from "./../../api";

// ─── helpers ──────────────────────────────────────────────────────────────────

const isProfileData = (r) => r.resume?.originalName === "Profile Data";

const STATUS_COLORS = {
  pending:     "bg-yellow-100 text-yellow-800 border border-yellow-300",
  reviewed:    "bg-blue-100 text-blue-800 border border-blue-300",
  shortlisted: "bg-green-100 text-green-800 border border-green-300",
  rejected:    "bg-red-100 text-red-800 border border-red-300",
  accepted:    "bg-purple-100 text-purple-800 border border-purple-300",
};

const STATUSES = ["pending", "reviewed", "shortlisted", "rejected", "accepted"];

const scoreColor = (s) => {
  if (s >= 80) return { bar: "bg-green-500", text: "text-green-700", ring: "ring-green-200" };
  if (s >= 60) return { bar: "bg-yellow-400", text: "text-yellow-700", ring: "ring-yellow-200" };
  return { bar: "bg-red-400", text: "text-red-600", ring: "ring-red-200" };
};

const initials = (name = "") =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

// ─── small section wrapper ─────────────────────────────────────────────────────

function Section({ title, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-100">
        {title}
      </h3>
      {children}
    </div>
  );
}

// ─── score breakdown ──────────────────────────────────────────────────────────

function ScoreBreakdown({ scoreBreakdown, totalScore }) {
  const isUnmet = totalScore === -1;
  
  if (isUnmet) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-red-900">Does not meet minimum criteria</p>
            <p className="text-xs text-red-700 mt-1 leading-relaxed">
              This candidate does not meet the minimum CGPA requirements for the job.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!scoreBreakdown) return <p className="text-sm text-gray-400 italic">No score data available.</p>;

  const entries = Object.entries(scoreBreakdown);
  const total = totalScore != null ? Math.round(totalScore) : null;
  const colors = total != null ? scoreColor(total) : scoreColor(0);

  return (
    <div>
      {/* overall score circle */}
      {total != null && (
        <div className="flex items-center gap-4 mb-5">
          <div className={`w-16 h-16 rounded-full ring-4 ${colors.ring} flex items-center justify-center flex-shrink-0`}>
            <span className={`text-xl font-bold ${colors.text}`}>{total}%</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-700">Overall match score</p>
            <p className="text-xs text-gray-400 mt-0.5">
              {total >= 80 ? "Strong match" : total >= 60 ? "Moderate match" : "Weak match"}
            </p>
          </div>
        </div>
      )}

      {/* per-criteria breakdown */}
      <div className="space-y-3">
        {entries.map(([key, val]) => {
          const criteriaScore = Math.round(val.score ?? 0);
          const weight        = val.weight != null ? Math.round(val.weight * 100) : null;
          const c             = scoreColor(criteriaScore);
          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700 capitalize">{key}</span>
                <div className="flex items-center gap-2">
                  {weight != null && (
                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      weight {weight}%
                    </span>
                  )}
                  <span className={`text-xs font-semibold ${c.text}`}>{criteriaScore}%</span>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${c.bar} transition-all duration-500`}
                  style={{ width: `${criteriaScore}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── cv sections ──────────────────────────────────────────────────────────────

function ExperienceSummary({ summary }) {
  if (!summary) return <p className="text-sm text-gray-400 italic">No summary available.</p>;
  return <p className="text-sm text-gray-600 leading-relaxed">{summary}</p>;
}

function EducationList({ education }) {
  if (!education?.length) return <p className="text-sm text-gray-400 italic">No education data.</p>;
  return (
    <div className="space-y-3">
      {education.map((e, i) => (
        <div key={i} className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M12 14l9-5-9-5-9 5 9 5z" strokeWidth="2"/>
              <path d="M12 14l6.16-3.422A12 12 0 0112 21a12 12 0 01-6.16-10.422L12 14z" strokeWidth="2"/>
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{e.degree}</p>
            <p className="text-xs text-gray-500">{e.institution}</p>
            <div className="flex items-center gap-3 mt-0.5">
              {e.year && <span className="text-xs text-gray-400">{e.year}</span>}
              {e.cgpa && (
                <span className="text-xs bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded-full font-medium">
                  CGPA {e.cgpa}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ExperienceList({ experience }) {
  if (!experience?.length) return <p className="text-sm text-gray-400 italic">No experience data.</p>;
  return (
    <div className="space-y-4">
      {experience.map((e, i) => (
        <div key={i} className="relative pl-4 border-l-2 border-gray-200">
          <p className="text-sm font-medium text-gray-900">{e.position}</p>
          <p className="text-xs font-medium text-gray-600">{e.company}</p>
          {e.duration && (
            <p className="text-xs text-gray-400 mt-0.5">{e.duration}</p>
          )}
          {e.description && (
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">{e.description}</p>
          )}
        </div>
      ))}
    </div>
  );
}

function SkillsList({ skills }) {
  if (!skills?.length) return <p className="text-sm text-gray-400 italic">No skills listed.</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((s, i) => (
        <span key={i} className="text-xs bg-gray-100 text-gray-700 border border-gray-200 px-2.5 py-1 rounded-full font-medium">
          {s}
        </span>
      ))}
    </div>
  );
}

function ProjectsList({ projects }) {
  if (!projects?.length) return <p className="text-sm text-gray-400 italic">No projects listed.</p>;
  return (
    <div className="space-y-4">
      {projects.map((p, i) => (
        <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
          <p className="text-sm font-medium text-gray-900">{p.name}</p>
          {p.description && (
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{p.description}</p>
          )}
          {p.technologies && (
            <p className="text-xs text-gray-400 mt-1.5">
              <span className="font-medium text-gray-500">Tech: </span>{p.technologies}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

function CertificationsList({ certifications }) {
  if (!certifications?.length) return <p className="text-sm text-gray-400 italic">No certifications.</p>;
  return (
    <div className="space-y-2">
      {certifications.map((c, i) => (
        <div key={i} className="flex items-start justify-between gap-3 py-1.5 border-b border-gray-50 last:border-b-0">
          <div>
            <p className="text-sm font-medium text-gray-900">{c.name}</p>
            {c.issuer && <p className="text-xs text-gray-400">{c.issuer}</p>}
          </div>
          {c.date && <span className="text-xs text-gray-400 flex-shrink-0">{c.date}</span>}
        </div>
      ))}
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

function CandidateDetailPage() {
  const { id } = useParams();           // application id from URL
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [cvData, setCvData]           = useState(null);
  const [loading, setLoading]         = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [currentStatus, setCurrentStatus] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // adjust endpoints as needed
        const appRes = await api.get(`/application/${id}`);
        const app    = appRes.data.application;
        setApplication(app);
        setCurrentStatus(app.status);
          setCvData(app.resume?.parsedData ?? null);
        
      } catch (err) {
        console.error("Error fetching application detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const updateStatus = async (newStatus) => {
    if (newStatus === currentStatus) return;
    setStatusLoading(true);
    try {
      await api.patch(`/application/${id}/status`, { status: newStatus }); // adjust
      setCurrentStatus(newStatus);
      setApplication((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Status update failed:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-sm text-gray-500 animate-pulse">Loading candidate profile...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-sm text-gray-400">Application not found.</p>
      </div>
    );
  }

  const { candidate, job, score, scoreBreakdown, appliedAt, resume } = application;
  const totalScore = score != null ? Math.round(score) : null;
  const isUnmetCriteria = totalScore === -1;
  const colors = !isUnmetCriteria && totalScore != null ? scoreColor(totalScore) : null;

  // resume parsedData lives on the Resume model; CV data from CvData model
  const parsed = cvData ?? resume?.parsedData ?? null;

  return (
    <div className="flex-1 py-8 px-4 sm:px-6 md:px-10 overflow-y-auto bg-gray-100 min-h-screen">

      {/* back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition mb-5"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to applications
      </button>

      {/* ── header card ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {/* avatar */}
          <div className="w-14 h-14 rounded-full bg-gray-900 text-white flex items-center justify-center text-lg font-bold flex-shrink-0">
            {initials(candidate?.name)}
          </div>

          {/* basic info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900">{candidate?.name}</h2>
            <p className="text-sm text-gray-500">{candidate?.email}</p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className="text-xs bg-gray-100 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-full">
                {job?.title}
              </span>
              <span className="text-xs bg-gray-100 text-gray-500 border border-gray-200 px-2.5 py-1 rounded-full">
                {job?.department}
              </span>
              <span className="text-xs text-gray-400">
                Applied {new Date(appliedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </span>
            </div>
          </div>

          {/* score badge */}
          {totalScore != null && (
            isUnmetCriteria ? (
              <div className="flex flex-col items-center justify-center w-16 h-16 rounded-full ring-4 ring-red-200 bg-red-50 flex-shrink-0">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-[9px] text-red-600 mt-1 font-semibold">Unmet</span>
              </div>
            ) : (
              <div className={`flex flex-col items-center justify-center w-16 h-16 rounded-full ring-4 ${colors.ring} flex-shrink-0`}>
                <span className={`text-xl font-bold leading-none ${colors.text}`}>{totalScore}%</span>
                <span className="text-[9px] text-gray-400 mt-0.5">match</span>
              </div>
            )
          )}
        </div>

        {/* status controls */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center gap-2">
          <span className="text-xs text-gray-500 font-medium mr-1">Status:</span>
          {STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => updateStatus(s)}
              disabled={statusLoading}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition capitalize ${
                currentStatus === s
                  ? STATUS_COLORS[s]
                  : "bg-white text-gray-400 border-gray-200 hover:border-gray-400 hover:text-gray-700"
              } disabled:opacity-50`}
            >
              {s}
            </button>
          ))}
          {resume && (
            isProfileData(application) ? (
              <button
                onClick={() => navigate(`/hr/candidates/profile/${resume.id}`)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium transition"
              >
                <User className="w-3.5 h-3.5" />
                View Profile
              </button>
            ) : (
              <a
                href={resume.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 hover:bg-black text-white text-xs font-medium transition"
              >
                <FileText className="w-3.5 h-3.5" />
                View Resume
              </a>
            )
          )}
        </div>
      </div>

      {/* ── main grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* left col — score + skills + certs */}
        <div className="flex flex-col gap-5">
          <Section title="AI Match Score">
            <ScoreBreakdown scoreBreakdown={scoreBreakdown} totalScore={score} />
          </Section>

          <Section title="Skills">
            <SkillsList skills={parsed?.skills} />
          </Section>

          <Section title="Certifications">
            <CertificationsList certifications={parsed?.certifications} />
          </Section>
        </div>

        {/* right col — summary + experience + education + projects */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <Section title="Experience Summary">
            <ExperienceSummary summary={parsed?.experienceSummary} />
          </Section>

          <Section title="Work Experience">
            <ExperienceList experience={parsed?.experience} />
          </Section>

          <Section title="Education">
            <EducationList education={parsed?.education} />
          </Section>

          <Section title="Projects">
            <ProjectsList projects={parsed?.projects} />
          </Section>
        </div>

      </div>
    </div>
  );
}

export default CandidateDetailPage;
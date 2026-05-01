// src/pages/hr/CandidateProfilePage.jsx
// Route: /hr/candidates/profile/:resumeId

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import api from "../../api";

// ── Section wrapper ────────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="mb-0">
    <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6">
      <span className="text-[11px] sm:text-xs font-bold tracking-[0.15em] sm:tracking-[0.2em] uppercase text-gray-400 whitespace-nowrap">{title}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
    {children}
  </div>
);

// ── Skill chip ─────────────────────────────────────────────────────────────────
const SkillChip = ({ label }) => (
  <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-gray-900 text-white text-xs sm:text-sm font-medium rounded-full hover:bg-gray-800 transition">
    {label}
  </span>
);

// ── Timeline item (experience / education) ─────────────────────────────────────
const TimelineItem = ({ title, subtitle, meta, description }) => (
  <div className="relative pl-5 sm:pl-6 pb-6 sm:pb-8 last:pb-0">
    {/* vertical line */}
    <div className="absolute left-1.5 sm:left-2 top-3 bottom-0 w-px bg-gray-200 last:hidden" />
    {/* dot */}
    <div className="absolute left-0 sm:left-0.5 top-3 w-3 h-3 sm:w-3 sm:h-3 rounded-full bg-gray-900 border-2 border-white ring-1 ring-gray-300" />
    <div className="flex items-start justify-between gap-3 sm:gap-4 flex-wrap">
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-gray-900 text-sm sm:text-base leading-snug">{title}</p>
        {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {meta && (
        <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md whitespace-nowrap flex-shrink-0">
          {meta}
        </span>
      )}
    </div>
    {description && (
      <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-gray-600 leading-relaxed">{description}</p>
    )}
  </div>
);

// ── Project card ───────────────────────────────────────────────────────────────
const ProjectCard = ({ project }) => (
  <div className="p-4 sm:p-5 rounded-lg sm:rounded-2xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-md transition-all">
    <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
      <p className="font-semibold text-gray-900 text-sm sm:text-base">{project.name || project.title}</p>
      <div className="flex items-center gap-2 flex-shrink-0">
        {project.technologies && (
          <span className="text-[10px] sm:text-[11px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
            {project.technologies}
          </span>
        )}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-900 transition p-1 hover:bg-gray-100 rounded-md"
          >
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </a>
        )}
      </div>
    </div>
    {project.description && (
      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{project.description}</p>
    )}
  </div>
);

// ── Main page ──────────────────────────────────────────────────────────────────
export default function CandidateProfilePage() {
  const { resumeId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/application/resume/${resumeId}/profile`);
        setProfile(res.data.data);
      } catch (err) {
        setError("Profile not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [resumeId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-400 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center gap-4 px-4">
        <p className="text-sm text-gray-500 text-center">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-gray-900 underline underline-offset-4 hover:text-gray-700"
        >
          Go back
        </button>
      </div>
    );
  }

  const { parsedData, candidateName } = profile;
  const {
    basicInfo,
    experienceSummary,
    skills        = [],
    experience    = [],
    education     = [],
    projects      = [],
    certifications = [],
  } = parsedData;

  const name     = basicInfo?.name     || candidateName || "Candidate";
  const email    = basicInfo?.email;
  const phone    = basicInfo?.phone;
  const location = basicInfo?.location;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-900 transition mb-6 sm:mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back
      </button>

      <div className="mx-auto w-full max-w-6xl">
        {/* ── Hero header ── */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl sm:rounded-3xl px-6 sm:px-10 py-8 sm:py-12 mb-6 sm:mb-8 relative overflow-hidden shadow-lg">
          {/* decorative background circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5" />

          <div className="relative">
            {/* Avatar initials */}
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-lg sm:text-xl font-bold text-white mb-5 tracking-tight flex-shrink-0">
              {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight mb-1">{name}</h1>

            {/* Contact row */}
            <div className="flex flex-wrap gap-3 sm:gap-4 mt-3 sm:mt-4">
              {email && (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                  <Mail className="w-4 h-4 flex-shrink-0" /><span className="truncate">{email}</span>
                </span>
              )}
              {phone && (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                  <Phone className="w-4 h-4 flex-shrink-0" />{phone}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm text-gray-300">
                  <MapPin className="w-4 h-4 flex-shrink-0" />{location}
                </span>
              )}
            </div>

            {/* Summary */}
            {experienceSummary && (
              <p className="mt-5 sm:mt-6 text-xs sm:text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-5 sm:pt-6">
                {experienceSummary}
              </p>
            )}
          </div>
        </div>

        {/* ── Body card ── */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-gray-200 shadow-sm px-6 sm:px-8 lg:px-10 py-8 sm:py-10 lg:py-12 space-y-8 sm:space-y-10">

          {/* Skills */}
          {skills.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {skills.map((skill, i) => <SkillChip key={i} label={skill} />)}
              </div>
            </Section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <Section title="Experience">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {experience.map((exp, i) => (
                  <TimelineItem
                    key={i}
                    title={exp.position || exp.role}
                    subtitle={exp.company}
                    meta={exp.duration}
                    description={exp.description}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <Section title="Education">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                {education.map((edu, i) => (
                  <TimelineItem
                    key={i}
                    title={edu.degree}
                    subtitle={edu.institution}
                    meta={edu.year}
                  />
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Section title="Projects">
              <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {projects.map((proj, i) => <ProjectCard key={i} project={proj} />)}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <Section title="Certifications">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {certifications.map((cert, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 p-4 rounded-lg border border-gray-100 bg-gray-50 hover:bg-white hover:border-gray-200 transition">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{cert.name}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{cert.issuer || cert.authority}</p>
                    </div>
                    {(cert.date || cert.year) && (
                      <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-md whitespace-nowrap flex-shrink-0">
                        {cert.date || cert.year}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
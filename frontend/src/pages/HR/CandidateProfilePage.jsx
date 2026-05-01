// src/pages/hr/CandidateProfilePage.jsx
// Route: /hr/candidates/profile/:resumeId

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Mail, Phone, ExternalLink } from "lucide-react";
import api from "../../api";

// ── Section wrapper ────────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div className="mb-10">
    <div className="flex items-center gap-4 mb-5">
      <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-gray-400">{title}</span>
      <div className="flex-1 h-px bg-gray-200" />
    </div>
    {children}
  </div>
);

// ── Skill chip ─────────────────────────────────────────────────────────────────
const SkillChip = ({ label }) => (
  <span className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-full">
    {label}
  </span>
);

// ── Timeline item (experience / education) ─────────────────────────────────────
const TimelineItem = ({ title, subtitle, meta, description }) => (
  <div className="relative pl-6 pb-8 last:pb-0">
    {/* vertical line */}
    <div className="absolute left-0 top-2 bottom-0 w-px bg-gray-200 last:hidden" />
    {/* dot */}
    <div className="absolute left-[-4px] top-2 w-2 h-2 rounded-full bg-gray-900 border-2 border-white ring-1 ring-gray-300" />
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <p className="font-semibold text-gray-900 text-sm leading-snug">{title}</p>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {meta && (
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md whitespace-nowrap flex-shrink-0">
          {meta}
        </span>
      )}
    </div>
    {description && (
      <p className="mt-2 text-sm text-gray-600 leading-relaxed">{description}</p>
    )}
  </div>
);

// ── Project card ───────────────────────────────────────────────────────────────
const ProjectCard = ({ project }) => (
  <div className="p-5 rounded-2xl border border-gray-200 bg-white hover:border-gray-400 hover:shadow-md transition-all">
    <div className="flex items-start justify-between gap-3 mb-2 flex-wrap">
      <p className="font-semibold text-gray-900 text-sm">{project.name || project.title}</p>
      <div className="flex items-center gap-2">
        {project.technologies && (
          <span className="text-[11px] text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
            {project.technologies}
          </span>
        )}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-gray-900 transition"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>
    </div>
    {project.description && (
      <p className="text-sm text-gray-600 leading-relaxed">{project.description}</p>
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
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-sm text-gray-400 animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-500">{error}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-sm font-semibold text-gray-900 underline underline-offset-4"
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
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 md:px-10">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-900 transition mb-8 group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Back to Finalised Candidates
      </button>

      <div className="max-w-3xl mx-auto">
        {/* ── Hero header ── */}
        <div className="bg-gray-900 text-white rounded-2xl px-8 py-10 mb-8 relative overflow-hidden">
          {/* decorative background circles */}
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
          <div className="absolute -bottom-16 -left-8 w-64 h-64 rounded-full bg-white/5" />

          <div className="relative">
            {/* Avatar initials */}
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl font-bold text-white mb-5 tracking-tight">
              {name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
            </div>

            <h1 className="text-2xl font-bold tracking-tight mb-1">{name}</h1>

            {/* Contact row */}
            <div className="flex flex-wrap gap-4 mt-3">
              {email && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
                  <Mail className="w-3.5 h-3.5" />{email}
                </span>
              )}
              {phone && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
                  <Phone className="w-3.5 h-3.5" />{phone}
                </span>
              )}
              {location && (
                <span className="inline-flex items-center gap-1.5 text-sm text-gray-300">
                  <MapPin className="w-3.5 h-3.5" />{location}
                </span>
              )}
            </div>

            {/* Summary */}
            {experienceSummary && (
              <p className="mt-5 text-sm text-gray-300 leading-relaxed border-t border-white/10 pt-5">
                {experienceSummary}
              </p>
            )}
          </div>
        </div>

        {/* ── Body card ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm px-8 py-10">

          {/* Skills */}
          {skills.length > 0 && (
            <Section title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, i) => <SkillChip key={i} label={skill} />)}
              </div>
            </Section>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <Section title="Experience">
              {experience.map((exp, i) => (
                <TimelineItem
                  key={i}
                  title={exp.position || exp.role}
                  subtitle={exp.company}
                  meta={exp.duration}
                  description={exp.description}
                />
              ))}
            </Section>
          )}

          {/* Education */}
          {education.length > 0 && (
            <Section title="Education">
              {education.map((edu, i) => (
                <TimelineItem
                  key={i}
                  title={edu.degree}
                  subtitle={edu.institution}
                  meta={edu.year}
                />
              ))}
            </Section>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <Section title="Projects">
              <div className="grid gap-4 sm:grid-cols-2">
                {projects.map((proj, i) => <ProjectCard key={i} project={proj} />)}
              </div>
            </Section>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <Section title="Certifications">
              <div className="divide-y divide-gray-100">
                {certifications.map((cert, i) => (
                  <div key={i} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{cert.name}</p>
                      <p className="text-xs text-gray-500">{cert.issuer || cert.authority}</p>
                    </div>
                    {(cert.date || cert.year) && (
                      <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
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
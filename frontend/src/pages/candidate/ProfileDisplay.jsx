import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';

const Background = ({ children }) => (
  <div className="relative min-h-screen overflow-hidden bg-[#030712]">
    <div className="absolute inset-0 bg-gradient-to-br from-[#040418] via-[#050d2c] to-[#051534]" />
    <div className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full bg-indigo-500/30 blur-[180px]" />
    <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-[200px]" />
    <div className="relative z-10 min-h-screen px-4 py-10 sm:px-8 lg:px-12">{children}</div>
  </div>
);

const SectionCard = ({ title, children }) => (
  <section className="rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-[0_35px_80px_rgba(4,7,29,0.08)]">
    <div className="flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    </div>
    <div className="mt-4 text-sm text-slate-600">{children}</div>
  </section>
);

const ProfileDisplay = ({ onEdit }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
          navigate('/candidate/auth');
          return;
        }

        const response = await api.get('/cv');

        if (response.data.success && response.data.data) {
          setProfileData(response.data.data);
        } else {
          setProfileData(null);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        if (err.response?.status === 401) {
          navigate('/candidate/auth');
        } else if (err.response?.status === 404) {
          setProfileData(null);
        } else {
          setError('Error loading profile data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const renderEmptyState = (message) => (
    <Background>
      <div className="mx-auto max-w-2xl rounded-[32px] border border-white/10 bg-white/95 p-10 text-center shadow-[0_35px_80px_rgba(4,7,29,0.12)]">
        <p className="text-base font-semibold text-slate-900">{message}</p>
        <button
          onClick={() => navigate('/candidate/profile')}
          className="mt-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:scale-[1.02]"
        >
          Go to profile
        </button>
      </div>
    </Background>
  );

  if (isLoading) {
    return (
      <Background>
        <div className="mx-auto max-w-4xl space-y-6">
          <div className="h-12 w-32 animate-pulse rounded-full bg-white/10" />
          <div className="h-36 animate-pulse rounded-[32px] bg-white/5" />
          <div className="grid gap-6 sm:grid-cols-2">
            {[...Array(4)].map((_, idx) => (
              <div key={idx} className="h-48 animate-pulse rounded-[28px] bg-white/5" />
            ))}
          </div>
        </div>
      </Background>
    );
  }

  if (error) {
    return renderEmptyState('We ran into an issue loading your profile. Please try again.');
  }

  if (!profileData) {
    return renderEmptyState('No profile data available yet. Complete your profile to get personalized matches.');
  }

  const {
    name,
    email,
    phone,
    address,
    skills = [],
    education = [],
    work_experience = [],
    projects = [],
    certifications = [],
  } = profileData;

  return (
    <Background>
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        <section className="rounded-[36px] border border-white/15 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 p-8 text-white shadow-[0_45px_90px_rgba(28,27,66,0.55)]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Recruva candidate profile</p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">{name || 'Candidate Name'}</h1>
              <p className="mt-1 text-white/80">{email || 'email@example.com'}</p>
            </div>
            <button
              onClick={() => (typeof onEdit === 'function' ? onEdit() : navigate('/candidate/profile'))}
              className="inline-flex items-center justify-center rounded-full bg-white/90 px-6 py-3 text-sm font-semibold text-indigo-700 shadow-xl shadow-indigo-900/30 transition hover:scale-[1.02]"
            >
              Edit profile
            </button>
          </div>

          {(phone || address) && (
            <div className="mt-8 grid gap-4 text-sm text-white/90 sm:grid-cols-2">
              {phone && (
                <div className="rounded-3xl border border-white/30 bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Phone</p>
                  <p className="mt-1 text-base font-semibold">{phone}</p>
                </div>
              )}
              {address && (
                <div className="rounded-3xl border border-white/30 bg-white/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-white/60">Location</p>
                  <p className="mt-1 text-base font-semibold">{address}</p>
                </div>
              )}
            </div>
          )}
        </section>

        <div className="space-y-6">
          {skills.length > 0 && (
            <SectionCard title="Skills">
              <div className="flex flex-wrap gap-3">
                {skills.map((skill, idx) => (
                  <span
                    key={`${skill}-${idx}`}
                    className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </SectionCard>
          )}

          {education.length > 0 && (
            <SectionCard title="Education">
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={`${edu.degree}-${idx}`} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <h3 className="text-base font-semibold text-slate-900">{edu.degree}</h3>
                    <p className="text-sm text-slate-500">{edu.institution}</p>
                    {edu.year && <p className="text-xs uppercase tracking-[0.2em] text-slate-400 mt-2">Class of {edu.year}</p>}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {work_experience.length > 0 && (
            <SectionCard title="Work Experience">
              <div className="space-y-4">
                {work_experience.map((work, idx) => (
                  <div key={`${work.role}-${idx}`} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">{work.role}</h3>
                        <p className="text-sm text-slate-500">{work.company}</p>
                      </div>
                      {work.duration && (
                        <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{work.duration}</span>
                      )}
                    </div>
                    {work.description && <p className="mt-3 text-sm leading-relaxed text-slate-600">{work.description}</p>}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {projects.length > 0 && (
            <SectionCard title="Projects">
              <div className="space-y-4">
                {projects.map((project, idx) => (
                  <div key={`${project.title}-${idx}`} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <h3 className="text-base font-semibold text-slate-900">{project.title}</h3>
                      {project.link && (
                        <a
                          href={project.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                          View project →
                        </a>
                      )}
                    </div>
                    {project.description && <p className="text-sm text-slate-600">{project.description}</p>}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}

          {certifications.length > 0 && (
            <SectionCard title="Certifications">
              <div className="space-y-4">
                {certifications.map((cert, idx) => (
                  <div key={`${cert.name}-${idx}`} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <h3 className="text-base font-semibold text-slate-900">{cert.name}</h3>
                    <p className="text-sm text-slate-500">{cert.authority}</p>
                    {cert.year && <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mt-2">Issued {cert.year}</p>}
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>
      </div>
    </Background>
  );
};

export default ProfileDisplay;

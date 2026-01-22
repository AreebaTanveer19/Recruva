import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {FiMapPin,FiPhone,FiMail,FiStar,FiBookOpen,FiBriefcase,FiLayers,FiAward} from 'react-icons/fi';
import Sidebar from '../../components/candidate/Sidebar';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';

const SectionBlock = ({ title, Icon, children }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon className="h-5 w-5 text-slate-500" />}
      <h2 className="text-base font-semibold tracking-tight text-slate-900">{title}</h2>
    </div>
    <div className="space-y-3 text-sm text-slate-700">{children}</div>
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
        setProfileData(response.data.success ? response.data.data : null);
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

  const containerClasses = 'bg-white text-slate-800';

  const renderEmptyState = (message) => (
    <div className={`${containerClasses} space-y-6`}>
      <p className="text-base font-semibold text-slate-900">{message}</p>
      <button
        onClick={() => navigate('/candidate/profile')}
        className="inline-flex items-center justify-center rounded-full border border-slate-900 px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
      >
        Go to profile
      </button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans">
        <div className="relative flex min-h-screen flex-col lg:flex-row">
          <Sidebar />
          <main className="w-full flex-1 overflow-x-hidden lg:pl-64">
            <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
              <div className="space-y-8">
                <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-200" />
                <div className="space-y-4">
                  {[...Array(3)].map((_, idx) => (
                    <div key={idx} className="h-40 w-full animate-pulse rounded-2xl bg-slate-100" />
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
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

  const displayName = name || 'Areeba Tanveer';
  const initials = displayName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <Sidebar />
        <main className="w-full flex-1 overflow-x-hidden lg:pl-64">
          <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="space-y-8">
              <header className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-slate-500">Profile</p>
                <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-900 text-lg font-semibold text-white shadow-sm">
                      {initials}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">{displayName}</h1>
                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 sm:text-sm">
                        <div className="flex items-center gap-1.5">
                          <FiMail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{email || 'email@example.com'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiMapPin className="h-3.5 w-3.5 text-slate-400" />
                          <span>{address || 'Location not provided'}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <FiPhone className="h-3.5 w-3.5 text-slate-400" />
                          <span>{phone || 'Phone not provided'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => (onEdit ? onEdit() : navigate('/candidate/profile'))}
                    className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    Edit profile
                  </button>
                </div>
              </header>

              {(skills.length > 0 || education.length > 0 || work_experience.length > 0 || projects.length > 0 || certifications.length > 0) && (
                <div className="space-y-6">
                  {skills.length > 0 && (
                    <SectionBlock title="Skills" Icon={FiStar}>
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill, idx) => (
                          <span
                            key={`${skill}-${idx}`}
                            className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 sm:text-sm"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </SectionBlock>
                  )}

                  {education.length > 0 && (
                    <SectionBlock title="Education" Icon={FiBookOpen}>
                      <ul className="space-y-4 border-l border-slate-200 pl-4 sm:space-y-5 sm:pl-6">
                        {education.map((edu, idx) => (
                          <li key={`${edu.degree}-${idx}`} className="relative pl-4">
                            <div className="absolute -left-2.5 top-2 h-3.5 w-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                            <p className="text-base font-semibold text-slate-900">{edu.degree}</p>
                            <p className="text-sm text-slate-600">{edu.institution}</p>
                            {edu.year && (
                              <p className="text-xs font-medium text-slate-400">Class of {edu.year}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </SectionBlock>
                  )}

                  {work_experience.length > 0 && (
                    <SectionBlock title="Experience" Icon={FiBriefcase}>
                      <ul className="space-y-4 border-l border-slate-200 pl-4 sm:space-y-5 sm:pl-6">
                        {work_experience.map((work, idx) => (
                          <li key={`${work.role}-${idx}`} className="relative pl-4">
                            <div className="absolute -left-2.5 top-2 h-3.5 w-3.5 rounded-full bg-blue-600 ring-4 ring-blue-100" />
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-base font-semibold text-slate-900">{work.role}</p>
                                <p className="text-sm text-slate-600">{work.company}</p>
                              </div>
                              {work.duration && (
                                <span className="text-xs font-medium text-slate-400">{work.duration}</span>
                              )}
                            </div>
                            {work.description && (
                              <p className="mt-1 text-sm leading-relaxed text-slate-600">{work.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </SectionBlock>
                  )}

                  {projects.length > 0 && (
                    <SectionBlock title="Projects" Icon={FiLayers}>
                      <ul className="space-y-4">
                        {projects.map((project, idx) => (
                          <li
                            key={`${project.title}-${idx}`}
                            className="rounded-xl bg-slate-50/80 p-4 sm:p-5"
                          >
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-base font-semibold text-slate-900">{project.title}</p>
                              {project.link && (
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-blue-800 underline decoration-blue-200 underline-offset-4 transition hover:text-blue-900"
                                >
                                  View project
                                </a>
                              )}
                            </div>
                            {project.description && (
                              <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </SectionBlock>
                  )}

                  {certifications.length > 0 && (
                    <SectionBlock title="Certifications" Icon={FiAward}>
                      <ul className="space-y-4">
                        {certifications.map((cert, idx) => (
                          <li
                            key={`${cert.name}-${idx}`}
                            className="rounded-xl bg-slate-50/80 p-4 sm:p-5"
                          >
                            <p className="text-base font-semibold text-slate-900">{cert.name}</p>
                            <p className="text-sm text-slate-600">{cert.authority}</p>
                            {cert.year && (
                              <p className="mt-1 text-xs font-medium text-slate-400">Issued {cert.year}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </SectionBlock>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ProfileDisplay;

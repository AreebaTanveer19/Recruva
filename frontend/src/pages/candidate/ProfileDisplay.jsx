import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMenu } from 'react-icons/fi';
import Sidebar from '../../components/candidate/Sidebar';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';

const InfoRow = ({ label, value }) => (
  <div className="space-y-1 text-sm">
    <span className="font-semibold text-slate-900">{label}</span>
    <p className="text-slate-600">{value || 'Not provided'}</p>
  </div>
);

const SectionBlock = ({ title, children }) => (
  <section className="space-y-3">
    <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-600">{title}</h2>
    {children}
  </section>
);



const ProfileDisplay = ({ onEdit }) => {
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

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
      <div className="min-h-screen bg-white">
        <div className="relative flex min-h-screen flex-col lg:flex-row">
          <Sidebar isMobileOpen={isSidebarOpen} onClose={closeSidebar} />
          <main className="flex-1 px-4 py-8 sm:px-8 lg:ml-64">
            <div className="h-6 w-24 animate-pulse bg-slate-200" />
            <div className="mt-4 h-4 w-full animate-pulse bg-slate-100" />
            <div className="mt-2 h-4 w-3/4 animate-pulse bg-slate-100" />
            <div className="mt-6 space-y-2">
              {[...Array(4)].map((_, idx) => (
                <div key={idx} className="h-4 w-full animate-pulse bg-slate-100" />
              ))}
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

  return (
    <div className="min-h-screen bg-white">
      <div className="relative flex min-h-screen flex-col lg:flex-row">
        <Sidebar isMobileOpen={isSidebarOpen} onClose={closeSidebar} />
        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={closeSidebar}
            aria-label="Close menu overlay"
          />
        )}

        <main className="flex-1 w-full overflow-x-hidden lg:pl-64">
          <div className="w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <button
                type="button"
                onClick={toggleSidebar}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <FiMenu className="h-4 w-4" />
                Menu
              </button>
            </div>
            
            <div className="space-y-6">
              <header className="border-b border-slate-200 pb-5 w-full">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.5em] text-slate-500">Profile</p>
                <div className="mt-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-slate-900 sm:text-3xl">{name || 'Candidate Name'}</h1>
                    <p className="text-sm text-slate-600">{email || 'email@example.com'}</p>
                  </div>
                  <button
                    onClick={() => (onEdit ? onEdit() : navigate('/candidate/profile'))}
                    className="self-start rounded-full border border-slate-900 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-900 hover:text-white"
                  >
                    Edit profile
                  </button>
                </div>
              </header>

              <div className="grid gap-y-4 gap-x-4 text-sm text-slate-600 sm:grid-cols-2 sm:gap-x-10">
                <InfoRow label="Name" value={name} />
                <InfoRow label="Email" value={email} />
                <InfoRow label="Phone" value={phone} />
                <InfoRow label="Location" value={address} />
              </div>

              {(skills.length > 0 || education.length > 0 || work_experience.length > 0 || projects.length > 0 || certifications.length > 0) && (
                <div className="space-y-5 text-sm text-slate-700">
                  {skills.length > 0 && (
                    <SectionBlock title="Skills">
                      <ul className="grid gap-y-2 gap-x-6 text-sm font-medium text-slate-800 sm:grid-cols-2">
                        {skills.map((skill, idx) => (
                          <li key={`${skill}-${idx}`} className="relative pl-4 text-slate-700 before:absolute before:left-0 before:top-2 before:h-1 before:w-1 before:rounded-full before:bg-slate-500">
                            {skill}
                          </li>
                        ))}
                      </ul>
                    </SectionBlock>
                  )}

                  {education.length > 0 && (
                    <SectionBlock title="Education">
                      <ul className="space-y-3">
                        {education.map((edu, idx) => (
                          <li key={`${edu.degree}-${idx}`} className="border-b border-slate-200 pb-3 last:border-none last:pb-0">
                            <p className="text-base font-semibold text-slate-900">{edu.degree}</p>
                            <p className="text-sm text-slate-600">{edu.institution}</p>
                            {edu.year && <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Class of {edu.year}</p>}
                          </li>
                        ))}
                      </ul>
                    </SectionBlock>
                  )}

                  {work_experience.length > 0 && (
                    <SectionBlock title="Experience">
                      <ul className="space-y-3">
                        {work_experience.map((work, idx) => (
                          <li key={`${work.role}-${idx}`} className="space-y-2 border-b border-slate-200 pb-3 last:border-none last:pb-0">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <p className="text-base font-semibold text-slate-900">{work.role}</p>
                                <p className="text-sm text-slate-600">{work.company}</p>
                              </div>
                              {work.duration && <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{work.duration}</span>}
                            </div>
                            {work.description && <p className="leading-relaxed text-slate-600">{work.description}</p>}
                          </li>
                        ))}
                      </ul>
                    </SectionBlock>
                  )}

                  {projects.length > 0 && (
                    <SectionBlock title="Projects">
                      <ul className="space-y-3">
                        {projects.map((project, idx) => (
                          <li key={`${project.title}-${idx}`} className="space-y-2 border-b border-slate-200 pb-3 last:border-none last:pb-0">
                            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                              <p className="text-base font-semibold text-slate-900">{project.title}</p>
                              {project.link && (
                                <a
                                  href={project.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-sm font-semibold text-slate-900 underline decoration-slate-400 decoration-2 underline-offset-4 transition hover:text-slate-600"
                                >
                                  View project
                                </a>
                              )}
                            </div>
                            {project.description && <p className="text-slate-600">{project.description}</p>}
                          </li>
                        ))}
                      </ul>
                    </SectionBlock>
                  )}

                  {certifications.length > 0 && (
                    <SectionBlock title="Certifications">
                      <ul className="space-y-3">
                        {certifications.map((cert, idx) => (
                          <li key={`${cert.name}-${idx}`} className="border-b border-slate-200 pb-3 last:border-none last:pb-0">
                            <p className="text-base font-semibold text-slate-900">{cert.name}</p>
                            <p className="text-sm text-slate-600">{cert.authority}</p>
                            {cert.year && <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Issued {cert.year}</p>}
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

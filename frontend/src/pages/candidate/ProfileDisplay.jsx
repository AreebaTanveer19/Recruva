import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';
import { ACCESS_TOKEN } from '../../constants';

const ProfileDisplay = () => {
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
          setProfileData(null); // No profile yet
        } else {
          setError('Error loading profile data');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-red-50 border border-red-200 rounded-md p-6">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">No profile data available. Please complete your profile.</p>
      </div>
    );
  }

  // Safe defaults for arrays to avoid mapping over null
  const {
    name,
    email,
    phone,
    address,
    skills = [],
    education = [],
    work_experience = [],
    projects = [],
    certifications = []
  } = profileData;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white">{name || 'Candidate Name'}</h1>
                <p className="text-blue-100 mt-1">{email || 'email@example.com'}</p>
              </div>
              <button
                onClick={() => navigate('/candidate/profile')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Contact Info */}
          {(phone || address) && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {phone && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Phone:</span>
                    <p className="text-gray-900">{phone}</p>
                  </div>
                )}
                {address && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Address:</span>
                    <p className="text-gray-900">{address}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, idx) => (
                  <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Education</h2>
              <div className="space-y-4">
                {education.map((edu, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">{edu.degree}</h3>
                    <p className="text-gray-600">{edu.institution}</p>
                    {edu.year && <p className="text-sm text-gray-500">Year: {edu.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {work_experience.length > 0 && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Work Experience</h2>
              <div className="space-y-4">
                {work_experience.map((work, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">{work.role}</h3>
                    <p className="text-gray-600">{work.company}</p>
                    {work.duration && <p className="text-sm text-gray-500">Duration: {work.duration}</p>}
                    {work.description && <p className="text-gray-700 mt-2">{work.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div className="px-6 py-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Projects</h2>
              <div className="space-y-4">
                {projects.map((project, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">{project.title}</h3>
                    {project.description && <p className="text-gray-700 mt-1">{project.description}</p>}
                    {project.link && (
                      <a
                        href={project.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                      >
                        View Project →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div className="px-6 py-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Certifications</h2>
              <div className="space-y-4">
                {certifications.map((cert, idx) => (
                  <div key={idx} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-900">{cert.name}</h3>
                    <p className="text-gray-600">{cert.authority}</p>
                    {cert.year && <p className="text-sm text-gray-500">Year: {cert.year}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileDisplay;

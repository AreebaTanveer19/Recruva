import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  FileText,
  ChevronDown,
  ChevronUp,
  Mail,
  Calendar,
} from 'lucide-react';
import { getJobApplications, updateApplicationStatus } from '../../applicationApi';
import api from '../../api';

const STATUS_OPTIONS = ['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'];

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
  shortlisted: 'bg-green-100 text-green-800 border-green-200',
  rejected: 'bg-red-100 text-red-800 border-red-200',
  accepted: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const JobApplications = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [jobTitle, setJobTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Fetch job title
        const jobRes = await api.get('/openJobs');
        const jobs = jobRes.data?.jobs || jobRes.data || [];
        const job = jobs.find((j) => j.id === Number(jobId));
        setJobTitle(job?.title || `Job #${jobId}`);

        // Fetch applications
        const data = await getJobApplications(jobId);
        setApplications(data.data || []);
      } catch (err) {
        console.error('Error fetching job applications:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [jobId]);

  const handleStatusChange = async (applicationId, newStatus) => {
    setUpdatingId(applicationId);
    try {
      const data = await updateApplicationStatus(applicationId, newStatus);
      setApplications((prev) =>
        prev.map((a) => (a.id === applicationId ? { ...a, status: data.data.status } : a))
      );
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const toggleExpand = (id) => setExpandedId((prev) => (prev === id ? null : id));

  /* Render parsed resume data sections */
  const renderParsedData = (parsedData) => {
    if (!parsedData) return <p className="text-sm text-slate-400 italic">No parsed data available</p>;

    return (
      <div className="space-y-4">
        {/* Basic Info */}
        {parsedData.basicInfo && (
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Basic Info</h5>
            <div className="grid grid-cols-2 gap-2 text-sm">
              {Object.entries(parsedData.basicInfo).map(([key, val]) => (
                <div key={key}>
                  <span className="text-slate-400 capitalize">{key}: </span>
                  <span className="text-slate-700">{val || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {parsedData.education?.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Education</h5>
            <div className="space-y-1.5">
              {parsedData.education.map((edu, i) => (
                <div key={i} className="text-sm text-slate-700">
                  <strong>{edu.degree}</strong> — {edu.institution} ({edu.year})
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Experience */}
        {parsedData.experience?.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Experience</h5>
            <div className="space-y-2">
              {parsedData.experience.map((exp, i) => (
                <div key={i} className="text-sm text-slate-700">
                  <strong>{exp.position}</strong> at {exp.company} ({exp.duration})
                  {exp.description && <p className="mt-0.5 text-slate-500">{exp.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills */}
        {parsedData.skills?.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills</h5>
            <div className="flex flex-wrap gap-1.5">
              {parsedData.skills.map((skill, i) => (
                <span key={i} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Projects */}
        {parsedData.projects?.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Projects</h5>
            <div className="space-y-1.5">
              {parsedData.projects.map((proj, i) => (
                <div key={i} className="text-sm text-slate-700">
                  <strong>{proj.name}</strong>{proj.technologies && ` (${proj.technologies})`}
                  {proj.description && <p className="mt-0.5 text-slate-500">{proj.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {parsedData.certifications?.length > 0 && (
          <div>
            <h5 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Certifications</h5>
            <div className="space-y-1">
              {parsedData.certifications.map((cert, i) => (
                <div key={i} className="text-sm text-slate-700">
                  {cert.name} — {cert.issuer} ({cert.date})
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Applications for {jobTitle}</h1>
        <p className="mt-1 text-sm text-slate-500">
          {applications.length} application{applications.length !== 1 ? 's' : ''} received
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <User size={48} className="mx-auto text-slate-300" />
          <h3 className="mt-4 text-base font-semibold text-slate-900">No applications yet</h3>
          <p className="mt-2 text-sm text-slate-500">
            No candidates have applied to this position yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div
              key={app.id}
              className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
            >
              {/* Header row */}
              <div
                className="flex items-center justify-between gap-4 p-5 cursor-pointer hover:bg-slate-50"
                onClick={() => toggleExpand(app.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 font-semibold text-sm">
                    {app.candidate?.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">
                      {app.candidate?.name || 'Unknown'}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Mail size={12} /> {app.candidate?.email}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} /> {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Status dropdown */}
                  <select
                    value={app.status}
                    onChange={(e) => {
                      e.stopPropagation();
                      handleStatusChange(app.id, e.target.value);
                    }}
                    onClick={(e) => e.stopPropagation()}
                    disabled={updatingId === app.id}
                    className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium capitalize cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${STATUS_COLORS[app.status] || ''} ${updatingId === app.id ? 'opacity-50' : ''}`}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>

                  {expandedId === app.id ? (
                    <ChevronUp size={18} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={18} className="text-slate-400" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {expandedId === app.id && (
                <div className="border-t border-slate-100 bg-slate-50 p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <FileText size={16} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {app.resume?.originalName || 'Resume'}
                    </span>
                    {app.resume?.uploadedAt && (
                      <span className="text-xs text-slate-400">
                        (uploaded {new Date(app.resume.uploadedAt).toLocaleDateString()})
                      </span>
                    )}
                  </div>
                  {renderParsedData(app.resume?.parsedData)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobApplications;

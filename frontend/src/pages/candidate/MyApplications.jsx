import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Briefcase,
  MapPin,
  Building2,
  CalendarDays,
  FileText,
  Clock3,
  ArrowRight,
} from 'lucide-react';
import Sidebar from '../../components/candidate/Sidebar';
import { getMyApplications } from '../../applicationApi';

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  // reviewed: 'bg-blue-100 text-blue-800',
  shortlisted: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  accepted: 'bg-emerald-100 text-emerald-800',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[status] || 'bg-slate-100 text-slate-800'}`}
  >
    {status}
  </span>
);

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const data = await getMyApplications();
        setApplications(data.data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const statuses = ['all', 'pending',  'shortlisted', 'rejected', 'accepted'];

  const filteredApplications = selectedStatus === 'all'
    ? applications
    : applications.filter((app) => app.status === selectedStatus);

  const getStatusCount = (status) => {
    if (status === 'all') return applications.length;
    return applications.filter((app) => app.status === status).length;
  };

  const getFilterButtonClass = (status) => {
    const baseClass = 'px-4 py-2 rounded-lg font-medium text-sm transition-colors';
    const selectedClass = selectedStatus === status
      ? 'bg-blue-600 text-white'
      : 'bg-slate-100 text-slate-700 hover:bg-slate-200';
    return `${baseClass} ${selectedClass}`;
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 lg:ml-64">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">My Applications</h1>
            <p className="mt-1 text-sm text-slate-500">
              Track the status of all your job applications.
            </p>
          </div>

          {/* Status Filters */}
          <div className="mb-6 flex flex-wrap gap-2">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={getFilterButtonClass(status)}
              >
                <span className="capitalize">{status}</span>
                <span className="ml-2 rounded-full bg-slate-200 px-2.5 py-0.5 text-xs font-semibold text-slate-700">
                  {getStatusCount(status)}
                </span>
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-28 animate-pulse rounded-xl border border-slate-200 bg-slate-100"
                />
              ))}
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
              <Briefcase size={48} className="mx-auto text-slate-300" />
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No applications found
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {selectedStatus === 'all'
                  ? 'Start applying to jobs from the dashboard to see them here.'
                  : `You have no applications with status "${selectedStatus}".`}
              </p>
              <button
                onClick={() => navigate('/candidate/dashboard')}
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((app) => (
                <div
                  key={app.id}
                  className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-base font-semibold text-slate-900 truncate">
                          {app.job?.title || 'Untitled Job'}
                        </h3>
                        <StatusBadge status={app.status} />
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                        {app.job?.department && (
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 size={14} className="text-slate-400" />
                            {app.job.department}
                          </span>
                        )}
                        {app.job?.location && (
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-400" />
                            {app.job.location}
                          </span>
                        )}
                        {app.job?.employmentType && (
                          <span className="inline-flex items-center gap-1.5">
                            <Briefcase size={14} className="text-slate-400" />
                            {app.job.employmentType}
                          </span>
                        )}
                        {app.job?.workMode && (
                          <span className="inline-flex items-center gap-1.5">
                            <Building2 size={14} className="text-slate-400" />
                            {app.job.workMode}
                          </span>
                        )}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={13} />
                          Applied {new Date(app.appliedAt).toLocaleDateString()}
                        </span>
                        {app.resume && (
                          <span className="inline-flex items-center gap-1.5">
                            <FileText size={13} />
                            {app.resume.originalName}
                          </span>
                        )}
                        {app.job?.deadline && (
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            Deadline {new Date(app.job.deadline).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/candidate/job/${app.job?.id}`)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                    >
                      View Job <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyApplications;

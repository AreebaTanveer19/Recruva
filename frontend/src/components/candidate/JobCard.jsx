import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiDollarSign, FiBriefcase, FiClock } from 'react-icons/fi';

const JobCard = ({ job }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Open: 'bg-green-100/70 text-green-700',
      Pending: 'bg-amber-100/70 text-amber-700',
      Closed: 'bg-rose-100/70 text-rose-700',
    };

    return (
      <span className={`text-xs font-semibold tracking-wide px-3 py-1 rounded-full shadow-sm ${statusMap[status] || 'bg-slate-100 text-slate-700'}`}>
        {status}
      </span>
    );
  };

  const navigate = useNavigate();

  return (
    <div className="rounded-[28px] border border-white/60 bg-[#f7f7f9] p-6 shadow-[0_25px_60px_rgba(15,23,42,0.08)] transition hover:-translate-y-1 hover:shadow-[0_35px_80px_rgba(15,23,42,0.16)]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">{job.department} dept.</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-900">{job.title}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
            <span className="inline-flex items-center gap-2">
              <FiMapPin className="text-indigo-500" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-2 text-slate-400">•</span>
            <span>{job.workMode}</span>
          </div>
        </div>
        {getStatusBadge(job.status)}
      </div>

      <div className="mt-6 space-y-3 text-sm text-slate-600">
        <div className="flex items-center">
          <FiBriefcase className="mr-2 text-indigo-500" />
          <span>{job.employmentType}</span>
        </div>
        <div className="flex items-center">
          <FiDollarSign className="mr-2 text-indigo-500" />
          <span>${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}/year</span>
        </div>
        {job.deadline && (
          <div className="flex items-center">
            <FiClock className="mr-2 text-indigo-500" />
            <span>Apply before {formatDate(job.deadline)}</span>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <span className="text-xs uppercase tracking-[0.3em] text-slate-400">Posted {formatDate(job.createdAt)}</span>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => navigate(`/candidate/job/${job.id}`)}
            className="rounded-full border border-slate-200 bg-white/80 px-5 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-white"
          >
            View details
          </button>
          <button
            onClick={() => navigate(`/candidate/job/${job.id}#apply`)}
            className="rounded-full bg-white/95 px-5 py-2 text-sm font-semibold text-indigo-600 shadow-lg shadow-indigo-200/60 transition hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            Apply now
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

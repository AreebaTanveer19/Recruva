import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Briefcase,
  Layers,
  CalendarDays,
  DollarSign,
  Clock3,
} from 'lucide-react';
import api from '../../api';

const Background = ({ children }) => (
  <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">{children}</div>
  </div>
);

const Card = ({ children, className = '' }) => {
  const base = 'rounded-xl border border-slate-200 bg-white shadow-sm';
  return <div className={`${base} ${className}`.trim()}>{children}</div>;
};

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <dt className="flex items-center gap-2 text-slate-500">
      {Icon && <Icon size={16} className="text-slate-400" />}
      <span>{label}</span>
    </dt>
    <dd className="font-medium text-slate-900">{value}</dd>
  </div>
);

const ActionCard = ({ title, description, actionLabel, onAction }) => (
  <Card className="p-5">
    <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
    {description && (
      <p className="mt-2 text-sm text-slate-500">{description}</p>
    )}
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
      >
        {actionLabel}
      </button>
    )}
  </Card>
);

const formatCurrency = (value) => {
  if (typeof value !== 'number') return '-';
  return value.toLocaleString();
};

const CandidateJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      setLoading(true);
      try {
        const response = await api.get('/openJobs');
        const payload = Array.isArray(response.data?.jobs)
          ? response.data.jobs
          : Array.isArray(response.data)
            ? response.data
            : [];
        const match = payload.find((entry) => entry.id === Number(id));
        setJob(match || null);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  const scrollToApply = () => {
    const target = document.getElementById('apply-section');
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  };

  const renderList = (items = [], title) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  };

  if (loading) {
    return (
      <Background>
        <div className="space-y-4">
          <div className="h-9 w-24 animate-pulse rounded-md bg-slate-200/80" />
          <Card className="h-32 animate-pulse bg-slate-100" />
          <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
            <Card className="h-64 animate-pulse bg-slate-100" />
            <Card className="h-64 animate-pulse bg-slate-100" />
          </div>
        </div>
      </Background>
    );
  }

  if (!job) {
    return (
      <Background>
        <Card className="mx-auto max-w-xl p-8 text-center">
          <p className="text-base font-semibold text-slate-900">We couldn't find that role.</p>
          <p className="mt-2 text-sm text-slate-600">
            It may have been closed or removed. Head back to the dashboard to continue exploring.
          </p>
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50"
          >
            Return to dashboard
          </button>
        </Card>
      </Background>
    );
  }

  const infoChips = [
    {
      label: 'Employment type',
      value: job.employmentType,
      icon: Briefcase,
    },
    {
      label: 'Experience',
      value: job.experienceLevel ? `${job.experienceLevel}+ years` : 'Not specified',
      icon: Layers,
    },
    {
      label: 'Salary range',
      value: job.salaryMin && job.salaryMax
        ? `$${formatCurrency(job.salaryMin)} - $${formatCurrency(job.salaryMax)}`
        : 'Not disclosed',
      icon: DollarSign,
    },
    {
      label: 'Work mode',
      value: job.workMode,
      icon: Building2,
    },
  ];

  return (
    <Background>
      <div className="space-y-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to jobs
        </button>

        <Card className="p-6 sm:p-8">
          <div className="flex flex-col gap-4">
            <div>
              <h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
                {job.title}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={16} className="text-slate-400" />
                  {job.location}
                </span>
                {job.workMode && (
                  <span className="inline-flex items-center gap-1.5">
                    <Building2 size={16} className="text-slate-400" />
                    {job.workMode}
                  </span>
                )}
                {job.employmentType && (
                  <span className="inline-flex items-center gap-1.5">
                    <Briefcase size={16} className="text-slate-400" />
                    {job.employmentType}
                  </span>
                )}
              </div>
            </div>

            <div className="grid gap-3 text-xs text-slate-500 sm:grid-cols-2">
              <div className="inline-flex items-center gap-2">
                <Clock3 size={16} className="text-slate-400" />
                <span>
                  Posted{' '}
                  {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
              {job.deadline && (
                <div className="inline-flex items-center gap-2">
                  <CalendarDays size={16} className="text-slate-400" />
                  <span>Apply by {new Date(job.deadline).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {infoChips.map(({ label, value, icon: Icon }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <Icon size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">{label}</p>
                    <p className="text-sm font-medium text-slate-900">{value || ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-6">
            {job.description && (
              <Card className="p-6">
                <h3 className="text-base font-semibold text-slate-900">Job description</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-700">{job.description}</p>
              </Card>
            )}

            {renderList(job.responsibilities, 'Responsibilities')}
            {renderList(job.requirements, 'Requirements')}

            <section id="apply-section" className="mt-2">
              <div className="rounded-xl border border-blue-100 bg-blue-50 px-6 py-5 sm:flex sm:items-center sm:justify-between sm:gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Ready to apply?</h3>
                  <p className="mt-1 text-sm text-slate-700">
                    Share your updated profile and resume so the hiring team can review your application.
                  </p>
                </div>
                <button
                  onClick={() => navigate('/candidate/profile')}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-50 sm:mt-0"
                >
                  Go to profile
                </button>
              </div>
            </section>
          </div>

          <div className="space-y-4 lg:pl-2">
            <div className="sticky top-4 space-y-4">
              <ActionCard
                title="Apply now"
                description={`Submit your application to join the ${job.department} team at Recruva.`}
                actionLabel="Start application"
                onAction={scrollToApply}
              />

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-slate-900">Role summary</h3>
                <dl className="mt-4 space-y-3">
                  <DetailRow
                    icon={Briefcase}
                    label="Employment"
                    value={job.employmentType || ''}
                  />
                  <DetailRow
                    icon={Layers}
                    label="Experience"
                    value={
                      job.experienceLevel
                        ? `${job.experienceLevel}+ yrs`
                        : 'Not specified'
                    }
                  />
                  <DetailRow
                    icon={DollarSign}
                    label="Salary"
                    value={
                      job.salaryMin && job.salaryMax
                        ? `$${formatCurrency(job.salaryMin)} - $${formatCurrency(job.salaryMax)}`
                        : 'Not disclosed'
                    }
                  />
                  <DetailRow
                    icon={CalendarDays}
                    label="Deadline"
                    value={
                      job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : 'Rolling'
                    }
                  />
                </dl>
              </Card>

              <Card className="p-5">
                <h3 className="text-sm font-semibold text-slate-900">Need support?</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Email careers@recruva.com for questions about the role, interview process, or accessibility requests.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default CandidateJobDetails;

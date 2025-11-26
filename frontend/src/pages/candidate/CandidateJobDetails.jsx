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
  <div className="relative min-h-screen overflow-hidden bg-[#030712]">
    <div className="absolute inset-0 bg-gradient-to-br from-[#040418] via-[#050d2c] to-[#051534]" />
    <div className="pointer-events-none absolute -top-24 right-[-10%] h-96 w-96 rounded-full bg-indigo-500/30 blur-[180px]" />
    <div className="pointer-events-none absolute bottom-[-10%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-blue-500/20 blur-[200px]" />
    <div className="relative z-10 min-h-screen px-4 py-10 sm:px-8 lg:px-12">{children}</div>
  </div>
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
      <section className="rounded-[28px] border border-white/10 bg-white/95 p-6 shadow-[0_35px_80px_rgba(4,7,29,0.12)]">
        <h3 className="text-lg font-semibold tracking-tight text-slate-900">{title}</h3>
        <ul className="mt-4 space-y-3 text-sm text-slate-600">
          {items.map((item, index) => (
            <li key={`${title}-${index}`} className="flex items-start gap-3 leading-relaxed">
              <span className="mt-1 inline-block h-2 w-2 rounded-full bg-indigo-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  };

  if (loading) {
    return (
      <Background>
        <div className="mx-auto max-w-6xl">
          <div className="space-y-6">
            <div className="h-12 w-32 animate-pulse rounded-full bg-white/10" />
            <div className="h-40 animate-pulse rounded-[32px] bg-white/5" />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="h-64 animate-pulse rounded-[32px] bg-white/5 lg:col-span-2" />
              <div className="h-64 animate-pulse rounded-[32px] bg-white/5" />
            </div>
          </div>
        </div>
      </Background>
    );
  }

  if (!job) {
    return (
      <Background>
        <div className="mx-auto max-w-4xl rounded-[32px] border border-white/10 bg-white/95 p-10 text-center shadow-[0_35px_80px_rgba(4,7,29,0.12)]">
          <p className="text-lg font-semibold text-slate-900">We couldn't find that role.</p>
          <p className="mt-2 text-sm text-slate-500">It may have been closed or removed. Head back to the dashboard to continue exploring.</p>
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="mt-6 rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:scale-[1.02]"
          >
            Return to dashboard
          </button>
        </div>
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
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <section className="rounded-[32px] border border-white/10 bg-white/95 p-8 text-slate-900 shadow-[0_35px_80px_rgba(4,7,29,0.12)]">
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-indigo-500/80">Recruva — {job.department} team</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{job.title}</h1>
                  <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-2">
                      <MapPin size={16} className="text-indigo-500" />
                      {job.location}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Building2 size={16} className="text-indigo-500" />
                      {job.workMode}
                    </span>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
                  <div className="inline-flex items-center gap-2">
                    <Clock3 size={16} className="text-indigo-500" />
                    Posted {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  {job.deadline && (
                    <div className="inline-flex items-center gap-2">
                      <CalendarDays size={16} className="text-indigo-500" />
                      Apply by {new Date(job.deadline).toLocaleDateString()}
                    </div>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {infoChips.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="rounded-3xl border border-slate-100 bg-slate-50/60 px-4 py-3">
                      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-400">{label}</span>
                      <div className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900">
                        <Icon size={16} className="text-indigo-500" />
                        {value || '—'}
                      </div>
                    </div>
                  ))}
                </div>

                {job.description && (
                  <div className="rounded-[28px] border border-slate-100 bg-white/90 p-6">
                    <h3 className="text-lg font-semibold tracking-tight text-slate-900">Description</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-600">{job.description}</p>
                  </div>
                )}
              </div>
            </section>

            {renderList(job.requirements, 'Requirements')}
            {renderList(job.responsibilities, 'Responsibilities')}

            <section
              id="apply-section"
              className="rounded-[32px] border border-white/10 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 p-8 text-white shadow-[0_45px_90px_rgba(28,27,66,0.55)]"
            >
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/70">Ready to apply?</p>
              <h3 className="mt-4 text-2xl font-semibold tracking-tight">Share your profile and get matched faster.</h3>
              <p className="mt-3 text-sm text-white/80">
                Upload a tailored resume, highlight your impact, and the hiring team will reach out if you’re a fit.
              </p>
              <button
                onClick={() => navigate('/candidate/profile')}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-white/90 px-8 py-3 text-sm font-semibold text-indigo-700 shadow-xl shadow-indigo-900/30"
              >
                Go to profile
              </button>
            </section>
          </div>

          <div className="space-y-6 lg:col-span-1">
            <div className="sticky top-6 space-y-6">
              <div className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-[0_35px_80px_rgba(4,7,29,0.12)]">
                <h3 className="text-lg font-semibold text-slate-900">Apply now</h3>
                <p className="mt-2 text-sm text-slate-500">Submit your application to join the {job.department} team at Recruva.</p>
                <button
                  onClick={scrollToApply}
                  className="mt-6 w-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition hover:scale-[1.02]"
                >
                  Start application
                </button>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-[0_35px_80px_rgba(4,7,29,0.12)]">
                <h3 className="text-lg font-semibold text-slate-900">Role summary</h3>
                <dl className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2">
                      <Briefcase size={16} className="text-indigo-500" />
                      Employment
                    </dt>
                    <dd className="font-semibold text-slate-900">{job.employmentType}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2">
                      <Layers size={16} className="text-indigo-500" />
                      Experience
                    </dt>
                    <dd className="font-semibold text-slate-900">{job.experienceLevel ? `${job.experienceLevel}+ yrs` : '—'}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2">
                      <DollarSign size={16} className="text-indigo-500" />
                      Salary
                    </dt>
                    <dd className="font-semibold text-slate-900">
                      {job.salaryMin && job.salaryMax
                        ? `$${formatCurrency(job.salaryMin)} - $${formatCurrency(job.salaryMax)}`
                        : 'Not disclosed'}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="flex items-center gap-2">
                      <CalendarDays size={16} className="text-indigo-500" />
                      Deadline
                    </dt>
                    <dd className="font-semibold text-slate-900">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-[32px] border border-white/10 bg-white/95 p-6 shadow-[0_35px_80px_rgba(4,7,29,0.12)]">
                <h3 className="text-lg font-semibold text-slate-900">Need support?</h3>
                <p className="mt-2 text-sm text-slate-500">
                  Email careers@recruva.com for questions about the role, interview process, or accessibility requests.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Background>
  );
};

export default CandidateJobDetails;

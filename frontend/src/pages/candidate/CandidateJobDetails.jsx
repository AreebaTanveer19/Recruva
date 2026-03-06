import React, { useEffect, useState, useRef } from 'react';
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
  Upload,
  FileText,
  CheckCircle2,
  Loader2,
  X,
} from 'lucide-react';
import api from '../../api';
import {
  checkApplicationStatus,
  getCandidateResumes,
  applyWithExistingResume,
  applyWithNewResume,
} from '../../applicationApi';

const Background = ({ children }) => (
  <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-6xl">{children}</div>
  </div>
);

const Card = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const DetailRow = ({ icon: Icon, label, value }) => (
  <div className="flex items-center justify-between gap-3 text-sm">
    <dt className="flex items-center gap-2 text-slate-500">
      {Icon && <Icon size={16} className="text-slate-400" />}
      <span>{label}</span>
    </dt>
    <dd className="font-medium text-slate-900">{value}</dd>
  </div>
);

const formatCurrency = (v) => (typeof v === 'number' ? v.toLocaleString() : '-');

/* ─── status badge ─── */
const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
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

/* ─── main component ─── */
const CandidateJobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // application state
  const [canApply, setCanApply] = useState(null);
  const [existingApplication, setExistingApplication] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [showResumePanel, setShowResumePanel] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  /* fetch job */
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get('/openJobs');
        const payload = Array.isArray(res.data?.jobs)
          ? res.data.jobs
          : Array.isArray(res.data)
            ? res.data
            : [];
        setJob(payload.find((j) => j.id === Number(id)) || null);
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /* check application status */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await checkApplicationStatus(id);
        setCanApply(data.canApply);
      } catch (err) {
        if (err.response?.status === 400) {
          setCanApply(false);
          setExistingApplication(err.response.data.application);
        }
      }
    })();
  }, [id]);

  /* open resume picker */
  const handleApplyWithCV = async () => {
    setApplyError('');
    setShowResumePanel(true);
    try {
      const data = await getCandidateResumes();
      setResumes(data.data || []);
    } catch {
      setResumes([]);
    }
  };

  /* submit with existing resume */
  const handleApplyExisting = async () => {
    if (!selectedResumeId) return;
    setApplying(true);
    setApplyError('');
    try {
      await applyWithExistingResume(Number(id), selectedResumeId);
      setApplySuccess('Application submitted successfully!');
      setCanApply(false);
      setShowResumePanel(false);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  /* submit with new file */
  const handleNewFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setApplying(true);
    setApplyError('');
    try {
      await applyWithNewResume(Number(id), file);
      setApplySuccess('Application submitted successfully!');
      setCanApply(false);
      setShowResumePanel(false);
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  /* navigate to profile-form application */
  const handleApplyWithProfile = () => {
    navigate(`/candidate/profile?applyJobId=${id}`);
  };

  const scrollToApply = () =>
    document.getElementById('apply-section')?.scrollIntoView({ behavior: 'smooth' });

  /* ─── render helpers ─── */
  const renderList = (items = [], title) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <Card className="p-6">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <ul className="mt-4 space-y-2 text-sm text-slate-700">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-slate-300" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </Card>
    );
  };

  /* ─── loading / not found ─── */
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
            className="mt-6 inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            Return to dashboard
          </button>
        </Card>
      </Background>
    );
  }

  const infoChips = [
    { label: 'Employment type', value: job.employmentType, icon: Briefcase },
    {
      label: 'Experience',
      value: job.experienceLevel ? `${job.experienceLevel}+ years` : 'Not specified',
      icon: Layers,
    },
    {
      label: 'Salary range',
      value:
        job.salaryMin && job.salaryMax
          ? `$${formatCurrency(job.salaryMin)} – $${formatCurrency(job.salaryMax)}`
          : 'Not disclosed',
      icon: DollarSign,
    },
    { label: 'Work mode', value: job.workMode, icon: Building2 },
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
              {infoChips.map((chip) => {
                const ChipIcon = chip.icon;
                return (
                <div
                  key={chip.label}
                  className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2"
                >
                  <ChipIcon size={18} className="text-slate-400" />
                  <div>
                    <p className="text-xs font-medium text-slate-500">{chip.label}</p>
                    <p className="text-sm font-medium text-slate-900">{chip.value || ''}</p>
                  </div>
                </div>
                );
              })}
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

            <section id="apply-section" className="mt-2 space-y-4">
              {applySuccess && (
                <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 px-5 py-4">
                  <CheckCircle2 size={20} className="text-green-600" />
                  <p className="text-sm font-medium text-green-800">{applySuccess}</p>
                </div>
              )}
              {canApply === false && !applySuccess && (
                <div className="flex items-center gap-3 rounded-xl border border-yellow-200 bg-yellow-50 px-5 py-4">
                  <CheckCircle2 size={20} className="text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">You have already applied to this position.</p>
                    {existingApplication && (
                      <p className="mt-1 text-xs text-yellow-700">Status: <StatusBadge status={existingApplication.status} /></p>
                    )}
                  </div>
                </div>
              )}
              {canApply === true && !applySuccess && (
                <div className="rounded-xl border border-blue-100 bg-blue-50 px-6 py-5">
                  <h3 className="text-sm font-semibold text-slate-900">Ready to apply?</h3>
                  <p className="mt-1 text-sm text-slate-700">Choose how you'd like to submit your application.</p>
                  {applyError && (
                    <div className="mt-3 rounded-lg bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">{applyError}</div>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    <button onClick={handleApplyWithCV} disabled={applying} className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
                      <Upload size={16} /> Apply with CV Upload
                    </button>
                    <button onClick={handleApplyWithProfile} disabled={applying} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50">
                      <FileText size={16} /> Apply with Profile Form
                    </button>
                  </div>
                </div>
              )}
              {showResumePanel && canApply && (
                <Card className="p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Select a resume or upload a new one</h3>
                    <button onClick={() => setShowResumePanel(false)} className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"><X size={16} /></button>
                  </div>
                  {resumes.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Your resumes</p>
                      {resumes.map((r) => (
                        <label key={r.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition ${selectedResumeId === r.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <input type="radio" name="resume" className="accent-blue-600" checked={selectedResumeId === r.id} onChange={() => setSelectedResumeId(r.id)} />
                          <FileText size={18} className="text-slate-400" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate">{r.originalName}</p>
                            <p className="text-xs text-slate-500">Uploaded {new Date(r.uploadedAt).toLocaleDateString()}</p>
                          </div>
                        </label>
                      ))}
                      <button onClick={handleApplyExisting} disabled={!selectedResumeId || applying} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 disabled:opacity-50">
                        {applying ? (<><Loader2 size={16} className="animate-spin" /> Submitting…</>) : 'Submit Application'}
                      </button>
                    </div>
                  )}
                  {resumes.length > 0 && (
                    <div className="my-4 flex items-center gap-3"><div className="h-px flex-1 bg-slate-200" /><span className="text-xs text-slate-400">or</span><div className="h-px flex-1 bg-slate-200" /></div>
                  )}
                  <div>
                    <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleNewFileUpload} />
                    <button onClick={() => fileInputRef.current?.click()} disabled={applying} className="inline-flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-600 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-50">
                      {applying ? (<><Loader2 size={16} className="animate-spin" /> Processing & submitting…</>) : (<><Upload size={18} /> Upload new resume (PDF, DOC, DOCX — max 5 MB)</>)}
                    </button>
                  </div>
                </Card>
              )}
            </section>
          </div>

          <div className="space-y-4 lg:pl-2">
            <div className="sticky top-4 space-y-4">
              {canApply === true && !applySuccess ? (
                <Card className="p-5">
                  <h3 className="text-sm font-semibold text-slate-900">Apply now</h3>
                  <p className="mt-2 text-sm text-slate-500">Submit your application to join the {job.department} team at Recruva.</p>
                  <button onClick={scrollToApply} className="mt-4 inline-flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700">Start application</button>
                </Card>
              ) : (
                <Card className="p-5">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-green-600" />
                    <h3 className="text-sm font-semibold text-slate-900">{applySuccess ? 'Applied' : 'Already applied'}</h3>
                  </div>
                  <p className="mt-2 text-sm text-slate-500">Your application is being reviewed by the hiring team.</p>
                </Card>
              )}

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
                        ? `$${formatCurrency(job.salaryMin)} – $${formatCurrency(job.salaryMax)}`
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

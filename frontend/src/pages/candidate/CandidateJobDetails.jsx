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
  User,
  ChevronRight,
  History,
  ExternalLink,
  RefreshCw,
  Globe,
  GraduationCap,
  BadgeDollarSign,
  Timer,
  Eye,
  ChevronDown,
} from 'lucide-react';
import api from '../../api';
import {
  checkApplicationStatus,
  getCandidateResumes,
  checkHasPreviousResume,
  applyWithExistingResume,
  applyWithNewResume,
  applyWithProfileData,
  getPreviousProfileData,
} from '../../applicationApi';

const formatCurrency = (v) => (typeof v === 'number' ? v.toLocaleString() : '-');

const timeAgo = (dateStr) => {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? 's' : ''} ago`;
};

/* ─── status badge ─── */
const STATUS_COLORS = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  reviewed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  shortlisted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  rejected: 'bg-red-50 text-red-700 ring-red-600/20',
  accepted: 'bg-green-50 text-green-700 ring-green-600/20',
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${STATUS_COLORS[status] || 'bg-slate-50 text-slate-700 ring-slate-600/20'}`}
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
  const [applying, setApplying] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [applySuccess, setApplySuccess] = useState('');

  // multi-step apply dialog state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyStep, setApplyStep] = useState('choose-source');
  const [hasProfileData, setHasProfileData] = useState(false);
  const [hasPreviousResume, setHasPreviousResume] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [previousProfileData, setPreviousProfileData] = useState(null);
  const [previousSubmittedAt, setPreviousSubmittedAt] = useState(null);
  const [loadingPreviousData, setLoadingPreviousData] = useState(false);
  const [showPreviousPreview, setShowPreviousPreview] = useState(false);

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

  /* check application status + profile + previous resume */
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const data = await checkApplicationStatus(id);
        setCanApply(data.canApply);
      } catch (err) {
        if (err.response?.status === 400) {
          setCanApply(false);
        } else {
          setCanApply(true);
        }
      }

      try {
        const cvRes = await api.get('/cv');
        setHasProfileData(!!(cvRes.data?.data));
      } catch {
        setHasProfileData(false);
      }

      try {
        const prevRes = await checkHasPreviousResume();
        setHasPreviousResume(prevRes.hasPrevious);
      } catch {
        setHasPreviousResume(false);
      }
    })();
  }, [id]);

  /* open the apply modal */
  const handleApplyClick = () => {
    setApplyError('');
    setApplyStep('choose-source');
    setSelectedResumeId(null);
    setShowApplyModal(true);
  };

  /* close modal */
  const closeModal = () => {
    setShowApplyModal(false);
    setApplyStep('choose-source');
    setApplyError('');
    setSelectedResumeId(null);
  };

  const handleChooseProfile = async () => {
    setApplyError('');
    setApplyStep('profile-confirm');
    setShowPreviousPreview(false);
    setLoadingPreviousData(true);
    try {
      const data = await getPreviousProfileData();
      setPreviousProfileData(data.previousData);
      setPreviousSubmittedAt(data.previousSubmittedAt);
    } catch {
      setPreviousProfileData(null);
    } finally {
      setLoadingPreviousData(false);
    }
  };

  const handleProfileChanged = async () => {
    setApplying(true);
    setApplyError('');
    try {
      await applyWithProfileData(Number(id), true);
      setApplySuccess('Application submitted successfully!');
      setCanApply(false);
      closeModal();
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleProfileNotChanged = async () => {
    setApplying(true);
    setApplyError('');
    try {
      await applyWithProfileData(Number(id), false);
      setApplySuccess('Application submitted successfully!');
      setCanApply(false);
      closeModal();
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleChooseResume = async () => {
    if (hasPreviousResume) {
      setApplyStep('resume-options');
    } else {
      setApplyStep('upload-resume');
    }
  };

  const handleUsePreviousResume = async () => {
    setApplyStep('select-resume');
    try {
      const data = await getCandidateResumes();
      setResumes(data.data || []);
    } catch {
      setResumes([]);
    }
  };

  const handleUploadNewResume = () => {
    setApplyStep('upload-resume');
  };

  const handleSubmitExistingResume = async () => {
    if (!selectedResumeId) return;
    setApplying(true);
    setApplyError('');
    try {
      await applyWithExistingResume(Number(id), selectedResumeId);
      setApplySuccess('Application submitted successfully!');
      setCanApply(false);
      closeModal();
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  const handleNewFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setApplying(true);
    setApplyError('');
    try {
      await applyWithNewResume(Number(id), file);
      setApplySuccess('Application submitted successfully!');
      setCanApply(false);
      closeModal();
    } catch (err) {
      setApplyError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  /* ─── render helpers ─── */
  const renderSection = (items = [], title) => {
    if (!Array.isArray(items) || items.length === 0) return null;
    return (
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <span className="inline-block h-5 w-1 rounded-full bg-blue-600" />
          {title}
        </h2>
        <ul className="mt-4 space-y-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed text-slate-700">
              <span className="mt-2 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-blue-400" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  /* ─── loading skeleton ─── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
        <div className="h-48 animate-pulse bg-gradient-to-r from-slate-200 to-slate-100" />
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="h-36 animate-pulse rounded-2xl bg-white shadow-lg" />
          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-6">
              <div className="h-64 animate-pulse rounded-2xl bg-white shadow-sm" />
              <div className="h-48 animate-pulse rounded-2xl bg-white shadow-sm" />
            </div>
            <div className="h-80 animate-pulse rounded-2xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    );
  }

  /* ─── not found ─── */
  if (!job) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <div className="mx-auto max-w-md text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Briefcase size={28} className="text-slate-400" />
          </div>
          <h2 className="mt-5 text-xl font-semibold text-slate-900">Role not found</h2>
          <p className="mt-2 text-sm text-slate-500 leading-relaxed">
            This position may have been closed or removed. Head back to explore other opportunities.
          </p>
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 transition-all hover:shadow-lg"
          >
            Browse open roles
          </button>
        </div>
      </div>
    );
  }

  const salaryText =
    job.salaryMin && job.salaryMax
      ? `$${formatCurrency(job.salaryMin)} – $${formatCurrency(job.salaryMax)}`
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      {/* ─── Hero banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-2 text-sm text-blue-200">
              <button
                onClick={() => navigate('/candidate/dashboard')}
                className="hover:text-white transition-colors"
              >
                Jobs
              </button>
              <ChevronRight size={14} className="text-blue-300" />
              <span className="text-white/90 truncate max-w-xs">{job.title}</span>
            </nav>
            <button
              onClick={() => navigate('/candidate/dashboard')}
              className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 backdrop-blur-sm transition-all"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* ─── Main card overlapping hero ─── */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-14 relative z-10">
        <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4 min-w-0">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                <Building2 size={24} />
              </div>
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-[28px]">
                  {job.title}
                </h1>
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-500">
                  {job.department && (
                    <span className="font-medium text-slate-700">{job.department}</span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} className="text-slate-400" />
                    {job.location}
                  </span>
                  {job.workMode && (
                    <span className="inline-flex items-center gap-1.5">
                      <Globe size={14} className="text-slate-400" />
                      {job.workMode}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5">
                    <Clock3 size={14} className="text-slate-400" />
                    Posted {timeAgo(job.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* CTA buttons (desktop) */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              {canApply === true && !applySuccess && (
                <button
                  onClick={handleApplyClick}
                  disabled={applying}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all disabled:opacity-50"
                >
                  <Briefcase size={16} />
                  Apply Now
                </button>
              )}
              {(canApply === false || applySuccess) && (
                <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                  <CheckCircle2 size={16} />
                  {applySuccess ? 'Applied' : 'Already Applied'}
                </span>
              )}
            </div>
          </div>

          {/* Tags row */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            {job.employmentType && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/10">
                <Briefcase size={12} />
                {job.employmentType}
              </span>
            )}
            {job.experienceLevel && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-50 px-3 py-1.5 text-xs font-medium text-purple-700 ring-1 ring-inset ring-purple-600/10">
                <GraduationCap size={12} />
                {job.experienceLevel}+ years
              </span>
            )}
            {salaryText && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/10">
                <BadgeDollarSign size={12} />
                {salaryText}
              </span>
            )}
            {job.deadline && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/10">
                <Timer size={12} />
                Apply by {new Date(job.deadline).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* ─── Content grid ─── */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px] pb-16">
          {/* ─── Left column: Job content ─── */}
          <div>
            {job.description && (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <span className="inline-block h-5 w-1 rounded-full bg-blue-600" />
                  About this role
                </h2>
                <div className="mt-4 text-[15px] leading-[1.75] text-slate-600 whitespace-pre-line">
                  {job.description}
                </div>

                {renderSection(job.responsibilities, 'Key Responsibilities')}
                {renderSection(job.requirements, 'Requirements')}
              </div>
            )}


          </div>

          {/* ─── Right column: Sidebar ─── */}
          <div className="space-y-5 lg:sticky lg:top-6 lg:self-start">
            {/* Apply card */}
            {canApply === null && !applySuccess ? (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Loader2 size={18} className="animate-spin text-blue-500" />
                  <span className="text-sm font-medium text-slate-500">Checking eligibility…</span>
                </div>
              </div>
            ) : canApply === true && !applySuccess ? (
              <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
                <h3 className="text-base font-semibold text-slate-900">Apply for this job</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Join {job.department ? `the ${job.department} team` : 'our team'} and make an impact.
                </p>
                <button
                  onClick={handleApplyClick}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 hover:shadow-lg transition-all"
                >
                  <Briefcase size={16} />
                  Apply Now
                </button>
                <p className="mt-3 text-center text-xs text-slate-400">
                  {job.deadline
                    ? `Applications close ${new Date(job.deadline).toLocaleDateString()}`
                    : 'Applications accepted on a rolling basis'}
                </p>
              </div>
            ) : (canApply === false || applySuccess) ? (
              <div className="rounded-2xl border border-emerald-200/60 bg-gradient-to-b from-emerald-50 to-white p-6 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">
                      {applySuccess ? 'Application Sent' : 'Already Applied'}
                    </h3>
                    <p className="text-xs text-slate-500">Under review by hiring team</p>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/candidate/applications')}
                  className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition"
                >
                  View My Applications
                  <ChevronRight size={14} />
                </button>
              </div>
            ) : null}

            {/* Role details */}
            <div className="rounded-2xl border border-slate-200/60 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Role Details</h3>
              <div className="mt-4 divide-y divide-slate-100">
                {[
                  { icon: Briefcase, label: 'Employment', value: job.employmentType },
                  { icon: Layers, label: 'Experience', value: job.experienceLevel ? `${job.experienceLevel}+ years` : 'Not specified' },
                  { icon: MapPin, label: 'Location', value: job.location },
                  { icon: Globe, label: 'Work Mode', value: job.workMode },
                  { icon: DollarSign, label: 'Compensation', value: salaryText || 'Not disclosed' },
                  { icon: CalendarDays, label: 'Deadline', value: job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Rolling' },
                ].map((row) => {
                  const RowIcon = row.icon;
                  return (
                    <div key={row.label} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                        <RowIcon size={15} className="text-slate-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-slate-400">{row.label}</p>
                        <p className="text-sm font-medium text-slate-800 truncate">{row.value || '—'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>


          </div>
        </div>
      </div>

      {/* ─── Mobile sticky bottom CTA ─── */}
      {canApply === true && !applySuccess && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-lg sm:hidden">
          <button
            onClick={handleApplyClick}
            disabled={applying}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Briefcase size={16} />
            Apply Now
          </button>
        </div>
      )}

      {/* ─── Apply Modal ─── */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div
            className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl ring-1 ring-black/5 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {applyStep === 'choose-source' && 'Apply for this position'}
                    {applyStep === 'profile-confirm' && 'Confirm profile data'}
                    {applyStep === 'resume-options' && 'Choose resume'}
                    {applyStep === 'select-resume' && 'Select a resume'}
                    {applyStep === 'upload-resume' && 'Upload resume'}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{job.title}</p>
                </div>
                <button
                  onClick={closeModal}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 max-h-[60vh] overflow-y-auto">
              {applyError && (
                <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <X size={16} className="shrink-0 text-red-400" />
                  {applyError}
                </div>
              )}

              {/* Step 1: Choose source */}
              {applyStep === 'choose-source' && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 mb-4">How would you like to submit your application?</p>

                  {hasProfileData && (
                    <button
                      onClick={handleChooseProfile}
                      disabled={applying}
                      className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-blue-300 hover:shadow-md disabled:opacity-50"
                    >
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                        {applying ? <Loader2 size={20} className="animate-spin" /> : <User size={20} />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-900">Apply with Profile</p>
                        <p className="text-xs text-slate-500 mt-0.5">Use your saved profile information</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </button>
                  )}

                  <button
                    onClick={handleChooseResume}
                    disabled={applying}
                    className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-300 hover:shadow-md disabled:opacity-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Upload size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Upload Resume</p>
                      <p className="text-xs text-slate-500 mt-0.5">PDF, DOC, or DOCX file</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </button>

                  {!hasProfileData && (
                    <p className="text-xs text-slate-400 mt-3 text-center">
                      Want to apply with your profile?{' '}
                      <button onClick={() => navigate('/candidate/profile')} className="text-blue-600 hover:underline font-medium">
                        Complete your profile
                      </button>
                    </p>
                  )}
                </div>
              )}

              {/* Profile confirm step */}
              {applyStep === 'profile-confirm' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Have you updated your profile since your last application?</p>

                  {/* Previous data preview */}
                  {loadingPreviousData ? (
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Loader2 size={16} className="animate-spin text-blue-500" />
                      <span className="text-xs text-slate-400">Loading previous data…</span>
                    </div>
                  ) : previousProfileData && (
                    <div className="rounded-xl border border-slate-200 bg-slate-50/50 overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setShowPreviousPreview(!showPreviousPreview)}
                        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-slate-100/50 transition"
                      >
                        <div className="flex items-center gap-2">
                          <Eye size={15} className="text-blue-500" />
                          <span className="text-xs font-semibold text-slate-700">
                            Previously submitted data
                          </span>
                          {previousSubmittedAt && (
                            <span className="text-[10px] text-slate-400">
                              ({new Date(previousSubmittedAt).toLocaleDateString()})
                            </span>
                          )}
                        </div>
                        <ChevronDown
                          size={14}
                          className={`text-slate-400 transition-transform duration-200 ${showPreviousPreview ? 'rotate-180' : ''}`}
                        />
                      </button>

                      {showPreviousPreview && (
                        <div className="border-t border-slate-200 px-4 py-3 space-y-3 max-h-64 overflow-y-auto text-xs">
                          {/* Name & Contact */}
                          {(previousProfileData.name || previousProfileData.email || previousProfileData.phone) && (
                            <div>
                              <p className="font-semibold text-slate-600 uppercase tracking-wider mb-1" style={{ fontSize: '10px' }}>Contact</p>
                              {previousProfileData.name && <p className="text-slate-700 font-medium">{previousProfileData.name}</p>}
                              {previousProfileData.email && <p className="text-slate-500">{previousProfileData.email}</p>}
                              {previousProfileData.phone && <p className="text-slate-500">{previousProfileData.phone}</p>}
                            </div>
                          )}

                          {/* Skills */}
                          {Array.isArray(previousProfileData.skills) && previousProfileData.skills.length > 0 && (
                            <div>
                              <p className="font-semibold text-slate-600 uppercase tracking-wider mb-1" style={{ fontSize: '10px' }}>Skills</p>
                              <div className="flex flex-wrap gap-1">
                                {previousProfileData.skills.map((s, i) => (
                                  <span key={i} className="inline-block rounded-full bg-blue-100 px-2 py-0.5 text-blue-700">{typeof s === 'string' ? s : s.name || s}</span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Education */}
                          {Array.isArray(previousProfileData.education) && previousProfileData.education.length > 0 && (
                            <div>
                              <p className="font-semibold text-slate-600 uppercase tracking-wider mb-1" style={{ fontSize: '10px' }}>Education</p>
                              {previousProfileData.education.map((edu, i) => (
                                <p key={i} className="text-slate-700">
                                  {edu.degree || edu.qualification || ''}{(edu.degree || edu.qualification) && (edu.institution || edu.school) ? ' — ' : ''}{edu.institution || edu.school || ''}{edu.year ? ` (${edu.year})` : ''}
                                </p>
                              ))}
                            </div>
                          )}

                          {/* Experience */}
                          {Array.isArray(previousProfileData.work_experience || previousProfileData.experience) && (previousProfileData.work_experience || previousProfileData.experience).length > 0 && (
                            <div>
                              <p className="font-semibold text-slate-600 uppercase tracking-wider mb-1" style={{ fontSize: '10px' }}>Experience</p>
                              {(previousProfileData.work_experience || previousProfileData.experience).map((exp, i) => (
                                <div key={i} className="mb-1">
                                  <p className="text-slate-700 font-medium">
                                    {exp.role || exp.position || exp.title || ''}{(exp.role || exp.position || exp.title) && exp.company ? ' at ' : ''}{exp.company || ''}
                                  </p>
                                  {(exp.startDate || exp.start_date) && (
                                    <p className="text-slate-400">{exp.startDate || exp.start_date} – {exp.endDate || exp.end_date || 'Present'}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Projects */}
                          {Array.isArray(previousProfileData.projects) && previousProfileData.projects.length > 0 && (
                            <div>
                              <p className="font-semibold text-slate-600 uppercase tracking-wider mb-1" style={{ fontSize: '10px' }}>Projects</p>
                              {previousProfileData.projects.map((p, i) => (
                                <p key={i} className="text-slate-700">{p.title || p.name || ''}</p>
                              ))}
                            </div>
                          )}

                          {/* Certifications */}
                          {Array.isArray(previousProfileData.certifications) && previousProfileData.certifications.length > 0 && (
                            <div>
                              <p className="font-semibold text-slate-600 uppercase tracking-wider mb-1" style={{ fontSize: '10px' }}>Certifications</p>
                              {previousProfileData.certifications.map((c, i) => (
                                <p key={i} className="text-slate-700">
                                  {c.name || ''}{c.authority || c.issuer ? ` — ${c.authority || c.issuer}` : ''}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <button
                    onClick={handleProfileChanged}
                    disabled={applying}
                    className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-amber-300 hover:shadow-md disabled:opacity-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors">
                      {applying ? <Loader2 size={20} className="animate-spin" /> : <RefreshCw size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Yes, use latest data</p>
                      <p className="text-xs text-slate-500 mt-0.5">Re-parse my updated profile</p>
                    </div>
                  </button>

                  <button
                    onClick={handleProfileNotChanged}
                    disabled={applying}
                    className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-green-300 hover:shadow-md disabled:opacity-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-colors">
                      {applying ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">No changes</p>
                      <p className="text-xs text-slate-500 mt-0.5">Apply with existing profile data</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setApplyStep('choose-source')}
                    className="mt-2 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>
                </div>
              )}

              {/* Step 2: Resume options */}
              {applyStep === 'resume-options' && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-500 mb-4">You have previously uploaded resumes.</p>

                  <button
                    onClick={handleUsePreviousResume}
                    disabled={applying}
                    className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-violet-300 hover:shadow-md disabled:opacity-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                      <History size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Use Previous Resume</p>
                      <p className="text-xs text-slate-500 mt-0.5">Select from uploaded resumes</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-violet-500 transition-colors" />
                  </button>

                  <button
                    onClick={handleUploadNewResume}
                    disabled={applying}
                    className="group flex w-full items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 text-left transition-all hover:border-emerald-300 hover:shadow-md disabled:opacity-50"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Upload size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">Upload New Resume</p>
                      <p className="text-xs text-slate-500 mt-0.5">Upload a fresh file</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                  </button>

                  <button
                    onClick={() => setApplyStep('choose-source')}
                    className="mt-2 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>
                </div>
              )}

              {/* Step 3a: Select previous resume */}
              {applyStep === 'select-resume' && (
                <div className="space-y-3">
                  {resumes.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-8">
                      <Loader2 size={18} className="animate-spin text-blue-500" />
                      <span className="text-sm text-slate-500">Loading your resumes…</span>
                    </div>
                  ) : (
                    <>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Select a resume</p>
                      <div className="max-h-60 overflow-y-auto space-y-2 rounded-xl">
                        {resumes.map((r) => (
                          <label
                            key={r.id}
                            className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 transition-all ${
                              selectedResumeId === r.id
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name="resume"
                              className="accent-blue-600"
                              checked={selectedResumeId === r.id}
                              onChange={() => setSelectedResumeId(r.id)}
                            />
                            <FileText size={18} className={selectedResumeId === r.id ? 'text-blue-500' : 'text-slate-400'} />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{r.originalName}</p>
                              <p className="text-xs text-slate-500">Uploaded {new Date(r.uploadedAt).toLocaleDateString()}</p>
                            </div>
                            {r.pdfUrl && (
                              <a
                                href={r.pdfUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-100 transition"
                                title="Preview resume"
                              >
                                <ExternalLink size={13} />
                                View
                              </a>
                            )}
                          </label>
                        ))}
                      </div>
                      <button
                        onClick={handleSubmitExistingResume}
                        disabled={!selectedResumeId || applying}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700 disabled:opacity-50 transition-all"
                      >
                        {applying ? (
                          <><Loader2 size={16} className="animate-spin" /> Submitting…</>
                        ) : (
                          'Submit Application'
                        )}
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => setApplyStep('resume-options')}
                    className="mt-2 text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>
                </div>
              )}

              {/* Step 3b: Upload new resume */}
              {applyStep === 'upload-resume' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">We'll automatically parse your resume.</p>
                  <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleNewFileUpload} />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={applying}
                    className="group flex w-full flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 px-4 py-10 text-sm transition-all hover:border-blue-400 hover:bg-blue-50/50 disabled:opacity-50"
                  >
                    {applying ? (
                      <>
                        <Loader2 size={28} className="animate-spin text-blue-500" />
                        <span className="font-medium text-blue-600">Processing & submitting…</span>
                      </>
                    ) : (
                      <>
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Upload size={22} />
                        </div>
                        <div className="text-center">
                          <span className="font-medium text-slate-700 group-hover:text-blue-700 transition-colors">
                            Click to upload
                          </span>
                          <p className="text-xs text-slate-400 mt-1">PDF, DOC, or DOCX — max 5 MB</p>
                        </div>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setApplyStep(hasPreviousResume ? 'resume-options' : 'choose-source')}
                    className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 transition"
                  >
                    <ArrowLeft size={12} /> Back
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CandidateJobDetails;

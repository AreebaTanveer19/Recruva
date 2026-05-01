import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Video,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Building2,
  User,
} from 'lucide-react';
import Sidebar from '../../components/candidate/Sidebar';
import api from '../../api';

const CandidateInterviews = () => {
  const navigate = useNavigate();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('scheduled'); // 'scheduled' or 'completed'

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      // Fetch all interviews for the candidate
      const response = await api.get('/interview');
      if (response.data?.data && Array.isArray(response.data.data)) {
        setInterviews(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getStatusColor = (status, type = 'interview') => {
    // For application status
    if (type === 'application') {
      const appColors = {
        pending: 'bg-blue-50 text-blue-700 ring-blue-600/20',
        shortlisted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
        rejected: 'bg-red-50 text-red-700 ring-red-600/20',
      };
      return appColors[status] || appColors.pending;
    }
    // For interview status
    const colors = {
      scheduled: 'bg-blue-50 text-blue-700 ring-blue-600/20',
      completed: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
      expired: 'bg-red-50 text-red-700 ring-red-600/20',
      cancelled: 'bg-red-50 text-red-700 ring-red-600/20',
    };
    return colors[status] || colors.scheduled;
  };

  const getStatusIcon = (status, type = 'interview') => {
    if (type === 'application') {
      if (status === 'accepted' || status === 'shortlisted') return <CheckCircle2 size={16} />;
      return <AlertCircle size={16} />;
    }
    if (status === 'scheduled') return <AlertCircle size={16} />;
    if (status === 'completed') return <CheckCircle2 size={16} />;
    return <AlertCircle size={16} />;
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const filteredInterviews = interviews.filter((interview) => {
    if (activeTab === 'scheduled') {
      return interview.status === 'scheduled';
    } else {
      return interview.status !== 'scheduled';
    }
  }).sort((a, b) => {
    if (activeTab === 'completed') {
      // Sort completed interviews by date descending (latest first)
      return new Date(b.startTime) - new Date(a.startTime);
    }
    return 0;
  });

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/candidate/dashboard')}
            className="mb-4 inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 sm:text-4xl">My Interviews</h1>
              <p className="mt-2 text-slate-600">Track and manage your scheduled interviews</p>
            </div>
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              <Calendar size={28} />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab('scheduled')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'scheduled'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            Scheduled ({interviews.filter((i) => i.status === 'scheduled').length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-3 font-medium border-b-2 transition-colors ${
              activeTab === 'completed'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            History ({interviews.filter((i) => i.status !== 'scheduled').length})
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={32} className="animate-spin text-blue-600" />
          </div>
        ) : filteredInterviews.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <Calendar size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">
              {activeTab === 'scheduled' ? 'No scheduled interviews' : 'No completed interviews'}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {activeTab === 'scheduled'
                ? "When the HR team schedules an interview for you, it will appear here."
                : "Your completed interviews will be shown here."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInterviews.map((interview) => (
              <div
                key={interview.id}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-blue-200"
              >
                {/* Status Badge */}
                <div className="mb-4 flex items-start justify-between">
                  {activeTab === 'completed' && interview.applicationStatus ? (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusColor(
                        interview.applicationStatus,
                        'application'
                      )}`}
                    >
                      {getStatusIcon(interview.applicationStatus, 'application')}
                      {interview.applicationStatus.charAt(0).toUpperCase() + interview.applicationStatus.slice(1)}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-inset ${getStatusColor(
                        interview.status
                      )}`}
                    >
                      {getStatusIcon(interview.status)}
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </span>
                  )}
                  {interview.mode === 'google_meet' && interview.meetLink && interview.status === 'scheduled' && (
                    <a
                      href={interview.meetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-all"
                    >
                      <Video size={14} />
                      Join Meeting
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* Interview Details Grid */}
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Left Column */}
                  <div className="space-y-4">
                    {/* Position */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Building2 size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Position</p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">{interview.position}</p>
                      </div>
                    </div>

                    {/* Date */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
                        <Calendar size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Date</p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">{formatDate(interview.startTime)}</p>
                      </div>
                    </div>

                    {/* Time */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        <Clock size={18} />
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Time</p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {formatTime(interview.startTime)} - {formatTime(interview.endTime)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-4">
                    {/* Mode */}
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                        {interview.mode === 'google_meet' ? <Video size={18} /> : <MapPin size={18} />}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Mode</p>
                        <p className="text-sm font-semibold text-slate-900 mt-0.5">
                          {interview.mode === 'google_meet' ? 'Google Meet' : 'On-site'}
                        </p>
                      </div>
                    </div>

                    {/* Interviewer (if assigned) */}
                    {interview.assignedToId && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-purple-600">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Interviewer</p>
                          <p className="text-sm font-semibold text-slate-900 mt-0.5">
                            {interview.interviewer?.email ?? 'HR Team'}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Scheduled By */}
                    {interview.scheduledBy && (
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <User size={18} />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Scheduled By</p>
                          <p className="text-sm font-semibold text-slate-900 mt-0.5">
                            {interview.scheduledBy?.email ?? 'HR Team'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                {interview.notes && (
                  <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle size={18} className="shrink-0 text-amber-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-amber-900 uppercase tracking-wider">Notes from HR</p>
                        <p className="text-sm text-amber-800 mt-1 leading-relaxed">{interview.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Footer Info */}
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500">
                    Round {interview.round || 1}
                  </p>
                  {activeTab === 'scheduled' && isUpcoming(interview.startTime) && (
                    <p className="text-xs font-medium text-blue-600">
                      ⏰ Arriving soon? Mark your calendar!
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips Section */}
        {filteredInterviews.length > 0 && activeTab === 'scheduled' && (
          <div className="mt-8 rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2 mb-3">
              <AlertCircle size={18} className="text-blue-600" />
              Interview Tips
            </h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✓ Arrive 5-10 minutes early</li>
              <li>✓ Check your internet connection if it's a Google Meet</li>
              <li>✓ Have your resume ready for reference</li>
              <li>✓ Find a quiet, professional space for the interview</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateInterviews;

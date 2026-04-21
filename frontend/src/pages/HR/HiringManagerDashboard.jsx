import { useEffect, useState, useMemo } from "react";
import api from "../../api";
import WeeklySummary from "../../components/hr/WeeklySummary";
import ActiveJobsSection from "../../components/hr/ActiveJobsSection";
import UpcomingInterviewsSchedule from "../../components/hr/UpcomingInterviewsSchedule";
import TeamActivities from "../../components/hr/TeamActivities";
import RecruitmentSources from "../../components/hr/RecruitmentSources";

export default function HiringManagerDashboard() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [jobRes, intRes] = await Promise.all([
          api.get("/jobs/"), // Department's own jobs
          api.get("/interview/"), // Interviews for department
        ]);

        setJobs(jobRes.data.jobs || []);
        setInterviews(intRes.data.interviews || []);

        // Fetch applications for these jobs
        const jobIds = jobRes.data.jobs?.map((j) => j.id) || [];
        if (jobIds.length > 0) {
          try {
            const appRes = await api.get("/application/");
            const deptApps = (appRes.data.applications || []).filter((app) =>
              jobIds.includes(app.jobId)
            );
            setApplications(deptApps);
          } catch (err) {
            console.error("Error fetching applications:", err);
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Calculate weekly metrics
  const weeklyMetrics = useMemo(() => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const newCandidates = applications.filter((app) => {
      const appDate = new Date(app.createdAt);
      return appDate >= weekAgo;
    }).length;

    const upcomingInterviews = interviews.filter((int) => {
      const intDate = new Date(int.startTime);
      return intDate >= now;
    }).length;

    const offersExtended = applications.filter((app) => app.status === "accepted").length;

    // Calculate average time to hire (simplified)
    const avgTimeToHire = 28; // Placeholder - calculate from actual data

    return { newCandidates, upcomingInterviews, offersExtended, avgTimeToHire };
  }, [applications, interviews]);

  // Get active jobs with pipeline stats
  const activeJobsWithStats = useMemo(() => {
    return jobs
      .filter((job) => job.status === "Open")
      .map((job) => {
        const jobApps = applications.filter((app) => app.jobId === job.id);
        return {
          ...job,
          inboxCount: jobApps.filter((a) => a.status === "pending").length,
          interviewedCount: jobApps.filter((a) => a.status === "reviewed").length,
          rejectedCount: jobApps.filter((a) => a.status === "rejected").length,
          hiredCount: jobApps.filter((a) => a.status === "accepted").length,
        };
      });
  }, [jobs, applications]);

  // Get today's interviews
  const todayInterviews = useMemo(() => {
    const today = new Date().toDateString();
    return interviews.filter((int) => {
      const intDate = new Date(int.startTime).toDateString();
      return intDate === today && new Date(int.startTime) >= new Date();
    });
  }, [interviews]);

  // Generate team activities
  const teamActivities = useMemo(() => {
    const activities = [];

    applications.forEach((app) => {
      const job = jobs.find((j) => j.id === app.jobId);
      if (app.status === "shortlisted") {
        activities.push({
          type: "shortlist",
          candidateName: app.candidate?.name || "Unknown",
          jobTitle: job?.title || "Unknown Position",
          createdAt: app.updatedAt || app.createdAt,
        });
      } else if (app.status === "accepted") {
        activities.push({
          type: "offer",
          candidateName: app.candidate?.name || "Unknown",
          jobTitle: job?.title || "Unknown Position",
          createdAt: app.updatedAt || app.createdAt,
        });
      }
    });

    interviews.forEach((int) => {
      const job = jobs.find((j) => j.id === int.jobId);
      activities.push({
        type: "interview",
        candidateName: int.candidateName || "Unknown",
        jobTitle: job?.title || "Unknown Position",
        createdAt: int.createdAt,
      });
    });

    return activities.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [applications, interviews, jobs]);

  // Calculate recruitment sources
  const recruitmentSources = useMemo(() => {
    const sources = {};
    applications.forEach((app) => {
      const source = app.source || "Direct";
      sources[source] = (sources[source] || 0) + 1;
    });

    const total = Object.values(sources).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(sources)
      .map(([name, count]) => ({
        name,
        hires: count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.percentage - a.percentage);
  }, [applications]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 animate-pulse text-sm">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 py-8 px-6 md:px-10 overflow-y-auto bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Recruitment Dashboard</h1>
        <p className="text-gray-600 mt-2">Department hiring overview — manage your job openings and candidates</p>
      </div>

      {/* Weekly Summary */}
      <WeeklySummary
        newCandidates={weeklyMetrics.newCandidates}
        upcomingInterviews={weeklyMetrics.upcomingInterviews}
        offersExtended={weeklyMetrics.offersExtended}
        avgTimeToHire={weeklyMetrics.avgTimeToHire}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Left Column (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          <ActiveJobsSection jobs={activeJobsWithStats} />
          <TeamActivities activities={teamActivities} />
        </div>

        {/* Right Column (1/3) */}
        <div className="space-y-6">
          <UpcomingInterviewsSchedule interviews={todayInterviews} />
          <RecruitmentSources sources={recruitmentSources} />
        </div>
      </div>
    </div>
  );
}

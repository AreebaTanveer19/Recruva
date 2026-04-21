import { useEffect, useState, useMemo } from "react";
import api from "../../api";
import WeeklySummary from "../../components/dept/WeeklySummary";
import ActiveJobsSection from "../../components/dept/ActiveJobsSection";
import UpcomingInterviewsSchedule from "../../components/dept/UpcomingInterviewsSchedule";

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
          api.get("/openJobs"), // Correct endpoint for open jobs
          api.get("/interview/"), // Interviews endpoint
        ]);

        console.log("Jobs response:", jobRes.data);
        console.log("Interviews response:", intRes.data);

        setJobs(jobRes.data.jobs || jobRes.data || []);
        setInterviews(intRes.data.data || intRes.data || []);

        // Fetch applications for these jobs
        const jobIds = (jobRes.data.jobs || jobRes.data || []).map((j) => j.id) || [];
        console.log("Job IDs:", jobIds);

        if (jobIds.length > 0) {
          try {
            const appRes = await api.get("/application/");
            console.log("Applications response:", appRes.data);

            const deptApps = (appRes.data.applications || appRes.data || []).filter((app) =>
              jobIds.includes(app.jobId)
            );
            console.log("Filtered department apps:", deptApps);
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

  // Get today's interviews + upcoming
  const todayInterviews = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    console.log("Filtering interviews for today:", today);
    console.log("All interviews:", interviews);

    return interviews
      .filter((int) => {
        const intDate = new Date(int.startTime);
        console.log("Interview date:", intDate, "matches today:", intDate >= today && intDate < tomorrow);
        return intDate >= today && intDate < tomorrow;
      })
      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
  }, [interviews]);


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
        <div className="lg:col-span-2">
          <ActiveJobsSection jobs={activeJobsWithStats} />
        </div>

        {/* Right Column (1/3) */}
        <div>
          <UpcomingInterviewsSchedule interviews={todayInterviews} />
        </div>
      </div>
    </div>
  );
}

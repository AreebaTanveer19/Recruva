import { useEffect, useState, useMemo } from "react";
import api from "./../../api";
import StatCard from "../../components/hr/Statcard";
import Pipeline from "../../components/hr/Pipeline";
import JobRow from "../../components/hr/Jobrow";
import DeptBar from "../../components/hr/Deptbar";
import CandidateRow from "../../components/hr/CandidateRow";
import InterviewRow from "../../components/hr/InterviewRow";
import SectionCard from "../../components/hr/SectionCard";
import { useNavigate } from "react-router-dom";


function HRDashboard() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [appRes, jobRes, intRes] = await Promise.all([
          api.get("/application/"),   // adjust endpoint as needed
          api.get("/dashboard-jobs/"),           // adjust endpoint as needed
          api.get("/interview/"),     // adjust endpoint as needed
        ]);
        setApplications(appRes.data.applications ?? []);
        setJobs(jobRes.data.jobs ?? []);
        setInterviews(intRes.data.interviews ?? []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // pipeline counts
  const pipelineCounts = useMemo(() => {
    const c = { pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, accepted: 0 };
    applications.forEach((a) => {
      if (c[a.status] !== undefined) c[a.status]++;
    });
    return c;
  }, [applications]);

  // active jobs only
  const activeJobs = useMemo(
    () => jobs.filter((j) => j.status === "Open"),
    [jobs]
  );

  // applications grouped by department
  const deptCounts = useMemo(() => {
    const map = {};
    applications.forEach((a) => {
      const dept = a.job?.department ?? "Unknown";
      map[dept] = (map[dept] ?? 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [applications]);

  const maxDeptCount = useMemo(
    () => Math.max(1, ...deptCounts.map(([, c]) => c)),
    [deptCounts]
  );

  // top 5 scored candidates
  const topCandidates = useMemo(
    () =>
      [...applications]
        .filter((a) => a.score != null)
        .sort((a, b) => b.score - a.score)
        .slice(0, 5),
    [applications]
  );

  // upcoming interviews sorted by date
  const upcomingInterviews = useMemo(
    () =>
      [...interviews]
        .filter((i) => new Date(i.startTime) >= new Date())
        .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
        .slice(0, 4),
    [interviews]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500 animate-pulse text-sm">Loading dashboard...</p>
      </div>
    );
  }

  const scheduledCount = interviews.filter((i) => i.status === "scheduled").length;

  return (
    <div className="flex-1 py-8 px-6 md:px-10 overflow-y-auto bg-gray-100 min-h-screen">

      {/* page header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-900">Dashboard</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Welcome back — here's what's happening today.
        </p>
      </div>

      {/* stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <StatCard
          label="Total Applications"
          value={applications.length}
          delta={`${pipelineCounts.pending} pending review`}
          deltaType="warn"
        />
        <StatCard
          label="Active Jobs"
          value={activeJobs.length}
          delta={`${jobs.length} total postings`}
        />
        <StatCard
          label="Shortlisted"
          value={pipelineCounts.shortlisted}
          delta={pipelineCounts.shortlisted > 0 ? "Ready for dept. review" : "None yet"}
          deltaType={pipelineCounts.shortlisted > 0 ? "up" : "neutral"}
        />
        <StatCard
          label="Interviews Scheduled"
          value={scheduledCount}
          delta={`${upcomingInterviews.length} upcoming`}
          deltaType={upcomingInterviews.length > 0 ? "warn" : "neutral"}
        />
      </div>

      {/* pipeline */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Application pipeline</h3>
          <span className="text-xs text-gray-400">{applications.length} total</span>
        </div>
        <Pipeline counts={pipelineCounts} />
      </div>

      {/* active jobs + dept breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
        <div className="md:col-span-3">
          <SectionCard title="Active job postings" action="Open Jobs" onAction={() => navigate("/hr/open-jobs")}>
            {activeJobs.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">
                No active jobs.
              </p>
            ) : (
              activeJobs.slice(0, 5).map((j) => <JobRow key={j.id} job={j} />)
            )}
          </SectionCard>
        </div>
        <div className="md:col-span-2">
          <SectionCard title="Applications by department">
            {deptCounts.length === 0 ? (
              <p className="text-xs text-gray-400 italic py-4 text-center">No data.</p>
            ) : (
              deptCounts
                .slice(0, 6)
                .map(([dept, count]) => (
                  <DeptBar key={dept} name={dept} count={count} max={maxDeptCount} />
                ))
            )}
          </SectionCard>
        </div>
      </div>

      {/* top candidates + upcoming interviews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SectionCard title="Top scored candidates" action="View all" onAction={() => navigate("/hr/applications")}>
          {topCandidates.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4 text-center">
              No scored applications yet.
            </p>
          ) : (
            topCandidates.map((app) => <CandidateRow key={app.id} app={app} />)
          )}
        </SectionCard>

        <SectionCard title="Upcoming interviews" action="View all">
          {upcomingInterviews.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-4 text-center">
              No upcoming interviews.
            </p>
          ) : (
            upcomingInterviews.map((i) => <InterviewRow key={i.id} interview={i} />)
          )}
        </SectionCard>
      </div>

    </div>
  );
}

export default HRDashboard;
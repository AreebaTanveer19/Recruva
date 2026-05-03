import { useState, useEffect, useMemo } from "react";
import { Briefcase } from "lucide-react";
import dayjs from "dayjs";
import { format } from "date-fns";
import api from "../../api";
import { StatCard, StatCardSkeleton } from "../../components/dept/DeptStatCard";
import OutcomesChart from "../../components/dept/OutcomesChart";
import ActivityCalendar from "../../components/dept/ActivityCalendar";
import JobRow from "../../components/dept/JobRow";
import SectionCard from "../../components/dept/SectionCard";
import UpcomingInterviewsSchedule from "../../components/dept/UpcomingInterviewsSchedule";

const OUTCOME_LABELS = ["Scheduled", "Accepted", "Rejected"];

function sameMonthYear(dayjsDate, ref) {
  return dayjsDate.month() === ref.month() && dayjsDate.year() === ref.year();
}

export default function HiringManagerDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);

  const now = useMemo(() => dayjs(), []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [intRes, jobRes] = await Promise.all([
          api.get("/interview/"),
          api.get("/openJobs"),
        ]);
        setInterviews(intRes.data?.data || intRes.data || []);
        setJobs(jobRes.data?.jobs || jobRes.data || []);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const upcoming = useMemo(() => {
    const startOfToday = now.startOf("day");
    const endOfToday = now.endOf("day");
    return interviews
      .filter(iv =>
        iv.status === "scheduled" &&
        dayjs(iv.startTime).isAfter(startOfToday) &&
        dayjs(iv.startTime).isBefore(endOfToday)
      )
      .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime)));
  }, [interviews, now]);

  const conductedThisMonth = useMemo(() =>
    interviews.filter(iv =>
      ["accepted", "rejected", "waiting", "missed"].includes(iv.status) &&
      sameMonthYear(dayjs(iv.startTime), now)
    ),
    [interviews, now]
  );

  const passRate = useMemo(() => {
    const decided = interviews.filter(iv =>
      ["accepted", "rejected"].includes(iv.status) &&
      sameMonthYear(dayjs(iv.startTime), now)
    );
    const passed = decided.filter(iv => iv.status === "accepted").length;
    return { pct: decided.length ? Math.round((passed / decided.length) * 100) : null, passed, total: decided.length };
  }, [interviews, now]);

  const outcomesData = useMemo(() =>
    OUTCOME_LABELS.map(label => ({
      name:  label,
      value: interviews.filter(iv =>
        sameMonthYear(dayjs(iv.startTime), now) &&
        iv.status === label.toLowerCase()
      ).length,
    })),
    [interviews, now]
  );

  const jobsWithStats = useMemo(() =>
    jobs.map(job => ({
      ...job,
      pendingInterviews: interviews.filter(
        iv => iv.jobId === job.id && iv.status === "scheduled"
      ).length,
    })),
    [jobs, interviews]
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <main className="flex-1 p-8 space-y-8 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <StatCardSkeleton key={i} />)}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-80 bg-gray-100 rounded-xl border border-gray-200" />
              <div className="h-72 bg-gray-100 rounded-xl border border-gray-200" />
            </div>
            <div className="space-y-6">
              <div className="h-64 bg-gray-100 rounded-xl border border-gray-200" />
              <div className="h-72 bg-gray-100 rounded-xl border border-gray-200" />
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      <main className="flex-1 p-8 space-y-8 overflow-auto">

        <div>
          <h1 className="text-4xl font-semibold text-neutral-900 tracking-tight">Dashboard</h1>
          <p className="text-[15px] text-neutral-500 mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Upcoming Interviews"    value={upcoming.length} />
          <StatCard label="Interviewed This Month" value={conductedThisMonth.length} />
          <StatCard label="Active Job Postings"    value={jobs.length} />
          <StatCard
            label="Pass Rate This Month"
            value={passRate.pct !== null ? `${passRate.pct}%` : "—"}
            sub={passRate.total > 0 ? `${passRate.passed} of ${passRate.total} advanced` : "No decisions yet"}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">
            <SectionCard title="Interview Outcomes" badge={format(new Date(), "MMM yyyy")}>
              <OutcomesChart data={outcomesData} />
            </SectionCard>

            <SectionCard title="My Job Postings" badge={`${jobs.length} active`}>
              {jobsWithStats.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                  <Briefcase size={28} className="mb-2 opacity-40" />
                  <p className="text-sm">No active job postings</p>
                </div>
              ) : (
                <div>
                  {jobsWithStats.slice(0, 4).map(job => (
                    <JobRow key={job.id} job={job} />
                  ))}
                  {jobsWithStats.length > 5 && (
                    <div className="py-3 border-t border-gray-100">
                      <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition">
                        View all {jobsWithStats.length} postings →
                      </a>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
          </div>

          <div className="space-y-6">
            <UpcomingInterviewsSchedule interviews={upcoming} />
            <SectionCard title="Interview Activity">
              <ActivityCalendar interviews={interviews} />
            </SectionCard>
          </div>

        </div>
      </main>
    </div>
  );
}

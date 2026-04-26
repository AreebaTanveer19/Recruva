import { useState, useEffect, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  Calendar, Briefcase, ChevronLeft, ChevronRight,
  UserCheck, CalendarDays, TrendingUp, TrendingDown,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
import { format } from "date-fns";
import api from "../../api";
import { ACCESS_TOKEN } from "../../constants";
import UpcomingInterviewsSchedule from "../../components/dept/UpcomingInterviewsSchedule";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function getUserName() {
  try {
    const token = localStorage.getItem(ACCESS_TOKEN);
    if (!token) return "";
    const decoded = jwtDecode(token);
    return decoded.name || decoded.username || decoded.email?.split("@")[0] || "";
  } catch {
    return "";
  }
}

function sameMonthYear(dayjsDate, ref) {
  return dayjsDate.month() === ref.month() && dayjsDate.year() === ref.year();
}

// ─── Stat Card — matches WeeklySummary style ──────────────────────────────────

function StatCard({ icon: Icon, iconBg, iconColor, label, value,}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${iconBg} rounded-lg flex items-center justify-center`}>
          <Icon size={20} className={iconColor} />
        </div>
       
      </div>
      <p className="text-gray-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mb-2">{value}</p>
    
    </div>
  );
}

// ─── Skeleton Stat Card ───────────────────────────────────────────────────────

function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="w-10 h-10 bg-gray-200 rounded-lg mb-4" />
      <div className="h-3 w-24 bg-gray-200 rounded mb-2" />
      <div className="h-8 w-16 bg-gray-200 rounded mb-2" />
      <div className="h-3 w-32 bg-gray-200 rounded" />
    </div>
  );
}

// ─── Outcomes Bar Chart ───────────────────────────────────────────────────────

const OUTCOME_COLORS  = ["#6b7280", "#4b5563", "#1f2937"];
const OUTCOME_LABELS  = ["Scheduled", "Accepted", "Rejected"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
      <span className="font-semibold text-gray-700">{payload[0].name}:</span>{" "}
      <span className="text-gray-900">{payload[0].value}</span>
    </div>
  );
};

function OutcomesChart({ data }) {
  const total = data.reduce((s, d) => s + d.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-gray-400">
        <Calendar size={28} className="mb-2 opacity-40" />
        <p className="text-sm">No interviews this month</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={130}>
        <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 60, bottom: 5 }}>
          <XAxis type="number" stroke="#e5e7eb" allowDecimals={false} style={{ fontSize: "12px" }} />
          <YAxis dataKey="name" type="category" stroke="#1f2937" width={55} style={{ fontSize: "13px", fill: "#1f2937", fontWeight: 500 }} />
          <Tooltip
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px" }}
            formatter={(value) => value}
            cursor={{ fill: "rgba(59, 130, 246, 0.05)" }}
          />
          <Bar dataKey="value" radius={[0, 8, 8, 0]} fill="#3b82f6">
            {data.map((_, i) => (
              <Cell key={i} fill={OUTCOME_COLORS[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex justify-between gap-3 pt-2 border-t border-gray-100">
        {data.map((d, i) => (
          <div key={d.name} className="flex-1 text-center">
            <p className="text-xs text-gray-500 mb-1">{d.name}</p>
            <p className="text-lg font-bold text-gray-900">{d.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Activity Calendar ────────────────────────────────────────────────────────

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function ActivityCalendar({ interviews }) {
  const [viewDate, setViewDate] = useState(() => dayjs());
  const today = dayjs().format("YYYY-MM-DD");

  const interviewDayMap = useMemo(() => {
    const map = {};
    interviews.forEach((iv) => {
      const key = dayjs(iv.startTime).format("YYYY-MM-DD");
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [interviews]);

  const daysInMonth  = viewDate.daysInMonth();
  const firstWeekday = viewDate.startOf("month").day();
  const cells = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  return (
    <div>
      {/* Month nav */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => setViewDate(v => v.subtract(1, "month"))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-700">
          {viewDate.format("MMMM YYYY")}
        </span>
        <button
          onClick={() => setViewDate(v => v.add(1, "month"))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1 uppercase">
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-y-0.5">
        {cells.map((day, i) => {
          if (!day) return <div key={`e-${i}`} />;
          const dateKey = viewDate.date(day).format("YYYY-MM-DD");
          const count   = interviewDayMap[dateKey] || 0;
          const isToday = dateKey === today;

          return (
            <div key={dateKey} className="flex flex-col items-center py-0.5">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-medium transition
                  ${isToday
                    ? "bg-gray-900 text-white font-bold"
                    : count > 0
                      ? "bg-blue-50 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                {day}
              </div>
              {count > 0 && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-0.5" />
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-gray-900" />
          <span className="text-xs text-gray-400">Today</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-blue-200" />
          <span className="text-xs text-gray-400">Has interview</span>
        </div>
      </div>
    </div>
  );
}

// ─── Job Posting Row ──────────────────────────────────────────────────────────

function JobRow({ job }) {
  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b border-gray-100 last:border-0">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900 truncate">{job.title}</p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {job.department || job.location || "Open position"}
        </p>
      </div>
      {job.pendingInterviews > 0 ? (
        <span className="flex-shrink-0 text-xs font-semibold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full">
          {job.pendingInterviews} pending interview
        </span>
      ) : (
        <span className="flex-shrink-0 text-xs text-gray-300">No pending</span>
      )}
    </div>
  );
}

// ─── Section Card — matches portal card style ─────────────────────────────────

function SectionCard({ title, badge, children, className = "" }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h3 className="text-base font-semibold text-gray-900">{title}</h3>
        {badge !== undefined && (
          <span className="text-xs text-gray-400">{badge}</span>
        )}
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export default function HiringManagerDashboard() {
  const [interviews, setInterviews] = useState([]);
  const [jobs, setJobs]             = useState([]);
  const [loading, setLoading]       = useState(true);

  const userName  = useMemo(() => getUserName(), []);
  const now       = useMemo(() => dayjs(), []);


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

  // ── Derived data ─────────────────────────────────────────────────────────
  const upcoming = useMemo(() =>
    interviews
      .filter(iv => iv.status === "scheduled" && dayjs(iv.startTime).isAfter(now))
      .sort((a, b) => dayjs(a.startTime).diff(dayjs(b.startTime))),
    [interviews, now]
  );

  const conductedThisMonth = useMemo(() =>
    interviews.filter(iv =>
      ["accepted", "rejected"].includes(iv.status) &&
      sameMonthYear(dayjs(iv.startTime), now)
    ),
    [interviews, now]
  );



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



  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex min-h-screen bg-white">
        <main className="flex-1 p-8 space-y-8 animate-pulse">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <StatCardSkeleton key={i} />)}
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

        {/* ── Header ── */}
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            {getGreeting()}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            icon={CalendarDays}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
            label="Upcoming Interviews"
            value={upcoming.length}
            
          />
          <StatCard
            icon={UserCheck}
            iconBg="bg-green-50"
            iconColor="text-green-600"
            label="Interviewed This Month"
            value={conductedThisMonth.length}
          />
          <StatCard
            icon={Briefcase}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
            label="My Active Job Postings"
            value={jobs.length}
           
          />
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left column — 2/3 */}
          <div className="lg:col-span-2 space-y-6">
                        {/* Outcomes Chart */}
            <SectionCard
              title="Interview Outcomes"
              badge={format(new Date(), "MMM yyyy")}
            >
              <OutcomesChart data={outcomesData} />
            </SectionCard>

            {/* My Job Postings */}
            <SectionCard
              title="My Job Postings"
              badge={`${jobs.length} active`}
            >
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

          {/* Right column — 1/3 */}
          <div className="space-y-6">
            {/* Upcoming Interviews — reuses existing component */}
            <UpcomingInterviewsSchedule interviews={upcoming} />

            {/* Interview Activity Calendar */}
            <SectionCard title="Interview Activity">
              <ActivityCalendar interviews={interviews} />
            </SectionCard>

          </div>
        </div>
      </main>
    </div>
  );
}

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import dayjs from "dayjs";

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function ActivityCalendar({ interviews }) {
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

      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map(d => (
          <div key={d} className="text-center text-[10px] font-semibold text-gray-400 py-1 uppercase">
            {d}
          </div>
        ))}
      </div>

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

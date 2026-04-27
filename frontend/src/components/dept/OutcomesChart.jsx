import { Calendar } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Cell, Tooltip, ResponsiveContainer,
} from "recharts";

const OUTCOME_COLORS = ["#6b7280", "#4b5563", "#1f2937"];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow px-3 py-2 text-xs">
      <span className="font-semibold text-gray-700">{payload[0].name}:</span>{" "}
      <span className="text-gray-900">{payload[0].value}</span>
    </div>
  );
};

export default function OutcomesChart({ data }) {
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
          <YAxis
            dataKey="name"
            type="category"
            stroke="#1f2937"
            width={55}
            style={{ fontSize: "13px", fill: "#1f2937", fontWeight: 500 }}
          />
          <Tooltip
            content={<CustomTooltip />}
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
        {data.map((d) => (
          <div key={d.name} className="flex-1 text-center">
            <p className="text-xs text-gray-500 mb-1">{d.name}</p>
            <p className="text-lg font-bold text-gray-900">{d.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

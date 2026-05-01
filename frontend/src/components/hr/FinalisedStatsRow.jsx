// src/components/hr/FinalisedStatsRow.jsx

export default function FinalisedStatsRow({ stats }) {
  const cards = [
    { label: "Total Finalised", value: stats.total,    color: "text-gray-900" },
    { label: "Offered",         value: stats.offered,  color: "text-emerald-600" },
    { label: "Rejected",        value: stats.rejected, color: "text-rose-600" },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      {cards.map(({ label, value, color }) => (
        <div key={label} className="bg-white rounded-xl border border-gray-200 shadow-sm px-5 py-4">
          <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">{label}</p>
          <p className={`text-2xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
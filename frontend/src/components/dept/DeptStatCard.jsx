export function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</p>
      <p className="text-4xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
      <div className="h-3 w-28 bg-gray-200 rounded mb-3" />
      <div className="h-9 w-16 bg-gray-200 rounded" />
    </div>
  );
}

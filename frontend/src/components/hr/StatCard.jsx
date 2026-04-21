function StatCard({ label, value, delta, deltaType = "neutral" }) {
  const deltaClass =
    deltaType === "up"
      ? "text-green-600"
      : deltaType === "warn"
      ? "text-yellow-600"
      : "text-gray-400";

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">
        {label}
      </p>
      <p className="text-3xl font-semibold text-gray-900 leading-none">{value}</p>
      {delta && (
        <p className={`text-xs mt-1.5 ${deltaClass}`}>{delta}</p>
      )}
    </div>
  );
}

export default StatCard;
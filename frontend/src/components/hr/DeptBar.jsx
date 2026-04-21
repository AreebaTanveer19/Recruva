function DeptBar({ name, count, max }) {
  const pct = max > 0 ? Math.round((count / max) * 100) : 0;

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-xs text-gray-600 w-32 flex-shrink-0 truncate">{name}</span>
      <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-gray-800 rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs text-gray-500 w-5 text-right">{count}</span>
    </div>
  );
}

export default DeptBar;
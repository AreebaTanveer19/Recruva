export default function SectionCard({ title, badge, children, className = "" }) {
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

function SectionCard({ title, action, onAction, children }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {action && (
          <button
            onClick={onAction}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            {action} →
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

export default SectionCard;
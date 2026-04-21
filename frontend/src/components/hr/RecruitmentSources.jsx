import { Linkedin, Globe, CheckCircle } from "lucide-react";

const sourceIcons = {
  LinkedIn: Linkedin,
  Upwork: Globe,
  Indeed: CheckCircle,
};

const sourceColors = {
  LinkedIn: { bg: "bg-blue-50", text: "text-blue-600", bar: "bg-blue-500" },
  Upwork: { bg: "bg-green-50", text: "text-green-600", bar: "bg-green-500" },
  Indeed: { bg: "bg-purple-50", text: "text-purple-600", bar: "bg-purple-500" },
};

export default function RecruitmentSources({ sources = [] }) {
  // Default sources if none provided
  const defaultSources = [
    { name: "LinkedIn", hires: 46, percentage: 46 },
    { name: "Upwork", hires: 31, percentage: 31 },
    { name: "Indeed", hires: 23, percentage: 23 },
  ];

  const displaySources = sources.length > 0 ? sources : defaultSources;
  const maxPercentage = Math.max(...displaySources.map((s) => s.percentage), 100);

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-base font-semibold text-gray-900">Hires by source</h3>
      </div>

      <div className="px-6 py-6 space-y-6">
        {displaySources.map((source, idx) => {
          const Icon = sourceIcons[source.name] || Globe;
          const colors = sourceColors[source.name] || sourceColors.Indeed;
          const barWidth = (source.percentage / maxPercentage) * 100;

          return (
            <div key={idx}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${colors.bg} rounded-lg flex items-center justify-center`}>
                    <Icon size={20} className={colors.text} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{source.name}</p>
                    <p className="text-xs text-gray-500">{source.hires} hires</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900">{source.percentage}%</p>
                </div>
              </div>

              <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${colors.bar} rounded-full transition-all duration-500`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { Users, Calendar, Briefcase, Clock } from "lucide-react";

export default function WeeklySummary({ newCandidates, upcomingInterviews, offersExtended, avgTimeToHire }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {/* New Candidates */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <Users size={20} className="text-blue-600" />
          </div>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-1">New Candidates</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{newCandidates}</p>
        <p className="text-xs text-gray-400">This week</p>
      </div>

      {/* Upcoming Interviews */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
            <Calendar size={20} className="text-purple-600" />
          </div>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-1">Upcoming Interviews</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{upcomingInterviews}</p>
        <p className="text-xs text-gray-400">Scheduled</p>
      </div>

      {/* Offers Extended */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
            <Briefcase size={20} className="text-green-600" />
          </div>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-1">Offers Extended</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{offersExtended}</p>
        <p className="text-xs text-green-600 font-medium">↑ This week</p>
      </div>

      {/* Avg Time to Hire */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
            <Clock size={20} className="text-orange-600" />
          </div>
        </div>
        <p className="text-gray-500 text-sm font-medium mb-1">Avg. Time to Hire</p>
        <p className="text-3xl font-bold text-gray-900 mb-2">{avgTimeToHire}</p>
        <p className="text-xs text-gray-400">Days</p>
      </div>
    </div>
  );
}

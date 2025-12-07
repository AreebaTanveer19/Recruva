
import { useState } from "react";
import { Search, Filter, Download, UserCheck } from "lucide-react";
import {CandidateTable }from "./CandidateTable";
import ScheduleInterviewModal from "./ScheduleInterviewModal";

const stats = [
  { label: "Total Candidates", value: 120, change: "+5%" },
  { label: "Scheduled", value: 45, change: "+2%" },
  { label: "Interviewed", value: 30, change: "-1%" },
  { label: "Offered", value: 10, change: "+3%" },
];

export default function ShortlistedCandidates() {
const [openModal, setOpenModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const handleScheduleClick = (candidate) => {
    setSelectedCandidate(candidate);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedCandidate(null);
  };

  const handleScheduleInterview = (data) => {
    console.log("Interview scheduled:", data);
    handleCloseModal();
  };
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <main className="flex-1 p-8 overflow-auto">
        {/* Header */}
        <div className="animate-fade-in mb-8">
          <div className="flex items-center gap-4 mb-1">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 -tracking-[0.025em]">
                Shortlisted Candidates
              </h2>
              <p className="text-sm text-gray-500">
                Manage and schedule interviews for qualified candidates
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="animate-fade-in flex flex-col md:flex-row md:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search candidates..."
                className="w-full pl-9 pr-3 py-3 rounded-lg bg-white border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <button className="flex items-center gap-1.5 text-sm font-medium rounded-lg border border-gray-300 text-gray-900 px-3 py-3 hover:bg-gray-100">
              <Filter className="w-5 h-5" />
              Filters
            </button>
          </div>
 
        </div>

        {/* Stats Cards */}
<div className="animate-fade-in grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
  {stats.map((stat) => (
    <div
      key={stat.label}
      className="p-6 rounded-xl h-28 bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <p className="text-sm font-medium text-gray-500 tracking-wide mb-1">
        {stat.label}
      </p>

      <p className="text-2xl font-bold text-gray-900">
        {stat.value}
      </p>
    </div>
  ))}
</div>


        {/* Candidate Table */}
        <CandidateTable onScheduleInterview={handleScheduleClick} />

        {/* Schedule Modal */}
        <ScheduleInterviewModal
        open={openModal}
        onClose={handleCloseModal}
        candidate={selectedCandidate}
        onSchedule={handleScheduleInterview}
        />
      </main>
    </div>
  );
}

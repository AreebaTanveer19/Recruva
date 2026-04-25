import React from "react";
import { CalendarIcon } from "@heroicons/react/24/solid";
import { statusStyles } from "../data/candidateList.jsx";

export default function CandidateTable({ candidates, onScheduleInterview }) {
  const scheduleBtn = (candidate) => {
    const isDisabled =
      candidate.status === "scheduled" ||
      candidate.status === "accepted" ||
      candidate.status === "rejected";

    return (
      <button
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg shadow-sm transition ${
          isDisabled
            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:opacity-90"
        }`}
        onClick={() => onScheduleInterview(candidate)}
        disabled={isDisabled}
      >
        <CalendarIcon className="w-3.5 h-3.5 flex-shrink-0" />
        Schedule Interview
      </button>
    );
  };

  return (
    <div className="rounded-xl shadow-lg bg-white overflow-hidden">
      {/* ── Mobile / tablet card layout (hidden on lg+) ── */}
      <div className="lg:hidden divide-y divide-gray-200">
        {candidates.map((candidate) => {
          const statusClass =
            statusStyles[candidate.status] || "bg-gray-100 text-gray-800";

          return (
            <div key={candidate.id} className="p-4 space-y-3">
              {/* Row 1: name + status */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-gray-900 truncate">
                  {candidate.name}
                </span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full flex-shrink-0 ${statusClass}`}>
                  {candidate.status}
                </span>
              </div>

              {/* Row 2: email + position */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-600">
                <div>
                  <span className="font-medium text-gray-500 uppercase tracking-wide text-[10px]">Email</span>
                  <p className="truncate">{candidate.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-500 uppercase tracking-wide text-[10px]">Position</span>
                  <p className="truncate">{candidate.position}</p>
                </div>
              </div>

              {/* Row 3: action */}
              <div>{scheduleBtn(candidate)}</div>
            </div>
          );
        })}
      </div>

      {/* ── Desktop table (hidden below lg) ── */}
      <div className="hidden lg:block">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-100 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Candidate Name</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Email</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Position</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Status</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidates.map((candidate) => {
              const statusClass =
                statusStyles[candidate.status] || "bg-gray-100 text-gray-800";

              return (
                <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="text-sm font-medium text-gray-900">{candidate.name}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[180px]">
                    <span className="text-sm text-gray-600 block truncate">{candidate.email}</span>
                  </td>
                  <td className="px-4 py-3 max-w-[160px]">
                    <span className="text-sm text-gray-900 block truncate">{candidate.position}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClass}`}>
                      {candidate.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {scheduleBtn(candidate)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

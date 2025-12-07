import React from "react";
import { CalendarIcon } from "@heroicons/react/24/solid";

const candidates = [
  {
    id: "1",
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    position: "Senior Frontend Developer",
    status: "pending",
  },
  {
    id: "2",
    name: "Michael Chen",
    email: "michael.chen@email.com",
    position: "Product Designer",
    status: "scheduled",
  },
  {
    id: "3",
    name: "Emily Rodriguez",
    email: "emily.rod@email.com",
    position: "Backend Engineer",
    status: "pending",
  },
  {
    id: "4",
    name: "David Kim",
    email: "david.kim@email.com",
    position: "DevOps Engineer",
    status: "interviewed",
  },
  {
    id: "5",
    name: "Amanda Foster",
    email: "amanda.f@email.com",
    position: "UX Researcher",
    status: "offered",
  },
  {
    id: "6",
    name: "James Wilson",
    email: "james.w@email.com",
    position: "Senior Frontend Developer",
    status: "pending",
  },
];

const statusStyles = {
  pending: "bg-gray-100 text-gray-800",
  scheduled: "bg-blue-100 text-blue-600",
  interviewed: "text-gray-800 border border-gray-300",
  offered: "bg-green-100 text-green-800 border border-green-200",
};

export function CandidateTable({ onScheduleInterview }) {
  return (
    <div className="overflow-x-auto rounded-xl shadow-lg bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
              Candidate Name
            </th>
            <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
              Position
            </th>
            <th className="px-6 py-5 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-black text-gray-700 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {candidates.map((candidate) => (
            <tr
              key={candidate.id}
              className="hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-700">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <span className="text-gray-900 font-medium">
                  {candidate.name}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-600">{candidate.email}</td>
              <td className="px-6 py-4 text-gray-900">{candidate.position}</td>
              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    statusStyles[candidate.status]
                  }`}
                >
                  {candidate.status.charAt(0).toUpperCase() +
                    candidate.status.slice(1)}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  className={`px-3 py-2 text-sm font-medium rounded-lg shadow-sm flex items-center gap-1 ${
                    candidate.status === "scheduled" ||
                    candidate.status === "offered"
                      ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:bg-gray-800"
                  } transition-colors`}
                  onClick={() => onScheduleInterview(candidate)}
                  disabled={
                    candidate.status === "scheduled" ||
                    candidate.status === "offered"
                  }
                >
                  <CalendarIcon className="w-4 h-4" />
                  Schedule Interview
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

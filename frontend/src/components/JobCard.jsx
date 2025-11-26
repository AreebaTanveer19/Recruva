import React from "react";
import { FiMapPin, FiBriefcase, FiChevronDown, FiChevronUp, FiCreditCard } from "react-icons/fi";

const JobCard = ({ job, isExpanded, toggleExpand }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Open: "bg-black text-white",
      Closed: "bg-gray-800 text-white",
    };
    return (
      <span
        className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
          statusMap[status] || "bg-gray-200 text-black"
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="relative w-full md:w-[560px] bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden transition-shadow duration-300 border border-gray-300">
      <div className="p-7 flex flex-col justify-between text-black">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="text-lg font-semibold mb-1 truncate">{job.title}</h3>
            <p className="text-sm mb-2">{job.department} Department</p>
          </div>
          {getStatusBadge(job.status)}
        </div>

        {/* Horizontal Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {job.location && (
            <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gray-200 text-black rounded-full">
              <FiMapPin size={12} /> {job.location}
            </span>
          )}
          {job.workMode && (
            <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gray-200 text-black rounded-full">
              {job.workMode}
            </span>
          )}
          {job.employmentType && (
            <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gray-200 text-black rounded-full">
              <FiBriefcase size={12} /> {job.employmentType}
            </span>
          )}
          {job.salaryMin && job.salaryMax && (
            <span className="flex items-center gap-1 px-3 py-1 text-xs font-medium bg-gray-200 text-black rounded-full">
              <FiCreditCard size={12} /> Rs {job.salaryMin.toLocaleString()} - Rs {job.salaryMax.toLocaleString()}
            </span>
          )}
        </div>

        {/* Description */}
        {job.description && (
          <div
            className={`overflow-hidden transition-[max-height] duration-500 ease-in-out mb-4 ${
              isExpanded ? "max-h-[1000px]" : "max-h-[65px]"
            } ${!isExpanded ? "pointer-events-none" : ""}`}
          >
            <p className="text-sm leading-relaxed">{job.description}</p>
          </div>
        )}

        {/* Requirements */}
        {job.requirements?.length > 0 && (
          <div
            className={`mb-4 overflow-hidden transition-[max-height] duration-500 ease-in-out ${
              isExpanded ? "max-h-[500px]" : "max-h-0"
            } ${!isExpanded ? "pointer-events-none" : ""}`}
          >
            <h4 className="text-sm font-bold mb-1">Requirements:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {job.requirements.map((req, i) => (
                <li key={i}>{req}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Responsibilities */}
        {job.responsibilities?.length > 0 && (
          <div
            className={`mb-4 overflow-hidden transition-[max-height] duration-500 ease-in-out ${
              isExpanded ? "max-h-[500px]" : "max-h-0"
            } ${!isExpanded ? "pointer-events-none" : ""}`}
          >
            <h4 className="text-sm font-bold mb-1">Responsibilities:</h4>
            <ul className="list-disc list-inside text-sm space-y-1">
              {job.responsibilities.map((res, i) => (
                <li key={i}>{res}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Posted {formatDate(job.createdAt)}</span>
          <button
            onClick={toggleExpand}
            className="text-sm text-black font-semibold flex items-center gap-1"
          >
            {isExpanded ? "Show Less" : "Show More"}
            {isExpanded ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

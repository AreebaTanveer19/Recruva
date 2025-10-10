import React from 'react';
import { FiMapPin, FiDollarSign, FiBriefcase, FiClock } from 'react-icons/fi';

const JobCard = ({ job }) => {
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      Open: 'bg-green-100 text-green-800',
      Pending: 'bg-yellow-100 text-yellow-800',
      Closed: 'bg-red-100 text-red-800',
    };
    
    return (
      <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusMap[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-gray-600 text-sm mb-3">{job.department} Department</p>
          </div>
          {getStatusBadge(job.status)}
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center text-gray-600 text-sm">
            <FiMapPin className="mr-2 text-blue-500" />
            <span>{job.location} • {job.workMode}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FiBriefcase className="mr-2 text-blue-500" />
            <span>{job.employmentType}</span>
          </div>
          <div className="flex items-center text-gray-600 text-sm">
            <FiDollarSign className="mr-2 text-blue-500" />
            <span>${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}/year</span>
          </div>
          {job.deadline && (
            <div className="flex items-center text-gray-600 text-sm">
              <FiClock className="mr-2 text-blue-500" />
              <span>Apply before: {formatDate(job.deadline)}</span>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-1">Requirements:</h4>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {job.requirements.slice(0, 3).map((req, index) => (
              <li key={index} className="truncate">{req}</li>
            ))}
            {job.requirements.length > 3 && <li className="text-blue-600">+{job.requirements.length - 3} more</li>}
          </ul>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <span className="text-xs text-gray-500">Posted {formatDate(job.createdAt)}</span>
          <button className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
            Apply Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;

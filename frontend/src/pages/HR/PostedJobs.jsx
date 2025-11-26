import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./../../api";
import HRSidebar from "./../../components/HRSidebar";
import axios from "axios";
import { ACCESS_TOKEN } from "./../../constants";

function PostedJobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState("");
    const [filterDept, setFilterDept] = useState(""); // filter by department
    const [filterLocation, setFilterLocation] = useState("");

    const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = filterDept ? job.department === filterDept : true;
    const matchesLocation = filterLocation
      ? job.location === filterLocation
      : true;

    return matchesSearch && matchesDept && matchesLocation;
  });


  // ------------------------
  // Fetch open jobs
  // ------------------------
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get("/posted-jobs");
        setJobs(res.data.jobs);
      } catch (error) {
        console.error("Error fetching open jobs:", error);
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
          <HRSidebar />

      <div className="flex-1 py-10 px-4 sm:px-6 md:px-8 overflow-y-auto bg-gray-100">


        {loading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-lg animate-pulse">Loading posted jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-600">
            <p>No jobs posted yet.</p>
          </div>
        ) : (
          <>
            <h2 className="text-3xl font-semibold mb-6 text-center text-gray-900">
              Posted Jobs
            </h2>

            {/* Search & Filters */}
            <div className="items-stretch mb-6 flex flex-col sm:flex-row gap-3 md:items-center flex-wrap">
              {" "}
              {/* Search Input */}{" "}
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-white border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
              />{" "}
              {/* Department Filter */}{" "}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
              >
                {" "}
                <option value="">All Departments</option>{" "}
                {Array.from(new Set(jobs.map((job) => job.department))).map(
                  (dept) => (
                    <option key={dept} value={dept}>
                      {" "}
                      {dept}{" "}
                    </option>
                  )
                )}{" "}
              </select>{" "}
              {/* Location Filter */}{" "}
              <select
                value={filterLocation}
                onChange={(e) => setFilterLocation(e.target.value)}
                className="px-4 py-2 rounded-xl bg-white border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-800 focus:border-transparent transition"
              >
                {" "}
                <option value="">All Locations</option>{" "}
                {Array.from(new Set(jobs.map((job) => job.location))).map(
                  (loc) => (
                    <option key={loc} value={loc}>
                      {" "}
                      {loc}{" "}
                    </option>
                  )
                )}{" "}
              </select>{" "}
              {/* Clear Filters */}{" "}
              <button
                onClick={() => {
                  setSearchTerm("");
                  setFilterDept("");
                  setFilterLocation("");
                }}
                className="px-4 py-2 rounded-xl bg-gray-900 hover:bg-black text-white font-semibold transition"
              >
                {" "}
                Clear Filters{" "}
              </button>{" "}
            </div>

            {/* Job Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              {filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="bg-white border border-gray-300 rounded-xl p-6 shadow-sm hover:shadow-lg hover:border-gray-400 transition-all transform hover:-translate-y-1 flex flex-col"
                >
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-2">
      {job.department} • {job.location}
    </p>

    <p className="mt-3 text-gray-600 text-sm line-clamp-3 flex-1">
      {job.description}
    </p>

    {/* Extra Job Details */}
    <div className="mt-4 space-y-1 text-sm text-gray-700">
      <p><span className="font-semibold">Employment Type:</span> {job.employmentType}</p>
      <p><span className="font-semibold">Work Mode:</span> {job.workMode}</p>
      <p><span className="font-semibold">Salary Range:</span> {job.salaryMin} - {job.salaryMax}</p>
    </div>

                  <div className="mt-5 flex flex-col sm:flex-col lg:flex-row gap-2">
                    <button
                      onClick={() => navigate(`/posted-jobs/${job.id}`)}
                      className="flex-1 bg-gray-900 text-white py-2 rounded-lg font-semibold hover:bg-black transition"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default PostedJobs;

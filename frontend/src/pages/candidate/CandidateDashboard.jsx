import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/candidate/Sidebar';
import JobCard from '../../components/candidate/JobCard';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from '../../constants';

const CandidateDashboard = () => {
  const [jobs, setJobs] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    employmentType: '',
    workMode: '',
    location: '',
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        // Get the authentication token from localStorage using the correct key
        const token = localStorage.getItem(ACCESS_TOKEN);
        
        if (!token) {
          console.error('No authentication token found');
          toast.error('Please login to view jobs');
          navigate('/candidate/login');
          return;
        }

        const response = await axios.get(`${import.meta.env.VITE_API_URL}/openJobs`, {
          params: { status: 'Open', ...filters },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        // Ensure we're setting an array, even if the response is undefined or null
        if (Array.isArray(response.data)) {
          setJobs(response.data);
        } else if (response.data && Array.isArray(response.data.jobs)) {
          // Handle case where jobs are nested in a jobs property
          setJobs(response.data.jobs);
        } else {
          console.error('Unexpected response format:', response.data);
          setJobs([]); // Set to empty array if data is not in expected format
          toast.error('Error loading jobs. Please try again.');
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
        if (error.response && error.response.status === 401) {
          // Token is invalid or expired, clear it and redirect to login
          localStorage.removeItem('token');
          // navigate('/login');
        }
        setJobs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [filters]);

  // Ensure jobs is always an array before filtering
  const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job => {
    // Apply search filters
    const matchesSearch = searchTerm === '' || 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.requirements && Array.isArray(job.requirements) && 
       job.requirements.some(req => req.toLowerCase().includes(searchTerm.toLowerCase())));
    
    // Apply other filters
    const matchesFilters = 
      (!filters.employmentType || job.employmentType === filters.employmentType) &&
      (!filters.workMode || job.workMode === filters.workMode) &&
      (!filters.location || job.location?.toLowerCase().includes(filters.location.toLowerCase()));
    
    return matchesSearch && matchesFilters && job.status === 'Open';
  });

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="ml-64 p-8 w-full">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded w-1/3"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-white rounded-lg shadow-md p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-6"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <main className="flex-1 ml-64 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Openings</h1>
          <p className="text-gray-600">Browse and apply for the latest job opportunities</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Search jobs, departments, or keywords"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <FiFilter className="mr-2 h-4 w-4" />
              Filters
            </button>
          </div>
        </div>

        {/* Job Listings */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
            </h2>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">Sort by:</span>
              <select className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
                <option>Most Recent</option>
                <option>Salary: High to Low</option>
                <option>Salary: Low to High</option>
                <option>Application Deadline</option>
              </select>
            </div>
          </div>

          {filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
              <p className="text-gray-500">Try adjusting your search or filter criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

// Jobs are fetched from the backend API
export default CandidateDashboard;

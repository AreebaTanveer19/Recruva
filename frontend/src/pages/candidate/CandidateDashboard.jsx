import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FiSearch, FiFilter, FiRotateCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/candidate/Sidebar';
import JobCard from '../../components/candidate/JobCard';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from '../../constants';
import { debounce } from 'lodash';

const DEFAULT_FILTERS = {
  employmentType: '',
  workMode: '',
  location: '',
};

const EMPLOYMENT_TYPES = [
  { label: 'Full-time', value: 'FullTime' },
  { label: 'Part-time', value: 'PartTime' },
  { label: 'Internship', value: 'Internship' },
];

const WORK_MODES = [
  { label: 'On-site', value: 'Onsite' },
  { label: 'Remote', value: 'Remote' },
  { label: 'Hybrid', value: 'Hybrid' },
];

const CandidateDashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [appliedFilters, setAppliedFilters] = useState({ ...DEFAULT_FILTERS });
  const [isFiltering, setIsFiltering] = useState(false);
  const locationInputRef = useRef(null);

  const navigate = useNavigate();

  // Debounced search term update
  const debouncedSearchUpdate = useCallback(
    debounce((value) => {
      setFilters(prev => ({ ...prev, search: value }));
    }, 400),
    []
  );

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem(ACCESS_TOKEN);
      
      if (!token) {
        console.error('No authentication token found');
        toast.error('Please login to view jobs');
        navigate('/candidate/login');
        return;
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/openJobs`, {
        params: { status: 'Open' },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Ensure we're setting an array, even if the response is undefined or null
      if (Array.isArray(response.data)) {
        setJobs(response.data);
      } else if (response.data && Array.isArray(response.data.jobs)) {
        setJobs(response.data.jobs);
      } else {
        console.error('Unexpected response format:', response.data);
        setJobs([]);
        toast.error('Error loading jobs. Please try again.');
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/candidate/login');
      }
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Initial data fetch
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearchUpdate(value);
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters, search: searchTerm });
    setIsFiltering(true);
    setTimeout(() => setIsFiltering(false), 300);
  };

  const handleResetFilters = () => {
    const resetFilters = { ...DEFAULT_FILTERS };
    setFilters(resetFilters);
    setAppliedFilters(resetFilters);
    setSearchTerm('');
  };

  // Filter jobs based on applied filters and search
  const filteredJobs = React.useMemo(() => {
    return (Array.isArray(jobs) ? jobs : []).filter(job => {
      // Apply search filters
      const matchesSearch = !appliedFilters.search || 
        job.title?.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        job.department?.toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        (job.requirements && Array.isArray(job.requirements) && 
         job.requirements.some(req => req.toLowerCase().includes(appliedFilters.search.toLowerCase())));
      
      // Apply other filters
      const matchesFilters = 
        (!appliedFilters.employmentType || job.employmentType === appliedFilters.employmentType) &&
        (!appliedFilters.workMode || job.workMode === appliedFilters.workMode) &&
        (!appliedFilters.location || job.location?.toLowerCase().includes(appliedFilters.location.toLowerCase()));
      
      return matchesSearch && matchesFilters && job.status === 'Open';
    });
  }, [jobs, appliedFilters]);

  const activeFilters = [
    appliedFilters.search, 
    appliedFilters.employmentType, 
    appliedFilters.workMode, 
    appliedFilters.location
  ].filter(Boolean).length;

 const Background = ({ children }) => (
  <div className="min-h-screen bg-white">
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {children}
    </div>
  </div>
);


  // Loading state is now handled inline with the job listings

  return (
    <Background>
      <Sidebar />
      <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:ml-64">
        {activeFilters > 0 && (
          <div className="mb-6">
            <span className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              {activeFilters} filter{activeFilters > 1 ? 's' : ''}
            </span>
          </div>
        )}
        <div className="mx-auto max-w-6xl space-y-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <FiSearch className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search roles, teams, or keywords"
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full rounded-full border border-slate-200 bg-white px-12 py-3 text-sm font-medium text-slate-700 shadow-inner focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white/70 px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-white"
            >
              <FiRotateCw className="h-4 w-4" />
              Reset
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-full border border-slate-200 bg-[#f7f7f9] px-4 py-2">
              <select
                value={filters.employmentType}
                onChange={(e) => handleFilterChange('employmentType', e.target.value)}
                className="w-full rounded-full border-0 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
              >
                <option value="">Employment type</option>
                {EMPLOYMENT_TYPES.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="rounded-full border border-slate-200 bg-[#f7f7f9] px-4 py-2">
              <select
                value={filters.workMode}
                onChange={(e) => handleFilterChange('workMode', e.target.value)}
                className="w-full rounded-full border-0 bg-transparent text-sm font-semibold text-slate-700 focus:outline-none"
              >
                <option value="">Work mode</option>
                {WORK_MODES.map(({ label, value }) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div className="rounded-full border border-slate-200 bg-[#f7f7f9] px-4 py-2">
              <input
                ref={locationInputRef}
                type="text"
                value={filters.location || ''}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                placeholder="Location"
                className="w-full rounded-full border-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
            </div>
            <button 
              onClick={handleApplyFilters}
              disabled={isFiltering}
              className={`rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition focus:outline-none focus:ring-2 focus:ring-white/50 ${
                isFiltering ? 'opacity-75' : ''
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                {isFiltering ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <FiFilter className="h-4 w-4" />
                )}
                {isFiltering ? 'Applying...' : 'Apply filters'}
              </div>
            </button>
          </div>

          <div className="relative pt-8">
            {isFiltering && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/50 backdrop-blur-sm">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              </div>
            )}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Latest roles</p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {loading ? 'Loading...' : `${filteredJobs.length} ${filteredJobs.length === 1 ? 'role' : 'roles'}`}
                </h2>
                <p className="text-sm text-slate-500">Sorted by most recent openings</p>
              </div>
            </div>

            <div className="mt-6">
              {loading ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-64 animate-pulse rounded-[28px] bg-slate-100" />
                  ))}
                </div>
              ) : filteredJobs.length > 0 ? (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[28px] border border-dashed border-slate-200 bg-[#f7f7f9] p-12 text-center">
                  <h3 className="text-xl font-semibold text-slate-800">No roles match your filters yet</h3>
                  <p className="mt-2 text-sm text-slate-500">Adjust your search or check back soon for fresh openings.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </Background>
  );
};

// Jobs are fetched from the backend API
export default CandidateDashboard;

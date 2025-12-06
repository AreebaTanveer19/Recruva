import React, { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiRotateCw, FiMenu } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/candidate/Sidebar';
import JobCard from '../../components/candidate/JobCard';
import axios from 'axios';
import { toast } from 'react-toastify';
import { ACCESS_TOKEN } from '../../constants';

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
  const [jobs, setJobs] = useState([]); // Initialize as empty array
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
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

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleResetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setSearchTerm('');
  };

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

  const activeFilters = [searchTerm, filters.employmentType, filters.workMode, filters.location].filter(Boolean).length;

 const Background = ({ children }) => (
  <div className="min-h-screen bg-white">
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {children}
    </div>
  </div>
);


  if (loading) {
    return (
      <Background>
        <Sidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        {isSidebarOpen && (
          <button
            type="button"
            className="fixed inset-0 z-30 bg-black/40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close menu overlay"
          />
        )}
        <div className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:ml-64">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="h-48 animate-pulse rounded-[32px] border border-white/10 bg-white/5" />
            <div className="h-40 animate-pulse rounded-[32px] border border-white/10 bg-white/10" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 animate-pulse rounded-[28px] border border-white/10 bg-white/10" />
              ))}
            </div>
          </div>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <Sidebar isMobileOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Close menu overlay"
        />
      )}

      <main className="flex-1 px-4 py-8 sm:px-8 lg:px-12 lg:ml-64">
        <div className="mb-6 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
          >
            <FiMenu className="h-4 w-4" />
            Menu
          </button>
          {activeFilters > 0 && (
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              {activeFilters} filter{activeFilters > 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="mx-auto max-w-6xl">
          <section className="rounded-[32px] border border-white/10 bg-white/95 p-6 text-slate-900 shadow-[0_35px_80px_rgba(4,7,29,0.12)]">
            <div className="space-y-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                <div className="relative flex-1">
                  <FiSearch className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search roles, teams, or keywords"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
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
                    type="text"
                    value={filters.location}
                    onChange={(e) => handleFilterChange('location', e.target.value)}
                    placeholder="Location"
                    className="w-full rounded-full border-0 bg-transparent text-sm font-semibold text-slate-700 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button className="rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/40 transition focus:outline-none focus:ring-2 focus:ring-white/50">
                  <div className="flex items-center justify-center gap-2">
                    <FiFilter className="h-4 w-4" />
                    Apply filters
                  </div>
                </button>
              </div>
            </div>

            <div className="mt-10 border-t border-slate-200/70 pt-8">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.35em] text-slate-400">Latest roles</p>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {filteredJobs.length} {filteredJobs.length === 1 ? 'role match' : 'role matches'}
                  </h2>
                  <p className="text-sm text-slate-500">Sorted by most recent openings</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-500">Sort by</span>
                  <select className="rounded-full border border-slate-200 bg-[#f4f4f6] px-4 py-2 text-sm font-medium text-slate-700 focus:border-indigo-400 focus:outline-none">
                    <option>Most Recent</option>
                    <option>Salary: High to Low</option>
                    <option>Salary: Low to High</option>
                    <option>Application Deadline</option>
                  </select>
                </div>
              </div>

              {filteredJobs.length > 0 ? (
                <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredJobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              ) : (
                <div className="mt-8 rounded-[28px] border border-dashed border-slate-200 bg-[#f7f7f9] p-12 text-center">
                  <h3 className="text-xl font-semibold text-slate-800">No roles match your filters yet</h3>
                  <p className="mt-2 text-sm text-slate-500">Adjust your search or check back soon for fresh openings.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </Background>
  );
};

// Jobs are fetched from the backend API
export default CandidateDashboard;

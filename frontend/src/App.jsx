import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage';
import Auth from './pages/candidate/Auth';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import HRDashboard from './pages/HR/HRDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DeptDashboard from './pages/DEPT/DeptDashboard'
import CandidateDashboard from './pages/candidate/CandidateDashboard';
import JobCreationForm from './pages/DEPT/Jobs/JobCreationForm';
import JobsPage from './pages/DEPT/Jobs/JobsPage';
import OpenJobs from './pages/HR/OpenJobs';
import JobDetails from './components/JobDetails';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/candidate/auth" element={<Auth />} />
        <Route path="/admin/auth" element={<AdminLoginPage />} />
        <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['HR']}><HRDashboard /></ProtectedRoute>} />
        <Route path="/dept/dashboard" element={<ProtectedRoute allowedRoles={['DEPARTMENT']}><DeptDashboard /></ProtectedRoute>} />
        <Route path="/dept/dashboard/jobs/createjob" element={<ProtectedRoute allowedRoles={['DEPARTMENT']}><JobCreationForm /></ProtectedRoute>} />
        <Route path="/dept/dashboard/jobs" element={<ProtectedRoute allowedRoles={['DEPARTMENT']}><JobsPage /></ProtectedRoute>} />
        <Route path="/candidate/dashboard" element={<ProtectedRoute allowedRoles={['candidate']}><CandidateDashboard/></ProtectedRoute>} />
        <Route path="/OpenJobs" element={<ProtectedRoute allowedRoles={['HR']}><OpenJobs/></ProtectedRoute>} />
        <Route path="/open-jobs/:id" element={<ProtectedRoute allowedRoles={['HR']}><JobDetails /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App

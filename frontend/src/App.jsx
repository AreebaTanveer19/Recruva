import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage';
import Auth from './pages/candidate/Auth';
import AdminLoginPage from './pages/admin/AdminLoginPage';
import HRDashboard from './pages/HR/HRDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import DeptDashboard from './pages/DEPT/DeptDashboard'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/candidate/auth" element={<Auth />} />
        <Route path="/admin/auth" element={<AdminLoginPage />} />
        <Route path="/hr/dashboard" element={<ProtectedRoute allowedRoles={['HR']}><HRDashboard /></ProtectedRoute>} />
        <Route path="/dept/dashboard" element={<ProtectedRoute allowedRoles={['DEPARTMENT']}><DeptDashboard /></ProtectedRoute>} />
      </Routes>
    </Router>
  )
}

export default App

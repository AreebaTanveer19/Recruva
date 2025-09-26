import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/landingPage';
import Auth from './pages/candidate/Auth';
import AdminLoginPage from './pages/admin/AdminLoginPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/candidate/auth" element={<Auth />} />
        <Route path="/admin/auth" element={<AdminLoginPage />} />
      </Routes>
    </Router>
  )
}

export default App

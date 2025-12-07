import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import Auth from "./pages/candidate/Auth";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import HRDashboard from "./pages/HR/HRDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import DeptDashboard from "./pages/DEPT/DeptDashboard";
import CandidateDashboard from "./pages/candidate/CandidateDashboard";
import JobCreationForm from "./pages/DEPT/Jobs/JobCreationForm";
import JobsPage from "./pages/DEPT/Jobs/JobsPage";
import OpenJobs from "./pages/HR/OpenJobs";
import JobDetails from "./components/JobDetails";
import CandidateJobDetails from "./pages/candidate/CandidateJobDetails";
import Profile from "./pages/candidate/Profile";
import ProfileDisplay from "./pages/candidate/ProfileDisplay";
import PostedJobs from "./pages/HR/PostedJobs";
import SidebarLayout from "./layouts/SidebarLayout";
import ShortlistedCandidates from "./pages/DEPT/Shortlisted Candidates/ShortlistedCandidates";
import InterviewsCalendar from "./pages/DEPT/components/Interview Scheduling/InterviewsCalendar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/admin/auth" element={<AdminLoginPage />} />

        {/* Candidate */}

        <Route path="/candidate/auth" element={<Auth />} />
        <Route
          path="/candidate/dashboard"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/profile"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/profile/view"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <ProfileDisplay />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/job/:id"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateJobDetails />
            </ProtectedRoute>
          }
        />

        {/* HR */}

        <Route
          path="/hr/dashboard"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <HRDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/OpenJobs"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <OpenJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/open-jobs/:id"
          element={
            <ProtectedRoute allowedRoles={["HR", "DEPARTMENT"]}>
              <JobDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posted-jobs"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <PostedJobs />
            </ProtectedRoute>
          }
        />
        <Route
          path="/posted-jobs/:id"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <JobDetails />
            </ProtectedRoute>
          }
        />

        {/* Department */}
        <Route
          path="/dept/dashboard"
          element={
            <ProtectedRoute allowedRoles={["DEPARTMENT"]}>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DeptDashboard />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="jobs/createjob" element={<JobCreationForm />} />
          <Route path="shortlisted-candidates" element={<ShortlistedCandidates />} />
          <Route path="interviews" element={<InterviewsCalendar />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

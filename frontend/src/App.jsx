import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingPage";
import Auth from "./pages/candidate/Auth";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import HRDashboard from "./pages/HR/HRDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
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
import ShortlistedCandidates from "./pages/HR/Shortlisted Candidates/ShortlistedCandidates";
import InterviewsCalendar from "./pages/DEPT/Interview Scheduling/InterviewsCalendar";
import MyApplications from "./pages/candidate/MyApplications";
import CandidateInterviews from "./pages/candidate/CandidateInterviews";
import JobApplications from "./pages/HR/JobApplications";
import InterviewSession from "./pages/DEPT/Interview Questions/interviewSession";
import EditJob from "./pages/DEPT/Jobs/EditJob";
import CandidateDetailPage from "./pages/HR/CandidateDetailPage";
import HiringManagerDashboard from "./pages/DEPT/HiringManagerDashboard";
import ClosedJobsPage from "./pages/DEPT/ClosedJobsPage";
import ClosedJobDetails from "./pages/DEPT/ClosedJobDetails";
import InterviewResultsPage from "./pages/HR/InterviewResults";
import WaitingCandidates from "./pages/DEPT/WaitingCandidates";
import FinalisedCandidatesPage from "./pages/HR/FinalisedCandidatesPage";
import CandidateProfilePage from "./pages/HR/CandidateProfilePage";

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
        <Route
          path="/candidate/applications"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <MyApplications />
            </ProtectedRoute>
          }
        />
        <Route
          path="/candidate/interviews"
          element={
            <ProtectedRoute allowedRoles={["candidate"]}>
              <CandidateInterviews />
            </ProtectedRoute>
          }
        />

        {/* HR */}

        <Route
          path="/hr"
          element={
            <ProtectedRoute allowedRoles={["HR"]}>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<HRDashboard />} />
          <Route path="open-jobs" element={<OpenJobs />} />
          <Route path="open-jobs/:id" element={<JobDetails />} />
          <Route path="open-jobs/:id/applications" element={<JobApplications />} />
          <Route path="posted-jobs" element={<PostedJobs />} />
          <Route path="posted-jobs/:id" element={<JobDetails />} />
          <Route path="applications/:id" element={<CandidateDetailPage />} />
          <Route path="applications" element={<JobApplications />} />
          <Route path="interview-results" element={<InterviewResultsPage />} />
          <Route path="candidates/final" element={<FinalisedCandidatesPage />} />
           <Route
            path="shortlisted-candidates"
            element={<ShortlistedCandidates />}
          />
          <Route path="candidates/profile/:resumeId" element={<CandidateProfilePage />} />
        </Route>
        

        {/* Department */}
        <Route
          path="/dept/dashboard"
          element={
            <ProtectedRoute allowedRoles={["DEPARTMENT"]}>
              <SidebarLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<HiringManagerDashboard />} />
          <Route path="jobs" element={<JobsPage />} />
          <Route path="archived-jobs" element={<ClosedJobsPage />} />
          <Route path="archived-jobs/:id" element={<ClosedJobDetails />} />
          <Route path="jobs/createjob" element={<JobCreationForm />} />
          <Route path="open-jobs/:id" element={<JobDetails />} />
          <Route path="edit-job/:id" element={<EditJob />} />
          <Route path="interviews" element={<InterviewsCalendar />} />
          <Route path="interview-session" element={<InterviewSession />} />
          <Route path="waiting-candidates" element={<WaitingCandidates />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;

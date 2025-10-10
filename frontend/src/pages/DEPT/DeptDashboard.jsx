import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/SideBar";
import { MdDashboard, MdWork, MdPeople, MdGroups, MdBarChart, MdSettings } from "react-icons/md";
import LogoutPopup from "../../components/LogoutPopup";

function DeptDashboard() {
  const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", icon: <MdDashboard size={20} />, onClick: () => navigate("/dept/dashboard") },
    { name: "Jobs", icon: <MdWork size={20} />, onClick: () => navigate("/dept/dashboard/jobs") },
    { name: "Candidates", icon: <MdPeople size={20} />, onClick: () => navigate("/dept/dashboard/candidates") },
    { name: "Teams", icon: <MdGroups size={20} />, onClick: () => navigate("/dept/dashboard/teams") },
    { name: "Reports", icon: <MdBarChart size={20} />, onClick: () => navigate("/dept/dashboard/reports") },
    { name: "Settings", icon: <MdSettings size={20} />, onClick: () => navigate("/dept/dashboard/settings") },
  ];

  const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    navigate("/admin/auth"); 
    return <LogoutPopup onConfirm={handleLogout} />;
  };

  return (
    <div className="flex">
      <Sidebar
        // brandName="Recruva"
        panelName="Department Panel"
        navItems={navItems}
        onLogout={handleLogout}
      />
      <div className="flex-1 p-8">
        <h2 className="text-2xl font-bold mb-4">Welcome to the Dashboard</h2>
        <button
          onClick={() => navigate("/dept/dashboard/jobs/createJob")}
          className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
        >
          Create Job
        </button>
      </div>
    </div>
  );
}

export default DeptDashboard;

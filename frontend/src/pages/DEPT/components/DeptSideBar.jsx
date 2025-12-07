import React from 'react'
import Sidebar from '../../../components/SideBar'
import { useNavigate } from 'react-router-dom';
import {
  MdDashboard,
  MdWork,
  MdPeople,
  MdGroups,
  MdBarChart,
  MdSettings,
  MdAdd,
} from "react-icons/md";
import LogoutPopup from '../../../components/LogoutPopup'

const DeptSideBar = () => {
    const navigate = useNavigate();

  const navItems = [
    { name: "Dashboard", icon: <MdDashboard size={20} />, onClick: () => navigate("/dept/dashboard") },
    { name: "Jobs", icon: <MdWork size={20} />, onClick: () => navigate("/dept/dashboard/jobs") },
    { name: "Shortlisted", icon: <MdPeople size={20} />, onClick: () => navigate("/dept/dashboard/shortlisted-candidates") },
    { name: "Interviews", icon: <MdGroups size={20} />, onClick: () => navigate("/dept/dashboard/interviews") },
    { name: "Reports", icon: <MdBarChart size={20} />, onClick: () => navigate("/dept/dashboard/reports") },
    { name: "Settings", icon: <MdSettings size={20} />, onClick: () => navigate("/dept/dashboard/settings") },
  ];
    const handleLogout = () => {
    localStorage.removeItem("ACCESS_TOKEN");
    navigate("/admin/auth");
    return <LogoutPopup onConfirm={handleLogout} />;
  };
    const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ef4444"];
  return (
    <div>
        <Sidebar panelName="Department Panel" navItems={navItems} onLogout={handleLogout} />
    </div>
  )
}

export default DeptSideBar

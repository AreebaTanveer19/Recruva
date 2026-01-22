import React from "react";
import { Outlet } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";
import { jwtDecode } from "jwt-decode";
import HRSidebar from "../components/HRSidebar";
import { Home, Briefcase, FileText, Clock } from "lucide-react";
import { MdDashboard, MdWork, MdPeople, MdGroups } from "react-icons/md";

const SidebarLayout = () => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  const decoded = token ? jwtDecode(token) : null;
  const role = decoded?.role;

  console.log("role ", role);

  const HrNavLinks = [
    { name: "Dashboard", path: "/hr/dashboard", icon: <Home size={20} /> },
    { name: "Open Jobs", path: "/hr/open-jobs", icon: <Briefcase size={20} /> },
    { name: "Posted Jobs", path: "/hr/posted-jobs", icon: <Clock size={20} /> },
    {
      name: "Job Applications",
      path: "/hr/applications",
      icon: <FileText size={20} />,
    },
  ];

  const DeptNavLinks = [
    {
      name: "Dashboard",
      path: "/dept/dashboard",
      icon: <MdDashboard size={20} />,
    },
    { name: "Jobs", path: "/dept/dashboard/jobs", icon: <MdWork size={20} /> },
    {
      name: "Shortlisted",
      path: "/dept/dashboard/shortlisted-candidates",
      icon: <MdPeople size={20} />,
    },
    {
      name: "Interviews",
      path: "/dept/dashboard/interviews",
      icon: <MdGroups size={20} />,
    },
  ];
  return (
    <div>
      <div className="flex min-h-screen">
        {role === "HR" && (
          <HRSidebar links={HrNavLinks} panelName="HR Portal" />
        )}
        {role === "DEPARTMENT" && (
          <HRSidebar links={DeptNavLinks} panelName="Department Portal" />
        )}

        <div className="flex-1 bg-gray-100 ml-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default SidebarLayout;

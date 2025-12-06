import React from "react";
import { Outlet } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";
import DeptSideBar from "../pages/DEPT/components/DeptSideBar";
import { jwtDecode } from "jwt-decode";

const SidebarLayout = () => {
    const token = localStorage.getItem(ACCESS_TOKEN);
      const decoded = token ? jwtDecode(token) : null;
      const role = decoded?.role;
  return (
    <div>
        <div className="flex min-h-screen">
      {/* Sidebar */}
      {/* {role === "HR" && <HRSidebar />} */}
      {role === "DEPARTMENT" && <DeptSideBar />}

      {/* Main Content */}
      <div className="flex-1 bg-gray-100 lg:ml-[282px] ml-0">
        <Outlet />
      </div>
    </div>
    </div>
  )
}

export default SidebarLayout

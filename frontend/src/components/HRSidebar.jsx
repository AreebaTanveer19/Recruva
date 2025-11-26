import React, { useState } from "react";
import { Home, Briefcase, FileText, Clock, LogOut, Menu, X } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";


export default function HRSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { name: "Dashboard", path: "/hr/dashboard", icon: <Home size={18} /> },
    { name: "Open Jobs", path: "/OpenJobs", icon: <Briefcase size={18} /> },
    { name: "Posted Jobs", path: "/posted-jobs", icon: <Clock size={18} /> },
    { name: "Job Applications", path: "/applications", icon: <FileText size={18} /> },
  ];

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN); 
    setIsOpen(false);
    navigate("/admin/auth"); 
  };

  return (
    <>
      <>
  {/* Mobile toggle button (Menu) */}
  {!isOpen && (
    <button
      onClick={() => setIsOpen(true)}
      className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-md text-white"
    >
      <Menu size={20} />
    </button>
  )}

  {/* Sidebar */}
  <div
    className={`z-10 fixed top-0 left-0 h-full w-60 bg-black border-r border-gray-800 text-white flex flex-col shadow-lg transform transition-transform duration-300 md:translate-x-0 ${
      isOpen ? "translate-x-0" : "-translate-x-full"
    }`}
  >
    {/* Logo + close button */}
    <div className="p-5 text-xl font-bold text-white tracking-wide border-b border-gray-800 flex items-center justify-between">
      <span>Recruva</span>
      {/* X button only on mobile */}
      <button
        onClick={() => setIsOpen(false)}
        className="md:hidden text-white"
      >
        <X size={20} />
      </button>
    </div>

    {/* Nav Links */}
    <nav className="flex-1 p-4 space-y-2">
      {links.map((link) => {
        const active = location.pathname === link.path;
        return (
          <Link
            key={link.name}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
              active
                ? "bg-white text-black shadow-sm"
                : "hover:bg-gray-900 hover:text-white text-gray-400"
            }`}
          >
            {link.icon}
            <span>{link.name}</span>
          </Link>
        );
      })}

      <button
        onClick={handleLogout}
        className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left text-gray-400 hover:bg-gray-900 hover:text-white transition-all duration-200"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </nav>

    {/* Footer */}
    <div className="p-4 text-sm text-gray-600 border-t border-gray-800">
      © 2025 Recruva
    </div>
  </div>

  {/* Ensure main content shifts right on desktop */}
  <div className="md:ml-60"></div>
</>
</>















  );
}
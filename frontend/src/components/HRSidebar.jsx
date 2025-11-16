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
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-md text-white"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-60 bg-gradient-to-b from-black via-gray-900 to-gray-800 text-gray-200 flex flex-col shadow-lg transform transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
  
        <div className="p-5 text-xl font-bold text-white tracking-wide border-b border-gray-700">
          Recruva
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-2">
          {links.map((link) => {
            const active = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)} // close on mobile
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                  active
                    ? "bg-gradient-to-r from-purple-600 to-indigo-500 text-white shadow-md"
                    : "hover:bg-gray-700 hover:text-white text-gray-300"
                }`}
              >
                {link.icon}
                <span>{link.name}</span>
              </Link>
            );
          })}

          {/* Logout button */}


          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg w-full text-left text-gray-300 hover:bg-gray-700 hover:text-white transition-all duration-200"

          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </nav>


        {/* Footer */}
        <div className="p-4 text-sm text-gray-500 border-t border-gray-700">
          © 2025 Recruva
        </div>





      </div>

      {/* Ensure main content shifts right on desktop */}
      <div className="md:ml-60"></div>
    </>















  );
}
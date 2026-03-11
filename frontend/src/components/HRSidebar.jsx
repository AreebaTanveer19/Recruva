import React, { useState } from "react";
import { LogOut, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ACCESS_TOKEN } from "../constants";
import LogoutPopup from "./LogoutPopup";

export default function HRSidebar({ links = [], panelName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showLogout, setShowLogout] = useState(false);

  const confirmLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    setShowLogout(false);
    setIsOpen(false);
    navigate("/admin/auth");
  };

  const onCancel = () => {
    setShowLogout(false);
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
          className={`z-10 fixed top-0 left-0 h-full bg-black border-r border-gray-800 text-white flex flex-col shadow-lg transform transition-all duration-300 md:translate-x-0 ${
            isOpen ? "translate-x-0" : "-translate-x-full"
          } ${isCollapsed ? "w-16" : "w-60"}`}
        >
          <div className="p-4 text-xl font-bold text-white tracking-wide border-b border-gray-800 flex items-start justify-center">
            {!isCollapsed && (
              <div className="text-center flex-1">
                <h1 className="text-2xl font-bold leading-tight">Recruva</h1>
                <p className="font-medium leading-tight">{panelName}</p>
              </div>
            )}

            {/* Mobile close */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-white mt-1"
            >
              <X size={20} />
            </button>

            {/* Desktop collapse toggle */}
            <button
              onClick={() => setIsCollapsed((prev) => !prev)}
              className="hidden md:block text-white mt-1"
            >
              {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
          </div>

          {/* Nav Links */}
          <nav className={`flex-1 space-y-2 ${isCollapsed ? "p-2" : "p-4"}`}>
            {links.map((link) => {
              const active = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  title={isCollapsed ? link.name : undefined}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all duration-200 ${
                    isCollapsed ? "justify-center" : "gap-3"
                  } ${
                    active
                      ? "bg-white text-black shadow-sm"
                      : "hover:bg-gray-900 hover:text-white text-gray-400"
                  }`}
                >
                  {link.icon}
                  {!isCollapsed && <span>{link.name}</span>}
                </Link>
              );
            })}

            <button
              onClick={() => setShowLogout(true)}
              title={isCollapsed ? "Logout" : undefined}
              className={`flex items-center px-3 py-2 rounded-lg w-full text-left text-gray-400 hover:bg-gray-900 hover:text-white transition-all duration-200 ${
                isCollapsed ? "justify-center" : "gap-3"
              }`}
            >
              <LogOut size={18} />
              {!isCollapsed && <span>Logout</span>}
            </button>

            {showLogout && (
              <LogoutPopup
                open={showLogout}
                onConfirm={confirmLogout}
                onCancel={onCancel}
              />
            )}
          </nav>

          {/* Footer */}
          {!isCollapsed && (
            <div className="p-4 text-sm text-gray-600 border-t border-gray-800">
              © {new Date().getFullYear()} Recruva
            </div>
          )}
        </div>

        <div className={`transition-all duration-300 ${isCollapsed ? "md:ml-16" : "md:ml-60"}`}></div>
      </>
    </>
  );
}
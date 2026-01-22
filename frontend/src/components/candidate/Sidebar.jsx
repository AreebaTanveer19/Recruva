import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiBriefcase, FiFileText, FiUser, FiSettings, FiLogOut, FiX, FiMenu } from 'react-icons/fi';
import { ACCESS_TOKEN } from '../../constants';

const Sidebar = ({ isMobileOpen: propIsMobileOpen, onClose: propOnClose }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isControlled = typeof propIsMobileOpen === 'boolean';
  
  // Use controlled or uncontrolled state based on props
  const sidebarOpen = isControlled ? propIsMobileOpen : isMobileOpen;
  const toggleSidebar = isControlled ? propOnClose : () => setIsMobileOpen(!isMobileOpen);
  const closeSidebar = isControlled ? propOnClose : () => setIsMobileOpen(false);
  
  const location = useLocation();
  const navigate = useNavigate();
  
  // Close sidebar when route changes
  useEffect(() => {
    closeSidebar?.();
  }, [location]);
  
  const navItems = [
    { icon: <FiHome className="w-5 h-5" />, label: 'Dashboard', path: '/candidate/dashboard' },
    // { icon: <FiBriefcase className="w-5 h-5" />, label: 'Job Openings', path: '/candidate/jobs' },
    { icon: <FiFileText className="w-5 h-5" />, label: 'Applications', path: '/candidate/applications' },
    { icon: <FiUser className="w-5 h-5" />, label: 'Profile', path: '/candidate/profile' },
    // { icon: <FiSettings className="w-5 h-5" />, label: 'Settings', path: '/candidate/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem(ACCESS_TOKEN);
    localStorage.removeItem('candidateData');
    closeSidebar?.();
    navigate('/candidate/auth');
  };

  const mobileTranslation = sidebarOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <>
      {/* Mobile hamburger button */}
      <button
        onClick={toggleSidebar}
        className="fixed left-4 top-4 z-30 flex items-center gap-2 p-2 text-blue-700 bg-white rounded-md shadow-md lg:hidden"
        aria-label="Toggle menu"
      >
        <FiMenu className="w-6 h-6" />
        <span className="font-medium">Menu</span>
      </button>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}
      
      <div
        className={`fixed left-0 top-0 z-50 h-screen w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-lg transform transition-transform duration-300 ${mobileTranslation} lg:translate-x-0`}
      >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Recruva</h1>
        <p className="text-blue-200 text-sm">Candidate Portal</p>
        {isControlled && (
          <button
            type="button"
            onClick={closeSidebar}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 lg:hidden"
            aria-label="Close sidebar"
          >
            <FiX className="h-4 w-4" />
          </button>
        )}
      </div>
      
      <nav className="mt-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={closeSidebar}
            className={`flex items-center gap-3 px-6 py-3 text-sm font-medium border-l-4 border-transparent transition-colors duration-200 ${
              location.pathname === item.path
                ? 'bg-blue-900/40 text-white border-blue-300'
                : 'text-blue-100 hover:bg-blue-800/30'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-blue-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700/50 rounded-md transition-colors duration-200"
        >
          <FiLogOut className="mr-3 w-5 h-5" />
          Logout
        </button>
      </div>
      </div>
    </>
  );
};

export default Sidebar;

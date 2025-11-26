import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiBriefcase, FiFileText, FiUser, FiSettings, FiLogOut, FiX } from 'react-icons/fi';
import { ACCESS_TOKEN } from '../../constants';

const Sidebar = ({ isMobileOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
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
    navigate('/candidate/auth');
    onClose?.();
  };

  const controlled = typeof isMobileOpen === 'boolean';
  const mobileTranslation = controlled
    ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full')
    : 'translate-x-0';

  return (
    <div
      className={`fixed left-0 top-0 z-40 h-screen w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-lg transform transition-transform duration-300 ${mobileTranslation} lg:translate-x-0`}
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold">Recruva</h1>
        <p className="text-blue-200 text-sm">Candidate Portal</p>
        {controlled && (
          <button
            type="button"
            onClick={() => onClose?.()}
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
            onClick={() => onClose?.()}
            className={`flex items-center px-6 py-3 text-sm font-medium transition-colors duration-200 ${
              location.pathname === item.path 
                ? 'bg-blue-700 text-white' 
                : 'text-blue-100 hover:bg-blue-700/50'
            }`}
          >
            <span className="mr-3">{item.icon}</span>
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
  );
};

export default Sidebar;

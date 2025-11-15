import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiBriefcase, FiFileText, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';

const Sidebar = () => {
  const location = useLocation();
  
  const navItems = [
    { icon: <FiHome className="w-5 h-5" />, label: 'Dashboard', path: '/candidate/dashboard' },
    // { icon: <FiBriefcase className="w-5 h-5" />, label: 'Job Openings', path: '/candidate/jobs' },
    { icon: <FiFileText className="w-5 h-5" />, label: 'Applications', path: '/candidate/applications' },
    { icon: <FiUser className="w-5 h-5" />, label: 'Profile', path: '/candidate/profile' },
    // { icon: <FiSettings className="w-5 h-5" />, label: 'Settings', path: '/candidate/settings' },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-blue-800 to-blue-900 text-white shadow-lg">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Recruva</h1>
        <p className="text-blue-200 text-sm">Candidate Portal</p>
      </div>
      
      <nav className="mt-8">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
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
        <button className="flex items-center w-full px-4 py-2 text-sm font-medium text-blue-100 hover:bg-blue-700/50 rounded-md transition-colors duration-200">
          <FiLogOut className="mr-3 w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

import React from 'react';
import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN, ROLE } from '../constants';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  const userRole = localStorage.getItem(ROLE); 

  if (!token || !allowedRoles.includes(userRole)) {
    if(userRole=="candidate")
    return <Navigate to="/candidate/auth" replace />; 
    else{
    console.log(`you dont have access to ${allowedRoles[0]} routes`)
    return <Navigate to="/admin/auth" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

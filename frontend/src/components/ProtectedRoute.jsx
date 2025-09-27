import React from 'react';
import { Navigate } from 'react-router-dom';
import { ACCESS_TOKEN} from '../constants';
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem(ACCESS_TOKEN);
  const decoded = token ? jwtDecode(token) : null;
  const userRole = decoded?.role;

  if (!token || !allowedRoles.includes(userRole)) {
    if(allowedRoles[0]=="candidate")
    return <Navigate to="/candidate/auth" replace />; 
    else{
    console.log(`you dont have access to ${allowedRoles[0]} routes`)
    return <Navigate to="/admin/auth" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;

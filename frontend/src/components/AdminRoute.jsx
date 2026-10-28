import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function AdminRoute({ children }) {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user') || '{}');
  } catch {
    user = {};
  }

  const isAdmin = Boolean(
    token && (role === 'admin' || user?.role === 'admin')
  );

  if (!isAdmin) {
    // Redirect unauthenticated or unauthorized users straight to admin login
    return <Navigate to="/admin-login" state={{ from: location }} replace />;
  }

  return children;
}

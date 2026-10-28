import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));

  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Paint Studio', path: '/paint-visualizer' },
    { label: 'Inspiration', path: '/inspiration' },
    { label: 'About', path: '/about' },
  ];

  const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitial = storedUser.name ? storedUser.name.charAt(0).toUpperCase() : 'S';

  return (
    <nav className="navbar" role="navigation" aria-label="Main Navigation">
      <div className="navbar-left">
        <div
          className="navbar-brand-wrap"
          onClick={() => navigate(role === 'admin' ? '/admin-dashboard' : '/paint-visualizer')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate(role === 'admin' ? '/admin-dashboard' : '/paint-visualizer')}
        >
          {/* Stylized Paint Swatch Mark */}
          <div className="brand-logo-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C12.83 22 13.5 21.33 13.5 20.5C13.5 20.12 13.36 19.78 13.13 19.52C12.91 19.26 12.77 18.91 12.77 18.5C12.77 17.67 13.44 17 14.27 17H16C19.31 17 22 14.31 22 11C22 6.03 17.52 2 12 2Z"
                fill="#FF6B53"
              />
              <circle cx="6.5" cy="11.5" r="1.5" fill="#FAF8F5" />
              <circle cx="9.5" cy="7.5" r="1.5" fill="#FAF8F5" />
              <circle cx="14.5" cy="7.5" r="1.5" fill="#FAF8F5" />
              <circle cx="17.5" cy="11.5" r="1.5" fill="#FAF8F5" />
            </svg>
          </div>
          <span className="navbar-brand-text">Wall Paint Visualizer</span>
        </div>
      </div>

      <div className="navbar-center">
        {navLinks.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              className={`nav-link-btn ${isActive ? 'active' : ''}`}
              onClick={() => navigate(item.path)}
            >
              {item.label}
              {isActive && <span className="active-underline-indicator" />}
            </button>
          );
        })}
      </div>

      <div className="navbar-right">
        {/* Admin Dashboard Pill Shortcut */}
        <button
          type="button"
          className="admin-nav-pill-btn"
          onClick={() => navigate('/admin-dashboard')}
          title="Open Admin Dashboard"
        >
          <LayoutDashboard size={15} />
          <span>Admin Dashboard</span>
        </button>

        {isAuthenticated ? (
          <ProfileDropdown onLogout={handleLogout} />
        ) : (
          <div className="auth-avatar-wrap">
            <button
              type="button"
              className="navbar-avatar-btn"
              onClick={handleLoginClick}
              title="Sign In / User Profile"
              aria-label="User profile login"
            >
              {userInitial}
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

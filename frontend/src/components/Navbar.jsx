import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, User, LogIn, LogOut, FolderHeart, UserPlus } from 'lucide-react';
import ProfileDropdown from './ProfileDropdown';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'));
  const [role, setRole] = useState(() => localStorage.getItem('role'));
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleStorage = () => {
      setIsAuthenticated(!!localStorage.getItem('token'));
      setRole(localStorage.getItem('role'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  // Close mobile menu on Escape key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileMenuOpen]);

  // Auto-close mobile menu if viewport resized to desktop width
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

        {/* Mobile Hamburger Toggle */}
        <button
          type="button"
          className="navbar-mobile-toggle"
          onClick={() => setIsMobileMenuOpen((prev) => !prev)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="navbar-mobile-menu"
          aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
        >
          {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          className="navbar-drawer-backdrop"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Account & Navigation Drawer */}
      {isMobileMenuOpen && (
        <aside
          id="navbar-mobile-menu"
          className="navbar-mobile-drawer"
          role="dialog"
          aria-modal="true"
          aria-label="Account navigation drawer"
        >
          {/* Account Status Card */}
          <div className="navbar-drawer-account">
            <div className="navbar-drawer-avatar" aria-hidden="true">
              {isAuthenticated ? userInitial : <User size={20} />}
            </div>
            <div className="navbar-drawer-account-info">
              <span className="navbar-drawer-account-name">
                {isAuthenticated ? (storedUser.name || 'Customer') : 'Visitor'}
              </span>
              <span className="navbar-drawer-account-status">
                {isAuthenticated
                  ? (role === 'admin' ? 'Administrator' : 'Customer Account')
                  : 'Not signed in — Browse mode'}
              </span>
            </div>
          </div>

          <div className="navbar-drawer-body">
            <div className="navbar-drawer-section-label">Navigation</div>
            <div className="navbar-mobile-links">
              {navLinks.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.label}
                    type="button"
                    className={`mobile-nav-link-btn ${isActive ? 'active' : ''}`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate(item.path);
                    }}
                  >
                    <span>{item.label}</span>
                    {isActive && <span className="mobile-active-dot" />}
                  </button>
                );
              })}
            </div>

            <div className="mobile-nav-divider" />

            {/* Account Options */}
            <div className="navbar-drawer-section-label">Account</div>
            <div className="navbar-mobile-links">
              {isAuthenticated ? (
                <>
                  <button
                    type="button"
                    className={`mobile-nav-link-btn ${location.pathname === '/my-designs' ? 'active' : ''}`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/my-designs');
                    }}
                  >
                    <FolderHeart size={18} />
                    <span>My Saved Designs</span>
                  </button>
                  <button
                    type="button"
                    className={`mobile-nav-link-btn ${location.pathname === '/profile' ? 'active' : ''}`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/profile');
                    }}
                  >
                    <User size={18} />
                    <span>Manage Profile</span>
                  </button>
                  <button
                    type="button"
                    className="mobile-nav-link-btn mobile-nav-logout-btn"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleLogout();
                    }}
                  >
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className={`mobile-nav-link-btn mobile-nav-login-btn ${location.pathname === '/login' ? 'active' : ''}`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/login');
                    }}
                  >
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </button>
                  <button
                    type="button"
                    className={`mobile-nav-link-btn mobile-nav-signup-btn ${location.pathname === '/register' ? 'active' : ''}`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      navigate('/register');
                    }}
                  >
                    <UserPlus size={18} />
                    <span>Sign Up as Customer</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </aside>
      )}
    </nav>
  );
};

export default Navbar;

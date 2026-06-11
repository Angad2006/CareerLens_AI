import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFileText, FiSun, FiMoon, FiLogIn, FiLogOut, FiUser, FiChevronDown, FiClock } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, signOut, username } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Hide navbar on auth pages
  if (['/login', '/signup'].includes(location.pathname)) return null;

  const navLinks = [
    { path: '/', label: 'Home', icon: null },
    { path: '/upload', label: 'Analyze', icon: <FiUpload /> },
    { path: '/jd-match', label: 'JD Match', icon: <FiFileText /> },
  ];

  if (isAuthenticated) {
    navLinks.push({ path: '/history', label: 'History', icon: <FiClock /> });
  }

  const handleLogout = async () => {
    setShowDropdown(false);
    await signOut();
    navigate('/');
  };

  const initials = username?.charAt(0)?.toUpperCase() || 'U';

  return (
    <motion.nav
      className="navbar"
      initial={{ y: -80 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
    >
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">
            <svg width="22" height="22" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="blueGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#60a5fa" />
                  <stop offset="100%" stop-color="#3b82f6" />
                </linearGradient>
                <linearGradient id="goldGradNav" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#fde047" />
                  <stop offset="50%" stop-color="#eab308" />
                  <stop offset="100%" stop-color="#ca8a04" />
                </linearGradient>
              </defs>
              <g transform="translate(4, 4) scale(0.92)">
                <path d="M 68,22 C 34,16 14,42 24,68 C 30,82 52,86 68,78" stroke="url(#blueGradNav)" strokeWidth="8.5" strokeLinecap="round" fill="none" />
                <path d="M 44,36 L 44,64 L 62,64" stroke="url(#goldGradNav)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M 65,28 Q 65,38 55,38 Q 65,38 65,48 Q 65,38 75,38 Q 65,38 65,28 Z" fill="url(#goldGradNav)" />
              </g>
            </svg>
          </div>
          <span className="navbar-title">Career<span className="text-gradient">Lens</span> AI</span>
        </Link>

        <div className="navbar-links">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`navbar-link ${location.pathname === link.path ? 'active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
              {location.pathname === link.path && (
                <motion.div className="navbar-link-indicator" layoutId="navIndicator" />
              )}
            </Link>
          ))}
        </div>

        <div className="navbar-right">
          <button className="theme-toggle-btn" onClick={toggleTheme} aria-label="Toggle theme">
            <motion.div
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {theme === 'dark' ? <FiSun /> : <FiMoon />}
            </motion.div>
          </button>

          {isAuthenticated ? (
            <div className="user-menu" ref={dropdownRef}>
              <button className="user-avatar-btn" onClick={() => setShowDropdown(!showDropdown)}>
                <div className="user-avatar">{initials}</div>
                <span className="user-name">{username}</span>
                <FiChevronDown className={`chevron ${showDropdown ? 'open' : ''}`} />
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                    className="user-dropdown"
                    initial={{ opacity: 0, y: -8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                  >
                    <div className="dropdown-header">
                      <div className="dropdown-avatar">{initials}</div>
                      <div>
                        <div className="dropdown-name">{username}</div>
                        <div className="dropdown-email">{user?.email}</div>
                      </div>
                    </div>
                    <div className="dropdown-divider" />
                    <Link to="/history" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FiClock /> My History
                    </Link>
                    <div className="dropdown-divider" />
                    <button className="dropdown-item" onClick={handleLogout}>
                      <FiLogOut /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost btn-sm">Sign In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
            </div>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

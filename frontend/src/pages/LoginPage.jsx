import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiArrowRight, FiEye, FiEyeOff, FiLogIn } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    navigate('/upload', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    setError('');
    try {
      await signIn(email, password);
      navigate('/upload');
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="bg-orbs">
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
      </div>

      <div className="auth-container">
        {/* Left — Branding Panel */}
        <motion.div
          className="auth-branding"
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="auth-brand-content">
            <div className="auth-logo">
              <svg width="48" height="48" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="bgGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e40af" />
                    <stop offset="100%" stop-color="#080c18" />
                  </linearGradient>
                  <linearGradient id="blueGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6" />
                    <stop offset="100%" stop-color="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="goldGradAuth" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fde047" />
                    <stop offset="50%" stop-color="#eab308" />
                    <stop offset="100%" stop-color="#ca8a04" />
                  </linearGradient>
                </defs>

                <rect width="100" height="100" rx="22" fill="url(#bgGradAuth)" />

                <g transform="translate(4, 4) scale(0.92)">
                  <path d="M 68,22 C 34,16 14,42 24,68 C 30,82 52,86 68,78" stroke="url(#blueGradAuth)" strokeWidth="8.5" strokeLinecap="round" fill="none" />
                  <path d="M 44,36 L 44,64 L 62,64" stroke="url(#goldGradAuth)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M 65,28 Q 65,38 55,38 Q 65,38 65,48 Q 65,38 75,38 Q 65,38 65,28 Z" fill="url(#goldGradAuth)" />
                </g>
              </svg>
            </div>
            <h1 className="auth-brand-title">Career<span>Lens</span> AI</h1>
            <p className="auth-brand-desc">
              Experience the power of CareerLens AI—engineered with advanced modeling to analyze resumes, optimize for ATS, and map out career trajectories with precision unmatched by standard scanners.
            </p>
            <div className="auth-brand-features">
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span>AI-Powered ATS Scoring</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span>Skills Gap Analysis</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span>Career Path Prediction</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right — Login Form */}
        <motion.div
          className="auth-form-panel"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="auth-form-wrapper">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h2 className="auth-form-title">Welcome Back</h2>
              <p className="auth-form-subtitle">Sign in to your CareerLens account</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="auth-form">
              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
              >
                <label className="form-label">Email</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input
                    type="email"
                    className="auth-input"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </motion.div>

              <motion.div
                className="form-group"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="auth-input"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </motion.div>

              {error && (
                <motion.div
                  className="auth-error"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="btn-loading">Signing in...</span>
                ) : (
                  <>Sign In <FiArrowRight /></>
                )}
              </motion.button>
            </form>

            <motion.p
              className="auth-switch"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
            >
              Don&apos;t have an account? <Link to="/signup" className="auth-link">Create one</Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

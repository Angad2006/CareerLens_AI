import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiUser, FiArrowRight, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './AuthPages.css';

function getPasswordStrength(pass) {
  let score = 0;
  if (pass.length >= 6) score++;
  if (pass.length >= 10) score++;
  if (/[A-Z]/.test(pass)) score++;
  if (/[0-9]/.test(pass)) score++;
  if (/[^A-Za-z0-9]/.test(pass)) score++;
  return score;
}

const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
const STRENGTH_COLORS = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#22c55e'];

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (isAuthenticated) {
    navigate('/upload', { replace: true });
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!username || !email || !password || !confirmPass) {
      setError('Please fill in all fields.');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPass) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, username);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="bg-orbs">
          <div className="bg-orb"></div><div className="bg-orb"></div><div className="bg-orb"></div>
        </div>
        <motion.div
          className="auth-success-card"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="success-check-circle">
            <FiCheck />
          </div>
          <h2>Account Created!</h2>
          <p>Check your email for a confirmation link, then sign in.</p>
          <Link to="/login" className="btn btn-primary btn-lg" style={{ marginTop: '16px' }}>
            Go to Login <FiArrowRight />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="bg-orbs">
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
      </div>

      <div className="auth-container">
        {/* Left — Branding */}
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
                  <linearGradient id="bgGradAuth2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#1e40af" />
                    <stop offset="100%" stop-color="#080c18" />
                  </linearGradient>
                  <linearGradient id="blueGradAuth2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6" />
                    <stop offset="100%" stop-color="#1d4ed8" />
                  </linearGradient>
                  <linearGradient id="goldGradAuth2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#fde047" />
                    <stop offset="50%" stop-color="#eab308" />
                    <stop offset="100%" stop-color="#ca8a04" />
                  </linearGradient>
                </defs>

                <rect width="100" height="100" rx="22" fill="url(#bgGradAuth2)" />

                <g transform="translate(4, 4) scale(0.92)">
                  <path d="M 68,22 C 34,16 14,42 24,68 C 30,82 52,86 68,78" stroke="url(#blueGradAuth2)" strokeWidth="8.5" strokeLinecap="round" fill="none" />
                  <path d="M 44,36 L 44,64 L 62,64" stroke="url(#goldGradAuth2)" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  <path d="M 65,28 Q 65,38 55,38 Q 65,38 65,48 Q 65,38 75,38 Q 65,38 65,28 Z" fill="url(#goldGradAuth2)" />
                </g>
              </svg>
            </div>
            <h1 className="auth-brand-title">Career<span>Lens</span> AI</h1>
            <p className="auth-brand-desc">
              Join the new generation of career management. CareerLens AI provides industry-leading context parsing and deep cognitive analysis that outperforms generic scanners and builders.
            </p>
            <div className="auth-brand-features">
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span>Free Resume Analysis</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span>Save Analysis History</span>
              </div>
              <div className="auth-feature-item">
                <div className="auth-feature-dot"></div>
                <span>Personalized Insights</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Right — Signup Form */}
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
              <h2 className="auth-form-title">Create Account</h2>
              <p className="auth-form-subtitle">Start your career intelligence journey</p>
            </motion.div>

            <form onSubmit={handleSubmit} className="auth-form">
              <motion.div className="form-group" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
                <label className="form-label">Username</label>
                <div className="input-wrapper">
                  <FiUser className="input-icon" />
                  <input type="text" className="auth-input" placeholder="Choose a username" value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" />
                </div>
              </motion.div>

              <motion.div className="form-group" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.36 }}>
                <label className="form-label">Email</label>
                <div className="input-wrapper">
                  <FiMail className="input-icon" />
                  <input type="email" className="auth-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" />
                </div>
              </motion.div>

              <motion.div className="form-group" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                <label className="form-label">Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input type={showPass ? 'text' : 'password'} className="auth-input" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
                  <button type="button" className="pass-toggle" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                {password && (
                  <div className="password-strength">
                    <div className="strength-bar">
                      <motion.div
                        className="strength-bar-fill"
                        style={{ background: STRENGTH_COLORS[strength] }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(strength / 5) * 100}%` }}
                      />
                    </div>
                    <span className="strength-label" style={{ color: STRENGTH_COLORS[strength] }}>
                      {STRENGTH_LABELS[strength]}
                    </span>
                  </div>
                )}
              </motion.div>

              <motion.div className="form-group" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.44 }}>
                <label className="form-label">Confirm Password</label>
                <div className="input-wrapper">
                  <FiLock className="input-icon" />
                  <input type="password" className="auth-input" placeholder="Confirm your password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)} autoComplete="new-password" />
                  {confirmPass && password === confirmPass && (
                    <FiCheck className="pass-match-icon" />
                  )}
                </div>
              </motion.div>

              {error && (
                <motion.div className="auth-error" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                  {error}
                </motion.div>
              )}

              <motion.button
                type="submit"
                className="btn btn-primary btn-lg auth-submit"
                disabled={loading}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? 'Creating account...' : <>Create Account <FiArrowRight /></>}
              </motion.button>
            </form>

            <motion.p className="auth-switch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}>
              Already have an account? <Link to="/login" className="auth-link">Sign in</Link>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

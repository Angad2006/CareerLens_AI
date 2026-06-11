import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiFileText, FiTrash2, FiEye, FiBriefcase, FiAlertCircle, FiArrowRight } from 'react-icons/fi';
import { getAnalysisHistory, deleteAnalysis } from '../services/supabase';
import { useAuth } from '../context/AuthContext';
import './HistoryPage.css';

export default function HistoryPage({ setAnalysisData, setResumeText }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    async function fetchHistory() {
      try {
        setLoading(true);
        const data = await getAnalysisHistory(user.id);
        setHistory(data);
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load analysis history. Please check your Supabase tables.');
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [user, navigate]);

  const handleViewAnalysis = (item) => {
    // Restore states
    setAnalysisData(item.analysis_data);
    setResumeText(item.analysis_data.extracted_text || '');
    navigate('/analysis');
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation(); // Avoid triggering card click
    setDeletingId(id);
    try {
      await deleteAnalysis(id, user.id);
      setHistory(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Failed to delete the analysis. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const formatDistance = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="history-page">
        <div className="bg-orbs"><div className="bg-orb"></div><div className="bg-orb"></div></div>
        <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Retrieving your Career history...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page page-enter">
      <div className="bg-orbs"><div className="bg-orb"></div><div className="bg-orb"></div></div>

      <div className="container">
        <motion.div 
          className="history-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Your Analysis <span className="text-gradient">History</span></h1>
          <p>Revisit past analyses, compare scores, and jump back into JD matching.</p>
        </motion.div>

        {error && (
          <div className="error-banner">
            <FiAlertCircle />
            <span>{error}</span>
          </div>
        )}

        {history.length === 0 ? (
          <motion.div 
            className="empty-history glass-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="empty-icon"><FiFileText /></div>
            <h2>No Resumes Analyzed Yet</h2>
            <p>Upload your resume to receive AI insights, ATS optimization, and career recommendations.</p>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              Analyze Your Resume <FiArrowRight />
            </button>
          </motion.div>
        ) : (
          <div className="history-grid">
            <AnimatePresence mode="popLayout">
              {history.map((item, index) => {
                const isHighATS = (item.ats_score || 0) >= 80;
                return (
                  <motion.div
                    key={item.id}
                    className={`history-card glass-card ${isHighATS ? 'high-ats-card' : ''}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 10 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleViewAnalysis(item)}
                    whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)' }}
                  >
                    {isHighATS && <div className="card-badge">Top Scorer</div>}
                    
                    <div className="card-header-section">
                      <div className="doc-icon-wrapper">
                        <FiFileText className="doc-icon" />
                      </div>
                      <div className="doc-details">
                        <h3 className="doc-title" title={item.filename}>{item.filename}</h3>
                        <div className="meta-info">
                          <span className="meta-time">
                            <FiClock /> {formatDistance(item.created_at)}
                          </span>
                          {item.industry && (
                            <span className="meta-industry">
                              <FiBriefcase /> {item.industry}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="card-scores">
                      <div className="score-metric">
                        <span className="metric-label">ATS Score</span>
                        <div className="metric-value-container">
                          <span className="metric-value text-gold">{item.ats_score?.toFixed(0)}</span>
                          <span className="metric-total">/100</span>
                        </div>
                      </div>
                      <div className="score-divider"></div>
                      <div className="score-metric">
                        <span className="metric-label">Skills Match</span>
                        <div className="metric-value-container">
                          <span className="metric-value text-blue">{item.skill_match?.toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button className="btn-icon view-btn" title="View Full Report">
                        <FiEye /> View Report
                      </button>
                      <button 
                        className="btn-icon delete-btn" 
                        onClick={(e) => handleDelete(item.id, e)}
                        disabled={deletingId === item.id}
                        title="Delete Analysis"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

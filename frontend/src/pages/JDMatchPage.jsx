import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import JDMatcher from '../components/jd-match/JDMatcher';

export default function JDMatchPage({ resumeText }) {
  const navigate = useNavigate();

  return (
    <div className="page-enter" style={{ minHeight: 'calc(100vh - var(--navbar-height))', padding: '48px 0 64px' }}>
      <div className="bg-orbs"><div className="bg-orb"></div><div className="bg-orb"></div><div className="bg-orb"></div></div>
      <div className="container" style={{ maxWidth: '800px' }}>
        <motion.div
          style={{ textAlign: 'center', marginBottom: '32px' }}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-heading)', marginBottom: '4px' }}>
            Job Description <span className="text-gradient">Matching</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>
            Compare your resume against a specific job description
          </p>
        </motion.div>

        {resumeText ? (
          <JDMatcher resumeText={resumeText} />
        ) : (
          <motion.div
            className="glass-card"
            style={{ textAlign: 'center', padding: '48px' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '1rem' }}>
              Upload your resume first to use JD matching.
            </p>
            <button className="btn btn-primary" onClick={() => navigate('/upload')}>
              Upload Resume
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

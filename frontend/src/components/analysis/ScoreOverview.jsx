import { motion } from 'framer-motion';
import { FiTarget, FiZap, FiTrendingUp, FiAward } from 'react-icons/fi';
import ProgressRing from '../common/ProgressRing';
import AnimatedCounter from '../common/AnimatedCounter';
import './ScoreOverview.css';

export default function ScoreOverview({ atsScore, skillMatch, careerMatch, insights }) {
  const metrics = [
    { label: 'Domain Match', value: careerMatch?.top_matches?.[0]?.match_percentage || 0, icon: <FiTarget />, color: '#1e40af' },
    { label: 'Skill Match', value: skillMatch || 0, icon: <FiZap />, color: '#d4af37' },
    { label: 'ATS Score', value: atsScore?.overall_score || 0, icon: <FiTrendingUp />, color: '#22c55e' },
    { label: 'Job Readiness', value: Math.round(((atsScore?.overall_score || 0) + (skillMatch || 0)) / 2), icon: <FiAward />, color: '#3b82f6' },
  ];

  return (
    <div className="score-overview">
      <div className="score-hero">
        <ProgressRing score={atsScore?.overall_score || 0} size={180} strokeWidth={12} label="ATS Score" />
        <div className="score-hero-info">
          <h2>Resume Analysis Complete</h2>
          <p className="score-strength">
            Strength: <span className={`strength-${(insights?.resume_strength || 'average').toLowerCase().replace(/\s+/g, '-')}`}>
              {insights?.resume_strength || 'Average'}
            </span>
          </p>
          <p className="score-level">Experience: {insights?.experience_level || 'Entry Level'}</p>
          <p className="score-probability">
            Hiring Probability: <span className={`prob-${(insights?.hiring_probability || 'moderate').toLowerCase()}`}>
              {insights?.hiring_probability || 'Moderate'}
            </span>
          </p>
        </div>
      </div>

      <div className="score-metrics">
        {metrics.map((metric, idx) => (
          <motion.div
            key={metric.label}
            className="score-metric-card glass-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.1 }}
          >
            <div className="metric-icon" style={{ color: metric.color, background: `${metric.color}15` }}>
              {metric.icon}
            </div>
            <div className="metric-value">
              <AnimatedCounter value={metric.value} suffix="%" />
            </div>
            <div className="metric-label">{metric.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

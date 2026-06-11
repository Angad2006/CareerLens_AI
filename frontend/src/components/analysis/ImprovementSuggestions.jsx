import { motion } from 'framer-motion';
import { FiAlertTriangle, FiAlertCircle, FiInfo } from 'react-icons/fi';
import GlassCard from '../common/GlassCard';

const ICONS = {
  critical: <FiAlertTriangle style={{ color: '#ef4444' }} />,
  important: <FiAlertCircle style={{ color: '#f59e0b' }} />,
  nice_to_have: <FiInfo style={{ color: '#3b82f6' }} />,
};

const BADGE = {
  critical: 'badge-danger',
  important: 'badge-warning',
  nice_to_have: 'badge-info',
};

export default function ImprovementSuggestions({ data }) {
  if (!data) return null;

  return (
    <GlassCard title="AI Suggestions" icon={<FiAlertCircle />} delay={0.3}>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Improvement Potential: <strong style={{ color: 'var(--text-primary)' }}>{data.overall_improvement_potential}</strong>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.suggestions.map((s, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + idx * 0.08 }}
            style={{
              display: 'flex', gap: '12px', padding: '14px',
              background: 'var(--bg-glass)', border: '1px solid var(--border-glass)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            <div style={{ paddingTop: '2px', flexShrink: 0 }}>{ICONS[s.category]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{s.title}</strong>
                <span className={`badge ${BADGE[s.category]}`}>{s.impact}</span>
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{s.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

import { FiList, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import GlassCard from '../common/GlassCard';

export default function SectionDetection({ data }) {
  if (!data) return null;

  return (
    <GlassCard title="Resume Sections" icon={<FiList />} delay={0.3}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Completeness:</span>
        <div className="progress-bar" style={{ flex: 1 }}>
          <div
            className={`progress-bar-fill ${data.completeness_score >= 70 ? 'high' : data.completeness_score >= 40 ? 'mid' : 'low'}`}
            style={{ width: `${data.completeness_score}%` }}
          />
        </div>
        <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{Math.round(data.completeness_score)}%</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
        {data.sections.map(section => (
          <div key={section.name} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            padding: '10px 14px',
            background: section.detected ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
            border: `1px solid ${section.detected ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`,
            borderRadius: 'var(--radius-sm)',
          }}>
            {section.detected
              ? <FiCheckCircle style={{ color: '#10b981', flexShrink: 0 }} />
              : <FiXCircle style={{ color: '#ef4444', flexShrink: 0 }} />}
            <span style={{ flex: 1, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{section.name}</span>
            {section.detected && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {Math.round(section.quality_score)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

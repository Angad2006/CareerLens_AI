import { FiKey, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import GlassCard from '../common/GlassCard';
import AnimatedCounter from '../common/AnimatedCounter';

export default function ATSKeywords({ data }) {
  if (!data) return null;
  const { present_keywords, missing_keywords, keyword_density, optimization_score } = data;

  return (
    <GlassCard title="ATS Keywords" icon={<FiKey />} delay={0.2}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <div className="progress-bar">
            <div
              className={`progress-bar-fill ${optimization_score >= 70 ? 'high' : optimization_score >= 40 ? 'mid' : 'low'}`}
              style={{ width: `${optimization_score}%` }}
            />
          </div>
        </div>
        <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', minWidth: '60px' }}>
          <AnimatedCounter value={optimization_score} suffix="%" />
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-success)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiCheckCircle /> Keywords Found ({present_keywords.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {present_keywords.slice(0, 15).map(kw => (
              <span key={kw} className="skill-tag skill-tag-found">{kw}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-danger)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FiXCircle /> Missing Keywords ({missing_keywords.length})
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {missing_keywords.slice(0, 15).map(kw => (
              <span key={kw} className="skill-tag skill-tag-missing">{kw}</span>
            ))}
          </div>
        </div>
      </div>

      {Object.keys(keyword_density).length > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Keyword Density (top keywords)
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(keyword_density).slice(0, 6).map(([kw, density]) => (
              <div key={kw} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', minWidth: '120px' }}>{kw}</span>
                <div className="progress-bar" style={{ flex: 1, height: '6px' }}>
                  <div className="progress-bar-fill high" style={{ width: `${Math.min(100, density * 30)}%` }} />
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', minWidth: '40px' }}>{density}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

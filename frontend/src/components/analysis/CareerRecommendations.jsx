import { FiCompass, FiAward, FiBookOpen, FiCpu, FiArrowRight } from 'react-icons/fi';
import GlassCard from '../common/GlassCard';

export default function CareerRecommendations({ data }) {
  if (!data) return null;

  const sections = [
    { title: 'Best-Suited Roles', items: data.best_roles, icon: <FiCompass />, color: '#6366f1' },
    { title: 'Certifications', items: data.certifications, icon: <FiAward />, color: '#10b981' },
    { title: 'Courses to Take', items: data.courses, icon: <FiBookOpen />, color: '#06b6d4' },
    { title: 'Technologies to Learn', items: data.technologies_to_learn, icon: <FiCpu />, color: '#f59e0b' },
  ];

  return (
    <GlassCard title="Career Recommendations" icon={<FiCompass />} delay={0.4}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        {sections.map(section => (
          <div key={section.title} style={{
            padding: '16px', background: 'var(--bg-glass)',
            border: '1px solid var(--border-glass)', borderRadius: 'var(--radius-md)',
          }}>
            <h4 style={{
              fontSize: '0.85rem', color: section.color, marginBottom: '10px',
              display: 'flex', alignItems: 'center', gap: '6px',
            }}>
              {section.icon} {section.title}
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {section.items.slice(0, 5).map(item => (
                <li key={item} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <FiArrowRight style={{ fontSize: '0.7rem', color: section.color, flexShrink: 0 }} /> {item}
                </li>
              ))}
              {section.items.length === 0 && (
                <li style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No recommendations</li>
              )}
            </ul>
          </div>
        ))}
      </div>

      {data.career_transitions?.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Career Transition Paths</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {data.career_transitions.map(t => (
              <span key={t} className="badge badge-primary">{t}</span>
            ))}
          </div>
        </div>
      )}
    </GlassCard>
  );
}

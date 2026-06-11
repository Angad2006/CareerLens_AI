import { FiTarget } from 'react-icons/fi';
import GlassCard from '../common/GlassCard';
import AnimatedCounter from '../common/AnimatedCounter';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function CareerSuitability({ data }) {
  if (!data || !data.top_matches) return null;

  const chartData = data.top_matches.slice(0, 5).map(m => ({
    name: m.industry.length > 18 ? m.industry.substring(0, 16) + '…' : m.industry,
    value: m.match_percentage,
  }));

  return (
    <GlassCard title="Career Suitability" icon={<FiTarget />} delay={0.2}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div>
          <h4 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Best Matching Industries
          </h4>
          {data.top_matches.slice(0, 5).map((match, idx) => (
            <div key={match.industry} style={{
              display: 'flex', alignItems: 'center', gap: '12px',
              marginBottom: '12px', padding: '10px 14px',
              background: 'var(--bg-glass)', borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-glass)',
            }}>
              <span style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: COLORS[idx], display: 'flex', alignItems: 'center',
                justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 700,
              }}>
                {idx + 1}
              </span>
              <span style={{ flex: 1, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{match.industry}</span>
              <span style={{ fontWeight: 700, color: COLORS[idx] }}>
                <AnimatedCounter value={match.match_percentage} suffix="%" />
              </span>
            </div>
          ))}
        </div>
        <div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
              <XAxis type="number" domain={[0, 100]} tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis type="category" dataKey="name" width={100} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={20}>
                {chartData.map((_, idx) => (
                  <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {data.career_paths.length > 0 && (
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-glass)' }}>
          <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Suggested Roles</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {data.career_paths.map(role => (
              <span key={role} className="badge badge-primary">{role}</span>
            ))}
          </div>
        </div>
      )}

      {data.reasoning && (
        <div style={{ 
          marginTop: '20px', 
          padding: '14px 18px', 
          background: data.reasoning.includes('⚠') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(34, 197, 94, 0.08)', 
          border: `1px solid ${data.reasoning.includes('⚠') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'}`,
          borderRadius: '10px',
          color: data.reasoning.includes('⚠') ? '#f87171' : '#4ade80',
          fontSize: '0.86rem',
          lineHeight: '1.6'
        }}>
          {data.reasoning}
        </div>
      )}
    </GlassCard>
  );
}

import { motion } from 'framer-motion';
import { FiZap, FiAlertCircle, FiStar } from 'react-icons/fi';
import GlassCard from '../common/GlassCard';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts';

export default function SkillsAnalysis({ data }) {
  if (!data) return null;
  const { found_skills, missing_skills, recommended_skills, skill_match_percentage } = data;

  const radarData = [
    { skill: 'Technical', value: Math.min(100, found_skills.technical.length * 8) },
    { skill: 'Soft Skills', value: Math.min(100, found_skills.soft_skills.length * 12) },
    { skill: 'Tools', value: Math.min(100, found_skills.tools.length * 10) },
    { skill: 'Industry', value: Math.min(100, found_skills.industry_specific.length * 15) },
  ];

  return (
    <GlassCard title="Skills Analysis" icon={<FiZap />} delay={0.1}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px', alignItems: 'start' }}>
        <div>
          {found_skills.technical.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Technical Skills Found
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {found_skills.technical.map(skill => (
                  <motion.span key={skill} className="skill-tag skill-tag-found"
                    initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}>
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>
          )}

          {found_skills.soft_skills.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Soft Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {found_skills.soft_skills.map(skill => (
                  <span key={skill} className="skill-tag skill-tag-found">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {found_skills.tools.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Tools & Technologies
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {found_skills.tools.map(skill => (
                  <span key={skill} className="skill-tag skill-tag-found">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {missing_skills.industry_specific?.length > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-danger)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiAlertCircle /> Missing Industry Skills
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {missing_skills.industry_specific.map(skill => (
                  <span key={skill} className="skill-tag skill-tag-missing">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {recommended_skills.length > 0 && (
            <div>
              <h4 style={{ fontSize: '0.85rem', color: 'var(--accent-warning)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiStar /> Recommended to Learn
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {recommended_skills.slice(0, 8).map(skill => (
                  <span key={skill} className="skill-tag skill-tag-recommended">{skill}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border-glass)" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
              <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>Skill Distribution</p>
        </div>
      </div>
    </GlassCard>
  );
}

import { motion } from 'framer-motion';

export default function ProgressRing({ score, size = 140, strokeWidth = 10, label = 'Score' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 75) return '#10b981';
    if (s >= 50) return '#f59e0b';
    return '#ef4444';
  };

  const getGradientId = `ring-${score}-${size}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id={getGradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={getColor(score)} />
            <stop offset="100%" stopColor={score >= 75 ? '#06b6d4' : score >= 50 ? '#f97316' : '#f97316'} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="var(--bg-tertiary)"
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={`url(#${getGradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut', delay: 0.3 }}
        />
        <text
          x={size / 2} y={size / 2 - 6}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-primary)"
          fontSize={size * 0.22}
          fontWeight="800"
          fontFamily="Inter"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
        >
          {Math.round(score)}
        </text>
        <text
          x={size / 2} y={size / 2 + size * 0.12}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="var(--text-muted)"
          fontSize={size * 0.09}
          fontWeight="500"
          fontFamily="Inter"
          style={{ transform: 'rotate(90deg)', transformOrigin: 'center' }}
        >
          / 100
        </text>
      </svg>
      <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{label}</span>
    </div>
  );
}

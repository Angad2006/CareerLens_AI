import { motion } from 'framer-motion';

export default function GlassCard({ children, title, icon, className = '', delay = 0, ...props }) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      {...props}
    >
      {(title || icon) && (
        <div className="section-title" style={{ fontSize: '1.15rem', marginBottom: '16px' }}>
          {icon} {title}
        </div>
      )}
      {children}
    </motion.div>
  );
}

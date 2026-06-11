import { motion } from 'framer-motion';
import { FiCpu } from 'react-icons/fi';
import './LoadingSpinner.css';

export default function LoadingSpinner({ message = 'Analyzing your resume with AI...' }) {
  return (
    <div className="loading-container">
      <motion.div
        className="loading-brain"
        animate={{ scale: [1, 1.15, 1], rotate: [0, 5, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FiCpu />
      </motion.div>
      <div className="loading-dots">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="loading-dot"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
          />
        ))}
      </div>
      <motion.p
        className="loading-text"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {message}
      </motion.p>
    </div>
  );
}

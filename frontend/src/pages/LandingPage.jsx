import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiUploadCloud, FiCpu, FiBarChart2, FiFileText, FiTarget, FiZap, FiArrowRight, FiPenTool } from 'react-icons/fi';
import './LandingPage.css';

const FEATURES = [
  { icon: <FiCpu />, title: 'AI-Powered Analysis', desc: 'Advanced NLP engine analyzes your resume for skills, keywords, and structure.' },
  { icon: <FiBarChart2 />, title: 'ATS Score', desc: 'Get a comprehensive ATS compatibility score with detailed breakdown.' },
  { icon: <FiTarget />, title: 'Career Prediction', desc: 'Discover your best-fit industries and career paths based on your profile.' },
  { icon: <FiFileText />, title: 'JD Matching', desc: 'Compare your resume against any job description instantly.' },
  { icon: <FiZap />, title: 'Smart Suggestions', desc: 'Get actionable improvement tips to boost your hiring chances.' },
  { icon: <FiPenTool />, title: 'AI Cover Letter', desc: 'Draft tailored, print-ready cover letters customized for any job description in seconds.' },
];

export default function LandingPage() {
  return (
    <div className="landing page-enter">
      <div className="bg-orbs">
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
        <div className="bg-orb"></div>
      </div>

      {/* Hero */}
      <section className="hero">
        <div className="container hero-content">
          <motion.div
            className="hero-badge"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiCpu /> AI-Powered Career Intelligence
          </motion.div>

          <motion.h1
            className="hero-title"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            Career
            <span className="text-gradient">Lens AI</span>
          </motion.h1>

          <motion.p
            className="hero-desc"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Upload your resume and unlock AI-driven insights — ATS scoring, skills analysis,
            career predictions, and intelligent improvement suggestions. All in seconds.
          </motion.p>

          <motion.div
            className="hero-actions"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/upload" className="btn btn-primary btn-lg">
              Analyze My Resume <FiArrowRight />
            </Link>
            <Link to="/jd-match" className="btn btn-secondary btn-lg">
              Match Job Description
            </Link>
            <Link 
              to="/jd-match" 
              className="btn btn-secondary btn-lg"
              style={{ background: 'var(--bg-glass)', border: '1px solid rgba(212, 175, 55, 0.4)', color: 'var(--accent-gold)', display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <FiPenTool /> Draft Cover Letter
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="features container">
        <motion.h2
          className="features-title"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          Everything you need to <span className="text-gradient">accelerate your career</span>
        </motion.h2>

        <div className="features-grid">
          {FEATURES.map((f, idx) => (
            <motion.div
              key={f.title}
              className="feature-card glass-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Us Section */}
      <section className="why-us container">
        <motion.div 
          className="why-us-header"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2>Why <span className="text-gradient">CareerLens AI</span>?</h2>
          <p className="why-us-subtitle">Discover what sets our career intelligence engine apart from generic parsers</p>
        </motion.div>

        <div className="why-us-grid">
          <motion.div 
            className="why-us-card glass-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -4, borderColor: 'rgba(212, 175, 55, 0.35)' }}
          >
            <div className="why-us-number text-gradient-gold">01</div>
            <h3>Cognitive Context Engine</h3>
            <p>Unlike basic scanners that merely count keywords, CareerLens AI uses semantic analysis to evaluate actual experience relevance, impact density, and action verbs.</p>
          </motion.div>

          <motion.div 
            className="why-us-card glass-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -4, borderColor: 'rgba(30, 64, 175, 0.5)' }}
          >
            <div className="why-us-number">02</div>
            <h3>100% Privacy & Data Security</h3>
            <p>Your resume belongs to you. Using Supabase Row-Level Security (RLS), your data is fully sandboxed, encrypted, and never sold to recruiters or advertisers.</p>
          </motion.div>

          <motion.div 
            className="why-us-card glass-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            whileHover={{ y: -4, borderColor: 'rgba(212, 175, 55, 0.35)' }}
          >
            <div className="why-us-number text-gradient-gold">03</div>
            <h3>Dynamic JD Alignment</h3>
            <p>Instantly compare your skills against specific job descriptions. Uncover exact qualifications gaps and get tailored suggestions to optimize your application.</p>
          </motion.div>

          <motion.div 
            className="why-us-card glass-card"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ y: -4, borderColor: 'rgba(30, 64, 175, 0.5)' }}
          >
            <div className="why-us-number">04</div>
            <h3>Vector PDF & Cover Letters</h3>
            <p>Download print-optimized, corporate-grade PDF analysis reports and tailored cover letters formatted beautifully for standard A4 paper with a single click.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta container">
        <motion.div
          className="cta-box glass-card"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <h2>Ready to supercharge your resume?</h2>
          <p>Get instant AI-powered feedback and land your dream job.</p>
          <Link to="/upload" className="btn btn-primary btn-lg">
            Get Started Free <FiArrowRight />
          </Link>
        </motion.div>
      </section>

      <footer className="landing-footer">
        <p>© 2026 CareerLens AI — Built with ❤️ and AI</p>
      </footer>
    </div>
  );
}

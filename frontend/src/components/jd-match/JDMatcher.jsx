import { useState } from 'react';
import { motion } from 'framer-motion';
import { FiFileText, FiCheckCircle, FiXCircle, FiArrowRight, FiCopy, FiDownload, FiCheck } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import GlassCard from '../common/GlassCard';
import ProgressRing from '../common/ProgressRing';
import { matchJD, generateCoverLetter } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

// Dynamic loader for canvas-confetti from CDN
const loadConfetti = () => {
  return new Promise((resolve, reject) => {
    if (window.confetti) {
      resolve(window.confetti);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
    script.onload = () => resolve(window.confetti);
    script.onerror = (err) => reject(err);
    document.body.appendChild(script);
  });
};

export default function JDMatcher({ resumeText }) {
  const [jdText, setJdText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Cover Letter states
  const [companyName, setCompanyName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [coverLetter, setCoverLetter] = useState(null);
  const [generatingCL, setGeneratingCL] = useState(false);
  const [copied, setCopied] = useState(false);
  const [clError, setClError] = useState('');

  const handleMatch = async () => {
    if (!jdText.trim() || jdText.trim().length < 50) {
      setError('Please paste a job description (at least 50 characters).');
      return;
    }
    setLoading(true);
    setError('');
    setCoverLetter(null); // Clear previous cover letter
    try {
      const res = await matchJD(resumeText, jdText);
      setResult(res);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to match. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateCoverLetter = async () => {
    setGeneratingCL(true);
    setClError('');
    try {
      const res = await generateCoverLetter(resumeText, jdText, companyName, jobTitle);
      setCoverLetter(res);
    } catch (err) {
      setClError(err.response?.data?.detail || 'Failed to generate cover letter. Please try again.');
    } finally {
      setGeneratingCL(false);
    }
  };

  const handleCopy = () => {
    if (!coverLetter) return;
    navigator.clipboard.writeText(coverLetter.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPDF = async () => {
    try {
      const confetti = await loadConfetti();

      const candidateName = coverLetter.candidate_name || 'Candidate';
      const company = coverLetter.company_name || 'Company';
      const title = coverLetter.job_title || 'Position';
      
      const textBlocks = coverLetter.cover_letter.split('\n\n');
      const reportDOM = generateCoverLetterDOM(candidateName, textBlocks, company, title);
      document.body.appendChild(reportDOM);
      
      const opt = {
        margin: [15, 20, 15, 20],
        filename: `${candidateName.replace(/\s+/g, '_')}_Cover_Letter_${company.replace(/\s+/g, '_')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().from(reportDOM).set(opt).save();
      document.body.removeChild(reportDOM);

      confetti({
        particleCount: 120,
        spread: 60,
        origin: { y: 0.75 },
        colors: ['#1e40af', '#d4af37', '#3b82f6', '#f0d060']
      });
    } catch (err) {
      console.error('Error generating PDF:', err);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  return (
    <div>
      <GlassCard title="Job Description Matching" icon={<FiFileText />}>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '0.9rem' }}>
          Paste a job description below to compare it against your resume.
        </p>
        <textarea
          className="input-field"
          placeholder="Paste the full job description here..."
          value={jdText}
          onChange={e => setJdText(e.target.value)}
          style={{ minHeight: '180px', marginBottom: '16px' }}
        />
        <button
          className="btn btn-primary btn-lg"
          onClick={handleMatch}
          disabled={loading || !jdText.trim()}
          style={{ width: '100%' }}
        >
          {loading ? 'Analyzing...' : 'Compare Resume vs JD'}
          <FiArrowRight />
        </button>
        {error && (
          <p style={{ color: '#f87171', marginTop: '10px', fontSize: '0.9rem' }}>{error}</p>
        )}
      </GlassCard>

      {loading && <LoadingSpinner message="Comparing resume against job description..." />}

      {result && !loading && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', flexWrap: 'wrap', marginBottom: '24px' }}>
            <ProgressRing score={result.overall_match} size={130} label="Overall" />
            <ProgressRing score={result.skill_match} size={110} strokeWidth={8} label="Skills" />
            <ProgressRing score={result.keyword_match} size={110} strokeWidth={8} label="Keywords" />
            <ProgressRing score={result.experience_match} size={110} strokeWidth={8} label="Experience" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <GlassCard>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-success)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiCheckCircle /> Matching Skills ({result.matching_skills.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.matching_skills.map(s => (
                  <span key={s} className="skill-tag skill-tag-found">{s}</span>
                ))}
                {result.matching_skills.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None detected</span>}
              </div>
            </GlassCard>

            <GlassCard>
              <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-danger)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <FiXCircle /> Missing Skills ({result.missing_skills.length})
              </h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {result.missing_skills.map(s => (
                  <span key={s} className="skill-tag skill-tag-missing">{s}</span>
                ))}
                {result.missing_skills.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>None — great match!</span>}
              </div>
            </GlassCard>
          </div>

          {result.suggestions.length > 0 && (
            <GlassCard title="Suggestions" style={{ marginTop: '16px' }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {result.suggestions.map((s, i) => (
                  <li key={i} style={{ display: 'flex', gap: '8px', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                    <FiArrowRight style={{ color: 'var(--accent-primary)', flexShrink: 0, marginTop: '3px' }} /> {s}
                  </li>
                ))}
              </ul>
            </GlassCard>
          )}

          {/* Cover Letter Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} style={{ marginTop: '24px' }}>
            <GlassCard title="Draft Tailored Cover Letter" icon={<FiFileText />}>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '0.9rem' }}>
                Generate an optimized cover letter tailored specifically to this job description and your unique experience.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Company Name (Optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Google"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Job Title (Optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Senior Frontend Engineer"
                    value={jobTitle}
                    onChange={e => setJobTitle(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-glass)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <button
                className="btn btn-primary"
                onClick={handleGenerateCoverLetter}
                disabled={generatingCL}
                style={{ width: '100%' }}
              >
                {generatingCL ? 'Drafting Cover Letter...' : 'Generate Cover Letter'}
                <FiArrowRight />
              </button>

              {clError && (
                <p style={{ color: '#f87171', marginTop: '10px', fontSize: '0.9rem' }}>{clError}</p>
              )}
            </GlassCard>
          </motion.div>

          {/* Render Generated Letter */}
          {coverLetter && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: '24px' }}>
              <GlassCard title="Your Tailored Cover Letter">
                <div style={{ position: 'relative', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-glass)', borderRadius: '12px', padding: '24px', marginBottom: '16px', overflowX: 'auto' }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'var(--font-family)', fontSize: '0.92rem', color: 'var(--text-primary)', lineHeight: '1.6', margin: 0 }}>
                    {coverLetter.cover_letter}
                  </pre>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                  <button className="btn btn-secondary" onClick={handleCopy} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {copied ? <><FiCheck style={{ color: 'var(--accent-success)' }} /> Copied!</> : <><FiCopy /> Copy Text</>}
                  </button>
                  <button className="btn btn-primary" onClick={handleDownloadPDF} style={{ background: 'var(--bg-glass)', color: 'var(--accent-gold)', border: '1px solid rgba(212, 175, 55, 0.4)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiDownload /> Export Letter PDF
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

// Helper function to build dynamic cover letter DOM for PDF print
function generateCoverLetterDOM(candidateName, textBlocks, company, title) {
  const container = document.createElement('div');
  container.className = 'pdf-cover-letter-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '790px';
  container.style.background = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = "'Outfit', 'Inter', sans-serif";
  container.style.lineHeight = '1.6';
  container.style.padding = '50px 60px';

  const paragraphs = textBlocks.map((block, idx) => {
    const trimmed = block.trim();
    if (!trimmed) return '';

    // Sender Block (Candidate Info)
    if (idx === 0) {
      const lines = trimmed.split('\n');
      const name = lines[0];
      const contacts = lines.slice(1).join('  |  ');
      return `
        <div style="font-family: 'Outfit', sans-serif; font-size: 2.2rem; font-weight: 800; color: #1e40af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">${name}</div>
        <div style="font-size: 0.85rem; color: #64748b; border-bottom: 2px solid #d4af37; padding-bottom: 12px; margin-bottom: 30px; font-weight: 500;">${contacts}</div>
      `;
    }
    // Date
    if (idx === 1) {
      return `<div style="font-size: 0.95rem; color: #64748b; margin-bottom: 24px; font-weight: 500;">${trimmed}</div>`;
    }
    // Recipient Info
    if (idx === 2) {
      return `<div style="font-size: 0.95rem; font-weight: 600; color: #0f172a; margin-bottom: 24px; line-height: 1.4;">${trimmed.replace(/\n/g, '<br/>')}</div>`;
    }
    // Salutation
    if (idx === 3) {
      return `<div style="font-size: 0.98rem; font-weight: 600; color: #0f172a; margin-bottom: 18px;">${trimmed}</div>`;
    }
    // Signature / Closings
    if (trimmed.toLowerCase().startsWith('sincerely') || trimmed.toLowerCase().startsWith('regards') || trimmed.toLowerCase().startsWith('best')) {
      return `<div style="margin-top: 36px; font-size: 0.98rem; color: #334155; line-height: 1.5;">${trimmed.replace(/\n/g, '<br/>')}</div>`;
    }
    // Body Paragraphs
    return `<p style="font-size: 0.98rem; color: #334155; margin-bottom: 18px; text-align: justify; text-justify: inter-word;">${trimmed.replace(/\n/g, '<br/>')}</p>`;
  });

  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
    </style>
    <div style="font-family: 'Inter', sans-serif; max-width: 680px; margin: 0 auto; padding-top: 20px;">
      ${paragraphs.join('')}
    </div>
  `;

  return container;
}

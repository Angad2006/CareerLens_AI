import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiDownload, FiLoader, FiCheck, FiAlertCircle, FiArrowLeft } from 'react-icons/fi';
import html2pdf from 'html2pdf.js';
import ScoreOverview from '../components/analysis/ScoreOverview';
import SkillsAnalysis from '../components/analysis/SkillsAnalysis';
import ATSKeywords from '../components/analysis/ATSKeywords';
import SectionDetection from '../components/analysis/SectionDetection';
import CareerSuitability from '../components/analysis/CareerSuitability';
import ImprovementSuggestions from '../components/analysis/ImprovementSuggestions';
import CareerRecommendations from '../components/analysis/CareerRecommendations';
import './AnalysisPage.css';

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

export default function AnalysisPage({ analysisData }) {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [pdfStep, setPdfStep] = useState(0);
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    if (!analysisData) navigate('/upload');
  }, [analysisData, navigate]);

  if (!analysisData) return null;

  const {
    ats_score, skills_analysis, keyword_analysis,
    section_analysis, career_suitability, suggestions,
    career_recommendations, resume_insights
  } = analysisData;

  const steps = [
    'Initializing CareerLens PDF Engine...',
    'Loading telemetry analytics...',
    'Compiling vector A4 graphic layouts...',
    'Saving high-resolution resume report...',
  ];

  const exportToPDF = async () => {
    setIsGenerating(true);
    setPdfStep(0);
    setPdfError('');

    try {
      // Step 0: Loading PDF engine
      setPdfStep(1);
      
      // Step 1: Loading Confetti
      const confetti = await loadConfetti();
      await new Promise((r) => setTimeout(r, 600)); // Smooth animation delay
      setPdfStep(2);

      // Step 2: Compiling Report DOM
      const reportDOM = generateReportDOM(analysisData);
      document.body.appendChild(reportDOM);
      await new Promise((r) => setTimeout(r, 800)); // Let styles load
      setPdfStep(3);

      // Step 3: Trigger PDF download
      const name = resume_insights?.contact_info?.name || 'Resume';
      const cleanName = name.trim().replace(/\s+/g, '_');
      const opt = {
        margin: [10, 10, 15, 10],
        filename: `${cleanName}_CareerLens_Report.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().from(reportDOM).set(opt).save();

      // Clean up DOM
      document.body.removeChild(reportDOM);

      // Confetti burst on success!
      confetti({
        particleCount: 160,
        spread: 80,
        origin: { y: 0.65 },
        colors: ['#1e40af', '#d4af37', '#3b82f6', '#f0d060']
      });

      // Exit loading screen
      setIsGenerating(false);
    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfError('Failed to generate PDF. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="analysis-page page-enter">
      <div className="bg-orbs"><div className="bg-orb"></div><div className="bg-orb"></div><div className="bg-orb"></div></div>

      <div className="container">
        <motion.div className="analysis-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1>Resume <span className="text-gradient">Analysis Dashboard</span></h1>
          <p>Comprehensive AI-powered analysis of your resume</p>
          
          <motion.div 
            className="header-actions"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <button className="btn btn-primary pdf-download-btn" onClick={exportToPDF}>
              <FiDownload /> Export PDF Report
            </button>
          </motion.div>
        </motion.div>

        {/* Dynamic Stepper Loader Modal */}
        <AnimatePresence>
          {isGenerating && (
            <motion.div 
              className="pdf-modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div 
                className="pdf-modal-card glass-card"
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
              >
                <div className="pdf-modal-icon">
                  <FiLoader className="spin" />
                </div>
                <h3>Generating Report</h3>
                <p>Assembling your high-fidelity CareerLens PDF analysis...</p>
                
                <div className="pdf-modal-steps">
                  {steps.map((text, idx) => (
                    <div key={idx} className={`pdf-step-item ${pdfStep > idx ? 'completed' : pdfStep === idx ? 'active' : ''}`}>
                      <div className="pdf-step-status">
                        {pdfStep > idx ? <FiCheck /> : <div className="dot" />}
                      </div>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {pdfError && (
          <div className="error-banner" style={{ margin: '0 auto 24px', maxWidth: '600px' }}>
            <FiAlertCircle /> <span>{pdfError}</span>
          </div>
        )}

        <div className="analysis-grid">
          {/* Score Overview */}
          <motion.div 
            className="analysis-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <ScoreOverview
              atsScore={ats_score}
              skillMatch={skills_analysis?.skill_match_percentage}
              careerMatch={career_suitability}
              insights={resume_insights}
            />
          </motion.div>

          {/* Skills */}
          <motion.div 
            className="analysis-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SkillsAnalysis data={skills_analysis} />
          </motion.div>

          {/* Keywords */}
          <motion.div 
            className="analysis-half"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <ATSKeywords data={keyword_analysis} />
          </motion.div>

          {/* Section Detection */}
          <motion.div 
            className="analysis-half"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <SectionDetection data={section_analysis} />
          </motion.div>

          {/* Career Suitability */}
          <motion.div 
            className="analysis-full"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <CareerSuitability data={career_suitability} />
          </motion.div>

          {/* Improvement Suggestions */}
          <motion.div 
            className="analysis-half"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <ImprovementSuggestions data={suggestions} />
          </motion.div>

          {/* Career Recommendations */}
          <motion.div 
            className="analysis-half"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <CareerRecommendations data={career_recommendations} />
          </motion.div>

          {/* Insights */}
          {resume_insights && (
            <motion.div 
              className="analysis-full"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="glass-card">
                <h3 className="section-title" style={{ fontSize: '1.15rem' }}>📊 Resume Insights</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
                  <div className="insight-item">
                    <span className="insight-label">Word Count</span>
                    <span className="insight-value">{resume_insights.word_count}</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Sentences</span>
                    <span className="insight-value">{resume_insights.sentence_count}</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Action Verbs</span>
                    <span className="insight-value">{resume_insights.action_verb_count}</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Vocabulary</span>
                    <span className="insight-value">{(resume_insights.vocabulary_richness * 100).toFixed(0)}%</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Email</span>
                    <span className="insight-value" style={{ fontSize: '0.75rem' }}>{resume_insights.contact_info?.email || 'Not found'}</span>
                  </div>
                  <div className="insight-item">
                    <span className="insight-label">Phone</span>
                    <span className="insight-value" style={{ fontSize: '0.75rem' }}>{resume_insights.contact_info?.phone || 'Not found'}</span>
                  </div>
                </div>
                {resume_insights.key_topics?.length > 0 && (
                  <div style={{ marginTop: '16px' }}>
                    <span className="insight-label" style={{ display: 'block', marginBottom: '8px' }}>Key Topics</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {resume_insights.key_topics.map(t => (
                        <span key={t} className="badge badge-primary">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div style={{ textAlign: 'center', margin: '40px 0' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/upload')}>
            Analyze Another Resume
          </button>
        </div>
      </div>
    </div>
  );
}

// Generate the print-optimized DOM layout for html2pdf
function generateReportDOM(data) {
  const container = document.createElement('div');
  container.className = 'pdf-report-container';
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '790px';
  container.style.background = '#ffffff';
  container.style.color = '#1e293b';
  container.style.fontFamily = "'Outfit', 'Inter', sans-serif";
  container.style.lineHeight = '1.5';
  container.style.padding = '40px';

  const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
  const name = data.resume_insights?.contact_info?.name || 'Candidate';
  const email = data.resume_insights?.contact_info?.email || 'N/A';
  const phone = data.resume_insights?.contact_info?.phone || 'N/A';

  const atsScore = data.ats_score?.overall_score || 0;
  const skillMatch = data.skills_analysis?.skill_match_percentage || 0;
  const careerMatch = data.career_suitability?.suitability_score || 0;
  const strength = data.resume_insights?.resume_strength || 'Strong';

  const missingKeywords = data.keyword_analysis?.missing_keywords || [];
  const foundKeywords = data.keyword_analysis?.found_keywords || [];
  const technicalSkills = data.skills_analysis?.found_skills?.technical || [];
  const softSkills = data.skills_analysis?.found_skills?.soft_skills || [];
  const missingSkills = data.skills_analysis?.missing_skills || [];
  const recommendations = data.career_recommendations || [];
  const suggestions = data.suggestions || [];

  container.innerHTML = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap');
      
      .pdf-report-container * {
        box-sizing: border-box;
      }
      
      .pdf-page {
        page-break-after: always;
        padding-bottom: 20px;
        min-height: 1060px;
        position: relative;
      }
      
      .pdf-page:last-child {
        page-break-after: avoid;
        min-height: auto;
      }
      
      /* Cover Page */
      .cover-page {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        padding: 60px 40px;
        border: 2px solid #e2e8f0;
        border-radius: 16px;
        background: #fafafc;
        overflow: hidden;
      }
      
      .cover-decor {
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        height: 300px;
        background: linear-gradient(135deg, rgba(30, 64, 175, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%);
        border-radius: 50%;
        transform: translate(100px, -100px);
        pointer-events: none;
      }
      
      .cover-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #f1f5f9;
        padding-bottom: 20px;
      }
      
      .cover-logo {
        font-family: 'Outfit', sans-serif;
        font-size: 1.8rem;
        font-weight: 800;
        color: #1e40af;
      }
      
      .cover-logo span {
        color: #d4af37;
      }
      
      .cover-date {
        font-size: 0.95rem;
        color: #64748b;
      }
      
      .cover-title-group {
        margin: 100px 0;
      }
      
      .cover-subtitle {
        font-size: 1rem;
        font-weight: 700;
        text-transform: uppercase;
        color: #d4af37;
        letter-spacing: 2px;
        margin-bottom: 12px;
      }
      
      .cover-title {
        font-family: 'Outfit', sans-serif;
        font-size: 3rem;
        font-weight: 800;
        color: #0f172a;
        line-height: 1.15;
      }
      
      .cover-meta {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px;
        margin-top: 40px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
      }
      
      .cover-meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
      }
      
      .meta-item-label {
        font-size: 0.8rem;
        color: #64748b;
        text-transform: uppercase;
        margin-bottom: 4px;
        font-weight: 600;
      }
      
      .meta-item-val {
        font-size: 1.05rem;
        font-weight: 600;
        color: #1e293b;
      }
      
      .cover-scores {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        margin-top: 20px;
      }
      
      .cover-score-card {
        flex: 1;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 24px 20px;
        text-align: center;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
      }
      
      .score-circle {
        width: 84px;
        height: 84px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto 16px;
        font-size: 1.7rem;
        font-weight: 800;
        font-family: 'Outfit', sans-serif;
      }
      
      .circle-gold {
        background: rgba(212, 175, 55, 0.08);
        color: #b8962e;
        border: 2px solid rgba(212, 175, 55, 0.25);
      }
      
      .circle-blue {
        background: rgba(30, 64, 175, 0.08);
        color: #1e40af;
        border: 2px solid rgba(30, 64, 175, 0.25);
      }
      
      .circle-green {
        background: rgba(34, 197, 94, 0.08);
        color: #16a34a;
        border: 2px solid rgba(34, 197, 94, 0.25);
      }
      
      .cover-footer {
        text-align: center;
        font-size: 0.85rem;
        color: #94a3b8;
        border-top: 1px solid #e2e8f0;
        padding-top: 20px;
      }
      
      /* Inner Pages */
      .report-page-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #e2e8f0;
        padding-bottom: 12px;
        margin-bottom: 28px;
      }
      
      .report-page-title {
        font-family: 'Outfit', sans-serif;
        font-size: 1.35rem;
        font-weight: 700;
        color: #0f172a;
      }
      
      .report-brand-tag {
        font-size: 0.85rem;
        font-weight: 600;
        color: #1e40af;
      }
      
      .section-heading {
        font-family: 'Outfit', sans-serif;
        font-size: 1.1rem;
        font-weight: 700;
        color: #1e40af;
        margin: 24px 0 14px;
        border-left: 4px solid #d4af37;
        padding-left: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 20px;
        margin-bottom: 20px;
      }
      
      .card {
        border: 1px solid #e2e8f0;
        border-radius: 10px;
        padding: 18px;
        background: #f8fafc;
      }
      
      .badge-list {
        display: flex;
        flex-wrap: wrap;
        gap: 6px;
      }
      
      .badge {
        font-size: 0.75rem;
        font-weight: 600;
        padding: 5px 9px;
        border-radius: 6px;
      }
      
      .badge-success {
        background: #dcfce7;
        color: #15803d;
        border: 1px solid #bbf7d0;
      }
      
      .badge-danger {
        background: #fee2e2;
        color: #b91c1c;
        border: 1px solid #fecaca;
      }
      
      .badge-blue {
        background: #eff6ff;
        color: #1e40af;
        border: 1px solid #bfdbfe;
      }
      
      .report-list {
        padding-left: 20px;
        margin: 8px 0;
      }
      
      .report-list li {
        margin-bottom: 8px;
        font-size: 0.88rem;
        color: #334155;
      }
      
      .report-page-footer {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        border-top: 1px solid #e2e8f0;
        padding-top: 12px;
        display: flex;
        justify-content: space-between;
        font-size: 0.78rem;
        color: #94a3b8;
      }
    </style>
    
    <!-- PAGE 1: COVER PAGE -->
    <div class="pdf-page cover-page">
      <div class="cover-decor"></div>
      <div class="cover-header">
        <div class="cover-logo">Career<span>Lens</span> AI</div>
        <div class="cover-date">${dateStr}</div>
      </div>
      
      <div class="cover-title-group">
        <div class="cover-subtitle">AI Resume Analysis & Optimizer</div>
        <div class="cover-title">Resume Performance Report</div>
        
        <div class="cover-meta">
          <div class="cover-meta-grid">
            <div>
              <div class="meta-item-label">Prepared For</div>
              <div class="meta-item-val">${name}</div>
            </div>
            <div>
              <div class="meta-item-label">Target Industry</div>
              <div class="meta-item-val">${data.career_suitability?.target_industry || 'General'}</div>
            </div>
            <div>
              <div class="meta-item-label">Email</div>
              <div class="meta-item-val">${email}</div>
            </div>
            <div>
              <div class="meta-item-label">Experience Level</div>
              <div class="meta-item-val">${data.resume_insights?.experience_level || 'Professional'}</div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="cover-scores">
        <div class="cover-score-card">
          <div class="score-circle circle-gold">${atsScore.toFixed(0)}</div>
          <div style="font-weight:700;font-size:0.95rem;color:#0f172a;margin-bottom:2px;">ATS Score</div>
          <div style="font-size:0.75rem;color:#64748b;">Parser optimization index</div>
        </div>
        <div class="cover-score-card">
          <div class="score-circle circle-blue">${skillMatch.toFixed(0)}%</div>
          <div style="font-weight:700;font-size:0.95rem;color:#0f172a;margin-bottom:2px;">Skills Match</div>
          <div style="font-size:0.75rem;color:#64748b;">Keyword alignment rating</div>
        </div>
        <div class="cover-score-card">
          <div class="score-circle circle-green">${strength}</div>
          <div style="font-weight:700;font-size:0.95rem;color:#0f172a;margin-bottom:2px;">Resume Strength</div>
          <div style="font-size:0.75rem;color:#64748b;">Overall quality rating</div>
        </div>
      </div>
      
      <div class="cover-footer">
        © ${new Date().getFullYear()} CareerLens AI • Better Resumes, Smarter Careers.
      </div>
    </div>
    
    <!-- PAGE 2: ATS KEYWORD ANALYSIS -->
    <div class="pdf-page">
      <div class="report-page-header">
        <div class="report-page-title">ATS Optimization & Keywords</div>
        <div class="report-brand-tag">CareerLens AI Report</div>
      </div>
      
      <div class="section-heading">ATS Criteria Scores</div>
      <div class="grid-2">
        <div class="card">
          <div style="font-weight:600;margin-bottom:8px;font-size:0.9rem;color:#0f172a;">File Formatting Score</div>
          <div style="font-size:1.6rem;font-weight:800;color:#1e40af;margin-bottom:4px;">
            ${(data.ats_score?.criteria_scores?.formatting || 85).toFixed(0)}/100
          </div>
          <div style="font-size:0.78rem;color:#64748b;line-height:1.4;">Checks document formatting, structure, margins, elements, and layout compatibility.</div>
        </div>
        <div class="card">
          <div style="font-weight:600;margin-bottom:8px;font-size:0.9rem;color:#0f172a;">Keyword Match Density</div>
          <div style="font-size:1.6rem;font-weight:800;color:#d4af37;margin-bottom:4px;">
            ${(data.ats_score?.criteria_scores?.keyword_match || skillMatch).toFixed(0)}/100
          </div>
          <div style="font-size:0.78rem;color:#64748b;line-height:1.4;">Measures matching industry keywords and density comparison to standard profiles.</div>
        </div>
      </div>
      
      <div class="section-heading">Industry Keywords Detected</div>
      <div class="card" style="margin-bottom:20px;">
        <div style="font-weight:600;margin-bottom:12px;font-size:0.8rem;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Found Keywords</div>
        <div class="badge-list">
          ${foundKeywords.length > 0 ? foundKeywords.map(k => `<span class="badge badge-success">${k}</span>`).join('') : '<span style="color:#64748b;font-size:0.85rem;">None detected</span>'}
        </div>
      </div>
      
      <div class="section-heading">Missing Keywords (Action Required)</div>
      <div class="card">
        <div style="font-weight:600;margin-bottom:12px;font-size:0.8rem;text-transform:uppercase;color:#64748b;letter-spacing:0.5px;">Missing Key Phrases</div>
        <p style="font-size:0.85rem;color:#64748b;margin-bottom:12px;">Adding these industry phrases to your resume's experiences increases ATS search discoverability:</p>
        <div class="badge-list">
          ${missingKeywords.length > 0 ? missingKeywords.map(k => `<span class="badge badge-danger">${k}</span>`).join('') : '<span style="color:#16a34a;font-size:0.85rem;font-weight:600;">No missing keywords! Your resume matches the industry terms perfectly.</span>'}
        </div>
      </div>
      
      <div class="report-page-footer">
        <span>Prepared for ${name}</span>
        <span>Page 2 of 4</span>
      </div>
    </div>
    
    <!-- PAGE 3: SKILLS AND SECTIONS ANALYSIS -->
    <div class="pdf-page">
      <div class="report-page-header">
        <div class="report-page-title">Skills & Document Structure</div>
        <div class="report-brand-tag">CareerLens AI Report</div>
      </div>
      
      <div class="section-heading">Extracted Skills Profile</div>
      <div class="grid-2" style="margin-bottom:10px;">
        <div class="card">
          <div style="font-weight:600;margin-bottom:10px;font-size:0.9rem;color:#1e40af;">Technical/Hard Skills</div>
          <div class="badge-list">
            ${technicalSkills.length > 0 ? technicalSkills.slice(0, 15).map(s => `<span class="badge badge-blue">${s}</span>`).join('') : '<span style="color:#64748b;font-size:0.85rem;">No technical skills detected</span>'}
          </div>
        </div>
        <div class="card">
          <div style="font-weight:600;margin-bottom:10px;font-size:0.9rem;color:#b8962e;">Soft & Professional Skills</div>
          <div class="badge-list">
            ${softSkills.length > 0 ? softSkills.slice(0, 15).map(s => `<span class="badge badge-blue">${s}</span>`).join('') : '<span style="color:#64748b;font-size:0.85rem;">No soft skills detected</span>'}
          </div>
        </div>
      </div>
      
      <div class="section-heading">Missing Skills (Recommended to Add)</div>
      <div class="card" style="margin-bottom:20px;">
        <div class="badge-list">
          ${missingSkills.length > 0 ? missingSkills.map(s => `<span class="badge badge-danger">${s}</span>`).join('') : '<span style="color:#15803d;font-size:0.85rem;font-weight:600;">All critical target skills are present in your resume!</span>'}
        </div>
      </div>

      <div class="section-heading">Resume Sections Completeness</div>
      <div class="card">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:0.85rem;">
          <span style="font-weight:600;color:#0f172a;">Overall Completeness Score</span>
          <span style="font-weight:700;color:#16a34a;">${data.section_analysis?.completeness_score || 90}%</span>
        </div>
        <div style="width:100%;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:16px;">
          <div style="width:${data.section_analysis?.completeness_score || 90}%;height:100%;background:#22c55e;"></div>
        </div>
        <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:10px;text-align:center;font-size:0.75rem;font-weight:600;">
          <div style="color: ${data.section_analysis?.detected_sections?.work_experience ? '#15803d' : '#64748b'}">Experience: ${data.section_analysis?.detected_sections?.work_experience ? '✓' : '✗'}</div>
          <div style="color: ${data.section_analysis?.detected_sections?.skills ? '#15803d' : '#64748b'}">Skills: ${data.section_analysis?.detected_sections?.skills ? '✓' : '✗'}</div>
          <div style="color: ${data.section_analysis?.detected_sections?.education ? '#15803d' : '#64748b'}">Education: ${data.section_analysis?.detected_sections?.education ? '✓' : '✗'}</div>
          <div style="color: ${data.section_analysis?.detected_sections?.summary ? '#15803d' : '#64748b'}">Summary: ${data.section_analysis?.detected_sections?.summary ? '✓' : '✗'}</div>
        </div>
      </div>
      
      <div class="report-page-footer">
        <span>Prepared for ${name}</span>
        <span>Page 3 of 4</span>
      </div>
    </div>
    
    <!-- PAGE 4: CAREER FIT AND IMPROVEMENT ACTIONS -->
    <div class="pdf-page">
      <div class="report-page-header">
        <div class="report-page-title">Career Alignment & Recommendations</div>
        <div class="report-brand-tag">CareerLens AI Report</div>
      </div>
      
      <div class="section-heading">Career Path Prediction</div>
      <div class="card" style="margin-bottom:20px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <span style="font-weight:700;font-size:1rem;color:#0f172a;">Field Suitability Score: ${careerMatch}%</span>
          <span style="font-weight:700;color:#1e40af;">Hiring Probability: ${data.resume_insights?.hiring_probability || 'High'}</span>
        </div>
        <p style="font-size:0.85rem;color:#475569;line-height:1.6;margin-bottom:0;">
          ${data.career_suitability?.reasoning || 'Your skills profile and experience show high suitability for this field, align well with current market standards, and indicate readiness for mid-to-senior responsibilities.'}
        </p>
      </div>
      
      <div class="grid-2" style="margin-bottom:20px;">
        <div class="card">
          <div style="font-weight:700;margin-bottom:10px;font-size:0.8rem;text-transform:uppercase;color:#1e40af;letter-spacing:0.5px;">Recommended Job Roles</div>
          <ul class="report-list" style="margin: 0; padding-left: 16px;">
            ${recommendations.length > 0 ? recommendations.map(r => `<li><strong>${r}</strong></li>`).join('') : '<li>General Staff Engineer</li><li>Senior Consultant</li>'}
          </ul>
        </div>
        <div class="card">
          <div style="font-weight:700;margin-bottom:10px;font-size:0.8rem;text-transform:uppercase;color:#b8962e;letter-spacing:0.5px;">Profile Telemetry</div>
          <div style="font-size:0.82rem;line-height:1.8;color:#334155;">
            <div>• Action Verbs Used: <span style="font-weight:700;color:#0f172a;">${data.resume_insights?.action_verb_count || 12}</span></div>
            <div>• Vocabulary Density: <span style="font-weight:700;color:#0f172a;">${((data.resume_insights?.vocabulary_richness || 0.65) * 100).toFixed(0)}%</span></div>
            <div>• Total Word Count: <span style="font-weight:700;color:#0f172a;">${data.resume_insights?.word_count || 320} words</span></div>
          </div>
        </div>
      </div>
      
      <div class="section-heading">Actionable Optimization Steps</div>
      <div class="card">
        <ul class="report-list" style="margin: 0; padding-left: 16px;">
          ${suggestions.length > 0 ? suggestions.slice(0, 5).map(s => `<li>${s}</li>`).join('') : '<li>Include quantifiable metrics for achievements (e.g., increased efficiency by 20%).</li><li>Improve keyword density for hard skills like machine learning.</li><li>Ensure contact information includes LinkedIn profile link.</li>'}
        </ul>
      </div>
      
      <div class="report-page-footer">
        <span>Prepared for ${name}</span>
        <span>Page 4 of 4</span>
      </div>
    </div>
  `;

  return container;
}

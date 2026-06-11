import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiUploadCloud, FiTarget, FiCpu } from 'react-icons/fi';
import ResumeUploader from '../components/upload/ResumeUploader';
import IndustrySelector from '../components/industry/IndustrySelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { analyzeResume } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { saveAnalysis } from '../services/supabase';
import './UploadPage.css';

export default function UploadPage({ setAnalysisData, setResumeText }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [uploadResult, setUploadResult] = useState(null);
  const [industry, setIndustry] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState('');

  const handleUploadComplete = (result) => {
    setUploadResult(result);
    setResumeText(result.extracted_text);
    setIsUploading(false);
    setStep(2);
  };

  const handleAnalyze = async () => {
    if (!uploadResult?.extracted_text) return;
    setIsAnalyzing(true);
    setError('');
    try {
      const analysis = await analyzeResume(uploadResult.extracted_text, industry);
      setAnalysisData(analysis);

      if (user) {
        try {
          const analysisToSave = {
            ...analysis,
            extracted_text: uploadResult.extracted_text
          };
          await saveAnalysis(user.id, uploadResult.filename || 'resume.pdf', industry, analysisToSave);
        } catch (saveErr) {
          console.warn('Failed to save analysis to history:', saveErr);
        }
      }

      navigate('/analysis');
    } catch (err) {
      setError(err.response?.data?.detail || 'Analysis failed. Please try again.');
      setIsAnalyzing(false);
    }
  };

  const steps = [
    { num: 1, label: 'Upload Resume', icon: <FiUploadCloud /> },
    { num: 2, label: 'Select Industry', icon: <FiTarget /> },
    { num: 3, label: 'Analyze', icon: <FiCpu /> },
  ];

  if (isAnalyzing) {
    return (
      <div className="upload-page page-enter">
        <div className="bg-orbs"><div className="bg-orb"></div><div className="bg-orb"></div><div className="bg-orb"></div></div>
        <div className="container">
          <LoadingSpinner message="Our AI is analyzing your resume — skills, keywords, career fit, ATS score..." />
        </div>
      </div>
    );
  }

  return (
    <div className="upload-page page-enter">
      <div className="bg-orbs"><div className="bg-orb"></div><div className="bg-orb"></div><div className="bg-orb"></div></div>

      <div className="container">
        <motion.div
          className="upload-header"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Analyze Your Resume</h1>
          <p>Upload, select your target industry, and let our AI do the work.</p>
        </motion.div>

        {/* Stepper */}
        <div className="stepper">
          {steps.map((s, idx) => (
            <div key={s.num} className={`stepper-item ${step >= s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}>
              <div className="stepper-circle">{s.icon}</div>
              <span className="stepper-label">{s.label}</span>
              {idx < steps.length - 1 && <div className="stepper-line" />}
            </div>
          ))}
        </div>

        {/* Step 1: Upload */}
        {step >= 1 && (
          <motion.div
            className="step-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ResumeUploader
              onUploadComplete={handleUploadComplete}
              isUploading={isUploading}
              setIsUploading={setIsUploading}
            />
          </motion.div>
        )}

        {/* Step 2: Industry */}
        {step >= 2 && (
          <motion.div
            className="step-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <IndustrySelector selected={industry} onSelect={(val) => { setIndustry(val); setStep(3); }} />
          </motion.div>
        )}

        {/* Step 3: Analyze */}
        {step >= 3 && (
          <motion.div
            className="step-section analyze-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              className="btn btn-primary btn-lg analyze-btn"
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              <FiCpu /> Analyze Resume with AI <FiArrowRight />
            </button>
            {!industry && (
              <p className="skip-text" onClick={handleAnalyze} style={{ cursor: 'pointer' }}>
                or skip industry selection →
              </p>
            )}
            {error && <p style={{ color: '#f87171', marginTop: '12px' }}>{error}</p>}
          </motion.div>
        )}

        {/* Extracted Text Preview */}
        {uploadResult && (
          <motion.div
            className="text-preview glass-card"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <h3 style={{ fontSize: '1rem', color: 'var(--text-heading)', marginBottom: '8px' }}>
              📄 Extracted Text Preview
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
              {uploadResult.word_count} words • {uploadResult.page_count} page(s)
            </p>
            <pre className="text-preview-content">{uploadResult.extracted_text.substring(0, 800)}...</pre>
          </motion.div>
        )}
      </div>
    </div>
  );
}

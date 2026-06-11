import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiFile, FiCheckCircle, FiX, FiAlertCircle } from 'react-icons/fi';
import './ResumeUploader.css';

export default function ResumeUploader({ onUploadComplete, isUploading, setIsUploading }) {
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleUpload = async (f) => {
    setIsUploading(true);
    setUploadProgress(0);
    setError('');

    // Simulate progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) { clearInterval(progressInterval); return 90; }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const { uploadResume } = await import('../../services/api');
      const result = await uploadResume(f);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setTimeout(() => onUploadComplete(result), 500);
    } catch (err) {
      clearInterval(progressInterval);
      setUploadProgress(0);
      setError(err.response?.data?.detail || 'Failed to upload resume. Please try again.');
      setIsUploading(false);
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    if (rejectedFiles.length > 0) {
      setError('Invalid file. Please upload a PDF or DOCX file (max 10MB).');
      return;
    }
    if (acceptedFiles.length > 0) {
      const f = acceptedFiles[0];
      setFile(f);
      handleUpload(f);
    }
  }, [onUploadComplete, setIsUploading]);

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setError('');
    setIsUploading(false);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    },
    maxSize: 10 * 1024 * 1024,
    maxFiles: 1,
    disabled: isUploading,
  });

  return (
    <div className="uploader-wrapper">
      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            {...getRootProps()}
            className={`dropzone ${isDragActive ? 'dropzone-active' : ''}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ borderColor: 'rgba(99, 102, 241, 0.5)' }}
          >
            <input {...getInputProps()} />
            <motion.div
              className="dropzone-icon"
              animate={isDragActive ? { scale: 1.2, y: -10 } : { scale: 1, y: 0 }}
            >
              <FiUploadCloud />
            </motion.div>
            <h3 className="dropzone-title">
              {isDragActive ? 'Drop your resume here' : 'Drag & drop your resume'}
            </h3>
            <p className="dropzone-subtitle">or click to browse files</p>
            <div className="dropzone-formats">
              <span className="format-badge">PDF</span>
              <span className="format-badge">DOCX</span>
              <span className="format-info">Max 10MB</span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            className="file-preview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="file-preview-header">
              <div className="file-icon">
                <FiFile />
              </div>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">{(file.size / 1024).toFixed(1)} KB</span>
              </div>
              {!isUploading && (
                <button className="file-remove" onClick={removeFile}>
                  <FiX />
                </button>
              )}
              {uploadProgress === 100 && (
                <FiCheckCircle className="file-success-icon" />
              )}
            </div>
            {isUploading && uploadProgress < 100 && (
              <div className="progress-bar">
                <motion.div
                  className="progress-bar-fill high"
                  initial={{ width: 0 }}
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          className="upload-error"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <FiAlertCircle /> {error}
        </motion.div>
      )}
    </div>
  );
}

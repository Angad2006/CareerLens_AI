import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 60000,
  headers: { 'Content-Type': 'application/json' },
});

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
}

export async function analyzeResume(resumeText, targetIndustry = null) {
  const response = await api.post('/api/analyze', {
    resume_text: resumeText,
    target_industry: targetIndustry,
  });
  return response.data;
}

export async function matchJD(resumeText, jobDescription) {
  const response = await api.post('/api/jd-match', {
    resume_text: resumeText,
    job_description: jobDescription,
  });
  return response.data;
}

export async function generateCoverLetter(resumeText, jobDescription, companyName = null, jobTitle = null) {
  const response = await api.post('/api/generate-cover-letter', {
    resume_text: resumeText,
    job_description: jobDescription,
    company_name: companyName,
    job_title: jobTitle,
  });
  return response.data;
}

export default api;


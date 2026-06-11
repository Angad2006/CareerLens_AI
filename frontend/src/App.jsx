import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import JDMatchPage from './pages/JDMatchPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [resumeText, setResumeText] = useState('');

  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/upload" element={
                <ProtectedRoute>
                  <UploadPage setAnalysisData={setAnalysisData} setResumeText={setResumeText} />
                </ProtectedRoute>
              } />
              <Route path="/analysis" element={
                <ProtectedRoute>
                  <AnalysisPage analysisData={analysisData} />
                </ProtectedRoute>
              } />
              <Route path="/jd-match" element={
                <ProtectedRoute>
                  <JDMatchPage resumeText={resumeText} />
                </ProtectedRoute>
              } />
              <Route path="/history" element={
                <ProtectedRoute>
                  <HistoryPage setAnalysisData={setAnalysisData} setResumeText={setResumeText} />
                </ProtectedRoute>
              } />
            </Routes>
          </main>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

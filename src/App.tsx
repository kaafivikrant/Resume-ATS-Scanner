import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { FileUp as FileUpload, UploadCloud } from 'lucide-react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ResumeUpload from './components/ResumeUpload';
import JobDescription from './components/JobDescription';
import AnalysisResults from './components/AnalysisResults';
import SubscriptionBanner from './components/subscription/SubscriptionBanner';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PricingPage from './pages/PricingPage';
import SubscriptionPage from './pages/SubscriptionPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import useAuthStore from './store/authStore';
import useSubscriptionStore from './store/subscriptionStore';
import { Resume, JobDesc, AnalysisResult } from './types';
import { analyzeResume } from './api/resume';

function App() {
  const [activeTab, setActiveTab] = React.useState<'upload' | 'dashboard'>('upload');
  const [resumes, setResumes] = React.useState<Resume[]>([]);
  const [jobDescriptions, setJobDescriptions] = React.useState<JobDesc[]>([]);
  const [currentResume, setCurrentResume] = React.useState<Resume | null>(null);
  const [currentJobDesc, setCurrentJobDesc] = React.useState<JobDesc | null>(null);
  const [analysisResults, setAnalysisResults] = React.useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  
  const { checkAuth } = useAuthStore();
  const { fetchPlans, fetchCurrentPlan } = useSubscriptionStore();

  useEffect(() => {
    checkAuth();
    fetchPlans();
    fetchCurrentPlan();
  }, [checkAuth, fetchPlans, fetchCurrentPlan]);

  const handleResumeUpload = (resume: Resume) => {
    setResumes([...resumes, resume]);
    setCurrentResume(resume);
  };

  const handleJobDescriptionSave = (jobDesc: JobDesc) => {
    setJobDescriptions([...jobDescriptions, jobDesc]);
    setCurrentJobDesc(jobDesc);
  };

  const handleAnalyze = async () => {
    if (!currentResume || !currentJobDesc) return;
    
    setIsAnalyzing(true);
    
    try {
      const results = await analyzeResume(currentResume.id, currentJobDesc.id);
      setAnalysisResults(results);
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Analysis failed:', error);
      alert('Failed to analyze resume. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const MainApp = () => (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <SubscriptionBanner />
        
        <div className="mb-8">
          <div className="flex border-b border-gray-200">
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('upload')}
            >
              <div className="flex items-center">
                <FileUpload className="w-4 h-4 mr-2" />
                Upload & Analyze
              </div>
            </button>
            <button
              className={`px-4 py-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setActiveTab('dashboard')}
              disabled={!analysisResults}
            >
              <div className="flex items-center">
                <UploadCloud className="w-4 h-4 mr-2" />
                Results Dashboard
              </div>
            </button>
          </div>
        </div>

        {activeTab === 'upload' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <ResumeUpload onUpload={handleResumeUpload} currentResume={currentResume} />
            <JobDescription onSave={handleJobDescriptionSave} currentJobDesc={currentJobDesc} />
            
            <div className="md:col-span-2">
              <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
                onClick={handleAnalyze}
                disabled={!currentResume || !currentJobDesc || isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Analyzing Resume...
                  </>
                ) : (
                  'Analyze Resume'
                )}
              </button>
            </div>
          </div>
        ) : (
          <Dashboard analysisResults={analysisResults} />
        )}
      </main>
    </div>
  );

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route 
          path="/subscription" 
          element={
            <ProtectedRoute>
              <SubscriptionPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <MainApp />
            </ProtectedRoute>
          } 
        />
        <Route path="/" element={<MainApp />} />
      </Routes>
    </Router>
  );
}

export default App;
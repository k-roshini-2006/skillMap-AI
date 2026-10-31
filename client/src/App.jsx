import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from './context/AuthContext';
import API from './api/axiosInstance';
import AuthPage from './pages/AuthPage';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import ResumeAnalyzerPage from './pages/ResumeAnalyzerPage';
import CompetencyMappingPage from './pages/CompetencyMappingPage';
import SkillGapPage from './pages/SkillGapPage';
import JobExplorePage from './pages/JobExplorePage';
import ProgressPage from './pages/ProgressPage';
import LearningPathPage from './pages/LearningPathPage';
import ProfilePage from './pages/ProfilePage';
import AIChatbot from './components/AIChatbot';
import CertificatesModal from './components/CertificatesModal';

function App() {
  const { user, token, loading, logout } = useContext(AuthContext);

  // Tab State Persistence via localStorage + URL Hash (No kick-out on page reload!)
  const [activeTab, setActiveTabState] = useState(() => {
    const hash = window.location.hash.replace('#', '').trim();
    if (hash) return hash;
    return localStorage.getItem('skillmap_active_tab') || 'dashboard';
  });

  // Resume Data Persistence (Single Upload Rule: retrieved from DB/localStorage)
  const [resumeData, setResumeDataState] = useState(() => {
    const cached = localStorage.getItem('skillmap_resume_data');
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (err) {
        console.error('Error parsing cached resumeData:', err);
      }
    }
    return null;
  });

  const [showCertificates, setShowCertificates] = useState(false);

  // Synchronized activeTab setter that updates URL hash and localStorage
  const setActiveTab = (tab) => {
    if (tab === 'certificates') {
      setShowCertificates(true);
      return;
    }
    setActiveTabState(tab);
    localStorage.setItem('skillmap_active_tab', tab);
    window.location.hash = tab;
  };

  // Synchronized resumeData setter that writes to localStorage
  const setResumeData = (data) => {
    setResumeDataState(data);
    if (data) {
      localStorage.setItem('skillmap_resume_data', JSON.stringify(data));
    } else {
      localStorage.removeItem('skillmap_resume_data');
    }
  };

  // Listen to browser hash changes (e.g. back/forward navigation)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      if (hash && hash !== activeTab) {
        setActiveTabState(hash);
        localStorage.setItem('skillmap_active_tab', hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [activeTab]);

  // Single Upload Rule: Fetch latest analyzed resume from database on load/login
  useEffect(() => {
    let isMounted = true;
    const fetchLatestResume = async () => {
      if (!token) return;
      try {
        const res = await API.get('/resume/latest');
        if (isMounted && res.data) {
          // If we don't have local data or the DB data is newer, sync it
          setResumeDataState((prev) => {
            const updated = res.data;
            localStorage.setItem('skillmap_resume_data', JSON.stringify(updated));
            return updated;
          });
        }
      } catch (err) {
        // If 404, candidate hasn't uploaded yet; keep existing cached state or null
        console.log('No prior resume found on server, ready for new upload.');
      }
    };

    fetchLatestResume();
    return () => { isMounted = false; };
  }, [token]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 text-cyan-400 flex flex-col items-center justify-center font-sans space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-2xl animate-pulse shadow-lg shadow-cyan-500/30">
          S
        </div>
        <div className="text-sm font-semibold tracking-wide text-slate-300">
          Loading SkillMap AI Platform...
        </div>
      </div>
    );
  }

  if (!token) {
    return <AuthPage />;
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden font-sans relative">
      {/* Persistent Left Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main View Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 pb-20">
        {activeTab === 'dashboard' && (
          <DashboardPage
            setActiveTab={setActiveTab}
            resumeData={resumeData}
            onOpenCertificates={() => setShowCertificates(true)}
          />
        )}

        {activeTab === 'resume-analyzer' && (
          <ResumeAnalyzerPage
            resumeData={resumeData}
            setResumeData={setResumeData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'competency-mapping' && (
          <CompetencyMappingPage
            resumeData={resumeData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'skill-gap' && (
          <SkillGapPage
            resumeData={resumeData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'explore-jobs' && (
          <JobExplorePage
            resumeData={resumeData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressPage
            resumeData={resumeData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'learning-path' && (
          <LearningPathPage
            resumeData={resumeData}
            setResumeData={setResumeData}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'profile' && (
          <ProfilePage
            resumeData={resumeData}
            setActiveTab={setActiveTab}
          />
        )}
      </main>

      {/* Certificates Modal Dialog */}
      <CertificatesModal
        isOpen={showCertificates}
        onClose={() => setShowCertificates(false)}
        userName={user?.name || resumeData?.candidateName || 'Candidate'}
      />

      {/* Floating AI Resume & Career Coach */}
      <AIChatbot resumeData={resumeData} />
    </div>
  );
}

export default App;
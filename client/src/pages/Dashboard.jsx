import React, { useState } from 'react';
import API from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import CertificatesModal from '../components/CertificatesModal';
import FloatingChatbot from '../components/FloatingChatbot';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend
} from 'recharts';
import {
  Upload, FileText, Target, Award, BookOpen, Briefcase, Bell, CheckCircle2,
  AlertTriangle, ArrowRight, Sparkles, Loader2
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Engineer');
  const [showCertModal, setShowCertModal] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUploadAndAnalyze = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);

    setAnalyzing(true);

    try {
      const res = await API.post('/resume/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAnalysis(res.data.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to analyze resume PDF.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-6 rounded-2xl backdrop-blur-xl">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
            Welcome back, {user?.name || 'Developer'}!
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Skill gap analysis & AI career engine configured for: <span className="text-sky-400 font-semibold">{targetRole}</span>
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCertModal(true)}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700/80 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all"
          >
            <Award className="w-4 h-4" />
            <span>Certificates</span>
          </button>
        </div>
      </div>

      {/* Upload Box */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
          <Upload className="w-5 h-5 text-sky-400" />
          <span>Upload Resume PDF for AI Analysis</span>
        </h2>

        <form onSubmit={handleUploadAndAnalyze} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Target Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:outline-none focus:border-sky-500"
            >
              <option value="Software Engineer">Software Engineer</option>
              <option value="Data Scientist">Data Scientist</option>
              <option value="Data Analyst">Data Analyst</option>
              <option value="Full Stack Developer">Full Stack Developer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Select Resume PDF</label>
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-slate-300 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-sky-500 file:text-white hover:file:bg-sky-400 cursor-pointer"
            />
          </div>

          <button
            type="submit"
            disabled={!file || analyzing}
            className="w-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-50"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing PDF with Gemini AI...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Run AI Analysis</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Analysis Results View */}
      {analysis && (
        <div className="space-y-8">
          
          {/* Top Score Summary Banner */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 flex items-center space-x-4">
              <div className="p-4 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Target className="w-8 h-8" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Target Role Match Score</p>
                <h3 className="text-3xl font-extrabold text-white mt-1">{analysis.matchScore}%</h3>
              </div>
            </div>

            <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-sm font-semibold text-sky-400 mb-2">Executive Summary</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{analysis.summary}</p>
            </div>
          </div>

          {/* Recharts Skill Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Radar Chart */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Competency Radar (Current vs Target)</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={analysis.skills}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fontSize: 11 }} />
                    <PolarRadiusAxis stroke="#334155" />
                    <Radar name="Current Level" dataKey="currentLevel" stroke="#0284c7" fill="#0284c7" fillOpacity={0.5} />
                    <Radar name="Required Level" dataKey="requiredLevel" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.2} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Bar Chart */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4">Skill Gap Numerical Mapping</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analysis.skills}>
                    <XAxis dataKey="skill" stroke="#94a3b8" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#fff' }} />
                    <Legend />
                    <Bar dataKey="currentLevel" name="Current Skill Level" fill="#0284c7" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="requiredLevel" name="Target Requirement" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Job Matches & Skill Gaps */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Job Match Percentage Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-sky-400" />
                <span>Target Role Job Matches</span>
              </h3>
              <div className="space-y-3">
                {analysis.jobMatches?.map((job, idx) => (
                  <div key={idx} className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">{job.company}</h4>
                      <p className="text-xs text-slate-400">{job.role} • {job.location}</p>
                    </div>
                    <span className="text-sm font-bold px-3 py-1 bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
                      {job.matchPercentage}% Match
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Identified Skill Gaps */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <span>Key Skill Gaps Identified</span>
              </h3>
              <div className="space-y-3">
                {analysis.skillGaps?.map((gap, idx) => (
                  <div key={idx} className="p-4 bg-slate-800/50 border border-slate-700/60 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-sm font-semibold text-white">{gap.skill}</h4>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        gap.gapSeverity === 'High' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {gap.gapSeverity} Severity
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{gap.description}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* AI Recommended Course Roadmap */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              <span>Recommended Learning Roadmap</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.learningPath?.map((step, idx) => (
                <div key={idx} className="p-4 bg-slate-800/40 border border-slate-700/50 rounded-xl flex items-start space-x-3">
                  <span className="p-2 bg-sky-500/20 text-sky-400 rounded-lg text-xs font-bold">
                    Step {step.step}
                  </span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">{step.topic}</h4>
                    <p className="text-xs text-slate-400 mt-1">{step.action}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Modal and Floating Widget */}
      <CertificatesModal
        isOpen={showCertModal}
        onClose={() => setShowCertModal(false)}
        userName={user?.name}
      />
      
      <FloatingChatbot resumeSummary={analysis} />
    </div>
  );
}
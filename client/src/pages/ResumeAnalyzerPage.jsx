import React, { useState, useContext } from 'react';
import API from '../api/axiosInstance';
import { AuthContext } from '../context/AuthContext';
import {
  FileText, Cpu, AlertCircle, CheckCircle2, Award, Upload,
  Layers, Target, Briefcase, Sparkles, RefreshCw, Check
} from 'lucide-react';

const ResumeAnalyzerPage = ({ setResumeData, resumeData, setActiveTab }) => {
  const { user } = useContext(AuthContext);

  const [file, setFile] = useState(null);
  const [targetRole, setTargetRole] = useState(user?.targetRole || 'Software Engineer');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analysisSuccess, setAnalysisSuccess] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setAnalysisSuccess(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a PDF resume file to upload.');
      return;
    }

    setLoading(true);
    setError('');
    setAnalysisSuccess(false);

    const formData = new FormData();
    formData.append('resume', file);
    formData.append('targetRole', targetRole);

    try {
      const res = await API.post('/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.data) {
        setResumeData(res.data);
        setAnalysisSuccess(true);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.response?.data?.error || 'Failed to analyze resume. Make sure Flask backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-5xl mx-auto text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 space-y-2 backdrop-blur-md">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-cyan-400" />
          AI Resume Parser & ATS Diagnostic Engine
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm">
          Upload your PDF resume to extract raw competencies via Python <code className="text-cyan-400 bg-slate-800 px-1.5 py-0.5 rounded">pypdf</code>, calculate dynamic ATS match %, and persist your career profile to SQLite.
        </p>
      </div>

      {/* Upload Form Box */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-5 shadow-xl">
        {error && (
          <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {analysisSuccess && (
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Resume parsed and saved to SQLite database successfully! Data is now synced across all tabs.</span>
            </div>
            <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-semibold uppercase">
              Persisted
            </span>
          </div>
        )}

        <form onSubmit={handleAnalyze} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Target Role Benchmark</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 transition-colors"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Data Analyst">Data Analyst</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Machine Learning Engineer">Machine Learning Engineer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Select PDF Resume</label>
              <input
                type="file"
                accept=".pdf,.txt"
                onChange={handleFileChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-300 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-slate-950 hover:file:bg-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Parsing PDF with pypdf & Generating Dynamic Scores...</span>
              </>
            ) : (
              <>
                <Cpu className="w-4 h-4" />
                <span>Run Dynamic AI Analysis & Save</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Output Data Display from Stored / Newly Analyzed Resume */}
      {resumeData && (
        <div className="space-y-5 animate-fade-in">
          {/* Summary Banner */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-wider bg-cyan-950/80 px-2.5 py-0.5 rounded-full border border-cyan-800/60">
                  {resumeData.verdict || 'Active Profile'}
                </span>
                <span className="text-xs text-slate-400">File: {resumeData.filename || 'Uploaded Resume'}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">{resumeData.candidateName || 'Candidate'}</h2>
              <p className="text-xs text-slate-400">
                Target Role: <strong className="text-cyan-300">{resumeData.targetRole}</strong>
                {resumeData.email && <span> • Contact: {resumeData.email}</span>}
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 self-start md:self-center">
              <div className="text-center">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">ATS Readiness</span>
                <span className="text-3xl font-black text-cyan-400">{resumeData.matchScore}%</span>
              </div>
              <div className="border-l border-slate-700 pl-4 text-left">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Gatekeeper</span>
                <span className={`text-xs font-bold ${resumeData.matchScore >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {resumeData.matchScore >= 60 ? '✓ Jobs Unlocked' : '✕ Complete Gaps'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Hub Jump Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => setActiveTab('competency-mapping')}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-200 transition-all"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>Competency Radar</span>
              </span>
              <span className="text-cyan-400 text-[10px]">Open →</span>
            </button>

            <button
              onClick={() => setActiveTab('skill-gap')}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-rose-500/40 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-200 transition-all"
            >
              <span className="flex items-center gap-2">
                <Target className="w-4 h-4 text-rose-400" />
                <span>Missing Skill Gaps</span>
              </span>
              <span className="text-rose-400 text-[10px]">Open →</span>
            </button>

            <button
              onClick={() => setActiveTab('explore-jobs')}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/40 rounded-xl flex items-center justify-between text-xs font-semibold text-slate-200 transition-all"
            >
              <span className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-400" />
                <span>Eligible Job Openings</span>
              </span>
              <span className="text-indigo-400 text-[10px]">Open →</span>
            </button>
          </div>

          {/* Extracted Skills Breakdown */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-cyan-400" />
                Extracted Competencies & Proficiency Levels
              </h3>
              <span className="text-xs text-slate-400">
                {resumeData.skills?.length || 0} Core Skills Detected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {resumeData.skills?.map((item, idx) => (
                <div key={idx} className="bg-slate-800/40 border border-slate-700/60 p-3.5 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-200">{item.skill || item.name}</span>
                    <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                      {item.currentLevel}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full"
                      style={{ width: `${item.currentLevel}%` }}
                    />
                  </div>
                  {item.evidence && (
                    <p className="text-[10px] text-slate-400 italic truncate">{item.evidence}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzerPage;
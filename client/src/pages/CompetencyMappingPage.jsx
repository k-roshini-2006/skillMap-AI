import React, { useState } from 'react';
import {
  Layers, FileText, ArrowRight, TrendingUp, Award,
  CheckCircle2, Target, BarChart2
} from 'lucide-react';
import {
  ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid
} from 'recharts';

const CompetencyMappingPage = ({ resumeData, setActiveTab }) => {
  const [viewMode, setViewMode] = useState('all'); // 'all', 'radar', 'bars'

  if (!resumeData) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6 my-12 font-sans">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
          <Layers className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">Competency Mapping Locked</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Upload your resume PDF in the Resume Analyzer tab to extract and map your technical competencies against industry standards.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('resume-analyzer')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Upload Resume in Analyzer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // Format skills data for Recharts (Current vs Required Level)
  const skillsData = (resumeData.skills || []).map((s) => ({
    skill: (s.skill || s.name || 'Skill').slice(0, 14),
    fullName: s.skill || s.name || 'Skill',
    currentLevel: s.currentLevel || 50,
    requiredLevel: s.requiredLevel || 85,
    category: s.category || 'Core Technical',
    evidence: s.evidence || 'Extracted from resume experience.'
  }));

  const candidateName = resumeData.candidateName || 'Candidate';
  const targetRole = resumeData.targetRole || 'Software Engineer';
  const matchScore = resumeData.matchScore || 65;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
              Live Database Mapping
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Layers className="w-6 h-6 text-cyan-400" />
            Competency Mapping: Current vs Industry Baseline
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm">
            Technical proficiency breakdown for <strong className="text-cyan-300">{candidateName}</strong> targeting <strong className="text-white">{targetRole}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 shrink-0">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">ATS Readiness</span>
            <span className="text-2xl font-black text-cyan-400">{matchScore}%</span>
          </div>
          <div className="border-l border-slate-700 pl-4 text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Skills Evaluated</span>
            <span className="text-2xl font-black text-emerald-400">{skillsData.length}</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Competency Radar Analysis
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Multi-axis visual mapping of candidate strength vs standard industry benchmark.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg font-semibold">
              Radar
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillsData}>
                <PolarGrid stroke="#334155" />
                <PolarAngleAxis dataKey="skill" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 100]} stroke="#475569" tick={{ fill: '#64748b', fontSize: 9 }} />
                <Radar
                  name="Current Proficiency"
                  dataKey="currentLevel"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.45}
                />
                <Radar
                  name="Target Requirement"
                  dataKey="requiredLevel"
                  stroke="#818cf8"
                  fill="#818cf8"
                  fillOpacity={0.15}
                  strokeDasharray="4 4"
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-indigo-400" />
                Numerical Benchmark Comparison
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Exact numerical delta between current skill levels and the target threshold.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg font-semibold">
              Delta Bars
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skillsData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis
                  dataKey="skill"
                  stroke="#94a3b8"
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  interval={0}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="currentLevel" name="Current Level" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                <Bar dataKey="requiredLevel" name="Target Requirement" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Comprehensive Skill Badges & Proficiency Matrix */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            Detailed Skill Proficiency Matrix
          </h3>
          <span className="text-xs text-slate-400">
            Categorized & weighted against {targetRole} standards
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {skillsData.map((item, idx) => {
            const isTargetReached = item.currentLevel >= item.requiredLevel;
            const statusLabel =
              item.currentLevel >= 85 ? 'Expert Level' :
              item.currentLevel >= 70 ? 'Proficient' :
              item.currentLevel >= 55 ? 'Intermediate' : 'Developing';

            return (
              <div
                key={idx}
                className="bg-slate-800/40 border border-slate-700/60 p-4 rounded-xl space-y-3 hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.fullName}</h4>
                    <span className="text-[10px] text-slate-400">{item.category}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isTargetReached
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                  }`}>
                    {statusLabel}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Current: <strong className="text-cyan-400">{item.currentLevel}%</strong></span>
                    <span className="text-slate-400">Target: <strong className="text-slate-200">{item.requiredLevel}%</strong></span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isTargetReached ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-cyan-500 to-blue-500'
                      }`}
                      style={{ width: `${item.currentLevel}%` }}
                    />
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 italic">
                  {item.evidence}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CompetencyMappingPage;
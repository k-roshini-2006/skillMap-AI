import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  FileText, Target, Briefcase, BookOpen, ArrowRight, Sparkles,
  Award, TrendingUp, ShieldCheck, Layers, Lock, Compass
} from 'lucide-react';

const DashboardPage = ({ setActiveTab, resumeData, onOpenCertificates }) => {
  const { user } = useContext(AuthContext);

  const candidateName = user?.name || resumeData?.candidateName || 'Candidate';
  const targetRole = user?.targetRole || resumeData?.targetRole || 'Software Engineer';
  const matchScore = resumeData?.matchScore || 72;
  const skillsCount = resumeData?.skills?.length || 8;
  const missingCount = resumeData?.missingSkills?.length || 3;
  const isGatekeeperPassed = matchScore >= 60;

  const quickActions = [
    {
      id: 'resume-analyzer',
      title: 'Analyze Resume (pypdf)',
      desc: 'Upload PDF and extract key ATS match insights with persistent database storage.',
      icon: FileText,
      color: 'from-cyan-500 to-blue-600',
      badge: 'Core Engine'
    },
    {
      id: 'competency-mapping',
      title: 'Competency Mapping',
      desc: 'Interactive Radar & Bar charts comparing your skills against standard industry baselines.',
      icon: Layers,
      color: 'from-blue-500 to-indigo-600',
      badge: 'Radar & Analytics'
    },
    {
      id: 'skill-gap',
      title: 'Skill Gap Matrix',
      desc: 'Identify missing skills categorized by Critical and Moderate priority.',
      icon: Target,
      color: 'from-rose-500 to-pink-600',
      badge: 'Gap Matrix'
    },
    {
      id: 'learning-path',
      title: 'Curated Learning Paths',
      desc: 'Complete suggested courses to dynamically upgrade skills and boost ATS readiness.',
      icon: BookOpen,
      color: 'from-amber-500 to-orange-600',
      badge: 'Skill Upgrades'
    },
    {
      id: 'explore-jobs',
      title: 'Smart Job Gatekeeper',
      desc: 'Explore role recommendations with 60% ATS Match threshold gatekeeping.',
      icon: Briefcase,
      color: 'from-emerald-500 to-teal-600',
      badge: isGatekeeperPassed ? 'Jobs Unlocked' : 'Gate Locked'
    },
    {
      id: 'progress',
      title: 'Growth History Log',
      desc: 'View your trajectory curve and SQLite recorded milestones over time.',
      icon: TrendingUp,
      color: 'from-purple-500 to-violet-600',
      badge: 'Milestones'
    }
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 p-6 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back, {candidateName}!</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 text-xs font-semibold">
              {user?.role === 'admin' ? 'Admin Access' : 'Verified Member'}
            </span>
          </div>
          <p className="text-slate-400 text-xs sm:text-sm">
            Target Benchmark: <strong className="text-cyan-400">{targetRole}</strong> • AI Career readiness dashboard initialized and synced with SQLite.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {onOpenCertificates && (
            <button
              onClick={onOpenCertificates}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-md"
            >
              <Award className="w-4 h-4 text-cyan-400" />
              <span>Certificates</span>
            </button>
          )}

          <button
            onClick={() => setActiveTab('resume-analyzer')}
            className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
          >
            <Sparkles className="w-4 h-4" />
            <span>Upload New Resume</span>
          </button>
        </div>
      </div>

      {/* Dynamic Key Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Match Score */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">ATS Match Score</span>
            <span className="text-3xl font-black text-cyan-400 mt-1 block">{matchScore}%</span>
          </div>
          <div className="p-3 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 2: Verified Skills */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Verified Skills</span>
            <span className="text-3xl font-black text-emerald-400 mt-1 block">{skillsCount} Skills</span>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 3: Smart Job Gatekeeper */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Job Gatekeeper</span>
            <span className={`text-xl font-black mt-1 block ${isGatekeeperPassed ? 'text-indigo-400' : 'text-rose-400'}`}>
              {isGatekeeperPassed ? 'Apply Unlocked' : 'Requires >= 60%'}
            </span>
          </div>
          <div className={`p-3 rounded-xl border ${
            isGatekeeperPassed
              ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
          }`}>
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        {/* Metric 4: Skill Gaps */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium block">Missing Competencies</span>
            <span className="text-3xl font-black text-rose-400 mt-1 block">{missingCount} Gaps</span>
          </div>
          <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
            <Target className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Interactive Module Navigation Grid */}
      <div className="space-y-3">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Platform Modules & Analytics Hubs
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon;

            return (
              <div
                key={action.id}
                onClick={() => setActiveTab(action.id)}
                className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/40 p-5 rounded-2xl cursor-pointer transition-all group flex flex-col justify-between space-y-4 shadow-lg backdrop-blur-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${action.color} text-slate-950 font-bold shadow-md`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                        {action.title}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{action.desc}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 text-[11px] font-medium">
                    {action.badge}
                  </span>
                  <span className="text-cyan-400 font-semibold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Open Module</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
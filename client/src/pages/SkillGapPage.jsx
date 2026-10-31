import React, { useState } from 'react';
import {
  Target, FileText, AlertCircle, ArrowRight, BookOpen,
  ExternalLink, Sparkles, AlertTriangle, CheckCircle2, Compass
} from 'lucide-react';

const SkillGapPage = ({ resumeData, setActiveTab }) => {
  const [filter, setFilter] = useState('ALL'); // 'ALL', 'CRITICAL', 'MODERATE'

  // If no resume uploaded yet, show empty state prompt
  if (!resumeData) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center space-y-6 my-12 font-sans">
        <div className="w-16 h-16 bg-slate-900 border border-slate-800 text-cyan-400 rounded-2xl flex items-center justify-center mx-auto shadow-xl">
          <Target className="w-8 h-8 text-rose-400" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-white">No Resume Analyzed Yet</h2>
          <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto">
            Please upload your PDF resume in the Resume Analyzer tab first. Skill gap analytics and course recommendations will be generated automatically based on your parsed competencies.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('resume-analyzer')}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm inline-flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition-all"
        >
          <FileText className="w-4 h-4" />
          <span>Go to Resume Analyzer</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const missingSkills = resumeData.missingSkills || [];
  const targetRole = resumeData.targetRole || 'Software Engineer';

  // Count priorities
  const criticalGaps = missingSkills.filter(
    (s) => s.priorityType === 'critical' || s.priority?.toLowerCase().includes('critical')
  );
  const moderateGaps = missingSkills.filter(
    (s) => s.priorityType !== 'critical' && !s.priority?.toLowerCase().includes('critical')
  );

  const displayedSkills = missingSkills.filter((s) => {
    const isCritical = s.priorityType === 'critical' || s.priority?.toLowerCase().includes('critical');
    if (filter === 'CRITICAL') return isCritical;
    if (filter === 'MODERATE') return !isCritical;
    return true;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 font-semibold">
              Gap Matrix
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Target className="w-6 h-6 text-rose-400" />
            Skill Gap Analysis & Priority Categorization
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Identified missing competencies for <strong className="text-cyan-400">{resumeData.candidateName}</strong> targeting <strong className="text-slate-200">{targetRole}</strong>.
          </p>
        </div>

        {/* Action Button to switch to Learning Path */}
        <button
          onClick={() => setActiveTab('learning-path')}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <Compass className="w-4 h-4" />
          <span>Open Curated Learning Path</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Metric Counters & Priority Filter Toolbar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Metric 1: Total Gaps */}
        <div
          onClick={() => setFilter('ALL')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filter === 'ALL'
              ? 'bg-slate-800/90 border-cyan-500/60 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs text-slate-400 font-semibold block">Total Identified Gaps</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-3xl font-black text-white">{missingSkills.length}</span>
            <span className="text-[11px] font-bold text-cyan-400 bg-cyan-950/60 px-2.5 py-1 rounded-lg border border-cyan-800/40">
              Show All
            </span>
          </div>
        </div>

        {/* Metric 2: Critical Gaps */}
        <div
          onClick={() => setFilter('CRITICAL')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filter === 'CRITICAL'
              ? 'bg-slate-800/90 border-rose-500/60 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs text-slate-400 font-semibold block">Critical Priority Gaps</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-3xl font-black text-rose-400">{criticalGaps.length}</span>
            <span className="text-[11px] font-bold text-rose-400 bg-rose-950/60 px-2.5 py-1 rounded-lg border border-rose-800/40">
              Must Bridge First
            </span>
          </div>
        </div>

        {/* Metric 3: Moderate Gaps */}
        <div
          onClick={() => setFilter('MODERATE')}
          className={`p-5 rounded-2xl border cursor-pointer transition-all ${
            filter === 'MODERATE'
              ? 'bg-slate-800/90 border-amber-500/60 shadow-lg'
              : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <span className="text-xs text-slate-400 font-semibold block">Moderate Priority Gaps</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-3xl font-black text-amber-400">{moderateGaps.length}</span>
            <span className="text-[11px] font-bold text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded-lg border border-amber-800/40">
              Secondary Skills
            </span>
          </div>
        </div>
      </div>

      {/* Missing Skills Grid */}
      {displayedSkills.length === 0 ? (
        <div className="p-8 text-center bg-slate-900/80 border border-slate-800 rounded-2xl">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No Missing Skills in this Filter</h3>
          <p className="text-xs text-slate-400 mt-1">You have covered all required skills under this priority category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {displayedSkills.map((skill, index) => {
            const isCritical = skill.priorityType === 'critical' || skill.priority?.toLowerCase().includes('critical');

            return (
              <div
                key={index}
                className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl space-y-4 shadow-lg backdrop-blur-md flex flex-col justify-between transition-all"
              >
                <div className="space-y-3">
                  {/* Skill Title & Priority Badge */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base sm:text-lg">{skill.name || skill.skill}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">Target Benchmark: {targetRole}</span>
                    </div>
                    <span
                      className={`text-xs px-2.5 py-1 rounded-md font-semibold shrink-0 border ${
                        isCritical
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      }`}
                    >
                      {skill.priority || (isCritical ? 'Critical Priority' : 'Moderate Priority')}
                    </span>
                  </div>

                  {/* Reason */}
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                    {skill.reason || `Skill required to match the industry candidate baseline for ${targetRole}.`}
                  </p>

                  {/* Suggested Course Box */}
                  <div className="p-3.5 bg-slate-800/60 border border-slate-700/60 rounded-xl space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-cyan-400 font-semibold flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5" />
                        Suggested Course
                      </span>
                      <span className="text-slate-400 text-[11px]">{skill.coursePlatform || 'Coursera / edX'}</span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-bold text-white">
                      {skill.recommendedCourse || `Mastering ${(skill.name || skill.skill)}`}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Duration: {skill.duration || '4 weeks'}</span>
                      <span>Target Level: {skill.targetLevel || 85}%</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-800 flex items-center gap-2">
                  <a
                    href={skill.courseUrl || 'https://www.coursera.org'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>Course Info</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    onClick={() => setActiveTab('learning-path')}
                    className="flex-1 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1 transition-all"
                  >
                    <span>Bridge in Learning Path</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SkillGapPage;
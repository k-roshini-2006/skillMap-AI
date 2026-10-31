import React, { useState } from 'react';
import {
  Search, MapPin, Briefcase, IndianRupee, ExternalLink,
  Lock, Sparkles, CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck
} from 'lucide-react';

const JobExplorePage = ({ resumeData, setActiveTab }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All Matches');

  const candidateScore = resumeData?.matchScore ?? 62;
  const targetRole = resumeData?.targetRole || 'Software Engineer';

  // Dynamic job listings that incorporate candidate's actual ATS score
  const baseJobs = [
    {
      id: 1,
      role: targetRole,
      company: 'TechNova Solutions',
      location: 'Bangalore / Remote',
      experience: '0-2 yrs',
      ctc: '₹8-14 LPA',
      type: 'Full-time',
      skills: ['Python', 'SQL', 'Git', 'System Design'],
      matchOffset: 4,
      link: 'https://www.linkedin.com/jobs/search/?keywords=' + encodeURIComponent(targetRole)
    },
    {
      id: 2,
      role: `Associate ${targetRole}`,
      company: 'DataSphere AI',
      location: 'Hyderabad',
      experience: '0-1 yrs',
      ctc: '₹6-10 LPA',
      type: 'Full-time',
      skills: ['Python', 'Algorithms', 'Databases', 'REST APIs'],
      matchOffset: 2,
      link: 'https://www.naukri.com/jobs-in-india'
    },
    {
      id: 3,
      role: 'Full Stack Engineer',
      company: 'Finlytics Corp',
      location: 'Mumbai / Hybrid',
      experience: '1-3 yrs',
      ctc: '₹9-15 LPA',
      type: 'Full-time',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Docker'],
      matchOffset: -4,
      link: 'https://in.indeed.com/q-Software-Engineer-jobs.html'
    },
    {
      id: 4,
      role: 'Machine Learning Analyst',
      company: 'NeuralWorks',
      location: 'Chennai',
      experience: 'Fresher / 0-1 yrs',
      ctc: '₹7-11 LPA',
      type: 'Full-time',
      skills: ['Python', 'Statistics', 'Pandas', 'Machine Learning'],
      matchOffset: -8,
      link: 'https://internshala.com'
    },
    {
      id: 5,
      role: 'Cloud & DevOps Associate',
      company: 'CloudMatrix',
      location: 'Pune',
      experience: '1-2 yrs',
      ctc: '₹8-12 LPA',
      type: 'Full-time',
      skills: ['Docker', 'AWS', 'Linux', 'CI/CD'],
      matchOffset: -12,
      link: 'https://wellfound.com/jobs'
    },
    {
      id: 6,
      role: 'Junior Platform Developer',
      company: 'AppScale Global',
      location: 'Bangalore',
      experience: '0-1 yrs',
      ctc: '₹5-8 LPA',
      type: 'Full-time',
      skills: ['Git', 'HTML/CSS', 'JavaScript', 'SQL'],
      matchOffset: 5,
      link: 'https://www.linkedin.com/jobs'
    }
  ];

  // Calculate dynamic match per job based on candidate's real score
  const jobListings = baseJobs.map((job) => {
    const calculatedMatch = Math.max(35, Math.min(98, candidateScore + job.matchOffset));
    const isEligible = calculatedMatch >= 60;

    let recommendation = '';
    if (calculatedMatch >= 85) {
      recommendation = `Top Fit! High 85%+ alignment with ${targetRole} hiring benchmark. Fast-track screening recommended.`;
    } else if (isEligible) {
      recommendation = `Eligible to apply! Your ${calculatedMatch}% match crosses the required 60% ATS readiness gatekeeper.`;
    } else {
      recommendation = `Application locked (${calculatedMatch}%). Complete missing skills in your Learning Path to unlock this opening.`;
    }

    return {
      ...job,
      match: calculatedMatch,
      isEligible,
      recommendation
    };
  });

  const filteredJobs = jobListings.filter((job) => {
    const query = searchTerm.toLowerCase();
    const matchesSearch =
      job.role.toLowerCase().includes(query) ||
      job.company.toLowerCase().includes(query) ||
      job.location.toLowerCase().includes(query) ||
      job.skills.some((s) => s.toLowerCase().includes(query));

    if (!matchesSearch) return false;

    if (selectedFilter === 'Eligible (60%+)') return job.match >= 60;
    if (selectedFilter === 'High Fit (75%+)') return job.match >= 75;
    if (selectedFilter === 'Top Fit (85%+)') return job.match >= 85;

    return true;
  });

  const totalEligible = jobListings.filter((j) => j.isEligible).length;

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
              Smart Gatekeeping Activated
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-cyan-400" />
            Explore Job Matches & Opportunities
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            External application links unlock dynamically when your ATS Match Score crosses the <strong>60% threshold</strong>.
          </p>
        </div>

        {/* Gatekeeping Status Widget */}
        <div className="flex items-center gap-3 bg-slate-800/80 p-3.5 rounded-2xl border border-slate-700/80 shrink-0">
          <div className="text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Your ATS Score</span>
            <span className="text-2xl font-black text-cyan-400">{candidateScore}%</span>
          </div>
          <div className="border-l border-slate-700 pl-4 text-left">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Application Gate</span>
            <span className={`text-xs font-bold flex items-center gap-1 ${candidateScore >= 60 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {candidateScore >= 60 ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Unlocked ({totalEligible} Roles)</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Locked (&lt;60%)</span>
                </>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by role, company, or skill..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-xl border border-slate-800 w-full md:w-auto overflow-x-auto">
          {['All Matches', 'Eligible (60%+)', 'High Fit (75%+)', 'Top Fit (85%+)'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedFilter === filter
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Role Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredJobs.map((job) => {
          const isEligible = job.isEligible;

          return (
            <div
              key={job.id}
              className={`bg-slate-900/80 border rounded-2xl p-5 shadow-lg backdrop-blur-md flex flex-col justify-between space-y-4 transition-all ${
                isEligible ? 'border-slate-800 hover:border-slate-700' : 'border-rose-950/40 bg-slate-950/70'
              }`}
            >
              <div className="space-y-3">
                {/* Header Row */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-lg text-white leading-tight">{job.role}</h3>
                    <p className="text-xs text-cyan-400 font-semibold mt-0.5">{job.company}</p>
                  </div>

                  {/* Circular Match Gauge */}
                  <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={isEligible ? 'text-cyan-400' : 'text-rose-400'}
                        strokeDasharray={`${job.match}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className={`absolute text-[11px] font-black ${isEligible ? 'text-cyan-400' : 'text-rose-400'}`}>
                      {job.match}%
                    </span>
                  </div>
                </div>

                {/* Tags row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                    {job.experience}
                  </span>
                  <span className="flex items-center gap-1">
                    <IndianRupee className="w-3.5 h-3.5 text-slate-500" />
                    {job.ctc}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-[11px]">
                    {job.type}
                  </span>
                </div>

                {/* Skill Pills */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/80 text-cyan-300 border border-slate-700"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Recommendation Note */}
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    job.match >= 85
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : isEligible
                      ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                      : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                  }`}
                >
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>{job.recommendation}</span>
                </div>
              </div>

              {/* Action Button: Smart Gatekeeper Logic */}
              <div className="pt-2 border-t border-slate-800">
                {isEligible ? (
                  <a
                    href={job.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/10"
                  >
                    <span>Apply Now ({job.role})</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <div className="space-y-2">
                    <button
                      disabled
                      className="w-full py-2.5 bg-slate-800/80 text-rose-400/80 border border-rose-500/20 font-semibold rounded-xl text-xs cursor-not-allowed flex items-center justify-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5 text-rose-400" />
                      <span>Locked - Complete Skill Gaps (Requires 60% Match)</span>
                    </button>
                    {setActiveTab && (
                      <button
                        onClick={() => setActiveTab('skill-gap')}
                        className="w-full text-center text-[11px] text-cyan-400 hover:underline flex items-center justify-center gap-1"
                      >
                        <span>Bridge Required Skills in Skill Gap Matrix</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default JobExplorePage;
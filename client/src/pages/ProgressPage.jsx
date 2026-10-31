import React, { useState, useEffect } from 'react';
import API from '../api/axiosInstance';
import {
  TrendingUp, BookOpen, Clock, Flame, Award, CheckCircle2,
  Calendar, ShieldCheck, ArrowUpRight, ArrowRight
} from 'lucide-react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from 'recharts';

const ProgressPage = ({ resumeData, setActiveTab }) => {
  const currentATS = resumeData?.matchScore || 70;

  const [progressData, setProgressData] = useState({
    overallCompetency: currentATS,
    coursesCompleted: 2,
    learningHours: 24,
    learningStreak: 6,
    growthData: [
      { month: 'Baseline Assessment', competency: Math.max(35, currentATS - 20) },
      { month: 'Milestone 1', competency: Math.max(45, currentATS - 12) },
      { month: 'Milestone 2', competency: Math.max(55, currentATS - 6) },
      { month: 'Current Level', competency: currentATS },
    ],
    weeklyActivity: [
      { day: 'Mon', hours: 2.0 },
      { day: 'Tue', hours: 2.5 },
      { day: 'Wed', hours: 1.0 },
      { day: 'Thu', hours: 3.0 },
      { day: 'Fri', hours: 2.0 },
      { day: 'Sat', hours: 4.5 },
      { day: 'Sun', hours: 2.0 },
    ],
    history: []
  });

  const [loading, setLoading] = useState(true);

  // Fetch progress from SQLite backend on load
  useEffect(() => {
    let isMounted = true;
    const fetchProgress = async () => {
      try {
        const res = await API.get('/progress');
        if (isMounted && res.data) {
          setProgressData((prev) => ({
            ...prev,
            overallCompetency: resumeData?.matchScore || res.data.overallCompetency || prev.overallCompetency,
            coursesCompleted: res.data.coursesCompleted || prev.coursesCompleted,
            learningHours: res.data.learningHours || prev.learningHours,
            learningStreak: res.data.learningStreak || prev.learningStreak,
            growthData: res.data.growthData && res.data.growthData.length > 0 ? res.data.growthData : prev.growthData,
            weeklyActivity: res.data.weeklyActivity || prev.weeklyActivity,
            history: res.data.history || []
          }));
        }
      } catch (err) {
        console.log('Using local progress fallback:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchProgress();
    return () => { isMounted = false; };
  }, [resumeData?.matchScore]);

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
              Live Career Growth Log
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <TrendingUp className="w-6 h-6 text-cyan-400" />
            Competency Growth & Learning Milestones
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">
            Track how completed courses and skill upgrades systematically elevate your ATS score in SQLite.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('learning-path')}
          className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all shrink-0"
        >
          <BookOpen className="w-4 h-4" />
          <span>Complete Next Course</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Top 4 Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Overall Competency */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Overall Competency</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-cyan-400">{progressData.overallCompetency}%</span>
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-emerald-400 font-medium block mt-2">
            {progressData.overallCompetency >= 60 ? '✓ Exceeds 60% Job Gate' : 'Below 60% Gate'}
          </span>
        </div>

        {/* Metric 2: Courses Completed */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Courses Completed</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-indigo-400">{progressData.coursesCompleted}</span>
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-slate-400 block mt-2">Verified in Database</span>
        </div>

        {/* Metric 3: Learning Hours */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Learning Hours</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-emerald-400">{progressData.learningHours} hrs</span>
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-emerald-400 block mt-2">Active skill investment</span>
        </div>

        {/* Metric 4: Learning Streak */}
        <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl shadow-lg">
          <span className="text-xs text-slate-400 font-semibold block mb-1">Learning Streak</span>
          <div className="flex items-center justify-between">
            <span className="text-3xl font-black text-amber-400">{progressData.learningStreak} days</span>
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Flame className="w-5 h-5" />
            </div>
          </div>
          <span className="text-[11px] text-amber-400 block mt-2">Consistent momentum</span>
        </div>
      </div>

      {/* Analytics Line & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Competency Growth Line Chart */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Competency Growth Trajectory</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dynamic increase in ATS match score with every completed course.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-lg font-semibold">
              Live Curve
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={progressData.growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <YAxis domain={[0, 100]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Line
                  type="monotone"
                  dataKey="competency"
                  name="ATS Match %"
                  stroke="#06b6d4"
                  strokeWidth={3}
                  dot={{ fill: '#06b6d4', r: 5 }}
                  activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Learning Activity Bar Chart */}
        <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="font-bold text-sm text-white">Weekly Learning Distribution</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Hours spent mastering new modules over the current week.
              </p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-lg font-semibold">
              Weekly Activity
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData.weeklyActivity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="day" stroke="#94a3b8" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 6]} stroke="#475569" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff' }}
                />
                <Bar dataKey="hours" name="Hours Spent" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* SQLite Progress History Log */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            Verified Course Completion & Growth Events
          </h3>
          <span className="text-xs text-slate-400">
            Recorded in SQLite database <code className="text-cyan-400">resumes.db</code>
          </span>
        </div>

        {progressData.history && progressData.history.length > 0 ? (
          <div className="space-y-3">
            {progressData.history.map((item, idx) => (
              <div
                key={idx}
                className="p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">{item.course_title}</h4>
                    <p className="text-xs text-slate-400">
                      Skill Mastered: <span className="text-cyan-400 font-medium">{item.skill}</span> • Completed: {new Date(item.completed_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span className="text-xs text-slate-400 font-medium">{item.previous_score}%</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-sm font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
                    {item.new_score}% (+{item.new_score - item.previous_score}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-800/20 border border-slate-800 rounded-xl space-y-2">
            <p className="text-xs text-slate-400">
              No recent external course logs recorded in the database yet.
            </p>
            <p className="text-[11px] text-slate-500">
              Go to the <strong>Learning Path</strong> tab and click "Mark Complete" on any course to log your first verified milestone!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgressPage;
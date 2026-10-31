import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, FileText, Layers, Target, Briefcase,
  TrendingUp, BookOpen, Award, User, LogOut, ShieldCheck
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { logout, user } = useContext(AuthContext);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resume-analyzer', label: 'Resume Analyzer', icon: FileText },
    { id: 'competency-mapping', label: 'Competency Mapping', icon: Layers },
    { id: 'skill-gap', label: 'Skill Gap Analysis', icon: Target },
    { id: 'learning-path', label: 'Learning Path', icon: BookOpen },
    { id: 'explore-jobs', label: 'Explore Jobs', icon: Briefcase },
    { id: 'progress', label: 'Progress & Growth', icon: TrendingUp },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'profile', label: 'Profile Settings', icon: User },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between p-4 h-full shrink-0 select-none">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-cyan-500/20 shrink-0">
            S
          </div>
          <div className="overflow-hidden">
            <h1 className="font-extrabold text-base text-white tracking-tight leading-tight truncate">
              SkillMap AI
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase truncate">
                {user?.role === 'admin' ? 'Admin Access' : (user?.name || 'Pro Candidate')}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/10 text-cyan-400 border border-cyan-500/40 font-bold shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile / Logout Action */}
      <div className="pt-4 border-t border-slate-800/80 space-y-2">
        <div className="px-3 py-2 bg-slate-800/40 rounded-xl border border-slate-800 flex items-center justify-between">
          <div className="truncate">
            <p className="text-xs font-bold text-white truncate">{user?.name || 'Candidate'}</p>
            <p className="text-[10px] text-slate-400 truncate">{user?.email || 'User'}</p>
          </div>
          {user?.role === 'admin' && (
            <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0 ml-1" />
          )}
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl font-semibold text-xs text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
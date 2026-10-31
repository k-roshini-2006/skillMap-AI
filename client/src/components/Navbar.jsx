import React from 'react';
import { useAuth } from '../context/AuthContext';
import { BrainCircuit, LogOut, User } from 'lucide-react';

export default function Navbar() {
  const { user, logoutUser } = useAuth();

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="bg-gradient-to-r from-sky-500 to-blue-600 p-2 rounded-xl shadow-lg shadow-sky-500/20">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <div>
          <span className="text-xl font-bold bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
            SkillMap AI
          </span>
          <span className="hidden sm:inline-block text-xs ml-2 px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 font-medium">
            PRO
          </span>
        </div>
      </div>

      {user && (
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-full">
            <User className="w-4 h-4 text-sky-400" />
            <span className="text-sm font-medium text-slate-200">{user.name}</span>
            <span className="text-xs text-slate-400 border-l border-slate-700 pl-2">
              {user.targetRole || 'Software Engineer'}
            </span>
          </div>

          <button
            onClick={logoutUser}
            className="flex items-center space-x-1.5 text-xs text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg border border-transparent hover:border-red-500/20 hover:bg-red-500/10"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </nav>
  );
}
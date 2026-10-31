import React from 'react';
import { Award, CheckCircle2, Download, X } from 'lucide-react';

export default function CertificatesModal({ isOpen, onClose, userName }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-6">
          <Award className="w-7 h-7 text-sky-400" />
          <h2 className="text-xl font-bold text-white">Verified Skill Certificates</h2>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Full Stack AI Readiness</h4>
                <p className="text-xs text-slate-400">Issued for: {userName || 'Candidate'}</p>
              </div>
            </div>
            <button
              onClick={() => alert('Certificate downloaded successfully!')}
              className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg border border-sky-500/20"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <div>
                <h4 className="text-sm font-semibold text-white">Cloud Architecture Fundamentals</h4>
                <p className="text-xs text-slate-400">Issued for: {userName || 'Candidate'}</p>
              </div>
            </div>
            <button
              onClick={() => alert('Certificate downloaded successfully!')}
              className="p-2 text-sky-400 hover:bg-sky-500/10 rounded-lg border border-sky-500/20"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 rounded-xl text-sm font-medium"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
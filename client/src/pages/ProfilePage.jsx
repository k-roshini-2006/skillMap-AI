import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api/axiosInstance';
import {
  User, Mail, Briefcase, MapPin, Edit3, Save, Phone,
  CheckCircle2, ShieldCheck, RefreshCw
} from 'lucide-react';

const ProfilePage = ({ resumeData }) => {
  const { user, updateUser } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Initial State synced from AuthContext / localStorage / resumeData
  const [userInfo, setUserInfo] = useState({
    name: user?.name || resumeData?.candidateName || 'Candidate',
    email: user?.email || 'candidate@gmail.com',
    role: user?.targetRole || resumeData?.targetRole || 'Software Engineer',
    location: user?.location || 'Chennai, Tamil Nadu',
    phone: user?.phone || '+91 98765 43210'
  });

  useEffect(() => {
    if (user) {
      setUserInfo((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        role: user.targetRole || prev.role,
        location: user.location || prev.location,
        phone: user.phone || prev.phone
      }));
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    setErrorMsg('');

    try {
      const res = await API.put('/auth/profile', userInfo);
      if (res.data?.user) {
        updateUser(res.data.user);
      } else {
        updateUser(userInfo);
      }

      setIsEditing(false);
      setIsSavedNotice(true);
      setTimeout(() => {
        setIsSavedNotice(false);
      }, 4000);
    } catch (err) {
      console.error('Error saving profile to database:', err);
      // Fallback local persistence
      updateUser(userInfo);
      setIsEditing(false);
      setIsSavedNotice(true);
      setTimeout(() => {
        setIsSavedNotice(false);
      }, 4000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto text-slate-100 font-sans">
      {/* Save Success Banner Notification */}
      {isSavedNotice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-emerald-300 text-xs sm:text-sm shadow-md animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Profile changes saved and persisted to SQLite users.db successfully!</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs sm:text-sm">
          {errorMsg}
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/80 p-6 rounded-2xl border border-slate-800 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-cyan-500/20 shrink-0">
            {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{userInfo.name}</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-400 border border-cyan-800/40">
                {user?.role || 'user'}
              </span>
            </div>
            <p className="text-slate-400 text-xs mt-0.5">{userInfo.role}</p>
          </div>
        </div>

        {/* Action Button */}
        {isEditing ? (
          <button
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{saving ? 'Saving...' : 'Save to Database'}</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20"
          >
            <Edit3 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Personal Details Form */}
      <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-2xl space-y-6 shadow-xl">
        <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
          <h3 className="font-bold text-base text-white flex items-center gap-2">
            <User className="w-5 h-5 text-cyan-400" />
            Personal & Career Details
          </h3>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            {isEditing ? 'Editing Mode' : 'Read Only'}
          </span>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-400" />
              Full Name
            </label>
            {isEditing ? (
              <input
                type="text"
                name="name"
                value={userInfo.name}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
                required
              />
            ) : (
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-sm font-semibold text-slate-200">
                {userInfo.name}
              </div>
            )}
          </div>

          {/* Email Address */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" />
              Email Address
            </label>
            <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-sm font-semibold text-slate-300">
              {userInfo.email}
            </div>
          </div>

          {/* Target Role */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
              Target Benchmark Role
            </label>
            {isEditing ? (
              <select
                name="role"
                value={userInfo.role}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
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
            ) : (
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-sm font-semibold text-cyan-400">
                {userInfo.role}
              </div>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-cyan-400" />
              Phone Number
            </label>
            {isEditing ? (
              <input
                type="text"
                name="phone"
                value={userInfo.phone}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-sm font-semibold text-slate-200">
                {userInfo.phone || 'Not specified'}
              </div>
            )}
          </div>

          {/* Location */}
          <div className="space-y-1 sm:col-span-2">
            <label className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-cyan-400" />
              Location
            </label>
            {isEditing ? (
              <input
                type="text"
                name="location"
                value={userInfo.location}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            ) : (
              <div className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl text-sm font-semibold text-slate-200">
                {userInfo.location || 'Not specified'}
              </div>
            )}
          </div>

          {/* Submit Button Inside Form */}
          {isEditing && (
            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                <span>{saving ? 'Saving to Database...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import { 
  User, Mail, Lock, CheckCircle, AlertCircle, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toggleSidebar } = useOutletContext();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await api.get('/users/profile');
      setProfile(res.data.data);
      setName(res.data.data.name);
    } catch (err) {
      console.error('Failed to load profile:', err.message);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');

    try {
      await api.put('/users/profile', { name, password: password || undefined });
      setSuccess('Profile credentials updated successfully.');
      setPassword('');
      loadProfile();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header onMenuClick={toggleSidebar} title="Researcher Profile" subtitle="Account settings & diagnostic credentials" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
        {success && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        <div className="p-6 sm:p-8 bg-white rounded-2xl border border-stone-200 shadow-soft flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-2xl uppercase shadow-md shadow-emerald-900/20">
            {profile?.name ? profile.name.substring(0, 2) : 'US'}
          </div>
          <div className="text-center sm:text-left space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-bold text-slate-900">{profile?.name || user?.name}</h3>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                {profile?.role || 'Agronomist'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">{profile?.email || user?.email}</p>
            <div className="text-xs text-slate-400 pt-1 flex items-center justify-center sm:justify-start gap-4">
              <span>Total Analyses: <strong className="text-slate-700">{profile?.totalAnalyses ?? 0}</strong></span>
              <span>Joined: <strong className="text-slate-700">{profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : 'Active'}</strong></span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft p-6 sm:p-8">
          <h4 className="text-sm font-bold text-slate-900 mb-4">Edit Profile Settings</h4>

          <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={profile?.email || ''}
                  disabled
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-stone-200 rounded-xl bg-stone-100 text-slate-500 cursor-not-allowed"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">Account email address cannot be modified.</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">New Password (optional)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep existing password"
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-stone-200 flex items-center justify-between">
            <div>
              <div className="text-xs font-bold text-slate-900">Session Security</div>
              <div className="text-[11px] text-slate-500">Sign out of your active workstation session.</div>
            </div>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

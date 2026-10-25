import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, Lock, Mail, ArrowRight, AlertCircle, ShieldCheck, Microscope, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const initialPortal = searchParams.get('portal') === 'expert' ? 'expert' : 'user';

  const [portal, setPortal] = useState(initialPortal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const p = searchParams.get('portal');
    if (p === 'expert' || p === 'user') {
      setPortal(p);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password, portal);
      if (res?.role === 'expert' || res?.user?.role === 'expert' || portal === 'expert') {
        navigate('/history');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const isExpertPortal = portal === 'expert';

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-md shadow-emerald-700/20">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-slate-900 tracking-tight">AgriCloud<span className="text-emerald-600">-ML</span></span>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isExpertPortal ? 'Agronomist & Expert Portal' : 'Farmer & User Sign In'}
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          {isExpertPortal 
            ? 'Authorized access for pathology experts to review, confirm, and correct predictions.' 
            : 'Access your personal plant pathology records and submit new crop specimens.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Portal Switcher Tabs */}
        <div className="flex rounded-2xl bg-stone-200/80 p-1 mb-5">
          <button
            type="button"
            onClick={() => { setPortal('user'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
              !isExpertPortal 
                ? 'bg-white text-emerald-800 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4 text-emerald-600" />
            <span>Farmer / User</span>
          </button>

          <button
            type="button"
            onClick={() => { setPortal('expert'); setError(''); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-bold rounded-xl transition-all ${
              isExpertPortal 
                ? 'bg-white text-indigo-900 shadow-sm' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Microscope className="w-4 h-4 text-indigo-600" />
            <span>Pathology Expert</span>
          </button>
        </div>

        <div className={`bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-soft border ${
          isExpertPortal ? 'border-indigo-200 ring-2 ring-indigo-500/10' : 'border-stone-200'
        }`}>
          {isExpertPortal && (
            <div className="mb-5 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Agronomist Review Authorization:</span>
                <p className="text-[11px] text-indigo-700 mt-0.5">
                  Experts can inspect all images uploaded across all users and correct diagnoses for continuous model retraining.
                </p>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {isExpertPortal ? 'Agronomist Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isExpertPortal ? "expert@agricloud.ai" : "farmer@gmail.com"}
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                isExpertPortal 
                  ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-900/20' 
                  : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-900/20'
              }`}
            >
              <span>{loading ? 'Authenticating...' : isExpertPortal ? 'Access Expert Workspace' : 'Sign In as Farmer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <p className="text-xs text-slate-500">
              Need a new account?{' '}
              <Link 
                to={`/signup?role=${portal}`} 
                className={`font-bold hover:underline ${isExpertPortal ? 'text-indigo-600' : 'text-emerald-700'}`}
              >
                Register as {isExpertPortal ? 'Pathology Expert' : 'Farmer / User'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

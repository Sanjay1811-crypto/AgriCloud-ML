import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Sprout, Lock, Mail, User, ArrowRight, AlertCircle, Microscope, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'expert' ? 'expert' : 'user';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'expert' || r === 'user') {
      setRole(r);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await signup(name, email, password, role);
      navigate(role === 'expert' ? '/history' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const isExpertRole = role === 'expert';

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-10 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center justify-center gap-2.5 mb-5">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-md shadow-emerald-700/20">
            <Sprout className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-2xl text-slate-900 tracking-tight">AgriCloud<span className="text-emerald-600">-ML</span></span>
        </Link>
        <h2 className="text-2xl font-black text-slate-900 tracking-tight">
          {isExpertRole ? 'Create Agronomist Expert Account' : 'Create Farmer & Grower Account'}
        </h2>
        <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
          {isExpertRole
            ? 'Join our certified expert network to validate and relabel disease predictions.'
            : 'Access 38-class plant pathology AI diagnostics and clinical treatment plans.'}
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        {/* Role Selection Box */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <button
            type="button"
            onClick={() => setRole('user')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              !isExpertRole
                ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20'
                : 'border-stone-200 bg-white hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-800">
                <User className="w-4 h-4" />
              </div>
              {!isExpertRole && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <div className="font-bold text-xs text-slate-900">Farmer / Grower</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Upload leaves & get diagnostics</div>
          </button>

          <button
            type="button"
            onClick={() => setRole('expert')}
            className={`p-3.5 rounded-2xl border text-left transition-all ${
              isExpertRole
                ? 'border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-500/20'
                : 'border-stone-200 bg-white hover:bg-stone-50'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-800">
                <Microscope className="w-4 h-4" />
              </div>
              {isExpertRole && <Check className="w-4 h-4 text-indigo-600" />}
            </div>
            <div className="font-bold text-xs text-slate-900">Pathology Expert</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Review & correct all submissions</div>
          </button>
        </div>

        <div className={`bg-white py-8 px-6 sm:px-10 rounded-2xl shadow-soft border ${
          isExpertRole ? 'border-indigo-200 ring-2 ring-indigo-500/10' : 'border-stone-200'
        }`}>
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isExpertRole ? "Dr. Prabhakara Sanjay" : "Sanjay Prabhakar"}
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isExpertRole ? "expert@agricloud.ai" : "farmer@gmail.com"}
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
                  placeholder="At least 6 characters"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  required
                  className="w-full pl-9 pr-4 py-2.5 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 py-3 px-4 rounded-xl text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 ${
                isExpertRole 
                  ? 'bg-indigo-700 hover:bg-indigo-800 shadow-indigo-900/20' 
                  : 'bg-emerald-700 hover:bg-emerald-800 shadow-emerald-900/20'
              }`}
            >
              <span>{loading ? 'Creating Account...' : isExpertRole ? 'Register as Certified Expert' : 'Register as Farmer'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-stone-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link 
                to={`/login?portal=${role}`} 
                className={`font-bold hover:underline ${isExpertRole ? 'text-indigo-600' : 'text-emerald-700'}`}
              >
                Sign in to {isExpertRole ? 'Expert Portal' : 'Farmer Portal'}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

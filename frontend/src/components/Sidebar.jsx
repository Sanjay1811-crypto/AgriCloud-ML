import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  User, 
  LogOut, 
  Sprout, 
  Cloud,
  Microscope,
  ShieldCheck,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout, isExpert } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = isExpert ? [
    { name: 'Expert Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'All User Submissions', path: '/history', icon: FileCheck, highlight: true, badge: 'Review Queue' },
    { name: 'Profile & Settings', path: '/profile', icon: User },
  ] : [
    { name: 'Farmer Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'New Plant Analysis', path: '/analysis/new', icon: PlusCircle, highlight: true, badge: 'Run' },
    { name: 'My Diagnosis History', path: '/history', icon: History },
    { name: 'Profile & Settings', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out border-r border-slate-800 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-md ${
              isExpert ? 'bg-gradient-to-br from-indigo-500 to-purple-800 shadow-indigo-950' : 'bg-gradient-to-br from-emerald-500 to-teal-700 shadow-emerald-950'
            }`}>
              {isExpert ? <Microscope className="w-5 h-5 text-white" /> : <Sprout className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className="font-bold text-white tracking-tight text-base">AgriCloud<span className={isExpert ? "text-indigo-400" : "text-emerald-400"}>-ML</span></div>
              <div className="text-[10px] text-slate-400 font-mono">
                {isExpert ? 'Expert Pathology Review' : 'PyTorch EfficientNet-B0'}
              </div>
            </div>
          </div>
        </div>

        {/* Role status badge */}
        <div className="mx-4 my-3 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
          <div className="flex items-center gap-2 text-xs font-semibold mb-1">
            {isExpert ? (
              <span className="flex items-center gap-1.5 text-indigo-400">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Certified Agronomist Mode</span>
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-400">
                <Cloud className="w-3.5 h-3.5" />
                <span>Farmer / Grower Mode</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>{isExpert ? 'Scope: Global Submissions' : 'Scope: Personal Farm'}</span>
            <span className="flex items-center gap-1">
              <span className={`w-2 h-2 rounded-full ${isExpert ? 'bg-indigo-500' : 'bg-emerald-500'} animate-pulse`}></span>
              Online
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? isExpert ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-900/30' : 'bg-emerald-600 text-white font-semibold shadow-md shadow-emerald-900/30'
                    : item.highlight
                    ? isExpert ? 'bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 border border-indigo-500/30' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${item.highlight ? (isExpert ? 'text-indigo-400' : 'text-emerald-400') : ''}`} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                    isExpert ? 'bg-indigo-400/20 text-indigo-300' : 'bg-emerald-400/20 text-emerald-300'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 rounded-lg bg-slate-900">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white uppercase ${
              isExpert ? 'bg-indigo-700' : 'bg-emerald-700'
            }`}>
              {user?.name ? user.name.substring(0, 2) : 'AG'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white truncate">{user?.name || 'User'}</div>
              <div className="text-[10px] text-slate-400 truncate">
                {isExpert ? '🔬 Pathology Expert' : '🌿 Farmer'}
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}

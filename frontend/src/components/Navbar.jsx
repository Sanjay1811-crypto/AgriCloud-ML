import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldCheck, ArrowRight, LayoutDashboard, UserCheck, Microscope } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, isExpert, user } = useAuth();

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center shadow-md shadow-emerald-700/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-emerald-100" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg text-slate-900 tracking-tight">AgriCloud<span className="text-emerald-600">-ML</span></span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Serverless</span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium -mt-1">Plant Pathology & Relabeling</span>
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="/#features" className="hover:text-emerald-700 transition-colors">Features</a>
            <a href="/#pipeline" className="hover:text-emerald-700 transition-colors">Architecture</a>
            <a href="/#classes" className="hover:text-emerald-700 transition-colors">38 Classes</a>
            <a href="/#relabeling" className="hover:text-emerald-700 transition-colors">Relabeling MLOps</a>
          </div>

          <div className="flex items-center gap-2.5">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {isExpert && (
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                    <Microscope className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Expert Mode</span>
                  </span>
                )}
                <Link
                  to={isExpert ? "/history" : "/dashboard"}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>{isExpert ? "Review Queue" : "Dashboard"}</span>
                </Link>
              </div>
            ) : (
              <>
                <Link
                  to="/login?portal=user"
                  className="px-3 py-2 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
                >
                  Farmer Login
                </Link>
                <Link
                  to="/login?portal=expert"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-bold transition-colors"
                >
                  <Microscope className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Expert Portal</span>
                </Link>
                <Link
                  to="/signup"
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold shadow-sm transition-all hover:shadow"
                >
                  <span>Sign Up</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

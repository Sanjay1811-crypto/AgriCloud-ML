import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { 
  Sprout, Activity, CheckCircle2, AlertTriangle, PlusCircle, 
  ArrowUpRight, History, Download, Sparkles, Microscope, User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function DashboardPage() {
  const { user, isExpert } = useAuth();
  const { toggleSidebar } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, recentRes] = await Promise.all([
        api.get('/dashboard/stats'),
        api.get('/dashboard/recent')
      ]);
      setStats(statsRes.data.data);
      setRecent(recentRes.data.data);
    } catch (err) {
      console.error('Failed to load dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const statCards = isExpert ? [
    { title: 'Platform Submissions', value: stats?.totalAnalyses ?? 0, icon: Activity, color: 'bg-blue-50 text-blue-700 border-blue-200', subtitle: 'All grower uploads' },
    { title: 'Pending Review', value: stats?.reviewStats?.Pending ?? 0, icon: AlertTriangle, color: 'bg-amber-50 text-amber-700 border-amber-200', subtitle: 'Awaiting expert review' },
    { title: 'Verified / Confirmed', value: stats?.reviewStats?.Confirmed ?? 0, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', subtitle: 'Ground truth confirmed' },
    { title: 'Relabeled / Corrected', value: stats?.reviewStats?.Corrected ?? 0, icon: Sparkles, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', subtitle: 'MLOps retrain ready' },
  ] : [
    { title: 'My Total Analyses', value: stats?.totalAnalyses ?? 0, icon: Activity, color: 'bg-blue-50 text-blue-700 border-blue-200', subtitle: 'Your uploaded specimens' },
    { title: 'Diseases Detected', value: stats?.diseasesDetected ?? 0, icon: AlertTriangle, color: 'bg-amber-50 text-amber-700 border-amber-200', subtitle: 'Requiring curation' },
    { title: 'Healthy Plants', value: stats?.healthyPlants ?? 0, icon: CheckCircle2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', subtitle: 'Optimal foliage' },
    { title: 'Average Confidence', value: stats?.averageConfidence ?? '0%', icon: Sparkles, color: 'bg-teal-50 text-teal-700 border-teal-200', subtitle: 'EfficientNet-B0' },
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        onMenuClick={toggleSidebar} 
        title={isExpert ? "Agronomist Intelligence Console" : "Diagnostic Dashboard"} 
        subtitle={isExpert ? "Review, verify, and correct multi-user plant pathology specimens" : "Live metrics and botanical treatment recommendations"} 
      />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white shadow-soft relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 inline-block mb-3">
              {isExpert ? "Certified Agronomist Mode" : "Farmer & Grower Portal"}
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              {isExpert ? `Welcome, Dr. ${user?.name || 'Pathologist'}` : `Welcome back, ${user?.name || 'Farmer'}`}
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-emerald-100/80 leading-relaxed">
              {isExpert
                ? "You have full platform privileges to inspect leaf uploads from all farmers, verify model inferences, and submit authoritative relabeling corrections to continuously retrain the PyTorch neural network."
                : "Analyze leaf photos or PDF reports, identify potential diseases across 38 PlantVillage classes, and follow certified botanical treatment protocols."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {isExpert ? (
                <>
                  <Link to="/history" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-950 text-xs font-bold shadow-sm hover:bg-emerald-50 transition-colors">
                    <Microscope className="w-4 h-4 text-emerald-700" />
                    <span>Open All User Submissions ({stats?.reviewStats?.Pending || 0} Pending)</span>
                  </Link>
                  <a
                    href="/api/analysis/export/relabel?format=json"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white text-xs font-bold border border-emerald-600/40 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export COCO Retraining Set</span>
                  </a>
                </>
              ) : (
                <>
                  <Link to="/analysis/new" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-950 text-xs font-bold shadow-sm hover:bg-emerald-50 transition-colors">
                    <PlusCircle className="w-4 h-4 text-emerald-700" />
                    <span>New Plant Analysis</span>
                  </Link>
                  <Link to="/history" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-800/80 hover:bg-emerald-800 text-white text-xs font-bold border border-emerald-600/40 transition-colors">
                    <History className="w-4 h-4" />
                    <span>My Diagnosis History</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-soft">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-500">{c.title}</span>
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${c.color}`}><Icon className="w-4 h-4" /></div>
                </div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">{c.value}</div>
                <div className="text-[11px] text-slate-400 mt-1">{c.subtitle}</div>
              </div>
            );
          })}
        </div>

        {stats?.reviewStats && (
          <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-soft flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
              <span className="text-xs font-bold text-slate-900">
                {isExpert ? "Platform-Wide Human-in-the-Loop MLOps:" : "Agronomic Review Status:"}
              </span>
            </div>
            <div className="flex flex-wrap gap-3 text-xs font-medium">
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-semibold">Pending Review: {stats.reviewStats.Pending || 0}</span>
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">Confirmed: {stats.reviewStats.Confirmed || 0}</span>
              <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold">Corrected: {stats.reviewStats.Corrected || 0}</span>
            </div>
            <a href="/api/analysis/export/relabel?format=json" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800">
              <Download className="w-3.5 h-3.5" />
              <span>Export Retraining Set</span>
            </a>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft overflow-hidden">
          <div className="p-5 border-b border-stone-200 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {isExpert ? "Recent User Submissions Across Platform" : "Recent Plant Analyses"}
              </h3>
              <p className="text-xs text-slate-500">
                {isExpert ? "Live foliar specimens awaiting or reviewed by agronomists." : "Specimens evaluated through the pathology pipeline."}
              </p>
            </div>
            <Link to="/history" className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>{isExpert ? "Open Full Review Queue" : "View All"}</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="p-12 text-center">
              <Sprout className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700">No analyses recorded yet</div>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                {isExpert ? "No farmer uploads available in the database yet." : "Upload your first plant leaf photo or pathology document to begin automated disease detection."}
              </p>
              {!isExpert && (
                <Link to="/analysis/new" className="inline-flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-sm">
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Upload First Specimen</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Specimen</th>
                    {isExpert && <th className="py-3 px-4">Uploaded By</th>}
                    <th className="py-3 px-4">Crop</th>
                    <th className="py-3 px-4">Predicted Condition</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {recent.map((item) => (
                    <tr key={item._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img src={item.displayImageUrl} alt={item.predictedDisease} className="w-10 h-10 rounded-lg object-cover border border-stone-200 bg-stone-100 flex-shrink-0" onError={(e) => { e.target.src = 'https://placehold.co/80x80/2d6a4f/ffffff?text=Leaf'; }} />
                          <div className="truncate max-w-[140px]">
                            <div className="font-bold text-slate-900 truncate">{item.originalFilename}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{item.fileType === 'application/pdf' ? 'PDF Document' : 'JPEG Image'}</div>
                          </div>
                        </div>
                      </td>
                      {isExpert && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold">
                              <User className="w-3 h-3" />
                            </div>
                            <div className="truncate max-w-[120px]">
                              <div className="font-bold text-slate-900 truncate text-[11px]">{item.uploadedByName || 'Farmer'}</div>
                              <div className="text-[10px] text-slate-400 truncate">{item.uploadedByEmail || 'user@agricloud.org'}</div>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="py-3 px-4 text-slate-800 font-semibold">{item.plantName}</td>
                      <td className="py-3 px-4">
                        <span className={item.isHealthy ? 'text-emerald-700 font-bold' : 'text-slate-900 font-bold'}>
                          {item.correctedLabel || item.predictedDisease}
                        </span>
                        {item.correctedLabel && (
                          <div className="text-[9px] text-indigo-700 font-bold font-mono">Expert Relabeled</div>
                        )}
                      </td>
                      <td className="py-3 px-4"><ConfidenceBadge confidence={item.confidence} /></td>
                      <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${item.reviewStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' : item.reviewStatus === 'Corrected' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'}`}>{item.reviewStatus}</span></td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right">
                        <Link to={`/analysis/${item._id}`} className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 font-bold text-xs transition-colors">
                          {isExpert ? "Review" : "View Results"}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

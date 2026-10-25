import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import ConfidenceBadge from '../components/ConfidenceBadge';
import RelabelModal from '../components/RelabelModal';
import { useAuth } from '../context/AuthContext';
import { 
  Search, Download, Sprout, Trash2, ChevronLeft, ChevronRight,
  CheckCircle2, Edit3, User, ShieldCheck, Check
} from 'lucide-react';
import api from '../services/api';

export default function HistoryPage() {
  const { toggleSidebar } = useOutletContext();
  const { user, isExpert } = useAuth();
  
  const [analyses, setAnalyses] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [crop, setCrop] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Relabel modal state
  const [relabelItem, setRelabelItem] = useState(null);
  const [confirmingId, setConfirmingId] = useState(null);
  const [feedbackNotice, setFeedbackNotice] = useState('');

  const crops = [
    'Apple', 'Blueberry', 'Cherry', 'Corn (Maize)', 'Grape', 
    'Orange', 'Peach', 'Pepper (Bell)', 'Potato', 'Raspberry', 
    'Soybean', 'Squash', 'Strawberry', 'Tomato'
  ];

  useEffect(() => {
    loadAnalyses();
  }, [page, crop, status, sortBy, sortOrder]);

  const loadAnalyses = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 8,
        search,
        crop: crop !== 'all' ? crop : undefined,
        status: status !== 'all' ? status : undefined,
        sortBy,
        sortOrder
      };
      const res = await api.get('/analysis', { params });
      setAnalyses(res.data.data || []);
      setTotal(res.data.total || 0);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error('Failed to load history:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadAnalyses();
  };

  const handleQuickConfirm = async (item, e) => {
    e.preventDefault();
    setConfirmingId(item._id);
    setFeedbackNotice('');
    try {
      await api.put(`/analysis/${item._id}/review`, {
        reviewStatus: 'Confirmed',
        reviewNotes: 'Verified diagnosis confirmed by certified agronomist.'
      });
      setFeedbackNotice(`Confirmed prediction for "${item.originalFilename}"!`);
      loadAnalyses();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to confirm analysis.');
    } finally {
      setConfirmingId(null);
    }
  };

  const handleDelete = async (id, e) => {
    e.preventDefault();
    if (!window.confirm('Delete this analysis record permanently?')) return;

    try {
      await api.delete(`/analysis/${id}`);
      loadAnalyses();
    } catch (err) {
      alert('Failed to delete analysis.');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header 
        onMenuClick={toggleSidebar} 
        title={isExpert ? "Agronomist Review Queue & User Submissions" : "Pathology Analysis History"} 
        subtitle={isExpert 
          ? "All user uploads across the platform — review, confirm, or correct AI pathology diagnostics" 
          : "Search, filter, and track your submitted plant pathology records"} 
      />

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Expert Mode Notice */}
        {isExpert && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-900 text-white shadow-soft flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-300">Certified Agronomist Mode Active</div>
                <div className="text-xs text-emerald-100/90 mt-0.5">
                  Displaying submissions from <strong>all users</strong>. You have authoritative permissions to confirm predictions or correct labels to refine the MLOps retraining dataset.
                </div>
              </div>
            </div>
            <div className="hidden sm:block text-right flex-shrink-0">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/40 text-[11px] font-bold">
                {total} Total Submissions
              </span>
            </div>
          </div>
        )}

        {feedbackNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackNotice}</span>
            </div>
            <button onClick={() => setFeedbackNotice('')} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">Dismiss</button>
          </div>
        )}

        {/* Filter & Search Bar */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft p-4 sm:p-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isExpert ? "Search by disease name, user email, uploader name, or specimen filename..." : "Search by disease name, crop, or specimen filename..."}
                className="w-full pl-10 pr-4 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm"
            >
              Search
            </button>
          </form>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-stone-100 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Crop:</span>
                <select
                  value={crop}
                  onChange={(e) => { setCrop(e.target.value); setPage(1); }}
                  className="py-1 px-2.5 border border-stone-300 rounded-lg text-xs bg-stone-50 font-medium"
                >
                  <option value="all">All Crops</option>
                  {crops.map((c, i) => (
                    <option key={i} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-600">Review Status:</span>
                <select
                  value={status}
                  onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                  className="py-1 px-2.5 border border-stone-300 rounded-lg text-xs bg-stone-50 font-medium"
                >
                  <option value="all">All Statuses</option>
                  <option value="Pending">Pending Review</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Corrected">Corrected</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <a
                href="/api/analysis/export/relabel?format=json"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-semibold border border-stone-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export COCO JSON</span>
              </a>
              <a
                href="/api/analysis/export/relabel?format=csv"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-semibold border border-stone-200"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
            </div>
          </div>
        </div>

        {/* Table of Analyses */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading analysis records...</div>
          ) : analyses.length === 0 ? (
            <div className="p-12 text-center">
              <Sprout className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700">No records found matching filters</div>
              <p className="text-xs text-slate-400 mt-1">Try resetting search filters or wait for user image uploads.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Specimen</th>
                    {isExpert && <th className="py-3 px-4">Uploaded By</th>}
                    <th className="py-3 px-4">Crop</th>
                    <th className="py-3 px-4">Predicted Diagnosis</th>
                    <th className="py-3 px-4">Confidence</th>
                    <th className="py-3 px-4">Review Status</th>
                    <th className="py-3 px-4">Logged</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium">
                  {analyses.map((item) => (
                    <tr key={item._id} className="hover:bg-stone-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.displayImageUrl}
                            alt={item.predictedDisease}
                            className="w-10 h-10 rounded-lg object-cover border border-stone-200 bg-stone-100 flex-shrink-0"
                            onError={(e) => { e.target.src = 'https://placehold.co/80x80/2d6a4f/ffffff?text=Leaf'; }}
                          />
                          <div className="truncate max-w-[150px]">
                            <div className="font-bold text-slate-900 truncate">{item.originalFilename}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {item.fileType === 'application/pdf' ? 'PDF' : 'JPEG'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Uploaded By column for Experts */}
                      {isExpert && (
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div className="truncate max-w-[130px]">
                              <div className="font-bold text-slate-900 truncate text-[11px]">
                                {item.uploadedByName || 'Farmer'}
                              </div>
                              <div className="text-[10px] text-slate-400 truncate">
                                {item.uploadedByEmail || 'user@agricloud.org'}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      <td className="py-3 px-4 text-slate-800 font-semibold">{item.plantName}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.predictedDisease}</div>
                        {item.correctedLabel && (
                          <div className="text-[10px] text-indigo-700 font-mono mt-0.5 font-bold">
                            Corrected: {item.correctedLabel}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <ConfidenceBadge confidence={item.confidence} />
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.reviewStatus === 'Confirmed' ? 'bg-emerald-100 text-emerald-800' :
                          item.reviewStatus === 'Corrected' ? 'bg-indigo-100 text-indigo-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {item.reviewStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Expert Fast Review Interventions */}
                          {isExpert && (
                            <>
                              <button
                                onClick={(e) => handleQuickConfirm(item, e)}
                                disabled={confirmingId === item._id || item.reviewStatus === 'Confirmed'}
                                title="Confirm this prediction"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition-colors disabled:opacity-40"
                              >
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>{confirmingId === item._id ? 'Saving...' : 'Confirm'}</span>
                              </button>

                              <button
                                onClick={() => setRelabelItem(item)}
                                title="Correct / Relabel diagnosis"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-300 text-[11px] font-bold transition-colors"
                              >
                                <Edit3 className="w-3 h-3 text-indigo-600" />
                                <span>Correct</span>
                              </button>
                            </>
                          )}

                          <Link
                            to={`/analysis/${item._id}`}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold transition-colors text-[11px]"
                          >
                            Details
                          </Link>

                          {!isExpert && (
                            <button
                              onClick={(e) => handleDelete(item._id, e)}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                              title="Delete record"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="p-4 border-t border-stone-200 flex items-center justify-between text-xs text-slate-500">
              <div>
                Showing page <strong className="text-slate-800">{page}</strong> of <strong className="text-slate-800">{totalPages}</strong> ({total} total analyses)
              </div>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-stone-300 disabled:opacity-40"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className="p-1.5 rounded-lg border border-stone-300 disabled:opacity-40"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Relabel Modal for Expert Correction */}
      {relabelItem && (
        <RelabelModal
          isOpen={!!relabelItem}
          onClose={() => setRelabelItem(null)}
          currentLabel={relabelItem.predictedLabel || relabelItem.predictedDisease}
          analysisId={relabelItem._id}
          onUpdated={(updated) => {
            setFeedbackNotice(`Successfully corrected label to "${updated.correctedLabel}"! Curation updated.`);
            setRelabelItem(null);
            loadAnalyses();
          }}
        />
      )}
    </div>
  );
}

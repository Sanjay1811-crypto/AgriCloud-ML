import React, { useState, useEffect } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import ConfidenceBadge from '../components/ConfidenceBadge';
import { 
  Search, Download, Sprout, Trash2, ChevronLeft, ChevronRight
} from 'lucide-react';
import api from '../services/api';

export default function HistoryPage() {
  const { toggleSidebar } = useOutletContext();
  
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
      setAnalyses(res.data.data);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
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
      <Header onMenuClick={toggleSidebar} title="Pathology Analysis History" subtitle="Search, filter, and export verified records" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft p-4 sm:p-5 space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by disease name, crop, or specimen filename..."
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
                  <option value="Pending">Pending</option>
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

        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading history records...</div>
          ) : analyses.length === 0 ? (
            <div className="p-12 text-center">
              <Sprout className="w-10 h-10 text-slate-300 mx-auto mb-3" />
              <div className="text-sm font-bold text-slate-700">No records found matching filters</div>
              <p className="text-xs text-slate-400 mt-1">Try resetting search filters or submit a new plant analysis.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Specimen</th>
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
                      <td className="py-3 px-4 text-slate-800 font-semibold">{item.plantName}</td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{item.predictedDisease}</div>
                        {item.correctedLabel && (
                          <div className="text-[10px] text-indigo-700 font-mono">
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
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/analysis/${item._id}`}
                            className="px-2.5 py-1 rounded bg-stone-100 hover:bg-emerald-100 hover:text-emerald-800 text-slate-700 font-bold transition-colors"
                          >
                            Details
                          </Link>
                          <button
                            onClick={(e) => handleDelete(item._id, e)}
                            className="p-1 rounded text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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
    </div>
  );
}

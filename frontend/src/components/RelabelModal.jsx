import React, { useState, useEffect } from 'react';
import { X, Check, Search, AlertCircle, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function RelabelModal({ isOpen, onClose, currentLabel, analysisId, onUpdated }) {
  const [classes, setClasses] = useState([]);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [search, setSearch] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadClasses();
      setSelectedLabel(currentLabel || '');
      setNotes('');
      setError('');
    }
  }, [isOpen, currentLabel]);

  const loadClasses = async () => {
    try {
      const res = await api.get('/cures/classes');
      setClasses(res.data.data || []);
    } catch (err) {
      console.warn('Could not load classes list:', err.message);
    }
  };

  const filtered = classes.filter(c => 
    c.disease.toLowerCase().includes(search.toLowerCase()) ||
    c.crop.toLowerCase().includes(search.toLowerCase()) ||
    c.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLabel) {
      setError('Please select or specify the corrected diagnosis label.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await api.put(`/analysis/${analysisId}/review`, {
        reviewStatus: 'Corrected',
        correctedLabel: selectedLabel,
        reviewNotes: notes
      });

      if (onUpdated) onUpdated(res.data.data);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update review label.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between pb-4 border-b border-stone-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Expert Relabeling Intervention</h3>
            <p className="text-xs text-slate-500">Provide an authoritative diagnosis to refine the MLOps retraining dataset.</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-stone-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
            <span className="font-semibold text-amber-900">Current Model Prediction:</span>
            <div className="font-mono text-amber-800 text-sm mt-0.5">{currentLabel}</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Select Correct Pathological Class (from 38 PlantVillage Classes)
            </label>
            <div className="relative mb-2">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search crops or diseases (e.g. Tomato Early Blight, Corn Rust)..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="max-h-48 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100 bg-stone-50">
              {filtered.length > 0 ? (
                filtered.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedLabel(item.id)}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors flex items-center justify-between ${
                      selectedLabel === item.id ? 'bg-emerald-100 text-emerald-900 font-semibold' : 'hover:bg-white text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-medium">{item.disease}</span>
                      <span className="ml-2 text-[10px] text-slate-500 font-mono">({item.crop})</span>
                    </div>
                    {selectedLabel === item.id && <Check className="w-4 h-4 text-emerald-700" />}
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-slate-500">No matching classes found.</div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Agronomist / Expert Clinical Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g., Distinct concentric rings on leaflet indicate Alternaria solani rather than Septoria."
              className="w-full p-2.5 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving Correction...' : 'Confirm Label Correction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

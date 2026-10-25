import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import ConfidenceBadge from '../components/ConfidenceBadge';
import RelabelModal from '../components/RelabelModal';
import { 
  Sprout, CheckCircle, AlertTriangle, RefreshCw, ShieldCheck, 
  HeartHandshake, FileText, ArrowLeft, Calendar, Layers
} from 'lucide-react';
import api from '../services/api';

export default function AnalysisResultPage() {
  const { id } = useParams();
  const { toggleSidebar } = useOutletContext();
  
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  useEffect(() => {
    loadAnalysis();
  }, [id]);

  const loadAnalysis = async () => {
    try {
      const res = await api.get(`/analysis/${id}`);
      setAnalysis(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analysis record.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    setActionNotice('');
    try {
      const res = await api.put(`/analysis/${id}/review`, {
        reviewStatus: 'Confirmed',
        reviewNotes: 'Verified diagnosis by agronomist.'
      });
      setAnalysis(res.data.data);
      setActionNotice('Prediction confirmed! Saved to retraining dataset.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to confirm prediction.');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <div className="text-xs font-bold text-slate-700">Loading Clinical Diagnostics...</div>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-soft max-w-md text-center">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">Analysis Record Unavailable</h3>
          <p className="text-xs text-slate-500 mt-1">{error || 'Record does not exist or unauthorized.'}</p>
          <Link to="/dashboard" className="inline-block mt-4 px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const confidencePct = Math.round((analysis.confidence || 0) * 100);
  const isLowConfidence = confidencePct < 50;

  return (
    <div className="flex-1 flex flex-col">
      <Header onMenuClick={toggleSidebar} title="Pathology Diagnostic Report" subtitle={`Specimen ID: ${analysis._id}`} />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(analysis.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {actionNotice && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center gap-2 shadow-sm">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
        )}

        {isLowConfidence && (
          <div className="p-4 sm:p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-3.5 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Low-confidence prediction ({confidencePct}%) - please verify the result.</span>
              <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
                The observed 98.72% validation accuracy was obtained on the controlled PlantVillage dataset. Real-world field conditions with variable shadows and complex background foliage may reduce prediction certainty.
              </p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft overflow-hidden">
          <div className="grid md:grid-cols-12">
            <div className="md:col-span-5 bg-stone-100 p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-stone-200">
              <div className="w-full max-w-sm aspect-square rounded-xl overflow-hidden border border-stone-300 shadow-inner bg-stone-900 flex items-center justify-center">
                <img
                  src={analysis.displayImageUrl}
                  alt={analysis.predictedDisease}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = 'https://placehold.co/400x400/2d6a4f/ffffff?text=Leaf+Image'; }}
                />
              </div>
              <div className="mt-3 text-center">
                <div className="text-xs font-bold text-slate-800 truncate max-w-xs">{analysis.originalFilename}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {analysis.fileType} • {analysis.modelVersion}
                </div>
              </div>
            </div>

            <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-stone-100 text-slate-700">
                    Host Crop: {analysis.plantName}
                  </span>
                  <ConfidenceBadge confidence={analysis.confidence} />
                </div>

                <div className="text-xs font-semibold text-slate-500">Primary Neural Prediction</div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                  {analysis.predictedDisease}
                </h2>

                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Neural Probability Confidence</span>
                    <span className="font-mono">{confidencePct}%</span>
                  </div>
                  <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        confidencePct >= 80 ? 'bg-emerald-600' : confidencePct >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${confidencePct}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {analysis.topPredictions && analysis.topPredictions.length > 0 && (
                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="text-xs font-bold text-slate-800 mb-2.5 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Top-3 Neural Class Probabilities</span>
                  </div>
                  <div className="space-y-2">
                    {analysis.topPredictions.map((pred, idx) => {
                      const probPct = Math.round(pred.confidence * 100);
                      return (
                        <div key={idx} className="space-y-1">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-slate-700">
                              {idx + 1}. {pred.label}
                            </span>
                            <span className="font-mono font-bold text-slate-900">{probPct}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${idx === 0 ? 'bg-emerald-600' : 'bg-slate-400'}`}
                              style={{ width: `${probPct}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Relabeling Workflow</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      analysis.reviewStatus === 'Confirmed' ? 'bg-emerald-200 text-emerald-900' :
                      analysis.reviewStatus === 'Corrected' ? 'bg-indigo-200 text-indigo-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {analysis.reviewStatus}
                    </span>
                  </div>
                  {analysis.correctedLabel && (
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Expert Correction: <strong className="text-indigo-900">{analysis.correctedLabel}</strong>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleConfirm}
                    disabled={confirming || analysis.reviewStatus === 'Confirmed'}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {confirming ? 'Saving...' : 'Confirm Prediction'}
                  </button>
                  <button
                    onClick={() => setModalOpen(true)}
                    className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-white hover:bg-stone-100 text-slate-800 border border-stone-300 text-xs font-bold shadow-sm transition-colors"
                  >
                    Correct Label
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-soft">
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 mb-3">
              <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span>Pathological Cause</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {analysis.cause || 'No specific biological cause cataloged.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-soft">
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
              <span>Visual Symptoms</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {analysis.symptoms || 'No specific foliar symptoms cataloged.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-soft">
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <HeartHandshake className="w-4 h-4" />
              </div>
              <span>Recommended Treatment Protocol</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {analysis.treatment || 'No clinical intervention needed.'}
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-stone-200 shadow-soft">
            <div className="flex items-center gap-2.5 text-sm font-bold text-slate-900 mb-3">
              <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span>Long-Term Prevention Strategy</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {analysis.prevention || 'Standard crop rotation and foliage hygiene.'}
            </p>
          </div>
        </div>
      </main>

      <RelabelModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        currentLabel={analysis.predictedLabel}
        analysisId={analysis._id}
        onUpdated={(updated) => {
          setAnalysis(updated);
          setActionNotice('Label corrected successfully! Curation guidance refreshed.');
        }}
      />
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import ConfidenceBadge from '../components/ConfidenceBadge';
import RelabelModal from '../components/RelabelModal';
import { useAuth } from '../context/AuthContext';
import { 
  Sprout, CheckCircle, AlertTriangle, RefreshCw, ShieldCheck, 
  HeartHandshake, FileText, ArrowLeft, Calendar, Layers,
  User, Check, Edit3, Award
} from 'lucide-react';
import api from '../services/api';

export default function AnalysisResultPage() {
  const { id } = useParams();
  const { toggleSidebar } = useOutletContext();
  const { user, isExpert } = useAuth();
  
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
        reviewNotes: 'Verified diagnosis confirmed by certified agronomist.'
      });
      setAnalysis(res.data.data);
      setActionNotice('Prediction confirmed! Saved to authoritative retraining dataset.');
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
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to={isExpert ? "/history" : "/dashboard"} className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4" />
            <span>{isExpert ? "Back to Review Queue" : "Back to Dashboard"}</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(analysis.createdAt).toLocaleString()}</span>
          </div>
        </div>

        {/* Agronomist Review Info Banner for Experts */}
        {isExpert && (
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-soft flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-800">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center flex-shrink-0 text-emerald-400">
                <User className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Farmer Submission</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    analysis.reviewStatus === 'Confirmed' ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40' :
                    analysis.reviewStatus === 'Corrected' ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-500/40' :
                    'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                  }`}>
                    {analysis.reviewStatus}
                  </span>
                </div>
                <div className="text-sm font-bold text-white mt-0.5">
                  Uploaded by: {analysis.uploadedByName || 'Farmer'} <span className="text-xs text-slate-400 font-normal">({analysis.uploadedByEmail || 'user@agricloud.org'})</span>
                </div>
                {analysis.reviewedBy && (
                  <div className="text-xs text-slate-400 mt-1">
                    Reviewed by <strong>{analysis.reviewedByName || 'Agronomist'}</strong> on {new Date(analysis.reviewedAt || analysis.updatedAt).toLocaleString()}
                    {analysis.reviewNotes && ` — "${analysis.reviewNotes}"`}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full md:w-auto">
              <button
                onClick={handleConfirm}
                disabled={confirming || analysis.reviewStatus === 'Confirmed'}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-40"
              >
                <Check className="w-4 h-4" />
                <span>{confirming ? 'Saving...' : analysis.reviewStatus === 'Confirmed' ? 'Confirmed' : 'Confirm Prediction'}</span>
              </button>
              <button
                onClick={() => setModalOpen(true)}
                className="flex-1 md:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                <span>Correct Label</span>
              </button>
            </div>
          </div>
        )}

        {/* Regular Farmer Diagnostic Status Notice */}
        {!isExpert && analysis.reviewStatus !== 'Pending' && (
          <div className={`p-4 rounded-2xl flex items-center gap-3 border shadow-sm ${
            analysis.reviewStatus === 'Confirmed' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
              : 'bg-indigo-50 border-indigo-200 text-indigo-950'
          }`}>
            <Award className={`w-6 h-6 flex-shrink-0 ${analysis.reviewStatus === 'Confirmed' ? 'text-emerald-700' : 'text-indigo-700'}`} />
            <div>
              <div className="text-xs font-bold uppercase tracking-wider">
                {analysis.reviewStatus === 'Confirmed' ? 'Verified by Certified Agronomist' : 'Clinically Corrected by Agronomist'}
              </div>
              <div className="text-xs mt-0.5 leading-relaxed">
                {analysis.reviewStatus === 'Confirmed' 
                  ? `An agricultural pathologist reviewed this specimen and confirmed the diagnosis of ${analysis.predictedDisease}.`
                  : `An agricultural pathologist corrected the automated diagnosis to "${analysis.correctedLabel}". Recommended treatments and prevention below have been updated accordingly.`}
              </div>
            </div>
          </div>
        )}

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

                <div className="text-xs font-semibold text-slate-500">
                  {analysis.correctedLabel ? 'Authoritative Expert Diagnosis' : 'Primary Neural Prediction'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-950 mt-1 tracking-tight">
                  {analysis.correctedLabel || analysis.predictedDisease}
                </h2>
                {analysis.correctedLabel && (
                  <div className="text-xs text-indigo-700 font-semibold mt-1">
                    Original AI classification: {analysis.predictedDisease}
                  </div>
                )}

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

              {/* Status summary box */}
              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Agronomic Review Status</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold ${
                      analysis.reviewStatus === 'Confirmed' ? 'bg-emerald-200 text-emerald-900' :
                      analysis.reviewStatus === 'Corrected' ? 'bg-indigo-200 text-indigo-900' : 'bg-amber-200 text-amber-900'
                    }`}>
                      {analysis.reviewStatus}
                    </span>
                  </div>
                  {analysis.correctedLabel && (
                    <div className="text-[11px] text-slate-600 mt-0.5">
                      Verified Clinical Class: <strong className="text-indigo-900">{analysis.correctedLabel}</strong>
                    </div>
                  )}
                </div>

                {isExpert && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={handleConfirm}
                      disabled={confirming || analysis.reviewStatus === 'Confirmed'}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-colors disabled:opacity-50"
                    >
                      {confirming ? 'Saving...' : 'Confirm'}
                    </button>
                    <button
                      onClick={() => setModalOpen(true)}
                      className="flex-1 sm:flex-none px-3.5 py-2 rounded-lg bg-white hover:bg-stone-100 text-slate-800 border border-stone-300 text-xs font-bold shadow-sm transition-colors"
                    >
                      Correct Label
                    </button>
                  </div>
                )}
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
        currentLabel={analysis.predictedLabel || analysis.predictedDisease}
        analysisId={analysis._id}
        onUpdated={(updated) => {
          setAnalysis(updated);
          setActionNotice('Label corrected successfully! Curation guidance refreshed.');
        }}
      />
    </div>
  );
}

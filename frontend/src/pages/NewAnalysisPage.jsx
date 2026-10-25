import React, { useState, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import Header from '../components/Header';
import { 
  Upload, FileText, CheckCircle, AlertCircle, Loader2, Sparkles, Info, X
} from 'lucide-react';
import api from '../services/api';

export default function NewAnalysisPage() {
  const { toggleSidebar } = useOutletContext();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    'Uploading file to cloud storage...',
    'Preprocessing specimen & validating foliar contours...',
    'Running PyTorch EfficientNet-B0 neural inference...',
    'Querying structured curation database (cures.json)...',
    'Persisting pathology diagnostics to MongoDB...',
    'Analysis complete!'
  ];

  const handleFileSelect = (selectedFile) => {
    setError('');
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Invalid file format. Please upload a .jpg, .jpeg, .png image or .pdf document.');
      return;
    }

    if (selectedFile.size > 15 * 1024 * 1024) {
      setError('File exceeds maximum size of 15MB.');
      return;
    }

    if (selectedFile.size === 0) {
      setError('Uploaded file is empty.');
      return;
    }

    setFile(selectedFile);

    if (selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl('pdf');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl('');
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startAnalysis = async () => {
    if (!file) {
      setError('Please select or drag a leaf image or PDF first.');
      return;
    }

    setAnalyzing(true);
    setError('');
    setCurrentStep(0);

    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 2) return prev + 1;
        return prev;
      });
    }, 700);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/analysis', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      clearInterval(stepInterval);
      setCurrentStep(steps.length - 1);

      setTimeout(() => {
        navigate(`/analysis/${res.data.data._id}`);
      }, 600);
    } catch (err) {
      clearInterval(stepInterval);
      setAnalyzing(false);
      setError(err.response?.data?.message || 'Pathology analysis failed. Please verify server connection.');
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header onMenuClick={toggleSidebar} title="New Plant Pathology Analysis" subtitle="Submit plant foliage photos or clinical PDF reports" />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto space-y-6">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-stone-200 shadow-soft p-6 sm:p-8">
          <div className="text-center max-w-md mx-auto mb-6">
            <h3 className="text-base font-bold text-slate-900">Upload Plant Specimen</h3>
            <p className="text-xs text-slate-500 mt-1">
              Supports high-resolution JPEG photography (224x224 input) or PDF pathology reports.
            </p>
          </div>

          {!file ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
                isDragOver ? 'border-emerald-600 bg-emerald-50/50' : 'border-stone-300 hover:border-emerald-500 hover:bg-stone-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto mb-4 shadow-sm">
                <Upload className="w-7 h-7" />
              </div>
              <div className="text-sm font-bold text-slate-900">Drag & drop your leaf image or PDF here</div>
              <div className="text-xs text-slate-500 mt-1">or click to browse files from your computer</div>
              <div className="mt-4 flex items-center justify-center gap-3 text-[11px] font-semibold text-slate-400">
                <span>JPG</span>
                <span>•</span>
                <span>JPEG</span>
                <span>•</span>
                <span>PNG</span>
                <span>•</span>
                <span>PDF Document</span>
              </div>
            </div>
          ) : (
            <div className="border border-stone-200 rounded-2xl p-6 bg-stone-50/60">
              <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="relative w-44 h-44 rounded-xl overflow-hidden bg-stone-200 border border-stone-300 flex items-center justify-center flex-shrink-0">
                  {previewUrl === 'pdf' ? (
                    <div className="text-center p-4">
                      <FileText className="w-12 h-12 text-emerald-700 mx-auto mb-2" />
                      <div className="text-xs font-bold text-slate-800">PDF Document</div>
                      <div className="text-[10px] text-slate-500">Preprocessing enabled</div>
                    </div>
                  ) : (
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                  )}
                  {!analyzing && (
                    <button onClick={clearFile} className="absolute top-2 right-2 p-1.5 rounded-full bg-slate-900/70 text-white hover:bg-slate-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <CheckCircle className="w-3 h-3" />
                    Specimen File Ready
                  </div>
                  <h4 className="text-base font-bold text-slate-900 truncate">{file.name}</h4>
                  <p className="text-xs text-slate-500">
                    Size: {(file.size / (1024 * 1024)).toFixed(2)} MB • Type: {file.type}
                  </p>

                  <div className="pt-2">
                    {!analyzing ? (
                      <button
                        onClick={startAnalysis}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-md shadow-emerald-900/20 hover:shadow-lg transition-all"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Run EfficientNet-B0 Analysis</span>
                      </button>
                    ) : (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
                          <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                          <span>{steps[currentStep]}</span>
                        </div>
                        <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-600 transition-all duration-500 rounded-full"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3.5">
          <Info className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold">ML Pipeline Specification:</span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Uploaded files are mapped to PyTorch EfficientNet-B0 with 224x224 input sizing and ImageNet normalization. 
              The botanical curation knowledge is retrieved from <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-900">cures.json</code> independently of the model weights, allowing treatment updates without retraining.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

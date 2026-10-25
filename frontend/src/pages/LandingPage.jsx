import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
  Sprout, 
  Cpu, 
  ShieldCheck, 
  FileText, 
  Cloud, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Search,
  Activity,
  ChevronRight,
  Sparkles,
  Microscope,
  UploadCloud,
  Check,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated, isExpert } = useAuth();

  const features = [
    {
      icon: Cpu,
      title: 'EfficientNet-B0 ML Backbone',
      desc: 'Trained on 54,000+ PlantVillage images with transfer learning, center-cropped 224x224 input, and ImageNet standardization.',
      tag: '99.56% Accuracy'
    },
    {
      icon: Layers,
      title: '38 Pathological Classes',
      desc: 'Comprehensive diagnostic coverage across 14 vital crop families including Tomato, Potato, Corn, Apple, and Grapevine.',
      tag: '14 Crop Species'
    },
    {
      icon: FileText,
      title: 'Image & PDF Ingestion',
      desc: 'Multi-modal preprocessing pipeline handling high-resolution JPEG photography as well as multi-page PDF field agronomy reports.',
      tag: 'Multi-Modal'
    },
    {
      icon: ShieldCheck,
      title: 'Structured Botanical Curation',
      desc: 'Diagnostic knowledge base stored separately in cures.json, providing biological causes, foliar symptoms, and verified treatment steps.',
      tag: 'Decoupled Curation'
    },
    {
      icon: RefreshCw,
      title: 'Human-in-the-Loop Relabeling',
      desc: 'Expert verification and correction workflow that exports COCO-standard annotations to continuously combat field dataset drift.',
      tag: 'Continuous MLOps'
    },
    {
      icon: Cloud,
      title: 'AWS Cloud-Ready Serverless',
      desc: 'Architected for AWS S3 leaf storage, API Gateway, Node/Express Lambda runtime, and low-latency SageMaker inference.',
      tag: 'Serverless Ready'
    },
  ];

  const steps = [
    { num: '01', title: 'Upload Specimen', desc: 'Drag and drop high-resolution plant leaf photos or laboratory PDF diagnosis reports.' },
    { num: '02', title: 'Preprocess & Scale', desc: 'Standardized 224x224 center cropping with ImageNet tensor normalization pipeline.' },
    { num: '03', title: 'EfficientNet-B0 Inference', desc: 'Evaluated against 38 pathological classes, generating Top-3 probability distributions.' },
    { num: '04', title: 'Curation Synthesis', desc: 'Deterministic lookup in cures.json for biological causes, symptoms, and targeted treatments.' },
    { num: '05', title: 'Expert Relabeling', desc: 'Agronomists review predictions, correct misclassifications, and export clean retraining sets.' },
  ];

  const crops = [
    'Apple', 'Blueberry', 'Cherry', 'Corn (Maize)', 'Grape', 
    'Orange', 'Peach', 'Pepper (Bell)', 'Potato', 'Raspberry', 
    'Soybean', 'Squash', 'Strawberry', 'Tomato'
  ];

  return (
    <div className="min-h-screen bg-stone-50 text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-stone-200">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.15),rgba(255,255,255,0))]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-xs font-semibold text-emerald-900">
                <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                <span>Capstone Project BCSE497J — Serverless Plant Pathology</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-950 tracking-tight leading-[1.1]">
                Intelligent Plant Pathology. <br />
                <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 bg-clip-text text-transparent">
                  Smarter Agricultural Decisions.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                AgriCloud-ML unifies PyTorch EfficientNet-B0 neural classification with a structured botanical curation system and an expert relabeling MLOps pipeline. Designed for cloud-native deployment on AWS.
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={isAuthenticated ? (isExpert ? "/history" : "/dashboard") : "/signup"}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all"
                >
                  <span>Launch Pathology Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#portals"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-slate-800 font-bold text-sm border border-stone-300 shadow-sm transition-all"
                >
                  <span>Explore User & Expert Portals</span>
                </a>
              </div>

              {/* Research Metrics Callout */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
                <div>
                  <div className="text-2xl font-black text-emerald-700">99.56%</div>
                  <div className="text-xs text-slate-500 font-medium">Validation Accuracy</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">38</div>
                  <div className="text-xs text-slate-500 font-medium">Pathology Classes</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-slate-900">&lt; 3.5s</div>
                  <div className="text-xs text-slate-500 font-medium">Cloud Latency</div>
                </div>
              </div>
            </div>

            {/* Visual Hero Mockup Card */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-elevated border border-stone-200 p-6 relative overflow-hidden">
                <div className="flex items-center justify-between pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">EfficientNet-B0-v1</span>
                </div>

                <div className="mt-4 space-y-4">
                  <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
                    <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
                      <span>Detected Pathogen</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">99.2% Conf</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">Tomato Early Blight</div>
                    <div className="text-xs text-slate-500 mt-1 italic">Alternaria solani (fungal pathogen)</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <span>Tomato Early Blight</span>
                      <span className="font-mono font-bold text-slate-800">99.2%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '99.2%' }}></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Tomato Late Blight</span>
                      <span className="font-mono">0.6%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: '0.6%' }}></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-100 text-xs text-slate-600 space-y-1.5">
                    <div className="font-semibold text-slate-800">Curation Protocol (cures.json):</div>
                    <p className="text-[11px] leading-relaxed text-slate-500">
                      Apply chlorothalonil or copper-based fungicides; prune lower 12 inches of foliage; implement 2-3 year crop rotation.
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 text-[11px] font-medium text-emerald-700">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Relabeling feedback recorded
                    </span>
                    <span className="font-mono text-slate-400">Atlas Cloud Synced</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Dual Portal Section: Grower vs Expert */}
      <section id="portals" className="py-16 sm:py-20 bg-stone-100 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Dual-Role Architecture</span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Separate Workflows for Farmers & Pathology Experts
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-500">
              Growers receive instant diagnostics and clinical treatments. Certified agronomists inspect all submissions across the platform to verify and correct AI predictions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Farmer Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-soft flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Grower & Farmer Portal</div>
                <h3 className="text-xl font-black text-slate-900 mt-1">Submit Plant Specimens</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Upload high-resolution leaf photography or multi-page pathology PDF reports. Receive instant AI neural classification, botanical causes, and targeted curative treatments.
                </p>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Upload leaf photos or PDF lab reports</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Automated botanical guardrail (rejects non-foliage)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Clinical treatments, causes, and prevention strategies</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Track personal diagnostic history</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-stone-100 flex items-center gap-3">
                <Link
                  to="/login?portal=user"
                  className="flex-1 text-center py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Farmer Sign In
                </Link>
                <Link
                  to="/signup"
                  className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Register
                </Link>
              </div>
            </div>

            {/* Expert Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border-2 border-emerald-600 shadow-soft flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-4 right-4">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 text-[10px] font-black uppercase tracking-wider">
                  Cert. Agronomist
                </span>
              </div>

              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center mb-4">
                  <Microscope className="w-6 h-6" />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-700">Agronomist & Expert Portal</div>
                <h3 className="text-xl font-black text-slate-900 mt-1">Review All Submissions & Relabel</h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                  Inspect images uploaded by <strong>every user</strong>. Confirm accurate predictions or correct pathological classifications using the 38-class diagnostic modal to refine continuous MLOps.
                </p>

                <ul className="mt-5 space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span><strong>Platform-wide visibility</strong>: View all user uploads</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>One-click prediction confirmation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Interactive relabeling modal with search across 38 classes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Export verified datasets in COCO JSON & CSV</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-5 border-t border-stone-100 flex items-center gap-3">
                <Link
                  to="/login?portal=expert"
                  className="flex-1 text-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors"
                >
                  Expert Portal Login
                </Link>
                <Link
                  to="/signup"
                  className="py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 font-bold text-xs transition-colors"
                >
                  Expert Apply
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-24 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Engineered for Precision Pathology</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Enterprise Features Built for Agronomists and Researchers
            </p>
            <p className="mt-3 text-sm sm:text-base text-slate-500">
              A complete system integrating state-of-the-art computer vision with field-ready botanical cure guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-stone-50 border border-stone-200 hover:border-emerald-300 hover:shadow-soft transition-all group">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:bg-emerald-700 group-hover:text-white transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-stone-200 text-slate-700">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pipeline & Architecture Section */}
      <section id="pipeline" className="py-16 sm:py-24 bg-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">End-to-End Pipeline</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              From Raw Foliage to Clinically Verified Diagnosis
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500">
              Each specimen travels through an automated preprocessing, inference, and human verification loop.
            </p>
          </div>

          <div className="grid md:grid-cols-5 gap-6">
            {steps.map((s, i) => (
              <div key={i} className="p-5 rounded-2xl bg-white border border-stone-200 shadow-soft relative flex flex-col justify-between">
                <div>
                  <span className="text-2xl font-black text-emerald-600 font-mono">{s.num}</span>
                  <h4 className="text-sm font-bold text-slate-900 mt-2 mb-1.5">{s.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 bg-white rounded-full p-1 border border-stone-200 shadow-sm text-slate-400">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 38 Supported Disease Classes Section */}
      <section id="classes" className="py-16 sm:py-24 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold tracking-widest text-emerald-700 uppercase">Foliar Spectrum Coverage</span>
            <h2 className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              14 Crop Families & 38 Pathological Classes
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-500">
              Full diagnostic support spanning viral, bacterial, fungal, and physiological conditions across primary staple crops.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 max-w-4xl mx-auto">
            {crops.map((c, i) => (
              <span key={i} className="px-4 py-2 rounded-xl bg-stone-100 border border-stone-200 text-xs font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-300 transition-colors">
                {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Relabeling Loop Section */}
      <section id="relabeling" className="py-16 sm:py-24 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-bold tracking-widest text-emerald-400 uppercase">Continuous MLOps Flywheel</span>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
                Defeating Field Dataset Drift with Expert-in-the-Loop Relabeling.
              </h2>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                When field specimens exhibit ambiguous necrosis or uncommon lesions, certified agronomists inspect the specimen and provide authoritative ground truth. AgriCloud-ML automatically synchronizes verified labels to Amazon S3 for periodic model fine-tuning.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  to="/login?portal=expert"
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-colors inline-flex items-center gap-2"
                >
                  <Microscope className="w-4 h-4" />
                  <span>Enter Expert Relabeling Portal</span>
                </Link>
                <a
                  href="/api/analysis/export/relabel?format=json"
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-slate-200 text-xs font-bold border border-stone-700 transition-colors inline-flex items-center gap-2"
                >
                  <span>Download Sample COCO Retraining Set</span>
                </a>
              </div>
            </div>

            <div className="lg:col-span-5 bg-stone-800/80 p-6 sm:p-8 rounded-2xl border border-stone-700 space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Ground-Truth MLOps Pipeline</div>
              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">1</div>
                  <p>Inference log saved with image, predicted class, and entropy score.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">2</div>
                  <p>All user uploads populate the certified agronomist review queue.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">3</div>
                  <p>Agronomist confirms or selects corrected disease class from 38 categories.</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0 text-[11px]">4</div>
                  <p>Atlas & S3 sync relabeled metadata for automated trigger of PyTorch retrain job.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-stone-950 text-slate-400 text-xs border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sprout className="w-4 h-4 text-emerald-500" />
            <span className="font-bold text-slate-300">AgriCloud-ML</span>
            <span>— Serverless Plant Pathology Architecture</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Capstone Project BCSE497J • VIT Bhopal University
          </div>
        </div>
      </footer>
    </div>
  );
}

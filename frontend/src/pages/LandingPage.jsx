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
  Sparkles
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: Cpu,
      title: 'EfficientNet-B0 ML Backbone',
      desc: 'Trained on 54,000+ PlantVillage images with transfer learning, center-cropped 224x224 input, and ImageNet standardization.',
      tag: '98.72% Val Accuracy'
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
                  to={isAuthenticated ? "/dashboard" : "/signup"}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-sm shadow-md shadow-emerald-800/20 hover:shadow-lg transition-all"
                >
                  <span>Launch Pathology Pipeline</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#pipeline"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-stone-100 text-slate-800 font-bold text-sm border border-stone-300 shadow-sm transition-all"
                >
                  <span>Explore Architecture</span>
                </a>
              </div>

              {/* Research Metrics Callout */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-stone-200">
                <div>
                  <div className="text-2xl font-black text-emerald-700">98.72%</div>
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
                      <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900 font-bold">94.2% Conf</span>
                    </div>
                    <div className="text-lg font-bold text-slate-900">Tomato Early Blight</div>
                    <div className="text-xs text-slate-500 mt-1 italic">Alternaria solani (fungal pathogen)</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                      <span>Tomato Early Blight</span>
                      <span className="font-mono font-bold text-slate-800">94.2%</span>
                    </div>
                    <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-600 rounded-full" style={{ width: '94.2%' }}></div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Tomato Late Blight</span>
                      <span className="font-mono">3.8%</span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-400 rounded-full" style={{ width: '3.8%' }}></div>
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
                    <span className="font-mono text-slate-400">S3 Stored</span>
                  </div>
                </div>
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
            <h2 className="text-xs font-bold tracking-widest text-emerald-700 uppercase">End-to-End Pipeline</h2>
            <p className="mt-2 text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              How AgriCloud-ML Diagnoses & Improves
            </p>
            <p className="mt-3 text-sm text-slate-500">
              From raw leaf ingestion through neural inference, curation retrieval, and expert feedback capture.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="relative p-5 rounded-2xl bg-white border border-stone-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="text-2xl font-black text-emerald-700 mb-2">{step.num}</div>
                  <h4 className="text-sm font-bold text-slate-900 mb-1.5">{step.title}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center text-[11px] font-semibold text-emerald-600">
                  <span>Step Verified</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Crops Showcase */}
      <section id="classes" className="py-16 bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-emerald-700 uppercase">38 Pathology Classes</h2>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
                Supported Crop Species
              </p>
            </div>
            <p className="text-xs text-slate-500 max-w-md mt-2 md:mt-0">
              Covering both healthy physiological states and severe fungal, bacterial, viral, and pest infections.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            {crops.map((crop, i) => (
              <div key={i} className="px-4 py-2 rounded-xl bg-stone-50 border border-stone-200 hover:border-emerald-400 hover:bg-emerald-50 text-xs font-semibold text-slate-800 transition-colors flex items-center gap-2">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                <span>{crop}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/30 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
            <Sprout className="w-6 h-6" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight max-w-2xl mx-auto">
            Ready to Run Plant Pathology Diagnostics?
          </h2>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Sign up now to upload leaf photos or PDF reports, receive instant clinical predictions, and contribute to the relabeling dataset.
          </p>
          <div className="pt-2">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-900/50 transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

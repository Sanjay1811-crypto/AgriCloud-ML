import React from 'react';
import { AlertTriangle, CheckCircle, AlertCircle } from 'lucide-react';

export default function ConfidenceBadge({ confidence }) {
  const pct = Math.round((confidence || 0) * 100);

  if (pct >= 80) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
        High ({pct}%)
      </span>
    );
  }

  if (pct >= 50) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
        Moderate ({pct}%)
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
      Low ({pct}%)
    </span>
  );
}

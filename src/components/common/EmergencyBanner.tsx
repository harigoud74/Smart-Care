import React, { useState } from 'react';
import { AlertTriangle, PhoneCall, X } from 'lucide-react';

export const EmergencyBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs sm:text-sm text-amber-900 flex items-center justify-between">
      <div className="max-w-7xl mx-auto flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 font-semibold text-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          Emergency Medical Notice:
        </span>
        <span>
          If you are experiencing severe chest pain, shortness of breath, sudden numbness, or life-threatening trauma, do not use online scheduling.
        </span>
        <a
          href="tel:911"
          className="inline-flex items-center gap-1 font-bold text-red-600 hover:text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200"
        >
          <PhoneCall className="w-3.5 h-3.5" /> Call 911 Immediately
        </a>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-amber-700 hover:text-amber-900 p-1 shrink-0 ml-2"
        aria-label="Dismiss banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};

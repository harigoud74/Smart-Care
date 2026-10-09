import React, { useState } from 'react';
import { ShieldCheck, Bell, Clock, Lock, CheckCircle2, AlertTriangle, Save } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState({
    emergencyBannerEnabled: true,
    maxAdvanceBookingDays: 60,
    cancellationWindowHours: 4,
    automaticRemindersHoursBefore: 24,
    requireAdminVerificationForDoctors: true,
    lockoutFailedLoginAttempts: 5,
  });

  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
          Governance & Policy Controls
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Platform Safety & Scheduling Policies
        </h1>
        <p className="text-xs text-slate-500">
          Configure hospital network parameters, clinical triage rules, and booking constraints.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {saved && (
          <div className="p-3.5 mb-6 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Platform settings saved and propagated across active nodes.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6 text-xs">
          {/* Section 1: Emergency & Clinical Safety */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" /> Clinical Safety & Triage Policies
            </h3>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <strong className="block text-slate-900">Emergency 911 Banner</strong>
                <span className="text-slate-500">Displays acute emergency warning at the top of the interface.</span>
              </div>
              <input
                type="checkbox"
                checked={settings.emergencyBannerEnabled}
                onChange={(e) => setSettings({ ...settings, emergencyBannerEnabled: e.target.checked })}
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <strong className="block text-slate-900">Mandatory Physician Vetting</strong>
                <span className="text-slate-500">
                  New doctor accounts remain unbookable until approved by admin.
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.requireAdminVerificationForDoctors}
                onChange={(e) =>
                  setSettings({ ...settings, requireAdminVerificationForDoctors: e.target.checked })
                }
                className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Section 2: Scheduling Rules */}
          <div className="space-y-3 pb-5 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-600" /> Booking Constraints & Cancellation Rules
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Maximum Advance Booking Window (Days)
                </label>
                <input
                  type="number"
                  min={7}
                  max={180}
                  value={settings.maxAdvanceBookingDays}
                  onChange={(e) =>
                    setSettings({ ...settings, maxAdvanceBookingDays: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase mb-1">
                  Free Cancellation Window (Hours Before Slot)
                </label>
                <input
                  type="number"
                  min={1}
                  max={48}
                  value={settings.cancellationWindowHours}
                  onChange={(e) =>
                    setSettings({ ...settings, cancellationWindowHours: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> Save Network Policies
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

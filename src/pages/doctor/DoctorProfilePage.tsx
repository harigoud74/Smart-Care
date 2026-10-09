import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { DoctorProfile } from '../../types';
import { Save, User, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DoctorProfilePage: React.FC = () => {
  const { refreshUser } = useAuth();
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    apiRequest<DoctorProfile>('/doctors/portal/profile').then((res) => {
      if (res.success && res.data) {
        setDoctor(res.data);
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctor) return;
    setSaving(true);
    setMessage(null);

    const res = await apiRequest('/doctors/portal/profile', {
      method: 'PUT',
      body: JSON.stringify(doctor),
    });

    setSaving(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Physician profile updated successfully.' });
      refreshUser();
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to update profile.' });
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading profile credentials...</div>;
  }

  if (!doctor) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
          Professional Credentials
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Physician Profile
        </h1>
        <p className="text-xs text-slate-500">
          Manage your clinical bio, consultation fee, medical qualifications, and spoken languages.
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs">
        {message && (
          <div
            className={`p-3.5 mb-6 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Full Physician Name
              </label>
              <input
                type="text"
                required
                value={doctor.fullName}
                onChange={(e) => setDoctor({ ...doctor, fullName: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Medical Specialization
              </label>
              <input
                type="text"
                required
                value={doctor.specialization}
                onChange={(e) => setDoctor({ ...doctor, specialization: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Qualifications & Degrees
              </label>
              <input
                type="text"
                required
                value={doctor.qualification}
                onChange={(e) => setDoctor({ ...doctor, qualification: e.target.value })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Medical License Number (Verified)
              </label>
              <input
                type="text"
                disabled
                value={doctor.licenseNumber}
                className="w-full px-3.5 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs text-slate-500 cursor-not-allowed font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Years of Clinical Experience
              </label>
              <input
                type="number"
                min={0}
                value={doctor.experienceYears}
                onChange={(e) => setDoctor({ ...doctor, experienceYears: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Consultation Fee ($ USD)
              </label>
              <input
                type="number"
                min={0}
                value={doctor.consultationFee}
                onChange={(e) => setDoctor({ ...doctor, consultationFee: Number(e.target.value) })}
                className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs font-bold text-sky-800"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Spoken Languages
            </label>
            <input
              type="text"
              value={doctor.languages || ''}
              onChange={(e) => setDoctor({ ...doctor, languages: e.target.value })}
              placeholder="e.g. English, Spanish, Hindi"
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Clinical Bio & Focus
            </label>
            <textarea
              rows={4}
              value={doctor.bio || ''}
              onChange={(e) => setDoctor({ ...doctor, bio: e.target.value })}
              placeholder="Describe clinical philosophy and expertise..."
              className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-100">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Update Doctor Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

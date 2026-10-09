import React from 'react';
import { ShieldCheck, HeartPulse, Stethoscope, Lock, Award, Users, Hospital } from 'lucide-react';

export const About: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-3 max-w-3xl mx-auto">
        <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
          About SmartCare Platform
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Pioneering Intelligent Healthcare Access & Patient Care
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          SmartCare is built to eliminate healthcare scheduling bottlenecks, prevent appointment collisions,
          and provide patients and clinicians with reliable, secure medical data continuity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Credential Verification</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Every medical doctor registered on SmartCare is vetted by healthcare administrators. Only licensed physicians with verified registration credentials can accept appointments.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Conflict-Free Engine</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Our scheduling system computes doctor working hours, breaks, and leaves in real-time, preventing double booking through ACID transactional slot locking.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-slate-900">Privacy & Confidentiality</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Patient clinical notes, diagnoses, and digital prescriptions are protected by role-based access control. Only authorized attending physicians and patients can view records.
          </p>
        </div>
      </div>

      <div className="bg-linear-to-r from-sky-700 to-teal-800 rounded-3xl p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <h2 className="text-2xl font-bold">Ready to Experience Modern Healthcare?</h2>
          <p className="text-xs sm:text-sm text-sky-100">
            Book an appointment with verified specialists or manage your hospital clinical practice today.
          </p>
        </div>
        <button
          onClick={() => navigate('/doctors')}
          className="px-6 py-3 bg-white text-slate-900 hover:bg-sky-50 font-bold rounded-xl shadow-md text-xs sm:text-sm shrink-0 cursor-pointer"
        >
          Browse Verified Doctors
        </button>
      </div>
    </div>
  );
};

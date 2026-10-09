import React from 'react';
import { HeartPulse, ShieldCheck, Lock, PhoneCall, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500 text-white flex items-center justify-center font-bold">
                <HeartPulse className="w-5 h-5" />
              </div>
              <span className="text-white font-extrabold text-base tracking-tight">
                Smart<span className="text-sky-400">Care</span>
              </span>
            </div>
            <p className="text-slate-400 leading-relaxed text-xs">
              Intelligent Healthcare Appointment & Patient Management Platform. Bridging clinical care with verified physicians, automated slot scheduling, and secure medical history.
            </p>
            <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> HIPAA Compliant Architecture
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-4 h-4 text-sky-400" /> End-to-End Encrypted
              </span>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Patient Portal</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/doctors')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Find Verified Doctors
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/patient/dashboard')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Patient Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/patient/appointments')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Schedule Appointment
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/patient/medical-records')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Clinical Medical Records
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/patient/documents')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Lab Reports & Scans
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Healthcare Providers</h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => navigate('/register')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Doctor Credential Registration
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/doctor/dashboard')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Physician Consultation Portal
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/doctor/availability')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Availability & Slot Management
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigate('/admin/dashboard')}
                  className="hover:text-white transition cursor-pointer"
                >
                  Hospital Administration Portal
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Emergency Contact</h4>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-rose-950/40 border border-rose-800/40 rounded-lg text-rose-300">
                <span className="font-bold block text-rose-200 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5" /> Emergency Dispatch: 911
                </span>
                Immediate emergency response for trauma, heart attacks, or acute breathing distress.
              </div>
              <p className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400" />
                <span>Hospital Helpline: +1 (555) 019-2831</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>clinical-support@smartcare.org</span>
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>100 Healthcare Parkway, Medical District, NY</span>
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p>© 2026 SmartCare Healthcare Network. All rights reserved. Academic Major Project Release.</p>
          <div className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>•</span>
            <span>Terms of Clinical Service</span>
            <span>•</span>
            <span>Medical Safety Standards</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

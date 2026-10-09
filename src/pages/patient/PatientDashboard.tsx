import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import {
  Calendar,
  Clock,
  FileText,
  FileUp,
  Sparkles,
  Stethoscope,
  ShieldCheck,
  ArrowRight,
  Printer,
  Bell,
  HeartPulse,
} from 'lucide-react';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import { PrintablePrescription } from '../../components/common/PrintablePrescription';
import { Modal } from '../../components/common/Modal';
import { Prescription } from '../../types';

interface PatientDashboardProps {
  navigate: (path: string) => void;
  onOpenRecommendation: () => void;
}

export const PatientDashboard: React.FC<PatientDashboardProps> = ({
  navigate,
  onOpenRecommendation,
}) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  useEffect(() => {
    apiRequest('/patients/dashboard-summary').then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading patient clinical portal...
      </div>
    );
  }

  const patient = data?.patient;
  const stats = data?.stats || {};
  const nextAppointment = data?.nextAppointment;
  const recentPrescriptions = data?.recentPrescriptions || [];
  const recentDoctors = data?.recentDoctors || [];
  const recentDocuments = data?.recentDocuments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-linear-to-r from-sky-700 to-teal-700 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-xs font-bold text-sky-200 uppercase tracking-wider">
            Patient Health Portal
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {patient?.fullName || 'Patient'}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100">
            Blood Group: <strong>{patient?.bloodGroup || 'N/A'}</strong> • Allergies:{' '}
            <strong className="text-amber-200">{patient?.allergies || 'None recorded'}</strong>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/patient/book-appointment')}
            className="px-4 py-2.5 bg-white text-sky-900 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4 text-sky-600" /> Book Consultation
          </button>
          <button
            onClick={onOpenRecommendation}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> AI Symptom Triage
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Upcoming Appointments"
          value={stats.upcomingCount || 0}
          subtitle="Scheduled visits"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Completed Visits"
          value={stats.completedCount || 0}
          subtitle="Consultation history"
          icon={Stethoscope}
          color="teal"
        />
        <StatCard
          title="Prescriptions"
          value={stats.prescriptionsCount || 0}
          subtitle="Active Rx records"
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Lab Reports"
          value={stats.documentsCount || 0}
          subtitle="Medical uploads"
          icon={FileUp}
          color="emerald"
        />
      </div>

      {/* Gemini AI & Cloud Healthcare Intelligence Suite Section */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-900/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                Gemini Multimodal AI & Cloud Intelligence Suite
              </h2>
            </div>
            <p className="text-xs text-slate-300">
              Live Voice (gemini-3.8-live), Multi-Turn Chat, Search Grounding, and Audio Transcription with Firestore Persistence
            </p>
          </div>
          <button
            onClick={() => navigate('/ai-hub')}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
          >
            Launch Full Hub <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Live Voice */}
          <button
            onClick={() => navigate('/ai-hub?tab=voice')}
            className="p-4 bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl text-left transition space-y-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold">
              🎙️
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                Live Voice Consultation
              </p>
              <span className="text-[10px] text-indigo-300 font-mono">gemini-3.8-live</span>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                Real-time interactive bidirectional voice talk with Dr. SmartCare Live.
              </p>
            </div>
          </button>

          {/* Gemini Chatbot */}
          <button
            onClick={() => navigate('/ai-hub?tab=chat')}
            className="p-4 bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl text-left transition space-y-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-sky-500/30 text-sky-300 flex items-center justify-center font-bold">
              🤖
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                Gemini Clinical Chat
              </p>
              <span className="text-[10px] text-sky-300 font-mono">3.1 Pro • 3.5 Flash • Lite</span>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                Multi-turn conversation thread saved to Cloud Firestore database.
              </p>
            </div>
          </button>

          {/* Search Grounding */}
          <button
            onClick={() => navigate('/ai-hub?tab=search')}
            className="p-4 bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl text-left transition space-y-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold">
              🌐
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-emerald-300 transition">
                Search Grounding
              </p>
              <span className="text-[10px] text-emerald-300 font-mono">gemini-3.5-flash + web</span>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                Live Google Search grounding for verified medical research & alerts.
              </p>
            </div>
          </button>

          {/* Audio Transcription */}
          <button
            onClick={() => navigate('/ai-hub?tab=transcribe')}
            className="p-4 bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl text-left transition space-y-2 group cursor-pointer"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/30 text-amber-300 flex items-center justify-center font-bold">
              📝
            </div>
            <div>
              <p className="text-xs font-bold text-white group-hover:text-amber-300 transition">
                Voice Dictation
              </p>
              <span className="text-[10px] text-amber-300 font-mono">gemini-3.5-transcribe</span>
              <p className="text-[11px] text-slate-300 mt-1 line-clamp-2">
                Dictate clinical notes with microphone & save to Firestore.
              </p>
            </div>
          </button>
        </div>
      </div>

      {/* Next Appointment Card (if any) */}
      {nextAppointment && (
        <div className="bg-white rounded-3xl border border-sky-200 p-6 shadow-xs relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
                <Clock className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
                    Next Upcoming Consultation
                  </span>
                  <StatusBadge status={nextAppointment.status} />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {nextAppointment.doctor?.fullName || 'Attending Physician'}
                </h3>
                <p className="text-xs text-slate-500">
                  {nextAppointment.doctor?.specialization} • {nextAppointment.doctor?.hospitalName}
                </p>
                <div className="flex items-center gap-4 text-xs font-semibold text-slate-700 pt-1">
                  <span>📅 {nextAppointment.appointmentDate}</span>
                  <span>⏰ {nextAppointment.appointmentTime} - {nextAppointment.endTime}</span>
                  <span className="text-purple-700">Type: {nextAppointment.type.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => navigate('/patient/appointments')}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition cursor-pointer"
              >
                Manage / Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Two Column Layout: Recent Prescriptions & Visited Doctors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Prescriptions */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" /> Recent Digital Prescriptions
            </h3>
            <button
              onClick={() => navigate('/patient/prescriptions')}
              className="text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
            >
              View All Rx
            </button>
          </div>

          {recentPrescriptions.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No digital prescriptions issued yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recentPrescriptions.map((rx: Prescription) => (
                <div
                  key={rx.id}
                  className="p-3.5 rounded-2xl border border-slate-200 hover:border-sky-300 bg-slate-50/50 flex items-center justify-between gap-4 transition"
                >
                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{rx.diagnosis}</h4>
                    <p className="text-[11px] text-slate-500">
                      Date: {rx.prescriptionDate} • {rx.items.length} prescribed medications
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedRx(rx)}
                    className="px-3 py-1.5 bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 rounded-lg text-xs font-semibold flex items-center gap-1 transition cursor-pointer shrink-0"
                  >
                    <Printer className="w-3.5 h-3.5" /> View / Print
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recently Visited Doctors */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-teal-600" /> Recently Consulted Doctors
            </h3>
            <button
              onClick={() => navigate('/patient/doctors')}
              className="text-xs text-sky-600 hover:underline font-semibold cursor-pointer"
            >
              Find More
            </button>
          </div>

          {recentDoctors.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center italic">
              No previous doctor consultations recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {recentDoctors.map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-3 rounded-2xl border border-slate-200 bg-white flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        doc.profileImage ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={doc.fullName}
                      className="w-10 h-10 rounded-xl object-cover border border-slate-200"
                    />
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{doc.fullName}</h4>
                      <p className="text-[11px] text-sky-700 font-medium">{doc.specialization}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/patient/book-appointment?doctorId=${doc.id}`)}
                    className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded-lg transition cursor-pointer"
                  >
                    Book Again
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal for viewing printable prescription */}
      <Modal
        isOpen={!!selectedRx}
        onClose={() => setSelectedRx(null)}
        title="Electronic Prescription"
        maxWidth="max-w-3xl"
      >
        {selectedRx && <PrintablePrescription prescription={selectedRx} />}
      </Modal>
    </div>
  );
};

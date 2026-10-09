import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import { StatusBadge } from '../../components/common/Badge';
import {
  Calendar,
  Clock,
  User,
  Users,
  CheckCircle2,
  AlertCircle,
  FileText,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { DoctorProfile } from '../../types';

interface DoctorDashboardProps {
  navigate: (path: string) => void;
}

export const DoctorDashboard: React.FC<DoctorDashboardProps> = ({ navigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    const res = await apiRequest('/doctors/portal/dashboard-summary');
    if (res.success && res.data) {
      setData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleUpdateStatus = async (appointmentId: string, status: string) => {
    await apiRequest(`/appointments/${appointmentId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    fetchDashboard();
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading physician console...</div>;
  }

  const doctor: DoctorProfile = data?.doctor;
  const stats = data?.stats || {};
  const todayAppointments = data?.todayAppointments || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-linear-to-r from-sky-800 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-200 uppercase tracking-wider">
              Physician Consultation Desk
            </span>
            <StatusBadge status={doctor?.status || 'VERIFIED'} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {doctor?.fullName}
          </h1>
          <p className="text-xs sm:text-sm text-sky-100">
            {doctor?.specialization} • License: {doctor?.licenseNumber} • Fee: ${doctor?.consultationFee}/visit
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => navigate('/ai-hub?tab=transcribe')}
            className="px-3.5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🎙️</span> Voice Dictation
          </button>
          <button
            onClick={() => navigate('/ai-hub?tab=search')}
            className="px-3.5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <span>🌐</span> Search Guidelines
          </button>
          <button
            onClick={() => navigate('/doctor/availability')}
            className="px-4 py-2.5 bg-white text-slate-900 hover:bg-sky-50 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-4 h-4 text-sky-600" /> Working Hours
          </button>
          <button
            onClick={() => navigate('/doctor/appointments')}
            className="px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Calendar className="w-4 h-4" /> All Visits
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Schedule"
          value={stats.todayCount || 0}
          subtitle="Visits scheduled today"
          icon={Calendar}
          color="blue"
        />
        <StatCard
          title="Pending Requests"
          value={stats.pendingCount || 0}
          subtitle="Awaiting triage / review"
          icon={AlertCircle}
          color="amber"
        />
        <StatCard
          title="Completed Consultations"
          value={stats.completedCount || 0}
          subtitle="Consulted patient visits"
          icon={CheckCircle2}
          color="emerald"
        />
        <StatCard
          title="Active Patients"
          value={stats.uniquePatientCount || 0}
          subtitle="Under your medical care"
          icon={Users}
          color="purple"
        />
      </div>

      {/* Today's Appointments Agenda */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" /> Today's Consultation Schedule
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Patients scheduled for examination today. Click to conduct consultation or record prescriptions.
            </p>
          </div>
          <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-lg">
            {todayAppointments.length} Patient visits today
          </span>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 italic">
            No consultations scheduled for today. You are caught up!
          </div>
        ) : (
          <div className="space-y-3">
            {todayAppointments.map((apt: any) => (
              <div
                key={apt.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-sky-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3.5 flex-1 min-w-0">
                  <div className="px-3 py-2 bg-sky-600 text-white font-bold rounded-xl text-center text-xs shrink-0">
                    <div>{apt.appointmentTime}</div>
                    <div className="text-[10px] text-sky-200 font-normal">{apt.endTime}</div>
                  </div>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {apt.patient?.fullName || 'Patient'}
                      </h4>
                      <StatusBadge status={apt.status} />
                      <StatusBadge status={apt.priority} />
                      <span className="text-xs text-purple-700 font-medium">
                        {apt.type.replace('_', ' ')}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600">
                      <strong>Reason:</strong> {apt.reasonForVisit}
                    </p>
                  </div>
                </div>

                {/* Quick Consultation Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/doctor/patients/${apt.patientId}?appointmentId=${apt.id}`)}
                    className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                  >
                    <Stethoscope className="w-3.5 h-3.5" /> Start Consultation / Rx
                  </button>

                  {apt.status === 'CONFIRMED' && (
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                    >
                      Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          onClick={() => navigate('/doctor/availability')}
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-xs transition cursor-pointer space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Define Working Hours</h4>
          <p className="text-xs text-slate-500">
            Set working days, start/end hours, break periods, and block dates for leaves.
          </p>
        </div>

        <div
          onClick={() => navigate('/doctor/patients')}
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-xs transition cursor-pointer space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Authorized Patient Directory</h4>
          <p className="text-xs text-slate-500">
            View medical history timeline, prescriptions, and lab reports for your patients.
          </p>
        </div>

        <div
          onClick={() => navigate('/doctor/profile')}
          className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-xs transition cursor-pointer space-y-2"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <User className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Professional Profile</h4>
          <p className="text-xs text-slate-500">
            Update consultation fees, biographical overview, and hospital affiliations.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Appointment } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
} from 'lucide-react';

interface DoctorAppointmentsProps {
  navigate: (path: string) => void;
}

export const DoctorAppointments: React.FC<DoctorAppointmentsProps> = ({ navigate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('CONFIRMED');

  // Cancel Modal State
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await apiRequest<Appointment[]>('/doctors/portal/appointments');
    if (res.success && res.data) {
      setAppointments(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleUpdateStatus = async (id: string, status: string) => {
    await apiRequest(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    fetchAppointments();
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalApt || !cancellationReason.trim()) return;

    setSubmittingCancel(true);
    await apiRequest(`/appointments/${cancelModalApt.id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    });
    setSubmittingCancel(false);
    setCancelModalApt(null);
    setCancellationReason('');
    fetchAppointments();
  };

  const filtered = appointments.filter((apt) => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
            Clinical Consultations
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Appointment Management
          </h1>
          <p className="text-xs text-slate-500">
            Monitor incoming patient bookings, conduct consultations, and mark visit outcomes.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        {(['CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              filter === tab
                ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading appointments...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No {filter.toLowerCase()} appointments</h3>
          <p className="text-xs text-slate-500">
            No consultations currently match this status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-sky-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-base text-slate-900 truncate">
                    {apt.patient?.fullName || 'Patient'}
                  </h3>
                  <StatusBadge status={apt.status} />
                  <StatusBadge status={apt.priority} />
                  <span className="text-xs text-purple-700 font-medium">
                    {apt.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
                  <span className="font-semibold text-slate-900 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> {apt.appointmentDate}
                  </span>
                  <span className="font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.appointmentTime} - {apt.endTime}
                  </span>
                  {apt.patient?.phone && (
                    <span>Phone: {apt.patient.phone}</span>
                  )}
                  {apt.patient?.bloodGroup && (
                    <span className="bg-sky-50 text-sky-800 px-1.5 py-0.5 rounded font-bold">
                      {apt.patient.bloodGroup}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-700 pt-1">
                  <strong>Clinical Reason:</strong> {apt.reasonForVisit}
                </p>

                {apt.cancellationReason && (
                  <p className="text-xs text-rose-600 font-medium">
                    Cancelled: "{apt.cancellationReason}"
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                <button
                  onClick={() => navigate(`/doctor/patients/${apt.patientId}?appointmentId=${apt.id}`)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Clinical Notes & Rx
                </button>

                {apt.status === 'CONFIRMED' && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'COMPLETED')}
                      className="px-3 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Complete
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(apt.id, 'NO_SHOW')}
                      className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      No-Show
                    </button>
                    <button
                      onClick={() => setCancelModalApt(apt)}
                      className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {apt.status === 'PENDING' && (
                  <button
                    onClick={() => handleUpdateStatus(apt.id, 'CONFIRMED')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition cursor-pointer"
                  >
                    Confirm Visit
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Modal */}
      <Modal
        isOpen={!!cancelModalApt}
        onClose={() => setCancelModalApt(null)}
        title="Physician Cancellation"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <p className="text-xs text-slate-600">
            Please provide a clinical or scheduling reason for cancelling this appointment. The patient will be notified immediately.
          </p>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Cancellation Reason *
            </label>
            <textarea
              rows={3}
              required
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g. Emergency surgery coverage, illness, or rescheduling required..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalApt(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700"
            >
              Keep
            </button>
            <button
              type="submit"
              disabled={submittingCancel}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs"
            >
              {submittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

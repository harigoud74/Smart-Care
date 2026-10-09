import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Appointment } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Calendar,
  Clock,
  User,
  AlertCircle,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Stethoscope,
  Building2,
} from 'lucide-react';

interface PatientAppointmentsProps {
  navigate: (path: string) => void;
}

export const PatientAppointments: React.FC<PatientAppointmentsProps> = ({ navigate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');

  // Cancel Modal State
  const [cancelModalApt, setCancelModalApt] = useState<Appointment | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  // Reschedule Modal State
  const [rescheduleApt, setRescheduleApt] = useState<Appointment | null>(null);
  const todayStr = new Date().toISOString().split('T')[0];
  const [rescheduleDate, setRescheduleDate] = useState(todayStr);
  const [rescheduleSlots, setRescheduleSlots] = useState<any[]>([]);
  const [selectedNewSlot, setSelectedNewSlot] = useState('');
  const [selectedNewEndTime, setSelectedNewEndTime] = useState('');
  const [loadingRescheduleSlots, setLoadingRescheduleSlots] = useState(false);
  const [rescheduleSubmitting, setRescheduleSubmitting] = useState(false);
  const [rescheduleError, setRescheduleError] = useState<string | null>(null);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const res = await apiRequest<Appointment[]>('/patients/appointments');
      if (res.success && res.data) {
        setAppointments(res.data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Fetch slots for reschedule when date changes
  useEffect(() => {
    if (!rescheduleApt || !rescheduleDate) return;
    setLoadingRescheduleSlots(true);
    setSelectedNewSlot('');
    setRescheduleError(null);

    apiRequest<any>(`/appointments/slots?doctorId=${rescheduleApt.doctorId}&date=${rescheduleDate}`).then(
      (res) => {
        if (res.success && res.data) {
          setRescheduleSlots(res.data.slots || []);
        } else {
          setRescheduleSlots([]);
        }
        setLoadingRescheduleSlots(false);
      }
    );
  }, [rescheduleApt, rescheduleDate]);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancelModalApt || !cancellationReason.trim()) return;

    setCancelSubmitting(true);
    setCancelError(null);

    const res = await apiRequest(`/appointments/${cancelModalApt.id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ cancellationReason }),
    });

    setCancelSubmitting(false);

    if (res.success) {
      setCancelModalApt(null);
      setCancellationReason('');
      fetchAppointments();
    } else {
      setCancelError(res.error || 'Failed to cancel appointment.');
    }
  };

  const handleRescheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleApt || !selectedNewSlot) {
      setRescheduleError('Please pick an available time slot.');
      return;
    }

    setRescheduleSubmitting(true);
    setRescheduleError(null);

    const res = await apiRequest(`/appointments/${rescheduleApt.id}/reschedule`, {
      method: 'PUT',
      body: JSON.stringify({
        appointmentDate: rescheduleDate,
        appointmentTime: selectedNewSlot,
        endTime: selectedNewEndTime,
      }),
    });

    setRescheduleSubmitting(false);

    if (res.success) {
      setRescheduleApt(null);
      fetchAppointments();
    } else {
      setRescheduleError(res.error || 'Failed to reschedule.');
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'UPCOMING') {
      return apt.status === 'CONFIRMED' || apt.status === 'PENDING';
    }
    if (activeTab === 'COMPLETED') return apt.status === 'COMPLETED';
    if (activeTab === 'CANCELLED') return apt.status === 'CANCELLED';
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
            Appointment Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Consultations
          </h1>
          <p className="text-xs text-slate-500">
            View upcoming visits, manage rescheduling, or review completed medical histories.
          </p>
        </div>

        <button
          onClick={() => navigate('/patient/book-appointment')}
          className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
        >
          + Schedule New Appointment
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        {(['UPCOMING', 'COMPLETED', 'CANCELLED', 'ALL'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl transition cursor-pointer ${
              activeTab === tab
                ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.charAt(0) + tab.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Appointment Cards List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading your appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No {activeTab.toLowerCase()} appointments</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not currently have any appointments matching this category.
          </p>
          <button
            onClick={() => navigate('/patient/book-appointment')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg"
          >
            Book Appointment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => (
            <div
              key={apt.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-sky-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="flex items-start gap-4 flex-1">
                <img
                  src={
                    apt.doctor?.profileImage ||
                    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
                  }
                  alt={apt.doctor?.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-200 shrink-0"
                />

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold text-sm text-slate-900 truncate">
                      {apt.doctor?.fullName || 'Doctor'}
                    </h3>
                    <StatusBadge status={apt.status} />
                    <StatusBadge status={apt.priority} />
                  </div>

                  <p className="text-xs text-sky-700 font-semibold">{apt.doctor?.specialization}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600 pt-1">
                    <span className="font-bold text-slate-900 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {apt.appointmentDate}
                    </span>
                    <span className="font-medium flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> {apt.appointmentTime} - {apt.endTime}
                    </span>
                    <span className="text-purple-700 font-medium">
                      Mode: {apt.type.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 pt-1">
                    <strong className="text-slate-800">Reason:</strong> {apt.reasonForVisit}
                  </p>

                  {apt.cancellationReason && (
                    <p className="text-xs text-rose-600 pt-0.5 font-medium">
                      Cancelled Reason: "{apt.cancellationReason}"
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap md:flex-col items-end gap-2 shrink-0 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0">
                {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && (
                  <>
                    <button
                      onClick={() => setRescheduleApt(apt)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reschedule
                    </button>
                    <button
                      onClick={() => setCancelModalApt(apt)}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Cancel Visit
                    </button>
                  </>
                )}

                {apt.status === 'COMPLETED' && (
                  <button
                    onClick={() => navigate('/patient/medical-records')}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    View Consultation Record
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelModalApt}
        onClose={() => setCancelModalApt(null)}
        title="Confirm Appointment Cancellation"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCancelSubmit} className="space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            Cancelling will immediately release this time slot ({cancelModalApt?.appointmentDate} at{' '}
            {cancelModalApt?.appointmentTime}) for other patients.
          </div>

          {cancelError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {cancelError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Reason for Cancellation *
            </label>
            <textarea
              rows={3}
              required
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="e.g. Schedule conflict, feeling better, or personal reasons..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCancelModalApt(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Keep Appointment
            </button>
            <button
              type="submit"
              disabled={cancelSubmitting}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              {cancelSubmitting ? 'Cancelling...' : 'Confirm Cancellation'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reschedule Modal */}
      <Modal
        isOpen={!!rescheduleApt}
        onClose={() => setRescheduleApt(null)}
        title="Reschedule Appointment Slot"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleRescheduleSubmit} className="space-y-4">
          {rescheduleError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {rescheduleError}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Select New Date
            </label>
            <input
              type="date"
              min={todayStr}
              value={rescheduleDate}
              onChange={(e) => setRescheduleDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Choose Available Slot
            </label>
            {loadingRescheduleSlots ? (
              <p className="text-xs text-slate-400 py-3">Checking available doctor slots...</p>
            ) : rescheduleSlots.length === 0 ? (
              <p className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                No slots available on this date.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pt-1">
                {rescheduleSlots.map((slot, idx) => {
                  const isSelected = selectedNewSlot === slot.time;
                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() => {
                        setSelectedNewSlot(slot.time);
                        setSelectedNewEndTime(slot.endTime);
                      }}
                      className={`p-2 rounded-xl text-center text-xs font-bold border transition cursor-pointer ${
                        !slot.isAvailable
                          ? 'bg-slate-100 text-slate-400 line-through cursor-not-allowed'
                          : isSelected
                          ? 'bg-sky-600 text-white border-sky-600'
                          : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-300'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setRescheduleApt(null)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rescheduleSubmitting || !selectedNewSlot}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
            >
              {rescheduleSubmitting ? 'Updating...' : 'Confirm Reschedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Appointment } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Calendar, Search, Clock, Stethoscope, User } from 'lucide-react';

export const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchAppointments = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/admin/appointments');
    if (res.success && res.data) {
      setAppointments(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleOverrideStatus = async (id: string, status: string) => {
    await apiRequest(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    fetchAppointments();
  };

  const filtered = appointments.filter((apt) => {
    const matchesStatus = statusFilter === 'ALL' || apt.status === statusFilter;
    const matchesSearch =
      (apt.doctor?.fullName && apt.doctor.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (apt.patient?.fullName && apt.patient.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      apt.appointmentDate.includes(searchTerm) ||
      apt.reasonForVisit.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
            Platform Clinical Flow
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Central Appointment Registry
          </h1>
          <p className="text-xs text-slate-500">
            Real-time monitoring of all scheduled, completed, and cancelled consultations.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient, doctor, date..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold flex-wrap">
        {['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              statusFilter === st
                ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === 'ALL' ? 'All Records' : st}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading appointments registry...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">No appointments found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Date & Slot</th>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Attending Doctor</th>
                  <th className="px-5 py-3.5">Mode / Priority</th>
                  <th className="px-5 py-3.5">Clinical Reason</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Admin Override</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((apt) => (
                  <tr key={apt.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <strong className="text-slate-900 block font-bold">{apt.appointmentDate}</strong>
                      <span className="text-[11px] text-sky-700 font-medium">
                        {apt.appointmentTime} - {apt.endTime}
                      </span>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-900">
                      {apt.patient?.fullName || 'Patient'}
                      {apt.patient?.phone && (
                        <span className="text-[10px] text-slate-400 block font-normal">{apt.patient.phone}</span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      <strong className="text-slate-900 block">{apt.doctor?.fullName || 'Doctor'}</strong>
                      <span className="text-[11px] text-slate-500">{apt.doctor?.specialization}</span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-purple-700 font-semibold">{apt.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <StatusBadge status={apt.priority} />
                      </div>
                    </td>

                    <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                      {apt.reasonForVisit}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={apt.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <select
                        value={apt.status}
                        onChange={(e) => handleOverrideStatus(apt.id, e.target.value)}
                        className="px-2 py-1 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-sky-500 cursor-pointer"
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PENDING">PENDING</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                        <option value="NO_SHOW">NO_SHOW</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Appointment } from '../../types';
import { Users, Search, Stethoscope, Phone, Calendar, ArrowRight } from 'lucide-react';

export const DoctorPatients: React.FC<{ navigate: (path: string) => void }> = ({ navigate }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    apiRequest<Appointment[]>('/doctors/portal/appointments').then((res) => {
      if (res.success && res.data) {
        setAppointments(res.data);
      }
      setLoading(false);
    });
  }, []);

  // Deduplicate distinct patients
  const patientMap = new Map<string, any>();
  appointments.forEach((apt) => {
    if (apt.patient && !patientMap.has(apt.patientId)) {
      patientMap.set(apt.patientId, {
        ...apt.patient,
        lastVisit: apt.appointmentDate,
        appointmentCount: appointments.filter((a) => a.patientId === apt.patientId).length,
      });
    }
  });

  const patients = Array.from(patientMap.values());
  const filtered = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone && p.phone.includes(searchTerm)) ||
      (p.bloodGroup && p.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
            Clinical Records
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Authorized Patient Directory
          </h1>
          <p className="text-xs text-slate-500">
            Patients who have active or previous clinical consultation records with you.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient name or phone..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading authorized patient list...</div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-2">
          <Users className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No matching patients</h3>
          <p className="text-xs text-slate-500">
            Patients who book consultations with you will appear in your clinical directory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-slate-900">{p.fullName}</h3>
                  {p.bloodGroup && (
                    <span className="text-[10px] font-bold bg-sky-50 text-sky-800 px-2 py-0.5 rounded">
                      {p.bloodGroup}
                    </span>
                  )}
                </div>

                <div className="text-xs text-slate-500 space-y-1">
                  <p>Gender / DOB: {p.gender || 'N/A'} • {p.dateOfBirth || 'N/A'}</p>
                  {p.phone && <p>Phone: {p.phone}</p>}
                  {p.allergies && (
                    <p className="text-rose-600 font-medium">Allergies: {p.allergies}</p>
                  )}
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl text-[11px] text-slate-600 flex justify-between">
                  <span>Last Visit: {p.lastVisit}</span>
                  <span className="font-bold">{p.appointmentCount} Visits</span>
                </div>
              </div>

              <button
                onClick={() => navigate(`/doctor/patients/${p.id}`)}
                className="w-full py-2 bg-sky-50 hover:bg-sky-100 text-sky-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Stethoscope className="w-3.5 h-3.5" /> View Patient Chart
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

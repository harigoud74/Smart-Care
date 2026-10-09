import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { DoctorProfile } from '../../types';
import {
  ShieldCheck,
  Star,
  MapPin,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Award,
  Globe,
  Building2,
} from 'lucide-react';

interface DoctorDetailProps {
  doctorId: string;
  navigate: (path: string) => void;
}

export const DoctorDetail: React.FC<DoctorDetailProps> = ({ doctorId, navigate }) => {
  const [doctor, setDoctor] = useState<DoctorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Slot preview date
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  useEffect(() => {
    setLoading(true);
    apiRequest<DoctorProfile>(`/doctors/public/${doctorId}`).then((res) => {
      if (res.success && res.data) {
        setDoctor(res.data);
      }
      setLoading(false);
    });
  }, [doctorId]);

  useEffect(() => {
    if (doctorId && selectedDate) {
      setLoadingSlots(true);
      apiRequest<{ slots: any[] }>(`/appointments/slots?doctorId=${doctorId}&date=${selectedDate}`).then((res) => {
        if (res.success && res.data) {
          setSlots(res.data.slots || []);
        } else {
          setSlots([]);
        }
        setLoadingSlots(false);
      });
    }
  }, [doctorId, selectedDate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        Loading doctor profile credentials...
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Doctor Profile Not Found</h2>
        <button
          onClick={() => navigate('/doctors')}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold cursor-pointer"
        >
          Back to Doctors Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/doctors')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Doctor Directory
      </button>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <img
            src={
              doctor.profileImage ||
              'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
            }
            alt={doctor.fullName}
            className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl object-cover border border-slate-200 shadow-sm shrink-0"
          />

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{doctor.fullName}</h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Verified
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm font-bold text-slate-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-xl">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{doctor.rating}</span>
                <span className="text-slate-500 text-xs font-normal">({doctor.reviewCount} reviews)</span>
              </div>
            </div>

            <p className="text-sm font-bold text-sky-700">{doctor.specialization}</p>
            <p className="text-xs text-slate-600 font-medium">{doctor.qualification}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Experience</span>
                <span className="font-bold text-slate-900">{doctor.experienceYears} Years</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Consultation Fee</span>
                <span className="font-bold text-slate-900">${doctor.consultationFee}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Medical License</span>
                <span className="font-bold text-slate-900">{doctor.licenseNumber}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Languages</span>
                <span className="font-bold text-slate-900">{doctor.languages || 'English'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bio */}
        <div className="mt-6 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">About the Physician</h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{doctor.bio}</p>
        </div>

        {/* Hospital Affiliation */}
        {doctor.hospital && (
          <div className="mt-4 p-4 bg-sky-50/60 border border-sky-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-sky-600" />
              <div>
                <p className="font-bold text-xs text-slate-900">{doctor.hospital.name}</p>
                <p className="text-[11px] text-slate-500">{doctor.hospital.city}</p>
              </div>
            </div>
            <span className="text-[11px] font-semibold text-sky-700">Primary Hospital Facility</span>
          </div>
        )}
      </div>

      {/* Live Availability Preview & Book Action */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" /> Live Availability & Slots
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a date to check conflict-free consultation slots.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">Date:</label>
            <input
              type="date"
              value={selectedDate}
              min={todayStr}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-medium"
            />
          </div>
        </div>

        {/* Slot pills */}
        <div>
          {loadingSlots ? (
            <p className="text-xs text-slate-400 py-4">Checking live slot availability...</p>
          ) : slots.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs">
              No available slots on {selectedDate}. The doctor may be off-duty or this day is fully booked.
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-4 text-[11px] text-slate-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Available Slot
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Booked / Unavailable
                </span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {slots.map((slot, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-xl text-center text-xs font-semibold border transition ${
                      slot.isAvailable
                        ? 'bg-sky-50 text-sky-900 border-sky-200'
                        : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed line-through'
                    }`}
                  >
                    {slot.time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            onClick={() =>
              navigate(`/patient/book-appointment?doctorId=${doctor.id}&date=${selectedDate}`)
            }
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" /> Book Appointment with {doctor.fullName.split(',')[0]}
          </button>
        </div>
      </div>
    </div>
  );
};

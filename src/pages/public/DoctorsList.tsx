import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { DoctorProfile, Hospital } from '../../types';
import {
  Search,
  Filter,
  Star,
  ShieldCheck,
  Calendar,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

interface DoctorsListProps {
  navigate: (path: string) => void;
  onOpenRecommendation: () => void;
  initialSpecialization?: string;
}

export const DoctorsList: React.FC<DoctorsListProps> = ({
  navigate,
  onOpenRecommendation,
  initialSpecialization = '',
}) => {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState(initialSpecialization);
  const [selectedHospital, setSelectedHospital] = useState('');
  const [maxFee, setMaxFee] = useState<number>(300);
  const [minRating, setMinRating] = useState<number>(0);

  const SPECIALTIES = [
    'All Specialties',
    'Cardiology',
    'Orthopedics',
    'Dermatology',
    'Neurology',
    'Pediatrics',
    'General Medicine',
    'Gastroenterology',
    'Pulmonology',
  ];

  const fetchDoctors = async () => {
    setLoading(true);
    let url = '/doctors?';
    if (selectedSpecialty && selectedSpecialty !== 'All Specialties') {
      url += `specialization=${encodeURIComponent(selectedSpecialty)}&`;
    }
    if (selectedHospital) {
      url += `hospitalId=${encodeURIComponent(selectedHospital)}&`;
    }
    if (searchTerm) {
      url += `search=${encodeURIComponent(searchTerm)}&`;
    }
    if (maxFee) {
      url += `maxFee=${maxFee}&`;
    }
    if (minRating > 0) {
      url += `minRating=${minRating}&`;
    }

    try {
      const res = await apiRequest<DoctorProfile[]>(url);
      if (res.success && res.data) {
        setDoctors(res.data);
      }
    } catch (err) {
      console.error('Failed to load doctors:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [selectedSpecialty, selectedHospital, maxFee, minRating]);

  // Load hospitals for dropdown filter
  useEffect(() => {
    apiRequest<Hospital[]>('/admin/hospitals').then((res) => {
      if (res.success && res.data) {
        setHospitals(res.data);
      }
    });
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSpecialty('');
    setSelectedHospital('');
    setMaxFee(300);
    setMinRating(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Header & Search Bar */}
      <div className="bg-linear-to-r from-sky-700 to-teal-700 rounded-2xl p-6 sm:p-8 text-white shadow-md">
        <div className="max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 text-white rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            Verified Physician Directory
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Find the Right Doctor For Your Care
          </h1>
          <p className="text-xs sm:text-sm text-sky-100">
            Book appointment slots with board-certified physicians, read credentials, and check real-time availability.
          </p>

          <form onSubmit={handleSearchSubmit} className="flex gap-2 pt-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by physician name, clinical specialty, or symptoms..."
                className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white text-slate-900 text-sm focus:outline-hidden shadow-xs placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-xl shadow-xs transition cursor-pointer"
            >
              Search
            </button>
            <button
              type="button"
              onClick={onOpenRecommendation}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm rounded-xl shadow-xs transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4" /> AI Triage
            </button>
          </form>
        </div>
      </div>

      {/* Main Content Layout (Sidebar Filters + Doctor Cards Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 h-fit shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-sky-600" /> Filter Doctors
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs text-sky-600 hover:text-sky-800 font-semibold cursor-pointer"
            >
              Reset
            </button>
          </div>

          {/* Specialty Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Specialization
            </label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
            >
              {SPECIALTIES.map((s, idx) => (
                <option key={idx} value={s === 'All Specialties' ? '' : s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Hospital Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Hospital / Clinic
            </label>
            <select
              value={selectedHospital}
              onChange={(e) => setSelectedHospital(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-sky-500"
            >
              <option value="">All Hospital Locations</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name}
                </option>
              ))}
            </select>
          </div>

          {/* Consultation Fee Range */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-bold uppercase tracking-wider text-slate-600">Max Fee</label>
              <span className="font-bold text-sky-700">${maxFee}</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="10"
              value={maxFee}
              onChange={(e) => setMaxFee(Number(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>$50</span>
              <span>$300</span>
            </div>
          </div>

          {/* Minimum Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
              Minimum Rating
            </label>
            <div className="flex items-center gap-1">
              {[0, 4.0, 4.5, 4.8].map((rating) => (
                <button
                  key={rating}
                  type="button"
                  onClick={() => setMinRating(rating)}
                  className={`flex-1 py-1 text-xs rounded-lg font-semibold border transition cursor-pointer ${
                    minRating === rating
                      ? 'bg-sky-50 border-sky-600 text-sky-700'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {rating === 0 ? 'Any' : `${rating}★+`}
                </button>
              ))}
            </div>
          </div>

          {/* AI Banner in Sidebar */}
          <div className="bg-teal-50 border border-teal-200 rounded-xl p-3.5 text-xs text-teal-900 space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-teal-800">
              <Sparkles className="w-4 h-4 text-teal-600" /> Not sure who to see?
            </div>
            <p className="text-[11px] leading-relaxed text-teal-700">
              Tell our AI navigation tool your symptoms, and it will instantly map you to the correct department.
            </p>
            <button
              type="button"
              onClick={onOpenRecommendation}
              className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-xs shadow-xs transition cursor-pointer"
            >
              Start Symptom Triage
            </button>
          </div>
        </div>

        {/* Doctors Grid */}
        <div className="lg:col-span-3 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-600 pb-2">
            <span>
              Showing <strong className="text-slate-900">{doctors.length}</strong> verified doctors
            </span>
            {selectedSpecialty && (
              <span className="font-semibold text-sky-700">
                Department: {selectedSpecialty}
              </span>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
                  <div className="flex gap-4">
                    <div className="w-16 h-16 bg-slate-200 rounded-xl" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                  <div className="h-10 bg-slate-100 rounded-xl" />
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
              <div className="w-12 h-12 mx-auto bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">No doctors found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No verified physicians matched your active filter criteria. Try adjusting the specialization, location, or maximum fee.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-sky-300 hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <img
                        src={
                          doc.profileImage ||
                          'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
                        }
                        alt={doc.fullName}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-sm text-slate-900 truncate">{doc.fullName}</h4>
                          <span title="Verified Doctor">
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-sky-700">{doc.specialization}</p>
                        <p className="text-[11px] text-slate-500">{doc.qualification}</p>

                        <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                          <span className="flex items-center gap-1 text-amber-600 font-bold">
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            {doc.rating}
                          </span>
                          <span>•</span>
                          <span>{doc.experienceYears} yrs experience</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{doc.bio}</p>

                    <div className="bg-slate-50 rounded-xl p-2.5 text-[11px] text-slate-600 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{doc.hospital?.name || 'City Central Hospital'}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-500 pt-1">
                        <span>Languages: {doc.languages || 'English'}</span>
                        <span className="font-bold text-slate-900 text-xs">
                          ${doc.consultationFee} <span className="font-normal text-[10px] text-slate-500">/ consult</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => navigate(`/doctors/${doc.id}`)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition cursor-pointer"
                    >
                      View Profile
                    </button>
                    <button
                      onClick={() => navigate(`/patient/book-appointment?doctorId=${doc.id}`)}
                      className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
                    >
                      Book Appointment <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

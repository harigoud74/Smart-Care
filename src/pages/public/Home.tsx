import React, { useState } from 'react';
import {
  Calendar,
  ShieldCheck,
  Stethoscope,
  Sparkles,
  ArrowRight,
  Clock,
  Star,
  CheckCircle2,
  HeartPulse,
  Activity,
  FileText,
  Lock,
} from 'lucide-react';
import { DoctorProfile } from '../../types';

interface HomeProps {
  navigate: (path: string) => void;
  onOpenRecommendation: () => void;
  featuredDoctors: DoctorProfile[];
}

export const Home: React.FC<HomeProps> = ({
  navigate,
  onOpenRecommendation,
  featuredDoctors,
}) => {
  const [symptomInput, setSymptomInput] = useState('');

  const DEPARTMENTS = [
    { name: 'Cardiology', desc: 'Heart care, hypertension, echocardiography', icon: '❤️', doctors: '6 Specialists' },
    { name: 'Orthopedics', desc: 'Joint replacement, knee pain, fractures', icon: '🦴', doctors: '5 Specialists' },
    { name: 'Dermatology', desc: 'Clinical skin treatments, eczema, acne', icon: '✨', doctors: '4 Specialists' },
    { name: 'Neurology', desc: 'Headaches, migraines, epilepsy, nerve care', icon: '🧠', doctors: '3 Specialists' },
    { name: 'Pediatrics', desc: 'Infant wellness, childhood asthma, growth', icon: '👶', doctors: '5 Specialists' },
    { name: 'General Medicine', desc: 'Primary care, seasonal infections, fevers', icon: '🩺', doctors: '8 Specialists' },
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-sky-50/70 via-white to-white pt-12 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-100/80 text-sky-800 text-xs font-bold border border-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                Intelligent Healthcare Scheduling & Patient Care
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Seamless Access to <span className="text-sky-600">Verified Medical Care</span>, Anytime.
              </h1>

              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                SmartCare connects patients with licensed physicians across multi-specialty hospitals.
                Featuring automated conflict-free slot scheduling, symptom-guided department navigation, digital prescriptions, and encrypted health records.
              </p>

              {/* Symptom Quick Bar */}
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-md max-w-xl">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                    Describe your symptom or concern:
                  </span>
                  <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded">
                    Clinical AI Triage
                  </span>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={symptomInput}
                    onChange={(e) => setSymptomInput(e.target.value)}
                    placeholder="e.g. Sharp knee pain when walking down stairs..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') onOpenRecommendation();
                    }}
                  />
                  <button
                    onClick={onOpenRecommendation}
                    className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    Analyze <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => navigate('/doctors')}
                  className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Calendar className="w-4 h-4" /> Book Consultation
                </button>
                <button
                  onClick={() => navigate('/ai-hub')}
                  className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" /> Explore AI Suite
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold rounded-xl shadow-xs transition cursor-pointer"
                >
                  Portal Login
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center gap-6 pt-4 text-xs font-semibold text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> 100% Board Verified Doctors
                </span>
                <span className="flex items-center gap-1.5">
                  <Lock className="w-4 h-4 text-sky-600" /> End-to-End Encrypted Records
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-600" /> Zero Double-Booking Guarantee
                </span>
              </div>
            </div>

            {/* Right Column / Hero Graphic Card */}
            <div className="lg:col-span-5 relative">
              <div className="bg-linear-to-tr from-sky-600 to-teal-500 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-2xl" />

                <div className="relative z-10 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center font-bold text-xl">
                        <HeartPulse className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg leading-tight">SmartCare Central</h3>
                        <p className="text-xs text-sky-100">Live Hospital Telemetry</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 rounded-full text-xs font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live System
                    </span>
                  </div>

                  {/* Mock Appointment Confirmation Card */}
                  <div className="bg-white text-slate-900 rounded-2xl p-4 shadow-lg space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <span className="text-[11px] font-bold uppercase text-slate-500">Upcoming Consultation</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                        Confirmed
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150"
                        alt="Dr. Sarah Jenkins"
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200"
                      />
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">Dr. Sarah Jenkins, MD</h4>
                        <p className="text-xs text-sky-600 font-medium">Cardiology • Metro Heart Hospital</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-2.5 text-xs text-slate-700 flex justify-between">
                      <div>
                        <span className="text-slate-500 block text-[10px]">Date & Time</span>
                        <span className="font-bold">Oct 15, 2026 • 10:00 AM</span>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-500 block text-[10px]">Consultation Type</span>
                        <span className="font-semibold text-purple-700">In-Person Clinic</span>
                      </div>
                    </div>
                  </div>

                  {/* Feature Counters */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                      <p className="text-2xl font-extrabold">100%</p>
                      <p className="text-[10px] text-sky-100 uppercase tracking-wider font-semibold">Verified Doctors</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                      <p className="text-2xl font-extrabold">&lt; 30s</p>
                      <p className="text-[10px] text-sky-100 uppercase tracking-wider font-semibold">Slot Booking</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md rounded-xl p-3">
                      <p className="text-2xl font-extrabold">24/7</p>
                      <p className="text-[10px] text-sky-100 uppercase tracking-wider font-semibold">Health Access</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialty Departments Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600 block mb-1">
            Clinical Departments
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Specialized Care for Every Health Concern
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Browse hospital departments or use our symptom navigation engine to find the right clinical specialist.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {DEPARTMENTS.map((dept, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/doctors?specialization=${dept.name}`)}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-sky-300 hover:shadow-md transition cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{dept.icon}</span>
                <span className="text-xs bg-slate-100 group-hover:bg-sky-50 group-hover:text-sky-700 text-slate-600 font-semibold px-2.5 py-1 rounded-full transition">
                  {dept.doctors}
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-600 transition">
                {dept.name}
              </h3>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">{dept.desc}</p>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center text-xs font-semibold text-sky-600 group-hover:translate-x-1 transition-transform">
                <span>View Specialists</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Verified Doctors */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-teal-600 block mb-1">
              Top Ranked Faculty
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">Meet Our Verified Physicians</h2>
            <p className="text-sm text-slate-600 mt-1">
              All doctors undergo strict licensing verification and hospital credential checks.
            </p>
          </div>
          <button
            onClick={() => navigate('/doctors')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
          >
            Explore all doctors <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredDoctors.slice(0, 3).map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                <div className="relative h-48 bg-slate-100 overflow-hidden">
                  <img
                    src={
                      doc.profileImage ||
                      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
                    }
                    alt={doc.fullName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{doc.rating}</span>
                    <span className="text-[10px] text-slate-600">({doc.reviewCount})</span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md">
                      {doc.specialization}
                    </span>
                    <span className="text-xs text-slate-600">• {doc.experienceYears} yrs experience</span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 leading-snug">{doc.fullName}</h3>
                  <p className="text-xs text-slate-600 line-clamp-2">{doc.bio}</p>

                  <div className="text-xs text-slate-600 pt-1">
                    <span className="font-semibold text-slate-700">Hospital:</span>{' '}
                    {doc.hospital?.name || 'City Central Hospital'}
                  </div>
                </div>
              </div>

              <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-600 block">Consultation Fee</span>
                  <span className="text-base font-extrabold text-slate-900">${doc.consultationFee}</span>
                </div>
                <button
                  onClick={() => navigate(`/doctors/${doc.id}`)}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  Book Slot
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="bg-slate-50 border-y border-slate-200 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600 block mb-1">
              End-to-End Clinical Flow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">How SmartCare Works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 text-center">
              <div className="w-12 h-12 mx-auto bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                1
              </div>
              <h3 className="font-bold text-base text-slate-900">Search or AI Triage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Enter your symptoms to receive instant department guidance, or filter verified doctors by hospital and fees.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 text-center">
              <div className="w-12 h-12 mx-auto bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                2
              </div>
              <h3 className="font-bold text-base text-slate-900">Real-Time Booking</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Select your preferred date and available 30-minute time slot. Protected by atomic lock prevention.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 text-center">
              <div className="w-12 h-12 mx-auto bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                3
              </div>
              <h3 className="font-bold text-base text-slate-900">Attend Consultation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Receive notifications and reminders. Consult with your doctor in-person or via secure teleconsultation.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 text-center">
              <div className="w-12 h-12 mx-auto bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center font-bold text-lg">
                4
              </div>
              <h3 className="font-bold text-base text-slate-900">Prescription & Records</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Access your digital prescription, treatment plan, follow-up dates, and lab reports anytime from your portal.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

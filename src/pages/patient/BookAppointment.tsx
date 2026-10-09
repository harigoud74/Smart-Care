import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { DoctorProfile } from '../../types';
import {
  Calendar,
  Clock,
  ShieldCheck,
  Stethoscope,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Building2,
  Star,
  Mic,
  Square,
  Sparkles,
} from 'lucide-react';
import { transcribeAudioWithGemini } from '../../services/geminiClient';
import { saveAppointmentToFirestore } from '../../firebase/firestoreService';
import { useAuth } from '../../context/AuthContext';

interface BookAppointmentProps {
  navigate: (path: string) => void;
  initialDoctorId?: string;
  initialDate?: string;
}

export const BookAppointment: React.FC<BookAppointmentProps> = ({
  navigate,
  initialDoctorId,
  initialDate,
}) => {
  const { user } = useAuth();
  const todayStr = new Date().toISOString().split('T')[0];

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);

  // Form State
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>(initialDoctorId || '');
  const [selectedDate, setSelectedDate] = useState<string>(initialDate || todayStr);
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [appointmentType, setAppointmentType] = useState<'IN_PERSON' | 'TELECONSULTATION'>('IN_PERSON');
  const [priority, setPriority] = useState<'ROUTINE' | 'URGENT'>('ROUTINE');
  const [reasonForVisit, setReasonForVisit] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceTranscribing, setVoiceTranscribing] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);

  // Dictate symptoms with microphone
  const toggleVoiceDictation = async () => {
    if (isVoiceRecording) {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        setIsVoiceRecording(false);
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = recorder;
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        setVoiceTranscribing(true);
        try {
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = (reader.result as string).split(',')[1];
            const transcribed = await transcribeAudioWithGemini({
              audioBase64: base64,
              mimeType: blob.type || 'audio/webm',
              prompt: 'Transcribe these patient symptoms accurately.',
            });
            setReasonForVisit((prev) => (prev ? `${prev} ${transcribed}` : transcribed));
            setVoiceTranscribing(false);
          };
          reader.readAsDataURL(blob);
        } catch (e) {
          setVoiceTranscribing(false);
        }
      };

      recorder.start();
      setIsVoiceRecording(true);
    } catch (e: any) {
      alert('Microphone access is required for speech dictation.');
    }
  };

  // Slots State
  const [slots, setSlots] = useState<any[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<any | null>(null);

  // Load doctors
  useEffect(() => {
    apiRequest<DoctorProfile[]>('/doctors').then((res) => {
      if (res.success && res.data) {
        setDoctors(res.data);
        if (!selectedDoctorId && res.data.length > 0) {
          setSelectedDoctorId(res.data[0].id);
        }
      }
      setLoadingDoctors(false);
    });
  }, []);

  // Fetch slots whenever doctor or date changes
  useEffect(() => {
    if (!selectedDoctorId || !selectedDate) return;

    setLoadingSlots(true);
    setError(null);
    setSelectedSlot('');
    setSelectedEndTime('');

    apiRequest<any>(`/appointments/slots?doctorId=${selectedDoctorId}&date=${selectedDate}`).then((res) => {
      if (res.success && res.data) {
        if (res.data.isDateBlocked) {
          setBlockedReason(res.data.blockedReason || 'Doctor is unavailable on this date.');
          setSlots([]);
        } else {
          setBlockedReason(null);
          setSlots(res.data.slots || []);
        }
      } else {
        setSlots([]);
      }
      setLoadingSlots(false);
    });
  }, [selectedDoctorId, selectedDate]);

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) {
      setError('Please select an available time slot.');
      return;
    }
    if (!reasonForVisit.trim()) {
      setError('Please specify the reason for your visit.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await apiRequest('/appointments', {
        method: 'POST',
        body: JSON.stringify({
          doctorId: selectedDoctorId,
          appointmentDate: selectedDate,
          appointmentTime: selectedSlot,
          endTime: selectedEndTime,
          type: appointmentType,
          priority,
          reasonForVisit,
        }),
      });

      if (res.success && res.data) {
        setBookingSuccess(res.data);
        // Persist appointment to Cloud Firestore database
        if (user?.id) {
          saveAppointmentToFirestore({
            id: res.data.id,
            patientId: user.id,
            patientName: (user as any).fullName || 'Patient',
            patientEmail: user.email || '',
            doctorId: selectedDoctorId,
            doctorName: selectedDoctor?.fullName || 'Physician',
            department: selectedDoctor?.specialization || 'Clinical Department',
            date: selectedDate,
            timeSlot: `${selectedSlot} - ${selectedEndTime}`,
            status: 'CONFIRMED',
            symptoms: reasonForVisit,
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setError(res.error || 'Failed to book appointment. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title */}
      <div className="space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
          Clinical Scheduling System
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Book a Medical Consultation
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select your specialist, date, and conflict-free 30-minute consultation slot.
        </p>
      </div>

      {bookingSuccess ? (
        <div className="bg-white rounded-3xl border border-emerald-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h2 className="text-2xl font-bold text-slate-900">Appointment Confirmed!</h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
            Your appointment with <strong>{selectedDoctor?.fullName}</strong> has been successfully booked for{' '}
            <strong>{bookingSuccess.appointmentDate}</strong> at <strong>{bookingSuccess.appointmentTime}</strong>.
          </p>

          <div className="bg-slate-50 rounded-2xl p-4 max-w-md mx-auto text-xs text-slate-700 text-left space-y-1.5 border border-slate-200">
            <div className="flex justify-between">
              <span className="text-slate-500">Specialist:</span>
              <span className="font-bold">{selectedDoctor?.fullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Department:</span>
              <span className="font-semibold">{selectedDoctor?.specialization}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Consultation Fee:</span>
              <span className="font-semibold">${selectedDoctor?.consultationFee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Visit Mode:</span>
              <span className="font-semibold text-purple-700">{bookingSuccess.type.replace('_', ' ')}</span>
            </div>
          </div>

          <div className="flex justify-center gap-3 pt-4">
            <button
              onClick={() => navigate('/patient/appointments')}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              View My Appointments
            </button>
            <button
              onClick={() => {
                setBookingSuccess(null);
                setReasonForVisit('');
                setSelectedSlot('');
              }}
              className="px-4 py-2.5 border border-slate-300 text-slate-700 font-semibold text-xs rounded-xl hover:bg-slate-50 transition cursor-pointer"
            >
              Book Another Visit
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleBookingSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-2xl flex items-start gap-2.5 font-medium">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block">Booking Conflict Detected:</strong>
                {error}
              </div>
            </div>
          )}

          {/* Step 1: Select Doctor */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-900">Select Attending Doctor</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {doctors.map((doc) => {
                const isSelected = selectedDoctorId === doc.id;
                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoctorId(doc.id)}
                    className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center gap-3.5 ${
                      isSelected
                        ? 'border-sky-600 bg-sky-50/60 ring-2 ring-sky-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <img
                      src={
                        doc.profileImage ||
                        'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
                      }
                      alt={doc.fullName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h4 className="font-bold text-xs text-slate-900 truncate">{doc.fullName}</h4>
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-[11px] text-sky-700 font-semibold truncate">{doc.specialization}</p>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1">
                        <span>{doc.hospital?.name || 'City Central Hospital'}</span>
                        <span className="font-bold text-slate-800">${doc.consultationFee}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Date & Available Slots */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h3 className="text-sm font-bold text-slate-900">Select Date & Available Time Slot</h3>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-slate-700">Date:</label>
                <input
                  type="date"
                  min={todayStr}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Slots selector */}
            <div>
              {loadingSlots ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Retrieving doctor schedule and verifying conflicts...
                </div>
              ) : blockedReason ? (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs font-medium">
                  {blockedReason}
                </div>
              ) : slots.length === 0 ? (
                <div className="p-4 bg-slate-50 border border-slate-200 text-slate-500 rounded-2xl text-xs text-center italic">
                  No slots configured for this day of the week. Please select another date.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Click on an available 30-min slot:</span>
                    <span className="text-sky-700 font-semibold">
                      {slots.filter((s) => s.isAvailable).length} slots available
                    </span>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {slots.map((slot, idx) => {
                      const isSelected = selectedSlot === slot.time;
                      return (
                        <button
                          key={idx}
                          type="button"
                          disabled={!slot.isAvailable}
                          onClick={() => {
                            setSelectedSlot(slot.time);
                            setSelectedEndTime(slot.endTime);
                            setError(null);
                          }}
                          className={`p-2.5 rounded-xl text-center text-xs font-bold border transition cursor-pointer ${
                            !slot.isAvailable
                              ? 'bg-slate-100 text-slate-400 border-slate-200 line-through cursor-not-allowed'
                              : isSelected
                              ? 'bg-sky-600 text-white border-sky-600 ring-2 ring-sky-500/30'
                              : 'bg-white hover:bg-sky-50 text-slate-800 border-slate-300'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Step 3: Appointment Details & Urgency */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-sky-50 text-sky-600 rounded-lg flex items-center justify-center font-bold text-xs">
                3
              </div>
              <h3 className="text-sm font-bold text-slate-900">Consultation Details</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Consultation Mode
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAppointmentType('IN_PERSON')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      appointmentType === 'IN_PERSON'
                        ? 'bg-sky-50 border-sky-600 text-sky-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    In-Person Hospital Visit
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppointmentType('TELECONSULTATION')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      appointmentType === 'TELECONSULTATION'
                        ? 'bg-purple-50 border-purple-600 text-purple-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Teleconsultation (Remote)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Priority / Urgency
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPriority('ROUTINE')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      priority === 'ROUTINE'
                        ? 'bg-emerald-50 border-emerald-600 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Routine Care
                  </button>
                  <button
                    type="button"
                    onClick={() => setPriority('URGENT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition cursor-pointer text-center ${
                      priority === 'URGENT'
                        ? 'bg-amber-50 border-amber-600 text-amber-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Urgent (Non-Emergency)
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Reason for Visit / Symptoms *
                </label>
                <button
                  type="button"
                  onClick={toggleVoiceDictation}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                    isVoiceRecording
                      ? 'bg-rose-100 border border-rose-300 text-rose-700 animate-pulse'
                      : voiceTranscribing
                      ? 'bg-amber-100 border border-amber-300 text-amber-800'
                      : 'bg-slate-100 hover:bg-sky-50 border border-slate-300 text-slate-700 hover:text-sky-700'
                  }`}
                >
                  {isVoiceRecording ? (
                    <>
                      <Square className="w-3.5 h-3.5 fill-current text-rose-600" />
                      <span>Stop Recording</span>
                    </>
                  ) : voiceTranscribing ? (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-600" />
                      <span>Transcribing (gemini-3.5-transcribe)...</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-3.5 h-3.5 text-sky-600" />
                      <span>Dictate with Mic</span>
                    </>
                  )}
                </button>
              </div>
              <textarea
                rows={3}
                required
                value={reasonForVisit}
                onChange={(e) => setReasonForVisit(e.target.value)}
                placeholder="Briefly describe your symptoms or reason for scheduling this visit, or dictate with your microphone..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Submission Bar */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate('/patient/dashboard')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              Cancel and Return
            </button>

            <button
              type="submit"
              disabled={submitting || !selectedSlot}
              className="px-6 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              {submitting ? 'Confirming Reservation...' : 'Confirm Appointment'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

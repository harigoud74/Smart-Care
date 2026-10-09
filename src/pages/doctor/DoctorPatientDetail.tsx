import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { PatientProfile, MedicalRecord, Prescription, MedicalDocument, Appointment } from '../../types';
import {
  User,
  Stethoscope,
  Pill,
  FileText,
  Activity,
  Plus,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { Modal } from '../../components/common/Modal';
import { PrintablePrescription } from '../../components/common/PrintablePrescription';

interface DoctorPatientDetailProps {
  patientId: string;
  appointmentId?: string;
  navigate: (path: string) => void;
}

export const DoctorPatientDetail: React.FC<DoctorPatientDetailProps> = ({
  patientId,
  appointmentId,
  navigate,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [addRecordModalOpen, setAddRecordModalOpen] = useState(false);
  const [addRxModalOpen, setAddRxModalOpen] = useState(false);
  const [viewRx, setViewRx] = useState<Prescription | null>(null);

  // Consultation Record Form
  const [recordForm, setRecordForm] = useState({
    consultationDate: todayStr,
    diagnosis: '',
    symptoms: '',
    clinicalNotes: '',
    treatmentPlan: '',
    followUpDate: '',
    vitalSigns: {
      bloodPressure: '120/80 mmHg',
      heartRate: '72 bpm',
      temperature: '98.6 °F',
      spo2: '99%',
      weight: '70 kg',
    },
  });
  const [submittingRecord, setSubmittingRecord] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  // Prescription Form
  const [rxForm, setRxForm] = useState({
    prescriptionDate: todayStr,
    diagnosis: '',
    instructions: '',
    dietAdvice: '',
    items: [
      { medicineName: '', dosage: '500mg', frequency: 'Twice a day (1-0-1)', duration: '5 days', instructions: 'After meals' },
    ],
  });
  const [submittingRx, setSubmittingRx] = useState(false);
  const [rxError, setRxError] = useState<string | null>(null);

  const fetchPatientDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiRequest<any>(`/doctors/portal/patients/${patientId}`);
      if (res.success && res.data) {
        setPatient(res.data.patient);
        setAppointments(res.data.appointments || []);
        setRecords(res.data.medicalRecords || []);
        setPrescriptions(res.data.prescriptions || []);
        setDocuments(res.data.documents || []);
      } else {
        setError(res.error || 'Unable to access patient record.');
      }
    } catch (err: any) {
      setError(err.message || 'Access error.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [patientId]);

  const handleAddRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordForm.diagnosis || !recordForm.clinicalNotes) {
      setRecordError('Diagnosis and clinical notes are required.');
      return;
    }

    setSubmittingRecord(true);
    setRecordError(null);

    const res = await apiRequest('/medical-records', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        appointmentId,
        ...recordForm,
      }),
    });

    setSubmittingRecord(false);

    if (res.success) {
      setAddRecordModalOpen(false);
      fetchPatientDetails();
    } else {
      setRecordError(res.error || 'Failed to save record.');
    }
  };

  const handleAddRxSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxForm.diagnosis || rxForm.items.length === 0 || !rxForm.items[0].medicineName) {
      setRxError('Diagnosis and at least one medication item are required.');
      return;
    }

    setSubmittingRx(true);
    setRxError(null);

    const res = await apiRequest('/prescriptions', {
      method: 'POST',
      body: JSON.stringify({
        patientId,
        appointmentId,
        ...rxForm,
      }),
    });

    setSubmittingRx(false);

    if (res.success) {
      setAddRxModalOpen(false);
      fetchPatientDetails();
    } else {
      setRxError(res.error || 'Failed to issue prescription.');
    }
  };

  const handleAddMedItem = () => {
    setRxForm({
      ...rxForm,
      items: [
        ...rxForm.items,
        { medicineName: '', dosage: '500mg', frequency: 'Twice daily', duration: '5 days', instructions: 'After meals' },
      ],
    });
  };

  const handleRemoveMedItem = (index: number) => {
    setRxForm({
      ...rxForm,
      items: rxForm.items.filter((_, idx) => idx !== index),
    });
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Verifying patient credentials and loading clinical history...</div>;
  }

  if (error || !patient) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full mx-auto flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-600 max-w-sm mx-auto">{error}</p>
        <button
          onClick={() => navigate('/doctor/dashboard')}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button
        onClick={() => navigate('/doctor/appointments')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-sky-700 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Appointments
      </button>

      {/* Patient Clinical Demographics Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-lg">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">{patient.fullName}</h1>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-xs font-bold">
                  Authorized Patient
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                DOB: {patient.dateOfBirth || 'N/A'} • Gender: {patient.gender || 'N/A'} • Phone: {patient.phone || 'N/A'}
              </p>
            </div>
          </div>

          {/* Quick Doctor Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setAddRecordModalOpen(true);
                setRecordError(null);
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" /> Record Consultation Notes
            </button>
            <button
              onClick={() => {
                setAddRxModalOpen(true);
                setRxError(null);
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Pill className="w-4 h-4" /> Issue Digital Rx
            </button>
          </div>
        </div>

        {/* Clinical Badges Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Blood Group</span>
            <span className="text-sm font-extrabold text-slate-900">{patient.bloodGroup || 'Not Recorded'}</span>
          </div>

          <div className="bg-rose-50/60 p-3 rounded-2xl border border-rose-200">
            <span className="text-[10px] text-rose-500 uppercase font-bold block">Allergies Warning</span>
            <span className="text-xs font-bold text-rose-800">{patient.allergies || 'None Recorded'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Emergency Contact</span>
            <span className="text-xs font-semibold text-slate-800">{patient.emergencyContact || 'None on file'}</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Residential Address</span>
            <span className="text-xs text-slate-700 truncate block">{patient.address || 'Address on file'}</span>
          </div>
        </div>

        {patient.medicalHistoryNotes && (
          <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-xs text-slate-700">
            <strong className="block text-slate-900 mb-0.5">Historical Health Notes:</strong>
            {patient.medicalHistoryNotes}
          </div>
        )}
      </div>

      {/* Clinical Timeline */}
      <div className="space-y-6">
        <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-sky-600" /> Patient Medical History & Timeline
          </h2>
          <span className="text-xs text-slate-500">
            {records.length} Consultations • {prescriptions.length} Prescriptions • {documents.length} Reports
          </span>
        </div>

        {/* Records */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            1. Consultation Summaries & Diagnoses
          </h3>
          {records.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No previous consultation notes recorded.</p>
          ) : (
            records.map((rec) => (
              <div key={rec.id} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs bg-sky-50 text-sky-800 px-2 py-0.5 rounded">
                    Date: {rec.consultationDate}
                  </span>
                  <span className="text-xs text-slate-500">Dr. {rec.doctor?.fullName}</span>
                </div>
                <h4 className="text-sm font-bold text-slate-900">{rec.diagnosis}</h4>
                <p className="text-xs text-slate-600">{rec.clinicalNotes}</p>
                {rec.treatmentPlan && (
                  <p className="text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                    <strong>Treatment Plan:</strong> {rec.treatmentPlan}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* Prescriptions */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            2. Prescriptions History
          </h3>
          {prescriptions.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No prescriptions issued for this patient.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {prescriptions.map((rx) => (
                <div key={rx.id} className="bg-white rounded-2xl border border-slate-200 p-4 space-y-2 shadow-xs">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{rx.diagnosis}</span>
                    <span className="text-slate-500">{rx.prescriptionDate}</span>
                  </div>
                  <div className="text-xs text-slate-600 space-y-1">
                    {rx.items.map((it, i) => (
                      <div key={i} className="flex justify-between bg-slate-50 px-2 py-1 rounded">
                        <span>{it.medicineName}</span>
                        <span className="font-semibold text-slate-700">{it.frequency}</span>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setViewRx(rx)}
                    className="w-full py-1.5 text-xs font-semibold bg-sky-50 text-sky-700 rounded-lg flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" /> View Prescription Document
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Uploaded Documents */}
        <div className="space-y-4 pt-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            3. Patient Uploaded Lab Reports & Diagnostic Scans
          </h3>
          {documents.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No external documents uploaded by patient.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {documents.map((doc) => (
                <div key={doc.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1 text-xs">
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded">
                    {doc.documentType}
                  </span>
                  <h5 className="font-bold text-slate-900 truncate">{doc.title}</h5>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{doc.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      <Modal
        isOpen={addRecordModalOpen}
        onClose={() => setAddRecordModalOpen(false)}
        title="Record Clinical Consultation & Diagnosis"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddRecordSubmit} className="space-y-4">
          {recordError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {recordError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Consultation Date</label>
              <input
                type="date"
                required
                value={recordForm.consultationDate}
                onChange={(e) => setRecordForm({ ...recordForm, consultationDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Clinical Diagnosis *</label>
              <input
                type="text"
                required
                value={recordForm.diagnosis}
                onChange={(e) => setRecordForm({ ...recordForm, diagnosis: e.target.value })}
                placeholder="e.g. Acute Sinus Tachycardia"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Symptoms Reported</label>
            <input
              type="text"
              value={recordForm.symptoms}
              onChange={(e) => setRecordForm({ ...recordForm, symptoms: e.target.value })}
              placeholder="e.g. Mild palpitations, post-workout fatigue"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Clinical Examination Notes *</label>
            <textarea
              rows={3}
              required
              value={recordForm.clinicalNotes}
              onChange={(e) => setRecordForm({ ...recordForm, clinicalNotes: e.target.value })}
              placeholder="Auscultation, palpation, observations..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          {/* Vitals */}
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 uppercase">Vital Signs (Optional)</span>
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="BP (120/80)"
                value={recordForm.vitalSigns.bloodPressure}
                onChange={(e) =>
                  setRecordForm({
                    ...recordForm,
                    vitalSigns: { ...recordForm.vitalSigns, bloodPressure: e.target.value },
                  })
                }
                className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              />
              <input
                type="text"
                placeholder="Pulse (72 bpm)"
                value={recordForm.vitalSigns.heartRate}
                onChange={(e) =>
                  setRecordForm({
                    ...recordForm,
                    vitalSigns: { ...recordForm.vitalSigns, heartRate: e.target.value },
                  })
                }
                className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              />
              <input
                type="text"
                placeholder="SpO2 (99%)"
                value={recordForm.vitalSigns.spo2}
                onChange={(e) =>
                  setRecordForm({
                    ...recordForm,
                    vitalSigns: { ...recordForm.vitalSigns, spo2: e.target.value },
                  })
                }
                className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Treatment Plan</label>
              <input
                type="text"
                value={recordForm.treatmentPlan}
                onChange={(e) => setRecordForm({ ...recordForm, treatmentPlan: e.target.value })}
                placeholder="e.g. Hydration, diet modification"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Follow-up Date</label>
              <input
                type="date"
                value={recordForm.followUpDate}
                onChange={(e) => setRecordForm({ ...recordForm, followUpDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddRecordModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRecord}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-lg shadow-xs"
            >
              {submittingRecord ? 'Saving...' : 'Save Consultation Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Rx Modal */}
      <Modal
        isOpen={addRxModalOpen}
        onClose={() => setAddRxModalOpen(false)}
        title="Issue Digital Prescription (Rx)"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddRxSubmit} className="space-y-4">
          {rxError && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {rxError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Prescription Date</label>
              <input
                type="date"
                required
                value={rxForm.prescriptionDate}
                onChange={(e) => setRxForm({ ...rxForm, prescriptionDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Indication / Diagnosis *</label>
              <input
                type="text"
                required
                value={rxForm.diagnosis}
                onChange={(e) => setRxForm({ ...rxForm, diagnosis: e.target.value })}
                placeholder="e.g. Mild Hypertension"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Medicine Items */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold uppercase text-slate-700">Medications List (Rx)</span>
              <button
                type="button"
                onClick={handleAddMedItem}
                className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>

            {rxForm.items.map((item, idx) => (
              <div key={idx} className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800">Item #{idx + 1}</span>
                  {rxForm.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMedItem(idx)}
                      className="text-rose-600 text-xs hover:underline cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Medicine Name (e.g. Amoxicillin)"
                    value={item.medicineName}
                    onChange={(e) => {
                      const updated = [...rxForm.items];
                      updated[idx].medicineName = e.target.value;
                      setRxForm({ ...rxForm, items: updated });
                    }}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white sm:col-span-2 font-medium"
                  />
                  <input
                    type="text"
                    placeholder="Dosage (500mg)"
                    value={item.dosage}
                    onChange={(e) => {
                      const updated = [...rxForm.items];
                      updated[idx].dosage = e.target.value;
                      setRxForm({ ...rxForm, items: updated });
                    }}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                  <input
                    type="text"
                    placeholder="Frequency (1-0-1)"
                    value={item.frequency}
                    onChange={(e) => {
                      const updated = [...rxForm.items];
                      updated[idx].frequency = e.target.value;
                      setRxForm({ ...rxForm, items: updated });
                    }}
                    className="p-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                  />
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-700 mb-1">Clinical Instructions</label>
            <input
              type="text"
              value={rxForm.instructions}
              onChange={(e) => setRxForm({ ...rxForm, instructions: e.target.value })}
              placeholder="e.g. Take with full glass of water, complete entire 5-day course"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAddRxModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submittingRx}
              className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-lg shadow-xs"
            >
              {submittingRx ? 'Issuing...' : 'Issue Electronic Prescription'}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Rx Modal */}
      <Modal
        isOpen={!!viewRx}
        onClose={() => setViewRx(null)}
        title="Electronic Prescription Document"
        maxWidth="max-w-3xl"
      >
        {viewRx && <PrintablePrescription prescription={viewRx} />}
      </Modal>
    </div>
  );
};

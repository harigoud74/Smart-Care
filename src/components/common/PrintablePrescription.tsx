import React from 'react';
import { Prescription } from '../../types';
import { Printer, ShieldCheck, HeartPulse } from 'lucide-react';

interface PrintablePrescriptionProps {
  prescription: Prescription;
  onClose?: () => void;
}

export const PrintablePrescription: React.FC<PrintablePrescriptionProps> = ({
  prescription,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  const doctor = prescription.doctor;
  const patient = prescription.patient;

  return (
    <div className="bg-white text-slate-900 rounded-xl overflow-hidden print:p-0">
      <div className="flex justify-end gap-2 mb-4 print:hidden">
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold rounded-lg shadow-xs transition cursor-pointer"
        >
          <Printer className="w-4 h-4" /> Print Prescription
        </button>
      </div>

      <div className="border border-slate-300 rounded-xl p-8 bg-white print:border-none print:shadow-none">
        {/* Header */}
        <div className="flex justify-between items-start border-b-2 border-sky-600 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-sky-600 text-white rounded-xl flex items-center justify-center font-bold text-xl shadow-xs">
              <HeartPulse className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {doctor?.hospitalName || 'SmartCare Multi-Specialty Health Network'}
              </h2>
              <p className="text-xs text-slate-500">
                {doctor?.hospitalAddress || '100 Healthcare Parkway, Medical District'}
              </p>
              <p className="text-xs text-slate-500">
                Phone: {doctor?.hospitalPhone || '+1 (555) 019-2831'} • Emergency 24/7
              </p>
            </div>
          </div>
          <div className="text-right">
            <h3 className="text-base font-bold text-sky-800">{doctor?.fullName || 'Attending Physician'}</h3>
            <p className="text-xs text-slate-600 font-medium">{doctor?.specialization}</p>
            <p className="text-xs text-slate-500">{doctor?.qualification}</p>
            <p className="text-xs text-slate-500">License: {doctor?.licenseNumber}</p>
          </div>
        </div>

        {/* Patient Details Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 my-3 bg-slate-50 rounded-lg px-4 border border-slate-200 text-xs">
          <div>
            <span className="text-slate-500 block">Patient Name:</span>
            <span className="font-bold text-slate-900">{patient?.fullName || 'Patient'}</span>
          </div>
          <div>
            <span className="text-slate-500 block">Gender / Blood Group:</span>
            <span className="font-semibold text-slate-800">
              {patient?.gender || 'N/A'} • {patient?.bloodGroup || 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block">Allergies:</span>
            <span className="font-semibold text-rose-600">{patient?.allergies || 'None Recorded'}</span>
          </div>
          <div className="text-right sm:text-left">
            <span className="text-slate-500 block">Date of Rx:</span>
            <span className="font-semibold text-slate-800">{prescription.prescriptionDate}</span>
          </div>
        </div>

        {/* Diagnosis */}
        <div className="mb-6">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">
            Clinical Diagnosis
          </div>
          <div className="bg-sky-50/60 border border-sky-100 rounded-lg p-3 text-sm font-semibold text-sky-950">
            {prescription.diagnosis}
          </div>
        </div>

        {/* Rx Symbol & Medication Table */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="font-serif italic font-bold text-3xl text-sky-700 leading-none">℞</span>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Prescribed Medications
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-200 rounded-lg">
              <thead className="bg-slate-100 text-slate-700 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-2.5 border-b border-slate-200">#</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Medicine & Strength</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Dosage</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Frequency</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Duration</th>
                  <th className="px-4 py-2.5 border-b border-slate-200">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {prescription.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-medium text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{item.medicineName}</td>
                    <td className="px-4 py-3 text-slate-700">{item.dosage}</td>
                    <td className="px-4 py-3 font-medium text-sky-700">{item.frequency}</td>
                    <td className="px-4 py-3 text-slate-700">{item.duration}</td>
                    <td className="px-4 py-3 text-slate-600">{item.instructions || 'As advised'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Instructions & Dietary Advice */}
        {(prescription.instructions || prescription.dietAdvice) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
            {prescription.instructions && (
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Doctor's Clinical Advice:</span>
                <p className="text-slate-600">{prescription.instructions}</p>
              </div>
            )}
            {prescription.dietAdvice && (
              <div className="bg-emerald-50/60 p-3.5 rounded-lg border border-emerald-200">
                <span className="font-bold text-emerald-800 block mb-1">Diet & Lifestyle Guidelines:</span>
                <p className="text-emerald-900">{prescription.dietAdvice}</p>
              </div>
            )}
          </div>
        )}

        {/* Footer & Signature Stamp */}
        <div className="border-t border-slate-200 pt-6 mt-6 flex justify-between items-end text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <p className="font-semibold text-slate-700">Electronically Signed & Authenticated</p>
              <p className="text-[10px]">SmartCare Health Records Verification ID: {prescription.id}</p>
            </div>
          </div>

          <div className="text-center w-48">
            <div className="border-b border-slate-400 pb-1 mb-1 font-serif italic text-slate-800 text-sm">
              {doctor?.fullName}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
              Authorized Medical Officer
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

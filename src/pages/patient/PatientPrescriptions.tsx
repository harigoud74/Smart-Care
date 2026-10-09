import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Prescription } from '../../types';
import { PrintablePrescription } from '../../components/common/PrintablePrescription';
import { Modal } from '../../components/common/Modal';
import { FileText, Printer, Stethoscope, Calendar, Pill } from 'lucide-react';

export const PatientPrescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<Prescription | null>(null);

  useEffect(() => {
    apiRequest<Prescription[]>('/patients/prescriptions').then((res) => {
      if (res.success && res.data) {
        setPrescriptions(res.data);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
          Digital Pharmacy & Orders
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          My Digital Prescriptions
        </h1>
        <p className="text-xs text-slate-500">
          Official e-prescriptions issued by verified physicians with verified dosages and intake schedules.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading prescriptions...</div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <Pill className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No active prescriptions</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Prescriptions issued during consultations will be available here for digital printout.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:border-sky-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2.5 py-0.5 rounded-full">
                    Rx Date: {rx.prescriptionDate}
                  </span>
                  <span className="text-xs text-slate-500">
                    By: <strong>{rx.doctor?.fullName || 'Physician'}</strong> ({rx.doctor?.specialization})
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{rx.diagnosis}</h3>

                {/* Items preview pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {rx.items.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold"
                    >
                      <Pill className="w-3 h-3 text-sky-600" />
                      {item.medicineName} ({item.dosage})
                    </span>
                  ))}
                </div>

                {rx.instructions && (
                  <p className="text-xs text-slate-600 italic pt-1">
                    "{rx.instructions}"
                  </p>
                )}
              </div>

              <button
                onClick={() => setSelectedRx(rx)}
                className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Printer className="w-4 h-4" /> View & Print Prescription
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Printable Modal */}
      <Modal
        isOpen={!!selectedRx}
        onClose={() => setSelectedRx(null)}
        title="Electronic Prescription Document"
        maxWidth="max-w-3xl"
      >
        {selectedRx && <PrintablePrescription prescription={selectedRx} />}
      </Modal>
    </div>
  );
};

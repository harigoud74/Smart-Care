import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { MedicalRecord } from '../../types';
import {
  FileText,
  Activity,
  HeartPulse,
  Calendar,
  User,
  Stethoscope,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export const PatientRecords: React.FC = () => {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<MedicalRecord[]>('/patients/medical-records').then((res) => {
      if (res.success && res.data) {
        setRecords(res.data);
        if (res.data.length > 0) {
          setExpandedId(res.data[0].id);
        }
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
          Electronic Health Records
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Clinical Consultation Records
        </h1>
        <p className="text-xs text-slate-500">
          Confidential medical summaries entered by attending licensed physicians.
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading medical records...</div>
      ) : records.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No consultation records on file</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Clinical diagnoses, examination findings, and follow-up schedules will be compiled here after your doctor consultations.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {records.map((rec) => {
            const isExpanded = expandedId === rec.id;
            return (
              <div
                key={rec.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:border-sky-300 transition"
              >
                {/* Header Row */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : rec.id)}
                  className="p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-2xl flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md">
                          {rec.consultationDate}
                        </span>
                        <span className="text-xs text-slate-500">
                          Attending: <strong>{rec.doctor?.fullName || 'Physician'}</strong>
                        </span>
                      </div>
                      <h3 className="font-bold text-sm sm:text-base text-slate-900 truncate mt-1">
                        {rec.diagnosis}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-sky-600 font-semibold hidden sm:inline">
                      {isExpanded ? 'Hide Notes' : 'View Clinical Details'}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="px-6 pb-6 pt-2 border-t border-slate-100 space-y-5 text-xs bg-slate-50/30">
                    {/* Symptoms & Notes */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {rec.symptoms && (
                        <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                          <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                            Patient Symptoms
                          </span>
                          <p className="text-slate-600 leading-relaxed">{rec.symptoms}</p>
                        </div>
                      )}

                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-1">
                        <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px]">
                          Clinical Examination & Notes
                        </span>
                        <p className="text-slate-600 leading-relaxed">{rec.clinicalNotes}</p>
                      </div>
                    </div>

                    {/* Vitals signs if present */}
                    {rec.vitalSigns && (
                      <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                        <span className="font-bold text-slate-700 block uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-sky-600" /> Recorded Vital Signs
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 pt-1">
                          {rec.vitalSigns.bloodPressure && (
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                              <span className="text-[10px] text-slate-400 block font-bold">BP</span>
                              <span className="font-bold text-slate-800">{rec.vitalSigns.bloodPressure}</span>
                            </div>
                          )}
                          {rec.vitalSigns.heartRate && (
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                              <span className="text-[10px] text-slate-400 block font-bold">Pulse</span>
                              <span className="font-bold text-slate-800">{rec.vitalSigns.heartRate}</span>
                            </div>
                          )}
                          {rec.vitalSigns.temperature && (
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                              <span className="text-[10px] text-slate-400 block font-bold">Temp</span>
                              <span className="font-bold text-slate-800">{rec.vitalSigns.temperature}</span>
                            </div>
                          )}
                          {rec.vitalSigns.spo2 && (
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                              <span className="text-[10px] text-slate-400 block font-bold">SpO2</span>
                              <span className="font-bold text-slate-800">{rec.vitalSigns.spo2}</span>
                            </div>
                          )}
                          {rec.vitalSigns.weight && (
                            <div className="bg-slate-50 p-2 rounded-xl text-center">
                              <span className="text-[10px] text-slate-400 block font-bold">Weight</span>
                              <span className="font-bold text-slate-800">{rec.vitalSigns.weight}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Treatment Plan & Followup */}
                    {(rec.treatmentPlan || rec.followUpDate) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {rec.treatmentPlan && (
                          <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 space-y-1">
                            <span className="font-bold text-emerald-900 block uppercase tracking-wider text-[10px]">
                              Treatment & Care Plan
                            </span>
                            <p className="text-emerald-950 leading-relaxed">{rec.treatmentPlan}</p>
                          </div>
                        )}
                        {rec.followUpDate && (
                          <div className="bg-sky-50/60 p-4 rounded-2xl border border-sky-200 space-y-1">
                            <span className="font-bold text-sky-900 block uppercase tracking-wider text-[10px]">
                              Recommended Follow-up Visit
                            </span>
                            <p className="text-sky-950 font-bold">Schedule next consultation by: {rec.followUpDate}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

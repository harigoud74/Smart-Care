import React, { useState } from 'react';
import { Modal } from './Modal';
import { apiRequest } from '../../services/api';
import { DoctorProfile } from '../../types';
import { Sparkles, AlertTriangle, ArrowRight, ShieldCheck, Stethoscope, Clock, Star } from 'lucide-react';
import { StatusBadge } from './Badge';

interface RecommendationResponse {
  recommendedDepartment: string;
  confidenceScore: number;
  reasoning: string;
  suggestedSpecialty: string;
  isEmergency: boolean;
  emergencyWarning?: string;
  disclaimer: string;
  matchedDoctors: DoctorProfile[];
  urgencyRecommendation: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
}

interface SmartRecommendationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectDoctor?: (doctor: DoctorProfile) => void;
}

export const SmartRecommendationModal: React.FC<SmartRecommendationModalProps> = ({
  isOpen,
  onClose,
  onSelectDoctor,
}) => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const QUICK_EXAMPLES = [
    'Persistent knee pain and difficulty walking',
    'Palpitations and racing heart after light jog',
    'Severe red rash and skin itching',
    'Throbbing migraine headache with light sensitivity',
    'Child has high fever and persistent dry cough',
  ];

  const handleAnalyze = async (queryText?: string) => {
    const textToSubmit = queryText || symptoms;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await apiRequest<RecommendationResponse>('/recommendations', {
        method: 'POST',
        body: JSON.stringify({ symptoms: textToSubmit }),
      });

      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.error || 'Could not process recommendation. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Error occurred while contacting recommendation service.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSymptoms('');
    setResult(null);
    setError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Smart Doctor & Department Recommendation"
      maxWidth="max-w-3xl"
    >
      <div className="space-y-5">
        {/* Header Notice */}
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 text-xs text-sky-900 flex items-start gap-3">
          <div className="p-1.5 bg-sky-600 text-white rounded-lg shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-sky-950 text-sm">AI-Assisted Healthcare Navigation</p>
            <p className="mt-0.5 text-sky-800">
              Describe your health concern or symptoms below in natural language. Our clinical guidance engine
              will navigate you to the most appropriate medical department and available specialists.
            </p>
          </div>
        </div>

        {/* Input Form */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Describe Your Symptoms or Care Requirement
          </label>
          <div className="flex gap-2">
            <textarea
              rows={3}
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I have sharp knee pain when bending and my ankle feels stiff in the mornings..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          {/* Quick suggestions */}
          <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-slate-600">Try common inquiries:</span>
            {QUICK_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setSymptoms(ex);
                  handleAnalyze(ex);
                }}
                className="text-[11px] bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 px-2 py-1 rounded-md transition cursor-pointer"
              >
                {ex}
              </button>
            ))}
          </div>

          <div className="mt-4 flex justify-between items-center">
            {result && (
              <button
                type="button"
                onClick={handleReset}
                className="text-xs text-slate-700 hover:text-slate-900 font-semibold cursor-pointer"
              >
                Clear Results & Try Again
              </button>
            )}
            <div className="ml-auto">
              <button
                type="button"
                disabled={loading || !symptoms.trim()}
                onClick={() => handleAnalyze()}
                className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-semibold text-sm rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
              >
                {loading ? (
                  <>Processing Symptoms...</>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Recommend Specialists
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Results Area */}
        {result && (
          <div className="space-y-4 pt-2 border-t border-slate-200">
            {/* Emergency Alert if triggered */}
            {result.isEmergency && (
              <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-4 text-rose-900">
                <div className="flex items-center gap-2 font-bold text-base text-rose-700">
                  <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
                  EMERGENCY WARNING
                </div>
                <p className="mt-2 text-xs font-medium leading-relaxed">
                  {result.emergencyWarning}
                </p>
                <div className="mt-3">
                  <a
                    href="tel:911"
                    className="inline-flex items-center gap-2 bg-rose-600 text-white font-bold px-4 py-2 rounded-lg text-xs hover:bg-rose-700 shadow-xs"
                  >
                    Call Emergency Services (911)
                  </a>
                </div>
              </div>
            )}

            {/* Department Match Banner */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Recommended Department
                  </span>
                  <h4 className="text-xl font-bold text-sky-900 flex items-center gap-2">
                    <Stethoscope className="w-5 h-5 text-sky-600" />
                    {result.recommendedDepartment}
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={result.urgencyRecommendation} />
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-1 rounded-full">
                    {Math.round(result.confidenceScore * 100)}% Clinical Match
                  </span>
                </div>
              </div>

              <div className="mt-3 text-xs text-slate-700 bg-white p-3 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-900">Clinical Reasoning: </span>
                {result.reasoning}
              </div>
            </div>

            {/* Matched Verified Doctors */}
            <div>
              <h5 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                Available Verified Specialists in {result.recommendedDepartment}
              </h5>

              {result.matchedDoctors.length === 0 ? (
                <p className="text-xs text-slate-500 italic">
                  No verified doctors currently registered under this specialty.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {result.matchedDoctors.map((doc) => (
                    <div
                      key={doc.id}
                      className="border border-slate-200 bg-white rounded-xl p-3.5 hover:border-sky-300 hover:shadow-xs transition flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        <img
                          src={
                            doc.profileImage ||
                            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200'
                          }
                          alt={doc.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <h6 className="font-bold text-slate-900 text-xs truncate">{doc.fullName}</h6>
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          </div>
                          <p className="text-[11px] text-sky-700 font-medium truncate">{doc.specialization}</p>
                          <p className="text-[10px] text-slate-500 truncate">{doc.qualification}</p>
                          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-600">
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              {doc.rating} ({doc.reviewCount})
                            </span>
                            <span>•</span>
                            <span className="font-semibold text-slate-700">${doc.consultationFee}/visit</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectDoctor) {
                              onSelectDoctor(doc);
                            }
                            onClose();
                          }}
                          className="text-xs bg-sky-600 hover:bg-sky-700 text-white font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition cursor-pointer"
                        >
                          Book Appointment <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mandatory Medical Disclaimer */}
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 leading-relaxed">
              <span className="font-bold block text-amber-950">Clinical Disclaimer:</span>
              {result.disclaimer}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

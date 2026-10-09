import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { DoctorProfile } from '../../types';
import { StatusBadge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Stethoscope,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  Building2,
  Eye,
} from 'lucide-react';

export const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [inspectDoc, setInspectDoc] = useState<any | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/admin/doctors');
    if (res.success && res.data) {
      setDoctors(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleUpdateStatus = async (id: string, status: string, remarks?: string) => {
    await apiRequest(`/admin/doctors/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, remarks: remarks || `Administrative action by System Administrator` }),
    });
    fetchDoctors();
    if (inspectDoc && inspectDoc.id === id) {
      setInspectDoc(null);
    }
  };

  const filtered = doctors.filter((doc) => {
    const matchesStatus = statusFilter === 'ALL' || doc.status === statusFilter;
    const matchesSearch =
      doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.email && doc.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
            Medical Faculty Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Doctor Credentialing & Verification
          </h1>
          <p className="text-xs text-slate-500">
            Review physician registration applications, verify medical licenses, or suspend accounts.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, license, specialty..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold flex-wrap">
        {['ALL', 'PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
              statusFilter === st
                ? 'bg-sky-50 text-sky-700 font-bold border border-sky-200'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {st === 'ALL' ? 'All Doctors' : st}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading physician directory...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">No doctors match this filter.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Doctor & Credentials</th>
                  <th className="px-5 py-3.5">Specialization</th>
                  <th className="px-5 py-3.5">License Number</th>
                  <th className="px-5 py-3.5">Hospital</th>
                  <th className="px-5 py-3.5">Fee</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            doc.profileImage ||
                            'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'
                          }
                          alt={doc.fullName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <strong className="text-slate-900 block font-bold">{doc.fullName}</strong>
                          <span className="text-[11px] text-slate-500">{doc.email}</span>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-semibold text-slate-800">{doc.specialization}</span>
                      <span className="text-[10px] text-slate-500 block">{doc.experienceYears} yrs exp</span>
                    </td>

                    <td className="px-5 py-4 font-mono font-bold text-slate-800">
                      {doc.licenseNumber}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {doc.hospitalName || 'City Central Hospital'}
                    </td>

                    <td className="px-5 py-4 font-bold text-slate-900">
                      ${doc.consultationFee}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={doc.status} />
                    </td>

                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectDoc(doc)}
                          className="px-2.5 py-1 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg font-semibold cursor-pointer"
                          title="Inspect credentials"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {doc.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateStatus(doc.id, 'VERIFIED')}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-2xs transition cursor-pointer"
                            >
                              Verify
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(doc.id, 'REJECTED')}
                              className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg font-semibold transition cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {doc.status === 'VERIFIED' && (
                          <button
                            onClick={() => handleUpdateStatus(doc.id, 'SUSPENDED')}
                            className="px-2.5 py-1 text-amber-700 hover:bg-amber-50 border border-amber-200 rounded-lg font-semibold transition cursor-pointer"
                          >
                            Suspend
                          </button>
                        )}

                        {doc.status === 'SUSPENDED' && (
                          <button
                            onClick={() => handleUpdateStatus(doc.id, 'VERIFIED')}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition cursor-pointer"
                          >
                            Reactivate
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspect Doctor Modal */}
      <Modal
        isOpen={!!inspectDoc}
        onClose={() => setInspectDoc(null)}
        title="Physician Credentials Review"
        maxWidth="max-w-lg"
      >
        {inspectDoc && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img
                src={inspectDoc.profileImage || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=150'}
                alt={inspectDoc.fullName}
                className="w-14 h-14 rounded-xl object-cover border border-slate-200"
              />
              <div>
                <h3 className="font-bold text-sm text-slate-900">{inspectDoc.fullName}</h3>
                <p className="text-sky-700 font-semibold">{inspectDoc.specialization}</p>
                <p className="text-slate-500">{inspectDoc.email}</p>
              </div>
            </div>

            <div className="space-y-2 p-3 bg-white rounded-2xl border border-slate-200">
              <div className="flex justify-between">
                <span className="text-slate-500">Medical License:</span>
                <span className="font-mono font-bold text-slate-900">{inspectDoc.licenseNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Qualifications:</span>
                <span className="font-semibold text-slate-900">{inspectDoc.qualification}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Clinical Experience:</span>
                <span className="font-semibold text-slate-900">{inspectDoc.experienceYears} Years</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Hospital:</span>
                <span className="font-semibold text-slate-900">{inspectDoc.hospitalName || 'City Central'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Account Status:</span>
                <StatusBadge status={inspectDoc.status} />
              </div>
            </div>

            {inspectDoc.bio && (
              <div className="p-3 bg-slate-50 rounded-xl text-slate-700 leading-relaxed">
                <strong className="block text-slate-900 mb-1">Physician Bio:</strong>
                {inspectDoc.bio}
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              {inspectDoc.status !== 'VERIFIED' && (
                <button
                  onClick={() => handleUpdateStatus(inspectDoc.id, 'VERIFIED')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Verify Doctor
                </button>
              )}
              {inspectDoc.status === 'VERIFIED' && (
                <button
                  onClick={() => handleUpdateStatus(inspectDoc.id, 'SUSPENDED')}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Suspend Doctor
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

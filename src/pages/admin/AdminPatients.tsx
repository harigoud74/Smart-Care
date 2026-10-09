import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Users, Search, CheckCircle2, XCircle, ShieldCheck, ShieldAlert } from 'lucide-react';

export const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchPatients = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/admin/patients');
    if (res.success && res.data) {
      setPatients(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleToggleUserStatus = async (userId: string) => {
    await apiRequest(`/admin/users/${userId}/toggle-status`, { method: 'PUT' });
    fetchPatients();
  };

  const filtered = patients.filter(
    (p) =>
      p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (p.phone && p.phone.includes(searchTerm)) ||
      (p.bloodGroup && p.bloodGroup.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
            Patient User Administration
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Registered Patients Directory
          </h1>
          <p className="text-xs text-slate-500">
            Inspect enrolled patient profiles and manage platform access privileges.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading patients database...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">No patients match this search query.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-700 font-semibold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Patient Details</th>
                  <th className="px-5 py-3.5">Demographics</th>
                  <th className="px-5 py-3.5">Blood Group & Allergies</th>
                  <th className="px-5 py-3.5">Visits / Records</th>
                  <th className="px-5 py-3.5">Account Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((pat) => (
                  <tr key={pat.id} className="hover:bg-slate-50/60 transition">
                    <td className="px-5 py-4">
                      <strong className="text-slate-900 block font-bold">{pat.fullName}</strong>
                      <span className="text-[11px] text-slate-500">{pat.email}</span>
                      {pat.phone && <span className="text-[10px] text-slate-400 block">{pat.phone}</span>}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      <div>DOB: {pat.dateOfBirth || 'N/A'}</div>
                      <div>Gender: {pat.gender || 'N/A'}</div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded text-[11px]">
                        {pat.bloodGroup || 'N/A'}
                      </span>
                      {pat.allergies && (
                        <span className="text-[10px] text-rose-600 block mt-1">
                          Allergies: {pat.allergies}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      <span className="font-bold">{pat.appointmentsCount}</span> Consultations
                      <span className="text-[10px] text-slate-400 block">{pat.recordsCount} Clinical Records</span>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          pat.isActive
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`}
                      >
                        {pat.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => handleToggleUserStatus(pat.userId)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                          pat.isActive
                            ? 'text-rose-600 hover:bg-rose-50 border-rose-200'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 border-transparent'
                        }`}
                      >
                        {pat.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

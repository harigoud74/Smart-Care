import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { Hospital, Department } from '../../types';
import { Building2, Plus, PhoneCall, Mail, MapPin, CheckCircle2 } from 'lucide-react';
import { Modal } from '../../components/common/Modal';

export const AdminHospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // New Hospital Modal
  const [hospModalOpen, setHospModalOpen] = useState(false);
  const [hospForm, setHospForm] = useState({ name: '', address: '', city: '', contactPhone: '', contactEmail: '' });

  // New Department Modal
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptForm, setDeptForm] = useState({ name: '', description: '', hospitalId: '' });

  const fetchData = async () => {
    setLoading(true);
    const [hRes, dRes] = await Promise.all([
      apiRequest<Hospital[]>('/admin/hospitals'),
      apiRequest<Department[]>('/admin/departments'),
    ]);
    if (hRes.success && hRes.data) setHospitals(hRes.data);
    if (dRes.success && dRes.data) setDepartments(dRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/admin/hospitals', {
      method: 'POST',
      body: JSON.stringify(hospForm),
    });
    if (res.success) {
      setHospModalOpen(false);
      setHospForm({ name: '', address: '', city: '', contactPhone: '', contactEmail: '' });
      fetchData();
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await apiRequest('/admin/departments', {
      method: 'POST',
      body: JSON.stringify(deptForm),
    });
    if (res.success) {
      setDeptModalOpen(false);
      setDeptForm({ name: '', description: '', hospitalId: '' });
      fetchData();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
          Hospital Infrastructure
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Hospitals & Clinical Departments
        </h1>
        <p className="text-xs text-slate-500">
          Maintain partner healthcare facilities, outpatient departments, and clinical specialty wings.
        </p>
      </div>

      {/* Hospitals Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-sky-600" /> Hospital Facilities
          </h2>
          <button
            onClick={() => setHospModalOpen(true)}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Hospital Campus
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hospitals.map((h) => (
            <div
              key={h.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 transition space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-slate-900">{h.name}</h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active Campus" />
              </div>

              <div className="text-xs text-slate-600 space-y-1.5">
                <p className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{h.address}, {h.city}</span>
                </p>
                <p className="flex items-center gap-2">
                  <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{h.contactPhone}</span>
                </p>
                {h.contactEmail && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{h.contactEmail}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Clinical Departments Grid */}
      <div className="space-y-4 pt-4 border-t border-slate-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Clinical Specialties & Wings</h2>
          <button
            onClick={() => setDeptModalOpen(true)}
            className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Department
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:border-teal-300 transition space-y-1.5"
            >
              <h3 className="font-bold text-sm text-slate-900">{dept.name}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{dept.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Add Hospital Modal */}
      <Modal isOpen={hospModalOpen} onClose={() => setHospModalOpen(false)} title="Add Hospital Facility">
        <form onSubmit={handleCreateHospital} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Hospital Name *</label>
            <input
              type="text"
              required
              value={hospForm.name}
              onChange={(e) => setHospForm({ ...hospForm, name: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Street Address *</label>
            <input
              type="text"
              required
              value={hospForm.address}
              onChange={(e) => setHospForm({ ...hospForm, address: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">City & State *</label>
              <input
                type="text"
                required
                value={hospForm.city}
                onChange={(e) => setHospForm({ ...hospForm, city: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 uppercase mb-1">Contact Phone *</label>
              <input
                type="text"
                required
                value={hospForm.contactPhone}
                onChange={(e) => setHospForm({ ...hospForm, contactPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setHospModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-sky-600 text-white rounded-lg font-bold shadow-xs"
            >
              Add Hospital
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Department Modal */}
      <Modal isOpen={deptModalOpen} onClose={() => setDeptModalOpen(false)} title="Add Clinical Specialty">
        <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Specialty Name *</label>
            <input
              type="text"
              required
              value={deptForm.name}
              onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
              placeholder="e.g. Ophthalmology, Oncology, Urology"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-700 uppercase mb-1">Clinical Scope / Description</label>
            <textarea
              rows={3}
              value={deptForm.description}
              onChange={(e) => setDeptForm({ ...deptForm, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setDeptModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-teal-600 text-white rounded-lg font-bold shadow-xs"
            >
              Add Specialty
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

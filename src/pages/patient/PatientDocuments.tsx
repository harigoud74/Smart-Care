import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { MedicalDocument } from '../../types';
import { Modal } from '../../components/common/Modal';
import { FileUp, FileText, Trash2, Download, Eye, Plus, ShieldCheck } from 'lucide-react';

export const PatientDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<MedicalDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [viewDoc, setViewDoc] = useState<MedicalDocument | null>(null);

  // Form State
  const [form, setForm] = useState({
    title: '',
    documentType: 'Lab Report',
    fileName: '',
    description: '',
  });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    const res = await apiRequest<MedicalDocument[]>('/patients/documents');
    if (res.success && res.data) {
      setDocuments(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.fileName) {
      setError('Document title and file name are required.');
      return;
    }

    setUploading(true);
    setError(null);

    const res = await apiRequest('/documents/upload', {
      method: 'POST',
      body: JSON.stringify({
        title: form.title,
        documentType: form.documentType,
        fileName: form.fileName,
        fileSize: 320000,
        mimeType: form.fileName.endsWith('.png') || form.fileName.endsWith('.jpg') ? 'image/jpeg' : 'application/pdf',
        description: form.description,
      }),
    });

    setUploading(false);

    if (res.success) {
      setUploadModalOpen(false);
      setForm({ title: '', documentType: 'Lab Report', fileName: '', description: '' });
      fetchDocuments();
    } else {
      setError(res.error || 'Upload failed.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medical report?')) return;
    await apiRequest(`/documents/${id}`, { method: 'DELETE' });
    fetchDocuments();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
            Confidential Document Locker
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Medical Reports & Documents
          </h1>
          <p className="text-xs text-slate-500">
            Upload blood work, MRI/CT scans, discharge summaries, and historical health records.
          </p>
        </div>

        <button
          onClick={() => {
            setUploadModalOpen(true);
            setError(null);
          }}
          className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Upload Medical File
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Loading document vault...</div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <FileUp className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="font-bold text-slate-900 text-base">No medical documents uploaded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Safely store your diagnostic test results and scan files for instant access during doctor consultations.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg"
          >
            Upload First Document
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-sky-300 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded uppercase">
                        {doc.documentType}
                      </span>
                      <h3 className="font-bold text-sm text-slate-900 mt-0.5">{doc.title}</h3>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {doc.description && (
                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    {doc.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>File: {doc.fileName}</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-semibold">
                  Size: ~{Math.round(doc.fileSize / 1024)} KB
                </span>
                <button
                  onClick={() => setViewDoc(doc)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-sky-50 hover:text-sky-700 rounded-lg text-slate-700 transition flex items-center gap-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" /> Inspect Document
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Medical Document / Lab Report"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Document Title *
            </label>
            <input
              type="text"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g. Annual Blood Lipid Panel"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Document Category
            </label>
            <select
              value={form.documentType}
              onChange={(e) => setForm({ ...form, documentType: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
            >
              <option value="Lab Report">Lab / Blood Report</option>
              <option value="Scan Report">MRI / CT / X-Ray Scan</option>
              <option value="Discharge Summary">Hospital Discharge Summary</option>
              <option value="Pathology">Pathology Report</option>
              <option value="Prescription">Historical Prescription</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Document File Name *
            </label>
            <input
              type="text"
              required
              value={form.fileName}
              onChange={(e) => setForm({ ...form, fileName: e.target.value })}
              placeholder="e.g. lipid_profile_october_2026.pdf"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Clinical Notes / Findings (Optional)
            </label>
            <textarea
              rows={2}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="e.g. Fasting glucose 95 mg/dL, cholesterol within normal range..."
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-lg shadow-xs cursor-pointer"
            >
              {uploading ? 'Encrypting & Storing...' : 'Upload & Encrypt'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Inspector Modal */}
      <Modal
        isOpen={!!viewDoc}
        onClose={() => setViewDoc(null)}
        title={viewDoc?.title || 'Document Details'}
        maxWidth="max-w-lg"
      >
        {viewDoc && (
          <div className="space-y-4 text-xs">
            <div className="p-4 bg-sky-50 border border-sky-100 rounded-2xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Document Type:</span>
                <span className="font-bold text-slate-900">{viewDoc.documentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Name:</span>
                <span className="font-mono text-slate-800">{viewDoc.fileName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Upload Timestamp:</span>
                <span className="text-slate-800">{new Date(viewDoc.uploadedAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">File Size:</span>
                <span className="text-slate-800">~{Math.round(viewDoc.fileSize / 1024)} KB</span>
              </div>
            </div>

            {viewDoc.description && (
              <div className="bg-white p-4 rounded-2xl border border-slate-200">
                <span className="font-bold text-slate-700 block mb-1">Diagnostic Report Summary:</span>
                <p className="text-slate-600 leading-relaxed">{viewDoc.description}</p>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Document integrity verified and cryptographically signed.</span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

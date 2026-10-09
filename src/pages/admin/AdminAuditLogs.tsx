import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { AuditLog } from '../../types';
import { ShieldAlert, Search, Filter, Terminal, User, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/common/Badge';

export const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    let url = '/admin/audit-logs?';
    if (selectedAction) url += `action=${encodeURIComponent(selectedAction)}&`;
    if (searchTerm) url += `search=${encodeURIComponent(searchTerm)}&`;

    const res = await apiRequest<AuditLog[]>(url);
    if (res.success && res.data) {
      setLogs(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedAction]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-extrabold tracking-wider text-rose-600">
            Security & Governance
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            System Security Audit Trail
          </h1>
          <p className="text-xs text-slate-500">
            Immutable log of logins, profile modifications, appointment lifecycle, and administrative events.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search user email or entity..."
              className="w-full pl-9 pr-3 py-1.5 border border-slate-300 rounded-xl text-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-bold"
          >
            Filter
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400 italic">No audit records logged.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Action Code</th>
                  <th className="px-5 py-3.5">Actor User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Target Entity</th>
                  <th className="px-5 py-3.5">Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-3 text-slate-500 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>

                    <td className="px-5 py-3 font-bold text-sky-800">
                      {log.action}
                    </td>

                    <td className="px-5 py-3 text-slate-700">
                      {log.userEmail || 'Unauthenticated'}
                    </td>

                    <td className="px-5 py-3">
                      {log.userRole ? <StatusBadge status={log.userRole} /> : <span className="text-slate-400">-</span>}
                    </td>

                    <td className="px-5 py-3 text-slate-900 font-semibold">
                      {log.entity}
                    </td>

                    <td className="px-5 py-3 text-slate-600 max-w-xs truncate font-sans">
                      {log.details ? JSON.stringify(log.details) : '-'}
                    </td>

                    <td className="px-5 py-3 text-slate-400 font-mono">
                      {log.ipAddress || '127.0.0.1'}
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

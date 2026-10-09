import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { StatCard } from '../../components/common/StatCard';
import {
  Users,
  Stethoscope,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Building2,
  ShieldCheck,
  TrendingUp,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

interface AdminDashboardProps {
  navigate: (path: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ navigate }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/admin/analytics').then((res) => {
      if (res.success && res.data) {
        setData(res.data);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading system operations dashboard...</div>;
  }

  const summary = data?.summary || {};
  const charts = data?.charts || {};
  const statusDistribution = charts.statusDistribution || [];
  const specialtyDistribution = charts.specialtyDistribution || [];
  const appointmentsByDate = charts.appointmentsByDate || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-slate-900 to-sky-950 rounded-3xl p-6 sm:p-8 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              SmartCare Operations Console
            </span>
            <span className="px-2 py-0.5 bg-sky-500/20 text-sky-300 rounded text-[10px] font-bold border border-sky-500/30">
              Admin Governance
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hospital System Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Platform-wide telemetry, physician credentialing, patient activity, and security audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {summary.pendingDoctorsCount > 0 && (
            <button
              onClick={() => navigate('/admin/doctors')}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer animate-pulse"
            >
              <AlertCircle className="w-4 h-4" /> {summary.pendingDoctorsCount} Doctor Applications Pending
            </button>
          )}

          <button
            onClick={() => navigate('/admin/audit-logs')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition cursor-pointer"
          >
            Security Audit Trail
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={summary.totalPatients || 0}
          subtitle="Enrolled hospital patients"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Verified Physicians"
          value={summary.verifiedDoctorsCount || 0}
          subtitle={`${summary.pendingDoctorsCount || 0} applications pending`}
          icon={Stethoscope}
          color="teal"
        />
        <StatCard
          title="Total Appointments"
          value={summary.totalAppointments || 0}
          subtitle={`${summary.completedAppointmentsCount || 0} completed visits`}
          icon={Calendar}
          color="purple"
        />
        <StatCard
          title="Active System Accounts"
          value={summary.totalUsers || 0}
          subtitle="Role-based credentials"
          icon={ShieldCheck}
          color="emerald"
        />
      </div>

      {/* Visual Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointment Status Breakdown */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Consultation Outcomes & Status</h3>
              <p className="text-xs text-slate-500">Distribution across active scheduling states</p>
            </div>
            <Activity className="w-4 h-4 text-sky-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, percent }: any) => `${name} ${percent != null ? (percent * 100).toFixed(0) : 0}%`}
                >
                  {statusDistribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.fill || '#0284c7'} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Popular Specialties Chart */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Appointments by Clinical Specialty</h3>
              <p className="text-xs text-slate-500">Department utilization and patient demand</p>
            </div>
            <TrendingUp className="w-4 h-4 text-teal-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={specialtyDistribution}>
                <XAxis dataKey="specialty" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d9488" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Admin Modules Quick Launch */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div
          onClick={() => navigate('/admin/doctors')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
            <Stethoscope className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Doctor Management</h4>
          <p className="text-xs text-slate-500">
            Verify, reject, or suspend doctor accounts and check licenses.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/patients')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Patient Management</h4>
          <p className="text-xs text-slate-500">
            View patient accounts and toggle account status.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/hospitals')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <Building2 className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Hospitals & Departments</h4>
          <p className="text-xs text-slate-500">
            Manage hospital partner campuses and clinical departments.
          </p>
        </div>

        <div
          onClick={() => navigate('/admin/audit-logs')}
          className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition cursor-pointer space-y-2"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900">Security Audit Logs</h4>
          <p className="text-xs text-slate-500">
            Inspect authentication, clinical records, and admin actions.
          </p>
        </div>
      </div>
    </div>
  );
};

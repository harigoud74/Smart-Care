import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../services/api';
import { DoctorAvailability, BlockedDate } from '../../types';
import { Clock, Calendar, Plus, Trash2, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export const DoctorAvailabilityPage: React.FC = () => {
  const [availabilities, setAvailabilities] = useState<DoctorAvailability[]>([]);
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Blocked Date State
  const [newBlockDate, setNewBlockDate] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [addingBlock, setAddingBlock] = useState(false);

  const DAYS = [
    { day: 1, name: 'Monday' },
    { day: 2, name: 'Tuesday' },
    { day: 3, name: 'Wednesday' },
    { day: 4, name: 'Thursday' },
    { day: 5, name: 'Friday' },
    { day: 6, name: 'Saturday' },
    { day: 0, name: 'Sunday' },
  ];

  const fetchAvailabilityData = async () => {
    setLoading(true);
    const res = await apiRequest<{ availabilities: DoctorAvailability[]; blockedDates: BlockedDate[] }>(
      '/doctors/portal/availability'
    );
    if (res.success && res.data) {
      setAvailabilities(res.data.availabilities || []);
      setBlockedDates(res.data.blockedDates || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAvailabilityData();
  }, []);

  const handleToggleDay = (dayOfWeek: number) => {
    const existing = availabilities.find((a) => a.dayOfWeek === dayOfWeek);
    if (existing) {
      setAvailabilities(
        availabilities.map((a) => (a.dayOfWeek === dayOfWeek ? { ...a, isActive: !a.isActive } : a))
      );
    } else {
      setAvailabilities([
        ...availabilities,
        {
          id: `avail-${dayOfWeek}`,
          doctorId: '',
          dayOfWeek,
          startTime: '09:00',
          endTime: '17:00',
          breakStartTime: '13:00',
          breakEndTime: '14:00',
          slotDurationMinutes: 30,
          isActive: true,
        },
      ]);
    }
  };

  const handleDayChange = (dayOfWeek: number, field: string, val: any) => {
    setAvailabilities(
      availabilities.map((a) => (a.dayOfWeek === dayOfWeek ? { ...a, [field]: val } : a))
    );
  };

  const handleSaveHours = async () => {
    setSaving(true);
    setMessage(null);
    const res = await apiRequest('/doctors/portal/availability', {
      method: 'PUT',
      body: JSON.stringify({ availabilities }),
    });
    setSaving(false);

    if (res.success) {
      setMessage({ type: 'success', text: 'Working hours and slot rules saved successfully.' });
    } else {
      setMessage({ type: 'error', text: res.error || 'Failed to save working hours.' });
    }
  };

  const handleAddBlockedDate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBlockDate) return;

    setAddingBlock(true);
    const res = await apiRequest('/doctors/portal/blocked-dates', {
      method: 'POST',
      body: JSON.stringify({ date: newBlockDate, reason: newBlockReason }),
    });
    setAddingBlock(false);

    if (res.success) {
      setNewBlockDate('');
      setNewBlockReason('');
      fetchAvailabilityData();
    }
  };

  const handleRemoveBlockedDate = async (date: string) => {
    await apiRequest(`/doctors/portal/blocked-dates/${date}`, { method: 'DELETE' });
    fetchAvailabilityData();
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">Loading availability rules...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="space-y-1">
        <span className="text-xs uppercase font-extrabold tracking-wider text-sky-600">
          Clinic Operations
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Working Hours & Availability Rules
        </h1>
        <p className="text-xs text-slate-500">
          Define working shifts, slot intervals, lunch breaks, and block out holidays or leaves.
        </p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Working Days & Hours Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900">Weekly Clinical Shifts</h3>
            <p className="text-xs text-slate-500">
              The booking system automatically computes available 30-minute intervals from these hours.
            </p>
          </div>
          <button
            onClick={handleSaveHours}
            disabled={saving}
            className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Schedule Rules'}
          </button>
        </div>

        <div className="space-y-3">
          {DAYS.map(({ day, name }) => {
            const rule = availabilities.find((a) => a.dayOfWeek === day);
            const isActive = rule?.isActive ?? false;

            return (
              <div
                key={day}
                className={`p-4 rounded-2xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isActive ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/50 border-slate-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 w-40">
                  <input
                    type="checkbox"
                    id={`day-${day}`}
                    checked={isActive}
                    onChange={() => handleToggleDay(day)}
                    className="w-4 h-4 accent-sky-600 rounded cursor-pointer"
                  />
                  <label htmlFor={`day-${day}`} className="font-bold text-xs text-slate-900 cursor-pointer">
                    {name}
                  </label>
                </div>

                {isActive ? (
                  <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs w-full">
                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold mb-1">Shift Start</span>
                      <input
                        type="time"
                        value={rule?.startTime || '09:00'}
                        onChange={(e) => handleDayChange(day, 'startTime', e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white w-full font-medium"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold mb-1">Shift End</span>
                      <input
                        type="time"
                        value={rule?.endTime || '17:00'}
                        onChange={(e) => handleDayChange(day, 'endTime', e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white w-full font-medium"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold mb-1">Break Start</span>
                      <input
                        type="time"
                        value={rule?.breakStartTime || '13:00'}
                        onChange={(e) => handleDayChange(day, 'breakStartTime', e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white w-full font-medium"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-500 block font-semibold mb-1">Break End</span>
                      <input
                        type="time"
                        value={rule?.breakEndTime || '14:00'}
                        onChange={(e) => handleDayChange(day, 'breakEndTime', e.target.value)}
                        className="px-2.5 py-1.5 border border-slate-300 rounded-lg bg-white w-full font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">Off-duty / Clinic closed</div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Blocked Dates Section (Leaves & Holidays) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div>
          <h3 className="font-bold text-sm text-slate-900">Blocked Dates (Leaves & Holidays)</h3>
          <p className="text-xs text-slate-500">
            Block specific calendar dates when you will be on leave or attending medical conferences.
            Patients will be prevented from booking on these dates.
          </p>
        </div>

        <form onSubmit={handleAddBlockedDate} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full sm:w-auto">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Select Date *</label>
            <input
              type="date"
              required
              value={newBlockDate}
              onChange={(e) => setNewBlockDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>

          <div className="flex-2 w-full sm:w-auto">
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">Reason for Absence</label>
            <input
              type="text"
              value={newBlockReason}
              onChange={(e) => setNewBlockReason(e.target.value)}
              placeholder="e.g. Annual leave, Medical conference, Personal leave"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={addingBlock || !newBlockDate}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Block Date
          </button>
        </form>

        {blockedDates.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center italic">
            No dates currently blocked. All regular schedule days are open.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {blockedDates.map((block) => (
              <div
                key={block.id}
                className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/50 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{block.date}</span>
                  <span className="text-amber-800 text-[11px]">{block.reason || 'Leave / Unavailable'}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveBlockedDate(block.date)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition"
                  title="Remove blocked date"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

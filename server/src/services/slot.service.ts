import { db } from '../db/store.js';

export interface GeneratedSlot {
  time: string; // "09:00"
  endTime: string; // "09:30"
  isAvailable: boolean;
  reason?: string;
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

function formatMinutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function generateDoctorSlotsForDate(
  doctorId: string,
  dateStr: string // "YYYY-MM-DD"
): {
  date: string;
  isDateBlocked: boolean;
  blockedReason?: string;
  slots: GeneratedSlot[];
} {
  // Check if date is blocked
  const blockedDates = db.getDoctorBlockedDates(doctorId);
  const blocked = blockedDates.find((b) => b.date === dateStr);
  if (blocked) {
    return {
      date: dateStr,
      isDateBlocked: true,
      blockedReason: blocked.reason || 'Doctor is on leave or unavailable on this date.',
      slots: [],
    };
  }

  // Determine day of week
  // Date format: YYYY-MM-DD. Note: Date constructor with UTC prevents timezone shift
  const [year, month, day] = dateStr.split('-').map(Number);
  const targetDate = new Date(Date.UTC(year, month - 1, day, 12, 0, 0));
  const dayOfWeek = targetDate.getUTCDay();

  // Find availability rule
  const availabilities = db.getDoctorAvailabilities(doctorId);
  const dayAvailability = availabilities.find((a) => a.dayOfWeek === dayOfWeek);

  if (!dayAvailability) {
    return {
      date: dateStr,
      isDateBlocked: false,
      slots: [],
    };
  }

  const duration = dayAvailability.slotDurationMinutes || 30;
  const startMins = parseTimeToMinutes(dayAvailability.startTime);
  const endMins = parseTimeToMinutes(dayAvailability.endTime);
  const breakStart = dayAvailability.breakStartTime
    ? parseTimeToMinutes(dayAvailability.breakStartTime)
    : -1;
  const breakEnd = dayAvailability.breakEndTime
    ? parseTimeToMinutes(dayAvailability.breakEndTime)
    : -1;

  // Existing active appointments for doctor on this date
  const doctorAppointments = db
    .getAppointmentsByDoctor(doctorId)
    .filter(
      (a) =>
        a.appointmentDate === dateStr &&
        (a.status === 'CONFIRMED' || a.status === 'PENDING')
    );

  const bookedTimes = new Set(doctorAppointments.map((a) => a.appointmentTime));

  const slots: GeneratedSlot[] = [];
  let current = startMins;

  while (current + duration <= endMins) {
    // Check if slot overlaps with break
    const slotStart = current;
    const slotEnd = current + duration;

    const inBreak =
      breakStart !== -1 &&
      breakEnd !== -1 &&
      slotStart < breakEnd &&
      slotEnd > breakStart;

    const timeStr = formatMinutesToTime(slotStart);
    const endTimeStr = formatMinutesToTime(slotEnd);

    if (!inBreak) {
      const isBooked = bookedTimes.has(timeStr);
      slots.push({
        time: timeStr,
        endTime: endTimeStr,
        isAvailable: !isBooked,
        reason: isBooked ? 'Slot already reserved' : undefined,
      });
    }

    current += duration;
  }

  return {
    date: dateStr,
    isDateBlocked: false,
    slots,
  };
}

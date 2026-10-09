import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/audit.service.js';
import { sendNotification } from '../services/notification.service.js';
import { generateDoctorSlotsForDate } from '../services/slot.service.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const BookAppointmentSchema = z.object({
  doctorId: z.string().min(1, 'Doctor ID is required'),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
  endTime: z.string().optional(),
  type: z.enum(['IN_PERSON', 'TELECONSULTATION']).default('IN_PERSON'),
  priority: z.enum(['ROUTINE', 'URGENT']).default('ROUTINE'),
  reasonForVisit: z.string().min(3, 'Reason for visit must be at least 3 characters'),
});

const RescheduleSchema = z.object({
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm'),
  endTime: z.string().optional(),
});

const CancelSchema = z.object({
  cancellationReason: z.string().min(3, 'Cancellation reason is required'),
});

export async function getDoctorSlots(req: Request, res: Response) {
  try {
    const { doctorId, date } = req.query;
    if (!doctorId || typeof doctorId !== 'string' || !date || typeof date !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Both doctorId and date (YYYY-MM-DD) query parameters are required.',
      });
    }

    const doctor = db.findDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    if (doctor.status !== 'VERIFIED') {
      return res.status(400).json({
        success: false,
        error: 'Appointments can only be scheduled with verified doctors.',
      });
    }

    const slotInfo = generateDoctorSlotsForDate(doctorId, date);
    return res.json({
      success: true,
      data: slotInfo,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({
        success: false,
        error: 'Only patients can book appointments. Please log in as a patient.',
      });
    }

    const validated = BookAppointmentSchema.parse(req.body);

    // Verify doctor exists and is verified
    const doctor = db.findDoctorById(validated.doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    if (doctor.status !== 'VERIFIED') {
      return res.status(400).json({
        success: false,
        error: 'Selected doctor is not currently verified for public bookings.',
      });
    }

    // Check if slot is already booked for doctor or patient (Double booking prevention)
    const conflict = db.isSlotBooked(
      validated.doctorId,
      patientId,
      validated.appointmentDate,
      validated.appointmentTime
    );

    if (conflict.booked) {
      return res.status(409).json({
        success: false,
        error: conflict.reason || 'This time slot is no longer available. Please select another slot.',
      });
    }

    // Compute end time if not given (default 30 mins)
    let endTime = validated.endTime;
    if (!endTime) {
      const [h, m] = validated.appointmentTime.split(':').map(Number);
      const totalMins = h * 60 + m + 30;
      const endH = Math.floor(totalMins / 60);
      const endM = totalMins % 60;
      endTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }

    const patient = db.findPatientById(patientId);
    const appointmentId = `apt-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const newAppointment = db.createAppointment({
      id: appointmentId,
      patientId,
      doctorId: validated.doctorId,
      appointmentDate: validated.appointmentDate,
      appointmentTime: validated.appointmentTime,
      endTime,
      type: validated.type,
      priority: validated.priority,
      status: 'CONFIRMED',
      reasonForVisit: validated.reasonForVisit,
      createdAt: now,
      updatedAt: now,
    });

    // Notify patient
    sendNotification(
      req.user!.userId,
      'Appointment Confirmed',
      `Your appointment with ${doctor.fullName} on ${validated.appointmentDate} at ${validated.appointmentTime} is confirmed.`,
      'APPOINTMENT_CONFIRMED',
      '/patient/appointments'
    );

    // Notify doctor
    sendNotification(
      doctor.userId,
      'New Appointment Scheduled',
      `${patient?.fullName || 'A patient'} scheduled an appointment on ${validated.appointmentDate} at ${validated.appointmentTime}.`,
      'APPOINTMENT_BOOKED',
      '/doctor/appointments'
    );

    logAudit(req, 'BOOK_APPOINTMENT', 'Appointment', appointmentId, {
      doctorId: doctor.id,
      patientId,
      date: validated.appointmentDate,
      time: validated.appointmentTime,
      type: validated.type,
    });

    return res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: newAppointment,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.issues.map((e) => e.message).join(', '),
      });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function rescheduleAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { appointmentDate, appointmentTime, endTime } = RescheduleSchema.parse(req.body);

    const appointment = db.findAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    // Role check: Only the owning patient, assigned doctor, or admin can reschedule
    const isOwnerPatient = req.user?.role === 'PATIENT' && req.user?.patientId === appointment.patientId;
    const isAssignedDoctor = req.user?.role === 'DOCTOR' && req.user?.doctorId === appointment.doctorId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You do not have permission to reschedule this appointment.',
      });
    }

    if (appointment.status === 'COMPLETED' || appointment.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        error: `Cannot reschedule an appointment that is already ${appointment.status.toLowerCase()}.`,
      });
    }

    // Verify slot availability excluding the current appointment
    const conflict = db.isSlotBooked(
      appointment.doctorId,
      appointment.patientId,
      appointmentDate,
      appointmentTime,
      appointment.id
    );

    if (conflict.booked) {
      return res.status(409).json({
        success: false,
        error: conflict.reason || 'Requested slot is unavailable for rescheduling.',
      });
    }

    let resolvedEndTime = endTime;
    if (!resolvedEndTime) {
      const [h, m] = appointmentTime.split(':').map(Number);
      const totalMins = h * 60 + m + 30;
      const endH = Math.floor(totalMins / 60);
      const endM = totalMins % 60;
      resolvedEndTime = `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
    }

    const updated = db.updateAppointment(id, {
      appointmentDate,
      appointmentTime,
      endTime: resolvedEndTime,
      status: 'CONFIRMED',
    });

    const doctor = db.findDoctorById(appointment.doctorId);
    const patient = db.findPatientById(appointment.patientId);

    // Notify patient
    if (patient) {
      sendNotification(
        patient.userId,
        'Appointment Rescheduled',
        `Your appointment has been moved to ${appointmentDate} at ${appointmentTime}.`,
        'APPOINTMENT_RESCHEDULED',
        '/patient/appointments'
      );
    }

    // Notify doctor
    if (doctor) {
      sendNotification(
        doctor.userId,
        'Appointment Rescheduled',
        `Appointment with ${patient?.fullName || 'Patient'} rescheduled to ${appointmentDate} at ${appointmentTime}.`,
        'APPOINTMENT_RESCHEDULED',
        '/doctor/appointments'
      );
    }

    logAudit(req, 'RESCHEDULE_APPOINTMENT', 'Appointment', id, {
      newDate: appointmentDate,
      newTime: appointmentTime,
    });

    return res.json({
      success: true,
      message: 'Appointment rescheduled successfully.',
      data: updated,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.issues.map((e) => e.message).join(', '),
      });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function cancelAppointment(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { cancellationReason } = CancelSchema.parse(req.body);

    const appointment = db.findAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    const isOwnerPatient = req.user?.role === 'PATIENT' && req.user?.patientId === appointment.patientId;
    const isAssignedDoctor = req.user?.role === 'DOCTOR' && req.user?.doctorId === appointment.doctorId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isOwnerPatient && !isAssignedDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized: You do not have permission to cancel this appointment.',
      });
    }

    if (appointment.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: 'Appointment is already cancelled.' });
    }

    const updated = db.updateAppointment(id, {
      status: 'CANCELLED',
      cancellationReason,
      cancelledByRole: req.user?.role,
    });

    const doctor = db.findDoctorById(appointment.doctorId);
    const patient = db.findPatientById(appointment.patientId);

    if (patient) {
      sendNotification(
        patient.userId,
        'Appointment Cancelled',
        `Your appointment on ${appointment.appointmentDate} at ${appointment.appointmentTime} was cancelled: "${cancellationReason}".`,
        'APPOINTMENT_CANCELLED',
        '/patient/appointments'
      );
    }

    if (doctor) {
      sendNotification(
        doctor.userId,
        'Appointment Cancelled',
        `Appointment on ${appointment.appointmentDate} with ${patient?.fullName || 'Patient'} has been cancelled.`,
        'APPOINTMENT_CANCELLED',
        '/doctor/appointments'
      );
    }

    logAudit(req, 'CANCEL_APPOINTMENT', 'Appointment', id, {
      reason: cancellationReason,
      cancelledBy: req.user?.role,
    });

    return res.json({
      success: true,
      message: 'Appointment cancelled successfully. The time slot is now released.',
      data: updated,
    });
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: err.issues.map((e) => e.message).join(', '),
      });
    }
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateAppointmentStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['COMPLETED', 'NO_SHOW', 'CONFIRMED', 'PENDING'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid appointment status.' });
    }

    const appointment = db.findAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }

    const isAssignedDoctor = req.user?.role === 'DOCTOR' && req.user?.doctorId === appointment.doctorId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isAssignedDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Only the attending doctor or an administrator can update the consultation status.',
      });
    }

    const updated = db.updateAppointment(id, { status });
    logAudit(req, 'UPDATE_APPOINTMENT_STATUS', 'Appointment', id, { newStatus: status });

    return res.json({
      success: true,
      message: `Appointment marked as ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

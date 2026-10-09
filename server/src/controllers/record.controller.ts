import { Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/audit.service.js';
import { sendNotification } from '../services/notification.service.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const CreateRecordSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().optional(),
  consultationDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  symptoms: z.string().optional(),
  clinicalNotes: z.string().min(5, 'Clinical notes are required'),
  treatmentPlan: z.string().optional(),
  followUpDate: z.string().optional(),
  vitalSigns: z
    .object({
      bloodPressure: z.string().optional(),
      heartRate: z.string().optional(),
      temperature: z.string().optional(),
      respiratoryRate: z.string().optional(),
      spo2: z.string().optional(),
      weight: z.string().optional(),
    })
    .optional(),
});

export async function createMedicalRecord(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        error: 'Only doctors can record clinical consultation notes.',
      });
    }

    const validated = CreateRecordSchema.parse(req.body);

    const patient = db.findPatientById(validated.patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found.' });
    }

    // Check doctor relationship
    const hasRelation = db
      .getAppointmentsByDoctor(doctorId)
      .some((a) => a.patientId === validated.patientId);

    if (!hasRelation) {
      return res.status(403).json({
        success: false,
        error: 'Access restricted: You cannot record consultations for patients without an active appointment/consultation record.',
      });
    }

    const recordId = `rec-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const newRecord = db.createMedicalRecord({
      id: recordId,
      patientId: validated.patientId,
      doctorId,
      appointmentId: validated.appointmentId,
      consultationDate: validated.consultationDate,
      diagnosis: validated.diagnosis,
      symptoms: validated.symptoms,
      clinicalNotes: validated.clinicalNotes,
      treatmentPlan: validated.treatmentPlan,
      followUpDate: validated.followUpDate,
      vitalSigns: validated.vitalSigns,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    });

    // Automatically mark the appointment as COMPLETED if linked
    if (validated.appointmentId) {
      db.updateAppointment(validated.appointmentId, { status: 'COMPLETED' });
    }

    const doctor = db.findDoctorById(doctorId);
    sendNotification(
      patient.userId,
      'Medical Record Updated',
      `${doctor?.fullName || 'Your doctor'} added a consultation summary and diagnosis: ${validated.diagnosis}.`,
      'MEDICAL_RECORD_UPDATED',
      '/patient/medical-records'
    );

    logAudit(req, 'CREATE_MEDICAL_RECORD', 'MedicalRecord', recordId, {
      patientId: validated.patientId,
      diagnosis: validated.diagnosis,
    });

    return res.status(201).json({
      success: true,
      message: 'Medical record created successfully.',
      data: newRecord,
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

export async function getMedicalRecordById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const record = db.findMedicalRecordById(id);

    if (!record) {
      return res.status(404).json({ success: false, error: 'Record not found.' });
    }

    // Authorization: only the patient themselves or the attending doctor can view
    const isOwner = req.user?.role === 'PATIENT' && req.user?.patientId === record.patientId;
    const isAttendingDoctor = req.user?.role === 'DOCTOR' && req.user?.doctorId === record.doctorId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isOwner && !isAttendingDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Medical confidentiality: You are not authorized to view this medical record.',
      });
    }

    const doctor = db.findDoctorById(record.doctorId);
    const patient = db.findPatientById(record.patientId);

    return res.json({
      success: true,
      data: {
        ...record,
        doctor,
        patient,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

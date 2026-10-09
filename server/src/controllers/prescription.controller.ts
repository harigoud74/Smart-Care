import { Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/audit.service.js';
import { sendNotification } from '../services/notification.service.js';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';

const PrescriptionItemSchema = z.object({
  medicineName: z.string().min(1, 'Medicine name is required'),
  dosage: z.string().min(1, 'Dosage is required (e.g. 500mg)'),
  frequency: z.string().min(1, 'Frequency is required (e.g. Twice a day)'),
  duration: z.string().min(1, 'Duration is required (e.g. 5 days)'),
  instructions: z.string().optional(),
});

const CreatePrescriptionSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  appointmentId: z.string().optional(),
  prescriptionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date format must be YYYY-MM-DD'),
  diagnosis: z.string().min(2, 'Diagnosis is required'),
  instructions: z.string().optional(),
  dietAdvice: z.string().optional(),
  items: z.array(PrescriptionItemSchema).min(1, 'At least one medicine item is required'),
});

export async function createPrescription(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      return res.status(403).json({
        success: false,
        error: 'Only registered medical doctors can create prescriptions.',
      });
    }

    const validated = CreatePrescriptionSchema.parse(req.body);

    const patient = db.findPatientById(validated.patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found.' });
    }

    const rxId = `rx-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();

    const formattedItems = validated.items.map((item, index) => ({
      id: `rx-item-${uuidv4().substring(0, 8)}`,
      prescriptionId: rxId,
      medicineName: item.medicineName,
      dosage: item.dosage,
      frequency: item.frequency,
      duration: item.duration,
      instructions: item.instructions,
    }));

    const prescription = db.createPrescription({
      id: rxId,
      patientId: validated.patientId,
      doctorId,
      appointmentId: validated.appointmentId,
      prescriptionDate: validated.prescriptionDate,
      diagnosis: validated.diagnosis,
      instructions: validated.instructions,
      dietAdvice: validated.dietAdvice,
      items: formattedItems,
      createdAt: now,
      updatedAt: now,
    });

    const doctor = db.findDoctorById(doctorId);
    sendNotification(
      patient.userId,
      'Digital Prescription Issued',
      `${doctor?.fullName || 'Your physician'} has issued a digital prescription for ${validated.diagnosis}.`,
      'PRESCRIPTION_CREATED',
      '/patient/prescriptions'
    );

    logAudit(req, 'CREATE_PRESCRIPTION', 'Prescription', rxId, {
      patientId: validated.patientId,
      itemCount: formattedItems.length,
      diagnosis: validated.diagnosis,
    });

    return res.status(201).json({
      success: true,
      message: 'Prescription generated successfully.',
      data: prescription,
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

export async function getPrescriptionById(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const rx = db.findPrescriptionById(id);

    if (!rx) {
      return res.status(404).json({ success: false, error: 'Prescription not found.' });
    }

    const isOwnerPatient = req.user?.role === 'PATIENT' && req.user?.patientId === rx.patientId;
    const isAttendingDoctor = req.user?.role === 'DOCTOR' && req.user?.doctorId === rx.doctorId;
    const isAdmin = req.user?.role === 'ADMIN';

    if (!isOwnerPatient && !isAttendingDoctor && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Confidentiality notice: You are not authorized to view this prescription.',
      });
    }

    const doctor = db.findDoctorById(rx.doctorId);
    const patient = db.findPatientById(rx.patientId);
    const hospital = doctor?.hospitalId ? db.findHospitalById(doctor.hospitalId) : undefined;

    return res.json({
      success: true,
      data: {
        ...rx,
        doctor: doctor
          ? {
              ...doctor,
              hospitalName: hospital?.name,
              hospitalAddress: hospital?.address,
              hospitalCity: hospital?.city,
              hospitalPhone: hospital?.contactPhone,
            }
          : undefined,
        patient,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

import { Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/audit.service.js';

export async function getPatientProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, error: 'Patient profile not linked.' });
    }

    const patient = db.findPatientById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found.' });
    }

    const user = db.findUserById(patient.userId);

    return res.json({
      success: true,
      data: {
        ...patient,
        email: user?.email,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updatePatientProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, error: 'Patient profile not linked.' });
    }

    const updates = req.body;
    // Don't allow changing ID or userId
    delete updates.id;
    delete updates.userId;

    const updated = db.updatePatient(patientId, updates);
    logAudit(req, 'UPDATE_PATIENT_PROFILE', 'Patient', patientId, { fields: Object.keys(updates) });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPatientAppointments(req: AuthenticatedRequest, res: Response) {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, error: 'Patient profile not linked.' });
    }

    const appointments = db.getAppointmentsByPatient(patientId);
    const enriched = appointments.map((apt) => {
      const doctor = db.findDoctorById(apt.doctorId);
      const hospital = doctor?.hospitalId ? db.findHospitalById(doctor.hospitalId) : undefined;
      return {
        ...apt,
        doctor: doctor
          ? {
              id: doctor.id,
              fullName: doctor.fullName,
              specialization: doctor.specialization,
              profileImage: doctor.profileImage,
              consultationFee: doctor.consultationFee,
              hospitalName: hospital?.name,
            }
          : undefined,
      };
    }).sort((a, b) => new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime() - new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime());

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPatientMedicalRecords(req: AuthenticatedRequest, res: Response) {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, error: 'Patient profile not linked.' });
    }

    const records = db.getMedicalRecordsByPatient(patientId);
    const enriched = records.map((rec) => {
      const doctor = db.findDoctorById(rec.doctorId);
      return {
        ...rec,
        doctor: doctor ? { id: doctor.id, fullName: doctor.fullName, specialization: doctor.specialization } : undefined,
      };
    }).sort((a, b) => new Date(b.consultationDate).getTime() - new Date(a.consultationDate).getTime());

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPatientPrescriptions(req: AuthenticatedRequest, res: Response) {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, error: 'Patient profile not linked.' });
    }

    const prescriptions = db.getPrescriptionsByPatient(patientId);
    const enriched = prescriptions.map((rx) => {
      const doctor = db.findDoctorById(rx.doctorId);
      const hospital = doctor?.hospitalId ? db.findHospitalById(doctor.hospitalId) : undefined;
      return {
        ...rx,
        doctor: doctor
          ? {
              id: doctor.id,
              fullName: doctor.fullName,
              specialization: doctor.specialization,
              qualification: doctor.qualification,
              licenseNumber: doctor.licenseNumber,
              hospitalName: hospital?.name,
            }
          : undefined,
      };
    }).sort((a, b) => new Date(b.prescriptionDate).getTime() - new Date(a.prescriptionDate).getTime());

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPatientDocuments(req: AuthenticatedRequest, res: Response) {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, error: 'Patient profile not linked.' });
    }

    const docs = db.getDocumentsByPatient(patientId);
    return res.json({
      success: true,
      data: docs.sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getPatientDashboardSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const patientId = req.user?.patientId;
    if (!patientId) {
      return res.status(403).json({ success: false, error: 'Patient profile not linked.' });
    }

    const patient = db.findPatientById(patientId);
    const appointments = db.getAppointmentsByPatient(patientId);
    const records = db.getMedicalRecordsByPatient(patientId);
    const prescriptions = db.getPrescriptionsByPatient(patientId);
    const documents = db.getDocumentsByPatient(patientId);
    const notifications = db.getNotificationsByUser(req.user!.userId);

    const todayStr = new Date().toISOString().split('T')[0];

    // Find upcoming appointment
    const upcomingAppointments = appointments
      .filter((a) => (a.status === 'CONFIRMED' || a.status === 'PENDING') && a.appointmentDate >= todayStr)
      .sort((a, b) => new Date(`${a.appointmentDate}T${a.appointmentTime}`).getTime() - new Date(`${b.appointmentDate}T${b.appointmentTime}`).getTime());

    const nextAppointment = upcomingAppointments[0];
    let nextAppointmentEnriched = null;
    if (nextAppointment) {
      const doc = db.findDoctorById(nextAppointment.doctorId);
      const hosp = doc?.hospitalId ? db.findHospitalById(doc.hospitalId) : undefined;
      nextAppointmentEnriched = {
        ...nextAppointment,
        doctor: doc ? { id: doc.id, fullName: doc.fullName, specialization: doc.specialization, hospitalName: hosp?.name } : null,
      };
    }

    // Recently visited doctors
    const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
    const doctorIds = Array.from(new Set(completedAppointments.map((a) => a.doctorId)));
    const recentDoctors = doctorIds
      .map((id) => db.findDoctorById(id))
      .filter(Boolean)
      .slice(0, 4);

    return res.json({
      success: true,
      data: {
        patient,
        stats: {
          totalAppointments: appointments.length,
          upcomingCount: upcomingAppointments.length,
          completedCount: completedAppointments.length,
          prescriptionsCount: prescriptions.length,
          documentsCount: documents.length,
          unreadNotificationsCount: notifications.filter((n) => !n.isRead).length,
        },
        nextAppointment: nextAppointmentEnriched,
        recentAppointments: appointments.slice(0, 5),
        recentPrescriptions: prescriptions.slice(0, 3),
        recentDocuments: documents.slice(0, 3),
        recentDoctors,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

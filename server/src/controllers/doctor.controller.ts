import { Request, Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/audit.service.js';
import { generateDoctorSlotsForDate } from '../services/slot.service.js';

// --- Public Endpoints ---

export async function getPublicDoctors(req: Request, res: Response) {
  try {
    const { specialization, hospitalId, search, maxFee, minRating } = req.query;

    let doctors = db.getAllDoctors(true); // Only VERIFIED doctors

    if (specialization && typeof specialization === 'string') {
      doctors = doctors.filter(
        (d) => d.specialization.toLowerCase() === specialization.toLowerCase()
      );
    }

    if (hospitalId && typeof hospitalId === 'string') {
      doctors = doctors.filter((d) => d.hospitalId === hospitalId);
    }

    if (maxFee && !isNaN(Number(maxFee))) {
      doctors = doctors.filter((d) => d.consultationFee <= Number(maxFee));
    }

    if (minRating && !isNaN(Number(minRating))) {
      doctors = doctors.filter((d) => d.rating >= Number(minRating));
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      doctors = doctors.filter(
        (d) =>
          d.fullName.toLowerCase().includes(q) ||
          d.specialization.toLowerCase().includes(q) ||
          (d.bio && d.bio.toLowerCase().includes(q))
      );
    }

    const enriched = doctors.map((doc) => {
      const hospital = doc.hospitalId ? db.findHospitalById(doc.hospitalId) : undefined;
      const department = doc.departmentId ? db.findDepartmentById(doc.departmentId) : undefined;
      return {
        ...doc,
        hospital: hospital ? { id: hospital.id, name: hospital.name, city: hospital.city } : undefined,
        department: department ? { id: department.id, name: department.name } : undefined,
      };
    });

    return res.json({
      success: true,
      data: enriched,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getDoctorById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const doctor = db.findDoctorById(id);

    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    const hospital = doctor.hospitalId ? db.findHospitalById(doctor.hospitalId) : undefined;
    const department = doctor.departmentId ? db.findDepartmentById(doctor.departmentId) : undefined;
    const availabilities = db.getDoctorAvailabilities(doctor.id);

    return res.json({
      success: true,
      data: {
        ...doctor,
        hospital,
        department,
        availabilities,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

// --- Doctor Portal Endpoints ---

export async function getDoctorProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Doctor profile not found.' });
    }

    const doctor = db.findDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    const hospital = doctor.hospitalId ? db.findHospitalById(doctor.hospitalId) : undefined;
    const department = doctor.departmentId ? db.findDepartmentById(doctor.departmentId) : undefined;
    const availabilities = db.getDoctorAvailabilities(doctor.id);
    const blockedDates = db.getDoctorBlockedDates(doctor.id);

    return res.json({
      success: true,
      data: {
        ...doctor,
        hospital,
        department,
        availabilities,
        blockedDates,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateDoctorProfile(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Doctor profile not found.' });
    }

    const updates = req.body;
    // Disallow modifying critical status or id fields via regular profile update
    delete updates.id;
    delete updates.userId;
    delete updates.status;

    const updated = db.updateDoctor(doctorId, updates);
    logAudit(req, 'UPDATE_DOCTOR_PROFILE', 'Doctor', doctorId, { fields: Object.keys(updates) });

    return res.json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getDoctorAvailability(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId || req.params.id;
    if (!doctorId) {
      return res.status(400).json({ success: false, error: 'Doctor ID required.' });
    }

    const availabilities = db.getDoctorAvailabilities(doctorId);
    const blockedDates = db.getDoctorBlockedDates(doctorId);

    return res.json({
      success: true,
      data: {
        availabilities,
        blockedDates,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function updateDoctorAvailability(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Doctor profile required.' });
    }

    const { availabilities } = req.body;
    if (!Array.isArray(availabilities)) {
      return res.status(400).json({ success: false, error: 'Availabilities must be an array.' });
    }

    const formatted = availabilities.map((a, index) => ({
      id: a.id || `avail-${doctorId}-${a.dayOfWeek || index}`,
      doctorId,
      dayOfWeek: Number(a.dayOfWeek),
      startTime: a.startTime || '09:00',
      endTime: a.endTime || '17:00',
      breakStartTime: a.breakStartTime,
      breakEndTime: a.breakEndTime,
      slotDurationMinutes: Number(a.slotDurationMinutes) || 30,
      isActive: a.isActive !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    db.setDoctorAvailabilities(doctorId, formatted);
    logAudit(req, 'UPDATE_DOCTOR_AVAILABILITY', 'DoctorAvailability', doctorId, { count: formatted.length });

    return res.json({
      success: true,
      message: 'Working hours and slot rules updated successfully.',
      data: formatted,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function addDoctorBlockedDate(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Doctor profile required.' });
    }

    const { date, reason } = req.body;
    if (!date) {
      return res.status(400).json({ success: false, error: 'Date is required.' });
    }

    const blocked = db.addBlockedDate({
      id: `block-${doctorId}-${date}`,
      doctorId,
      date,
      reason: reason || 'Leave / Unavailable',
      createdAt: new Date().toISOString(),
    });

    logAudit(req, 'ADD_BLOCKED_DATE', 'BlockedDate', blocked.id, { date, reason });

    return res.status(201).json({
      success: true,
      message: `Date ${date} blocked successfully.`,
      data: blocked,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function removeDoctorBlockedDate(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Doctor profile required.' });
    }

    const { date } = req.params;
    db.removeBlockedDate(doctorId, date);
    logAudit(req, 'REMOVE_BLOCKED_DATE', 'BlockedDate', doctorId, { date });

    return res.json({
      success: true,
      message: `Blocked date ${date} removed.`,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getDoctorAppointments(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Doctor profile required.' });
    }

    const appointments = db.getAppointmentsByDoctor(doctorId);
    const enriched = appointments.map((apt) => {
      const patient = db.findPatientById(apt.patientId);
      return {
        ...apt,
        patient: patient
          ? {
              id: patient.id,
              fullName: patient.fullName,
              gender: patient.gender,
              dateOfBirth: patient.dateOfBirth,
              phone: patient.phone,
              bloodGroup: patient.bloodGroup,
              allergies: patient.allergies,
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

export async function getDoctorDashboardSummary(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Doctor profile required.' });
    }

    const doctor = db.findDoctorById(doctorId);
    const appointments = db.getAppointmentsByDoctor(doctorId);
    const todayStr = new Date().toISOString().split('T')[0];

    const todayAppointments = appointments.filter((a) => a.appointmentDate === todayStr);
    const upcomingAppointments = appointments.filter(
      (a) => (a.status === 'CONFIRMED' || a.status === 'PENDING') && a.appointmentDate >= todayStr
    );
    const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
    const pendingAppointments = appointments.filter((a) => a.status === 'PENDING');

    // Distinct patient IDs
    const patientIds = Array.from(new Set(appointments.map((a) => a.patientId)));

    const enrichedToday = todayAppointments.map((apt) => {
      const patient = db.findPatientById(apt.patientId);
      return {
        ...apt,
        patient: patient ? { id: patient.id, fullName: patient.fullName, phone: patient.phone } : null,
      };
    });

    return res.json({
      success: true,
      data: {
        doctor,
        stats: {
          todayCount: todayAppointments.length,
          upcomingCount: upcomingAppointments.length,
          completedCount: completedAppointments.length,
          pendingCount: pendingAppointments.length,
          uniquePatientCount: patientIds.length,
        },
        todayAppointments: enrichedToday,
        recentAppointments: appointments.slice(0, 6),
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAuthorizedPatientDetails(req: AuthenticatedRequest, res: Response) {
  try {
    const doctorId = req.user?.doctorId;
    const { patientId } = req.params;

    if (!doctorId) {
      return res.status(403).json({ success: false, error: 'Doctor profile required.' });
    }

    // Verify authorized relationship: Doctor must have at least one appointment with this patient
    const appointments = db
      .getAppointmentsByDoctor(doctorId)
      .filter((a) => a.patientId === patientId);

    if (appointments.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Access restricted: You do not have an active consultation or appointment record with this patient.',
      });
    }

    const patient = db.findPatientById(patientId);
    if (!patient) {
      return res.status(404).json({ success: false, error: 'Patient not found.' });
    }

    const records = db.getMedicalRecordsByPatient(patientId);
    const prescriptions = db.getPrescriptionsByPatient(patientId);
    const documents = db.getDocumentsByPatient(patientId);

    logAudit(req, 'VIEW_AUTHORIZED_PATIENT_RECORDS', 'Patient', patientId, { doctorId });

    return res.json({
      success: true,
      data: {
        patient,
        appointments,
        medicalRecords: records,
        prescriptions,
        documents,
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

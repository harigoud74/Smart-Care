import { Response } from 'express';
import { db } from '../db/store.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { logAudit } from '../services/audit.service.js';
import { sendNotification } from '../services/notification.service.js';
import { DoctorStatus } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

export async function getAdminAnalytics(req: AuthenticatedRequest, res: Response) {
  try {
    const users = db.getAllUsers();
    const doctors = db.getAllDoctors();
    const patients = db.getAllPatients();
    const appointments = db.getAllAppointments();

    const verifiedDoctors = doctors.filter((d) => d.status === 'VERIFIED');
    const pendingDoctors = doctors.filter((d) => d.status === 'PENDING');
    const rejectedDoctors = doctors.filter((d) => d.status === 'REJECTED');
    const suspendedDoctors = doctors.filter((d) => d.status === 'SUSPENDED');

    const completedAppointments = appointments.filter((a) => a.status === 'COMPLETED');
    const confirmedAppointments = appointments.filter((a) => a.status === 'CONFIRMED');
    const cancelledAppointments = appointments.filter((a) => a.status === 'CANCELLED');
    const pendingAppointments = appointments.filter((a) => a.status === 'PENDING');

    // Appointments by status for chart
    const statusDistribution = [
      { name: 'Completed', count: completedAppointments.length, fill: '#10b981' },
      { name: 'Confirmed', count: confirmedAppointments.length, fill: '#0ea5e9' },
      { name: 'Pending', count: pendingAppointments.length, fill: '#f59e0b' },
      { name: 'Cancelled', count: cancelledAppointments.length, fill: '#ef4444' },
    ];

    // Appointments by specialty
    const specialtyMap: Record<string, number> = {};
    appointments.forEach((apt) => {
      const doc = db.findDoctorById(apt.doctorId);
      if (doc) {
        specialtyMap[doc.specialization] = (specialtyMap[doc.specialization] || 0) + 1;
      }
    });

    const specialtyDistribution = Object.entries(specialtyMap).map(([specialty, count]) => ({
      specialty,
      count,
    }));

    // Appointments volume by day (last 7 days simulation / aggregation)
    const appointmentsByDateMap: Record<string, number> = {};
    appointments.forEach((apt) => {
      appointmentsByDateMap[apt.appointmentDate] = (appointmentsByDateMap[apt.appointmentDate] || 0) + 1;
    });

    const appointmentsByDate = Object.entries(appointmentsByDateMap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({
        date,
        count,
      }));

    return res.json({
      success: true,
      data: {
        summary: {
          totalUsers: users.length,
          totalPatients: patients.length,
          totalDoctors: doctors.length,
          verifiedDoctorsCount: verifiedDoctors.length,
          pendingDoctorsCount: pendingDoctors.length,
          rejectedDoctorsCount: rejectedDoctors.length,
          suspendedDoctorsCount: suspendedDoctors.length,
          totalAppointments: appointments.length,
          completedAppointmentsCount: completedAppointments.length,
          confirmedAppointmentsCount: confirmedAppointments.length,
          cancelledAppointmentsCount: cancelledAppointments.length,
        },
        charts: {
          statusDistribution,
          specialtyDistribution,
          appointmentsByDate,
        },
      },
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAllDoctorsAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const doctors = db.getAllDoctors();
    const enriched = doctors.map((doc) => {
      const user = db.findUserById(doc.userId);
      const hospital = doc.hospitalId ? db.findHospitalById(doc.hospitalId) : undefined;
      const department = doc.departmentId ? db.findDepartmentById(doc.departmentId) : undefined;
      const aptCount = db.getAppointmentsByDoctor(doc.id).length;
      return {
        ...doc,
        email: user?.email,
        isActive: user?.isActive,
        hospitalName: hospital?.name,
        departmentName: department?.name,
        totalAppointments: aptCount,
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

export async function updateDoctorStatusAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    const validStatuses: DoctorStatus[] = ['PENDING', 'VERIFIED', 'REJECTED', 'SUSPENDED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid doctor status.' });
    }

    const doctor = db.findDoctorById(id);
    if (!doctor) {
      return res.status(404).json({ success: false, error: 'Doctor not found.' });
    }

    const updated = db.updateDoctor(id, { status });

    sendNotification(
      doctor.userId,
      `Doctor Verification Update: ${status}`,
      `Your SmartCare physician profile status was updated to ${status}. ${remarks ? `Remarks: ${remarks}` : ''}`,
      'ACCOUNT_STATUS_CHANGED',
      '/doctor/dashboard'
    );

    logAudit(req, 'UPDATE_DOCTOR_STATUS', 'Doctor', id, { newStatus: status, remarks });

    return res.json({
      success: true,
      message: `Doctor status updated to ${status}.`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAllPatientsAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const patients = db.getAllPatients();
    const enriched = patients.map((pat) => {
      const user = db.findUserById(pat.userId);
      const aptCount = db.getAppointmentsByPatient(pat.id).length;
      const recCount = db.getMedicalRecordsByPatient(pat.id).length;
      return {
        ...pat,
        email: user?.email,
        isActive: user?.isActive ?? true,
        appointmentsCount: aptCount,
        recordsCount: recCount,
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

export async function toggleUserStatusAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const { userId } = req.params;
    const user = db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const updated = db.updateUser(userId, { isActive: !user.isActive });
    logAudit(req, 'TOGGLE_USER_STATUS', 'User', userId, { isActive: updated?.isActive });

    return res.json({
      success: true,
      message: `User account has been ${updated?.isActive ? 'activated' : 'deactivated'}.`,
      data: updated,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getHospitalsAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const hospitals = db.getAllHospitals();
    return res.json({ success: true, data: hospitals });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createHospitalAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, address, city, contactPhone, contactEmail } = req.body;
    if (!name || !address || !city || !contactPhone) {
      return res.status(400).json({ success: false, error: 'Hospital details are incomplete.' });
    }

    const hospId = `hosp-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();
    const hospital = db.createHospital({
      id: hospId,
      name,
      address,
      city,
      contactPhone,
      contactEmail,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    logAudit(req, 'CREATE_HOSPITAL', 'Hospital', hospId, { name, city });

    return res.status(201).json({
      success: true,
      message: 'Hospital added successfully.',
      data: hospital,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getDepartmentsAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const departments = db.getAllDepartments();
    return res.json({ success: true, data: departments });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function createDepartmentAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const { name, description, hospitalId } = req.body;
    if (!name) {
      return res.status(400).json({ success: false, error: 'Department name is required.' });
    }

    const deptId = `dept-${uuidv4().substring(0, 8)}`;
    const now = new Date().toISOString();
    const dept = db.createDepartment({
      id: deptId,
      name,
      description,
      hospitalId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    logAudit(req, 'CREATE_DEPARTMENT', 'Department', deptId, { name });

    return res.status(201).json({
      success: true,
      message: 'Department added successfully.',
      data: dept,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

export async function getAllAppointmentsAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const appointments = db.getAllAppointments();
    const enriched = appointments.map((apt) => {
      const doctor = db.findDoctorById(apt.doctorId);
      const patient = db.findPatientById(apt.patientId);
      return {
        ...apt,
        doctor: doctor ? { id: doctor.id, fullName: doctor.fullName, specialization: doctor.specialization } : undefined,
        patient: patient ? { id: patient.id, fullName: patient.fullName, phone: patient.phone } : undefined,
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

export async function getAuditLogsAdmin(req: AuthenticatedRequest, res: Response) {
  try {
    const { action, search } = req.query;
    let logs = db.getAllAuditLogs();

    if (action && typeof action === 'string') {
      logs = logs.filter((l) => l.action.toLowerCase() === action.toLowerCase());
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      logs = logs.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          (l.userEmail && l.userEmail.toLowerCase().includes(q)) ||
          l.entity.toLowerCase().includes(q)
      );
    }

    return res.json({
      success: true,
      data: logs.slice(0, 100),
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

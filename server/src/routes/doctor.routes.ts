import { Router } from 'express';
import {
  getPublicDoctors,
  getDoctorById,
  getDoctorProfile,
  updateDoctorProfile,
  getDoctorAvailability,
  updateDoctorAvailability,
  addDoctorBlockedDate,
  removeDoctorBlockedDate,
  getDoctorAppointments,
  getDoctorDashboardSummary,
  getAuthorizedPatientDetails,
} from '../controllers/doctor.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

// Public doctor discovery routes
router.get('/', getPublicDoctors);
router.get('/public/:id', getDoctorById);
router.get('/slots/public', getDoctorAvailability);

// Doctor protected routes
router.get('/portal/profile', authenticateToken, requireRole('DOCTOR'), getDoctorProfile);
router.put('/portal/profile', authenticateToken, requireRole('DOCTOR'), updateDoctorProfile);
router.get('/portal/availability', authenticateToken, requireRole('DOCTOR'), getDoctorAvailability);
router.put('/portal/availability', authenticateToken, requireRole('DOCTOR'), updateDoctorAvailability);
router.post('/portal/blocked-dates', authenticateToken, requireRole('DOCTOR'), addDoctorBlockedDate);
router.delete('/portal/blocked-dates/:date', authenticateToken, requireRole('DOCTOR'), removeDoctorBlockedDate);
router.get('/portal/appointments', authenticateToken, requireRole('DOCTOR'), getDoctorAppointments);
router.get('/portal/dashboard-summary', authenticateToken, requireRole('DOCTOR'), getDoctorDashboardSummary);
router.get('/portal/patients/:patientId', authenticateToken, requireRole('DOCTOR'), getAuthorizedPatientDetails);

export default router;

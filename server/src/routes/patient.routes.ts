import { Router } from 'express';
import {
  getPatientProfile,
  updatePatientProfile,
  getPatientAppointments,
  getPatientMedicalRecords,
  getPatientPrescriptions,
  getPatientDocuments,
  getPatientDashboardSummary,
} from '../controllers/patient.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('PATIENT'));

router.get('/dashboard-summary', getPatientDashboardSummary);
router.get('/profile', getPatientProfile);
router.put('/profile', updatePatientProfile);
router.get('/appointments', getPatientAppointments);
router.get('/medical-records', getPatientMedicalRecords);
router.get('/prescriptions', getPatientPrescriptions);
router.get('/documents', getPatientDocuments);

export default router;

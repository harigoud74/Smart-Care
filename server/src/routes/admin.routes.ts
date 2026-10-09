import { Router } from 'express';
import {
  getAdminAnalytics,
  getAllDoctorsAdmin,
  updateDoctorStatusAdmin,
  getAllPatientsAdmin,
  toggleUserStatusAdmin,
  getHospitalsAdmin,
  createHospitalAdmin,
  getDepartmentsAdmin,
  createDepartmentAdmin,
  getAllAppointmentsAdmin,
  getAuditLogsAdmin,
} from '../controllers/admin.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.use(requireRole('ADMIN'));

router.get('/analytics', getAdminAnalytics);
router.get('/doctors', getAllDoctorsAdmin);
router.put('/doctors/:id/status', updateDoctorStatusAdmin);
router.get('/patients', getAllPatientsAdmin);
router.put('/users/:userId/toggle-status', toggleUserStatusAdmin);
router.get('/hospitals', getHospitalsAdmin);
router.post('/hospitals', createHospitalAdmin);
router.get('/departments', getDepartmentsAdmin);
router.post('/departments', createDepartmentAdmin);
router.get('/appointments', getAllAppointmentsAdmin);
router.get('/audit-logs', getAuditLogsAdmin);

export default router;

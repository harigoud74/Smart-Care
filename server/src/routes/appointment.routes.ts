import { Router } from 'express';
import {
  getDoctorSlots,
  createAppointment,
  rescheduleAppointment,
  cancelAppointment,
  updateAppointmentStatus,
} from '../controllers/appointment.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// Public / Semi-public: checking available slots
router.get('/slots', getDoctorSlots);

// Authenticated booking operations
router.post('/', authenticateToken, createAppointment);
router.put('/:id/reschedule', authenticateToken, rescheduleAppointment);
router.put('/:id/cancel', authenticateToken, cancelAppointment);
router.put('/:id/status', authenticateToken, updateAppointmentStatus);

export default router;

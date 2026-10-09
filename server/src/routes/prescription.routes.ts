import { Router } from 'express';
import { createPrescription, getPrescriptionById } from '../controllers/prescription.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, requireRole('DOCTOR'), createPrescription);
router.get('/:id', authenticateToken, getPrescriptionById);

export default router;

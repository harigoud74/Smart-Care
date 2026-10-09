import { Router } from 'express';
import { createMedicalRecord, getMedicalRecordById } from '../controllers/record.controller.js';
import { authenticateToken, requireRole } from '../middleware/auth.js';

const router = Router();

router.post('/', authenticateToken, requireRole('DOCTOR'), createMedicalRecord);
router.get('/:id', authenticateToken, getMedicalRecordById);

export default router;

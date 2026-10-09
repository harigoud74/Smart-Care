import { Router } from 'express';
import { uploadMedicalDocument, deleteMedicalDocument } from '../controllers/document.controller.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);
router.post('/upload', uploadMedicalDocument);
router.delete('/:id', deleteMedicalDocument);

export default router;

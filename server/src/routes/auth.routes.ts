import { Router } from 'express';
import {
  registerPatient,
  registerDoctor,
  login,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  googleSignIn,
} from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { rateLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.post('/register', rateLimiter(20), registerPatient);
router.post('/register-doctor', rateLimiter(20), registerDoctor);
router.post('/login', rateLimiter(30), login);
router.post('/google', rateLimiter(30), googleSignIn);
router.get('/me', authenticateToken, getCurrentUser);
router.post('/forgot-password', rateLimiter(10), forgotPassword);
router.post('/reset-password', rateLimiter(10), resetPassword);

export default router;

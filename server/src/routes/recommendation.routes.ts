import { Router } from 'express';
import { getSmartRecommendation } from '../controllers/recommendation.controller.js';
import { rateLimiter } from '../middleware/rate-limiter.js';

const router = Router();

router.post('/', rateLimiter(40), getSmartRecommendation);

export default router;

import { Router } from 'express';
import {
  handleGeminiChatRoute,
  handleGroundedSearchRoute,
  handleAudioTranscriptionRoute,
} from '../controllers/gemini.controller.js';

const router = Router();

router.post('/chat', handleGeminiChatRoute);
router.post('/search', handleGroundedSearchRoute);
router.post('/transcribe', handleAudioTranscriptionRoute);

export default router;

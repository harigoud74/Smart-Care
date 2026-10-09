import { Request, Response } from 'express';
import {
  executeGeminiChat,
  executeGroundedSearch,
  executeAudioTranscription,
} from '../services/gemini.service.js';

export async function handleGeminiChatRoute(req: Request, res: Response) {
  try {
    const { message, history, model, role, systemInstruction } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ success: false, error: 'A message string is required.' });
    }

    const result = await executeGeminiChat({
      message,
      history,
      model,
      role,
      systemInstruction,
    });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Gemini Chat Controller Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Chat failed' });
  }
}

export async function handleGroundedSearchRoute(req: Request, res: Response) {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ success: false, error: 'A search query string is required.' });
    }

    const result = await executeGroundedSearch(query);
    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Gemini Search Controller Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Search grounding failed' });
  }
}

export async function handleAudioTranscriptionRoute(req: Request, res: Response) {
  try {
    const { audioBase64, mimeType, prompt } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ success: false, error: 'Audio data is required for transcription.' });
    }

    const result = await executeAudioTranscription({
      audioBase64,
      mimeType: mimeType || 'audio/webm',
      prompt,
    });

    return res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('[Gemini Transcription Controller Error]:', error);
    return res.status(500).json({ success: false, error: error.message || 'Transcription failed' });
  }
}

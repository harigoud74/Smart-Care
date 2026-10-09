import { Request, Response } from 'express';
import { recommendDepartmentAndDoctor } from '../services/recommendation.service.js';

export async function getSmartRecommendation(req: Request, res: Response) {
  try {
    const { symptoms } = req.body;
    if (!symptoms || typeof symptoms !== 'string' || symptoms.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please describe your symptoms or health concern (e.g. "persistent knee pain and difficulty walking").',
      });
    }

    const recommendation = await recommendDepartmentAndDoctor(symptoms);
    return res.json({
      success: true,
      data: recommendation,
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}

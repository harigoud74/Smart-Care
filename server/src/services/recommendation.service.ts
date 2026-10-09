import { db } from '../db/store.js';
import { Doctor } from '../types/index.js';
import { ai } from './gemini.service.js';
import { config } from '../config/index.js';

export interface RecommendationResult {
  recommendedDepartment: string;
  confidenceScore: number;
  reasoning: string;
  suggestedSpecialty: string;
  isEmergency: boolean;
  emergencyWarning?: string;
  disclaimer: string;
  matchedDoctors: Doctor[];
  urgencyRecommendation: 'ROUTINE' | 'URGENT' | 'EMERGENCY';
}

const EMERGENCY_KEYWORDS = [
  'crushing chest pain',
  'loss of consciousness',
  'unconscious',
  'cannot breathe',
  "can't breathe",
  'sudden numbness in face',
  'slurred speech',
  'stroke',
  'coughing up blood',
  'severe bleeding',
  'severe burn',
  'suicidal thoughts',
  'head trauma',
];

const SPECIALTY_KEYWORDS: Record<string, { specialty: string; keywords: string[]; reasoning: string }> = {
  Cardiology: {
    specialty: 'Cardiologist',
    keywords: [
      'chest pain',
      'heart',
      'palpitations',
      'racing heart',
      'hypertension',
      'blood pressure',
      'cholesterol',
      'cardiac',
      'angina',
      'irregular heartbeat',
    ],
    reasoning: 'Symptoms relate to cardiovascular rhythms, blood circulation, or heart health.',
  },
  Orthopedics: {
    specialty: 'Orthopedic Surgeon / Specialist',
    keywords: [
      'knee pain',
      'joint',
      'bone',
      'fracture',
      'back pain',
      'difficulty walking',
      'sprain',
      'ligament',
      'arthritis',
      'hip pain',
      'shoulder pain',
      'swollen ankle',
    ],
    reasoning: 'Symptoms point to musculoskeletal issues involving bones, joints, ligaments, or mobility.',
  },
  Dermatology: {
    specialty: 'Dermatologist',
    keywords: [
      'skin rash',
      'itching',
      'rash',
      'acne',
      'eczema',
      'psoriasis',
      'mole',
      'hair loss',
      'skin peeling',
      'hives',
      'fungal infection',
      'blisters',
    ],
    reasoning: 'Symptoms affect the skin, scalp, epidermal barriers, or cutaneous conditions.',
  },
  Neurology: {
    specialty: 'Neurologist',
    keywords: [
      'migraine',
      'severe headache',
      'headache',
      'dizziness',
      'vertigo',
      'tingling',
      'numbness',
      'seizures',
      'tremors',
      'memory loss',
      'nerve pain',
    ],
    reasoning: 'Symptoms involve the central or peripheral nervous systems, headaches, or neuromuscular control.',
  },
  Pediatrics: {
    specialty: 'Pediatrician',
    keywords: [
      'child',
      'baby',
      'infant',
      'toddler',
      'kid',
      'pediatric',
      'childhood fever',
      'child vaccination',
      'baby colic',
    ],
    reasoning: 'Patient is a child or adolescent requiring specialized pediatric clinical assessment.',
  },
  Gastroenterology: {
    specialty: 'Gastroenterologist',
    keywords: [
      'stomach pain',
      'acid reflux',
      'heartburn',
      'vomiting',
      'diarrhea',
      'constipation',
      'bloating',
      'abdomen',
      'indigestion',
      'nausea',
      'stomach cramps',
    ],
    reasoning: 'Symptoms suggest gastrointestinal or digestive system disturbances.',
  },
  Pulmonology: {
    specialty: 'Pulmonologist',
    keywords: [
      'shortness of breath',
      'wheezing',
      'persistent cough',
      'asthma',
      'bronchitis',
      'breathing difficulty',
      'phlegm',
      'lung',
    ],
    reasoning: 'Symptoms relate to airways, lung capacity, and respiratory function.',
  },
  'General Medicine': {
    specialty: 'General Physician / Internist',
    keywords: [
      'fever',
      'fatigue',
      'body ache',
      'weakness',
      'cold',
      'chills',
      'viral',
      'routine checkup',
      'general illness',
      'unwell',
    ],
    reasoning: 'Symptoms represent systemic or general primary care concerns suitable for initial triage.',
  },
};

const STANDARD_DISCLAIMER =
  'AI-assisted healthcare navigation. This feature provides general guidance and is not a medical diagnosis. For emergencies or severe symptoms, seek immediate professional medical care.';

export async function recommendDepartmentAndDoctor(
  symptomQuery: string
): Promise<RecommendationResult> {
  const normalized = symptomQuery.toLowerCase().trim();

  // 1. Check for urgent/critical emergencies
  const matchedEmergency = EMERGENCY_KEYWORDS.find((ek) => normalized.includes(ek));
  if (matchedEmergency) {
    const verifiedDocs = db.getAllDoctors(true).filter((d) => d.specialization === 'Cardiology' || d.specialization === 'General Medicine');
    return {
      recommendedDepartment: 'Emergency Department / Urgent Care',
      confidenceScore: 0.99,
      reasoning: `Critical symptoms detected ("${matchedEmergency}"). Immediate emergency evaluation is vital.`,
      suggestedSpecialty: 'Emergency Medicine / Critical Care',
      isEmergency: true,
      emergencyWarning:
        'EMERGENCY WARNING: Your described symptoms may indicate an acute life-threatening medical situation. Please call 911 (or your local emergency number) or proceed immediately to the nearest hospital Emergency Room.',
      disclaimer: STANDARD_DISCLAIMER,
      matchedDoctors: verifiedDocs.slice(0, 3),
      urgencyRecommendation: 'EMERGENCY',
    };
  }

  // 2. Optional: Gemini AI enhanced classification if API key is present
  if (config.geminiApiKey) {
    try {
      const prompt = `You are a medical triage assistant for SmartCare.
A patient has entered the following symptoms/request: "${symptomQuery}"
Based on these symptoms, determine the best medical department from this list:
[Cardiology, Orthopedics, Dermatology, Neurology, Pediatrics, Gastroenterology, Pulmonology, General Medicine]

Respond ONLY with valid JSON in this exact structure:
{
  "department": "DepartmentName",
  "reasoning": "A concise explanation of why this department is appropriate (max 2 sentences)",
  "urgency": "ROUTINE" | "URGENT"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const text = response.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const deptName = parsed.department || 'General Medicine';
        const matchedDocs = db
          .getAllDoctors(true)
          .filter((d) => d.specialization.toLowerCase() === deptName.toLowerCase());

        return {
          recommendedDepartment: deptName,
          confidenceScore: 0.95,
          reasoning: parsed.reasoning || SPECIALTY_KEYWORDS[deptName]?.reasoning || 'Clinically aligned specialty based on symptom description.',
          suggestedSpecialty: SPECIALTY_KEYWORDS[deptName]?.specialty || `${deptName} Specialist`,
          isEmergency: false,
          disclaimer: STANDARD_DISCLAIMER,
          matchedDoctors: matchedDocs.length > 0 ? matchedDocs : db.getAllDoctors(true).slice(0, 3),
          urgencyRecommendation: parsed.urgency === 'URGENT' ? 'URGENT' : 'ROUTINE',
        };
      }
    } catch (err) {
      console.warn('Gemini triage call did not return structured JSON, falling back to rule engine:', err);
    }
  }

  // 3. Fallback: Rule-based Heuristic Keyword Matcher
  let bestDepartment = 'General Medicine';
  let bestScore = 0;
  let bestReasoning = SPECIALTY_KEYWORDS['General Medicine'].reasoning;

  for (const [dept, info] of Object.entries(SPECIALTY_KEYWORDS)) {
    let matchCount = 0;
    for (const kw of info.keywords) {
      if (normalized.includes(kw)) {
        matchCount += 1;
      }
    }
    if (matchCount > bestScore) {
      bestScore = matchCount;
      bestDepartment = dept;
      bestReasoning = info.reasoning;
    }
  }

  const confidenceScore = bestScore > 0 ? Math.min(0.75 + bestScore * 0.08, 0.94) : 0.65;
  const matchedDocs = db
    .getAllDoctors(true)
    .filter((d) => d.specialization.toLowerCase() === bestDepartment.toLowerCase());

  return {
    recommendedDepartment: bestDepartment,
    confidenceScore: Number(confidenceScore.toFixed(2)),
    reasoning: bestReasoning,
    suggestedSpecialty: SPECIALTY_KEYWORDS[bestDepartment]?.specialty || `${bestDepartment} Specialist`,
    isEmergency: false,
    disclaimer: STANDARD_DISCLAIMER,
    matchedDoctors: matchedDocs.length > 0 ? matchedDocs : db.getAllDoctors(true).slice(0, 3),
    urgencyRecommendation: normalized.includes('severe') || normalized.includes('urgent') ? 'URGENT' : 'ROUTINE',
  };
}

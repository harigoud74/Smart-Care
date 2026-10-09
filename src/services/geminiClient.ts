import { apiRequest } from './api';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface GroundedSearchResult {
  answer: string;
  sources: GroundingSource[];
  searchQueries?: string[];
}

/**
 * Sends a chat message to Gemini with specified model:
 * - gemini-3.1-pro-preview: For complex tasks
 * - gemini-3.5-flash: For general tasks
 * - gemini-3.1-flash-lite: For tasks that should happen fast
 */
export async function sendGeminiChat(params: {
  message: string;
  history?: ChatMessage[];
  model?: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
  role?: string;
  systemInstruction?: string;
}): Promise<{ reply: string; modelUsed: string }> {
  const res = await apiRequest<{ reply: string; modelUsed: string }>('/gemini/chat', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (!res.success || !res.data) {
    throw new Error(res.error || 'Failed to communicate with Gemini Chat.');
  }

  return res.data;
}

/**
 * Executes Search Grounding using gemini-3.5-flash with googleSearch tool
 */
export async function searchWithGrounding(query: string): Promise<GroundedSearchResult> {
  const res = await apiRequest<GroundedSearchResult>('/gemini/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });

  if (!res.success || !res.data) {
    throw new Error(res.error || 'Failed to retrieve grounded search results.');
  }

  return res.data;
}

/**
 * Transcribes audio recording using gemini-3.5-transcribe
 */
export async function transcribeAudioWithGemini(params: {
  audioBase64: string;
  mimeType: string;
  prompt?: string;
}): Promise<string> {
  const res = await apiRequest<{ transcript: string }>('/gemini/transcribe', {
    method: 'POST',
    body: JSON.stringify(params),
  });

  if (!res.success || !res.data) {
    throw new Error(res.error || 'Failed to transcribe audio.');
  }

  return res.data.transcript;
}

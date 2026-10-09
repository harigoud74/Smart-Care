import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer } from 'ws';
import http from 'http';

// Centralized Gemini AI client with required User-Agent header
export const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

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
 * Handle Multi-turn Chat using Gemini.
 * Model Selection:
 * - gemini-3.1-pro-preview: For particularly complex tasks (e.g. differential diagnosis, complex oncology/cardiology review)
 * - gemini-3.5-flash: For general tasks (e.g. patient guidance, medication explanations)
 * - gemini-3.1-flash-lite: For tasks that should happen fast (e.g. quick triage, quick clinic info)
 */
export async function executeGeminiChat(params: {
  message: string;
  history?: ChatMessage[];
  model?: string;
  role?: string;
  systemInstruction?: string;
}): Promise<{ reply: string; modelUsed: string }> {
  // Validate model selection
  let chosenModel = params.model || 'gemini-3.5-flash';
  const validModels = ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
  if (!validModels.includes(chosenModel)) {
    chosenModel = 'gemini-3.5-flash';
  }

  const roleDescription = params.role || 'Clinical Assistant';
  const baseInstruction =
    params.systemInstruction ||
    `You are SmartCare AI, an empathetic, highly trained ${roleDescription}.
You assist patients and healthcare practitioners with structured, compassionate, and medically sound information.
Always maintain high clinical clarity, summarize complex health concepts plainly, advise when urgent in-person medical care is needed, and keep responses engaging and helpful.`;

  try {
    const chat = ai.chats.create({
      model: chosenModel,
      config: {
        systemInstruction: baseInstruction,
      },
    });

    // Replay previous conversation turns if provided
    if (params.history && params.history.length > 0) {
      for (const turn of params.history) {
        if (turn.role === 'user') {
          // Pre-populate chat context
          await chat.sendMessage({ message: turn.text });
        }
      }
    }

    const response = await chat.sendMessage({
      message: params.message,
    });

    return {
      reply: response.text || 'I apologize, but I could not formulate a response at this moment.',
      modelUsed: chosenModel,
    };
  } catch (error: any) {
    console.error('[Gemini Chat Error]:', error);
    // Fallback gracefully if high-tier model quota is constrained
    if (chosenModel !== 'gemini-3.5-flash') {
      try {
        const fallbackChat = ai.chats.create({
          model: 'gemini-3.5-flash',
          config: { systemInstruction: baseInstruction },
        });
        const response = await fallbackChat.sendMessage({ message: params.message });
        return {
          reply: response.text || 'Response generated via fallback triage model.',
          modelUsed: 'gemini-3.5-flash',
        };
      } catch (fallbackError: any) {
        throw new Error(fallbackError?.message || 'Gemini Chat service unavailable');
      }
    }
    throw new Error(error?.message || 'Gemini Chat service error');
  }
}

/**
 * Handle Search Grounding using gemini-3.5-flash with googleSearch tool
 * Retrieves up-to-date health information, guidelines, outbreaks, and medication warnings with web citations.
 */
export async function executeGroundedSearch(query: string): Promise<GroundedSearchResult> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Provide an accurate, up-to-date, and verified medical and healthcare answer with grounded search information for the following question: "${query}". Include practical health context and verified references.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const answer = response.text || 'No detailed information could be retrieved for this query.';
    const sources: GroundingSource[] = [];
    const searchQueries: string[] = [];

    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;

    if (groundingMetadata?.webSearchQueries) {
      searchQueries.push(...groundingMetadata.webSearchQueries);
    }

    if (groundingMetadata?.groundingChunks) {
      for (const chunk of groundingMetadata.groundingChunks) {
        if (chunk.web?.uri) {
          sources.push({
            title: chunk.web.title || new URL(chunk.web.uri).hostname,
            uri: chunk.web.uri,
          });
        }
      }
    }

    // Deduplicate sources by URI
    const uniqueSources = sources.filter(
      (source, index, self) => index === self.findIndex((s) => s.uri === source.uri)
    );

    return {
      answer,
      sources: uniqueSources,
      searchQueries,
    };
  } catch (error: any) {
    console.error('[Gemini Search Grounding Error]:', error);
    throw new Error(error?.message || 'Search Grounding failed');
  }
}

/**
 * Handle Audio Transcription using gemini-3.5-transcribe
 * Takes audio data (base64 string and mimeType) and returns precise clinical transcription.
 */
export async function executeAudioTranscription(params: {
  audioBase64: string;
  mimeType: string;
  prompt?: string;
}): Promise<{ transcript: string; durationEstimate?: string }> {
  try {
    const audioPart = {
      inlineData: {
        mimeType: params.mimeType || 'audio/webm',
        data: params.audioBase64,
      },
    };

    const instruction =
      params.prompt ||
      'Transcribe this spoken healthcare / clinical audio note accurately, including medical terminology, patient symptoms, and doctor observations. Provide clear, well-punctuated text.';

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [audioPart, { text: instruction }],
      },
    });

    const transcript = response.text?.trim() || '';
    return {
      transcript: transcript || 'No speech detected in audio recording.',
    };
  } catch (error: any) {
    console.error('[Gemini Transcription Error]:', error);
    throw new Error(error?.message || 'Audio transcription failed');
  }
}

/**
 * Configure WebSocket server for Gemini Live API (gemini-3.8-live)
 * Allows bidirectional, real-time voice conversations between user/patient/doctor and Gemini Live.
 */
export function setupGeminiLiveWebSocket(server: http.Server) {
  const wss = new WebSocketServer({ server, path: '/live' });

  wss.on('connection', async (clientWs) => {
    console.log('[Gemini Live] Client connected to live voice consultation session.');

    let session: any = null;

    try {
      session = await ai.live.connect({
        model: 'gemini-3.8-live',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction:
            'You are Dr. SmartCare Live, a certified, caring, and highly articulate clinical voice assistant. You are having an interactive voice consultation with a patient or doctor. Speak warmly, clearly, and concisely (1-3 sentences per turn where possible). Advise emergency services immediately for acute symptoms.',
        },
        callbacks: {
          onmessage: (message: LiveServerMessage) => {
            try {
              const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
              if (audio) {
                clientWs.send(JSON.stringify({ type: 'audio', audio }));
              }
              if (message.serverContent?.interrupted) {
                clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
              }
            } catch (err) {
              console.error('[Gemini Live Send Error]:', err);
            }
          },
        },
      });

      clientWs.send(JSON.stringify({ type: 'status', status: 'connected', message: 'Gemini 3.8 Live session active' }));
    } catch (err: any) {
      console.error('[Gemini Live Connect Error]:', err);
      clientWs.send(JSON.stringify({ type: 'error', error: err?.message || 'Failed to start Live session' }));
      clientWs.close();
      return;
    }

    clientWs.on('message', (data) => {
      try {
        const parsed = JSON.parse(data.toString());
        if (parsed.audio && session) {
          // Send 16kHz PCM audio to Gemini Live session
          session.sendRealtimeInput({
            audio: { data: parsed.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (parsed.text && session) {
          session.sendRealtimeInput({
            text: parsed.text,
          });
        }
      } catch (err) {
        console.error('[Gemini Live Message Error]:', err);
      }
    });

    clientWs.on('close', () => {
      console.log('[Gemini Live] Client disconnected.');
      try {
        if (session) {
          session.close();
        }
      } catch (e) {
        // ignore close error
      }
    });

    clientWs.on('error', (err) => {
      console.error('[Gemini Live Client WS Error]:', err);
    });
  });

  return wss;
}

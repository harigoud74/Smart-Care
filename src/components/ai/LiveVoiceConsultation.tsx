import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, PhoneCall, PhoneOff, Volume2, Sparkles, Activity, AlertCircle, Info } from 'lucide-react';

export const LiveVoiceConsultation: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isTalking, setIsTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [statusText, setStatusText] = useState('Ready to connect to Dr. SmartCare Live');
  const [volumeLevel, setVolumeLevel] = useState(0);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
  const isMutedRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // Convert Float32Array audio samples into 16-bit PCM little-endian Base64
  const floatTo16BitPCMBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  };

  // Convert incoming 16-bit PCM base64 back to Float32Array and play at 24kHz
  const playPCMChunk = (base64Audio: string) => {
    if (!outputAudioCtxRef.current) return;
    const ctx = outputAudioCtxRef.current;

    const binaryString = window.atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const int16Array = new Int16Array(bytes.buffer);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768.0;
    }

    const audioBuffer = ctx.createBuffer(1, float32Array.length, 24000);
    audioBuffer.copyToChannel(float32Array, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    // Schedule gapless playback
    const currentTime = ctx.currentTime;
    if (nextStartTimeRef.current < currentTime) {
      nextStartTimeRef.current = currentTime + 0.05; // tiny safety buffer
    }

    source.start(nextStartTimeRef.current);
    nextStartTimeRef.current += audioBuffer.duration;

    activeSourcesRef.current.push(source);
    setIsTalking(true);

    source.onended = () => {
      activeSourcesRef.current = activeSourcesRef.current.filter((s) => s !== source);
      if (activeSourcesRef.current.length === 0) {
        setIsTalking(false);
      }
    };
  };

  const handleInterruption = () => {
    // Stop all scheduled sources immediately on user interruption
    activeSourcesRef.current.forEach((src) => {
      try {
        src.stop();
      } catch (e) {}
    });
    activeSourcesRef.current = [];
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    }
    setIsTalking(false);
  };

  const startVoiceSession = async () => {
    try {
      setStatusText('Requesting microphone access...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // Audio contexts
      inputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 16000,
      });
      outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });

      // WebSocket connection to backend Gemini Live bridge
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      setStatusText('Connecting to Gemini 3.8 Live session...');

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setStatusText('Live Voice Consultation active with Dr. SmartCare');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === 'audio' && msg.audio) {
            playPCMChunk(msg.audio);
          } else if (msg.type === 'interrupted') {
            handleInterruption();
          } else if (msg.type === 'status') {
            setStatusText(msg.message || 'Connected to Gemini Live');
          } else if (msg.type === 'error') {
            setStatusText(`Error: ${msg.error}`);
          }
        } catch (e) {
          console.error('[Live Voice Parse Error]:', e);
        }
      };

      ws.onerror = (e) => {
        console.error('[Live Voice WS Error]:', e);
        setStatusText('Voice WebSocket connection error.');
      };

      ws.onclose = () => {
        setIsConnected(false);
        setStatusText('Live Voice session concluded.');
        stopVoiceSession();
      };

      // Set up microphone capture pipeline
      const source = inputAudioCtxRef.current.createMediaStreamSource(stream);
      const processor = inputAudioCtxRef.current.createScriptProcessor(4096, 1, 1);
      processorRef.current = processor;

      processor.onaudioprocess = (e) => {
        if (isMutedRef.current || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
          return;
        }

        const inputData = e.inputBuffer.getChannelData(0);

        // Simple volume meter
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        setVolumeLevel(Math.min(100, Math.round(rms * 250)));

        const base64Pcm = floatTo16BitPCMBase64(inputData);
        wsRef.current.send(JSON.stringify({ audio: base64Pcm }));
      };

      source.connect(processor);
      processor.connect(inputAudioCtxRef.current.destination);
    } catch (err: any) {
      console.error('[Live Voice Start Error]:', err);
      setStatusText(err.message || 'Could not access microphone.');
      setIsConnected(false);
    }
  };

  const stopVoiceSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close().catch(() => {});
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close().catch(() => {});
      outputAudioCtxRef.current = null;
    }
    handleInterruption();
    setIsConnected(false);
    setIsTalking(false);
    setVolumeLevel(0);
    setStatusText('Session ended. Click Start to speak again.');
  };

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, []);

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-tr from-sky-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Dr. SmartCare Live Voice Consultation</h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full">
                gemini-3.8-live
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Real-time conversational medical assistant powered by Gemini Live API
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isConnected ? (
            <button
              onClick={stopVoiceSession}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <PhoneOff className="w-4 h-4" /> End Call
            </button>
          ) : (
            <button
              onClick={startVoiceSession}
              className="px-5 py-2.5 bg-linear-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4" /> Start Live Voice Call
            </button>
          )}
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6 relative overflow-hidden">
        {/* Glow effect */}
        {isConnected && (
          <div
            className={`absolute w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-500 ${
              isTalking ? 'bg-indigo-500 scale-125' : 'bg-sky-400 scale-100'
            }`}
          />
        )}

        {/* Central Orb / Visualizer */}
        <div className="relative">
          <div
            className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
              !isConnected
                ? 'bg-slate-200 text-slate-400'
                : isTalking
                ? 'bg-linear-to-tr from-indigo-600 to-purple-600 text-white ring-8 ring-indigo-200 animate-pulse'
                : 'bg-linear-to-tr from-sky-500 to-teal-500 text-white ring-8 ring-sky-100'
            }`}
          >
            {isTalking ? (
              <Activity className="w-14 h-14 animate-spin text-white" />
            ) : isConnected ? (
              <Mic className="w-14 h-14 text-white" />
            ) : (
              <MicOff className="w-12 h-12" />
            )}
          </div>

          {/* Volume wave ring */}
          {isConnected && !isMuted && volumeLevel > 5 && (
            <div
              className="absolute inset-0 rounded-full border-4 border-sky-400 animate-ping opacity-40 pointer-events-none"
              style={{ animationDuration: '1.2s' }}
            />
          )}
        </div>

        {/* Status indicator */}
        <div className="space-y-1.5 max-w-md">
          <div className="flex items-center justify-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                isConnected
                  ? isTalking
                    ? 'bg-indigo-600 animate-ping'
                    : 'bg-emerald-500'
                  : 'bg-slate-400'
              }`}
            />
            <span className="text-xs font-bold text-slate-800">
              {isConnected
                ? isTalking
                  ? 'Dr. SmartCare is speaking...'
                  : isMuted
                  ? 'Microphone muted'
                  : 'Listening to your voice...'
                : 'Inactive'}
            </span>
          </div>
          <p className="text-xs text-slate-500">{statusText}</p>
        </div>

        {/* Controls when connected */}
        {isConnected && (
          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-2 cursor-pointer ${
                isMuted
                  ? 'bg-amber-100 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {isMuted ? <MicOff className="w-4 h-4 text-amber-700" /> : <Mic className="w-4 h-4 text-slate-600" />}
              {isMuted ? 'Unmute Mic' : 'Mute Mic'}
            </button>

            <button
              onClick={handleInterruption}
              className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" /> Interrupt / New Question
            </button>
          </div>
        )}
      </div>

      {/* Guidance footnote */}
      <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl flex items-start gap-3 text-xs text-sky-900">
        <Info className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-bold">Real-time Bidirectional Audio Streaming</p>
          <p className="text-sky-800 text-[11px] mt-0.5">
            Gemini 3.8 Live processes incoming 16kHz microphone audio streaming over a high-speed WebSocket and responds with synthesized 24kHz audio in real time. You can speak naturally, describe your symptoms, ask questions about medications, or request health recommendations.
          </p>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef } from 'react';
import {
  Mic,
  Square,
  Upload,
  FileAudio,
  Copy,
  Check,
  Sparkles,
  Bookmark,
  Volume2,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { transcribeAudioWithGemini } from '../../services/geminiClient';
import { useAuth } from '../../context/AuthContext';
import {
  saveAudioTranscriptionToFirestore,
  getAudioTranscriptionsFromFirestore,
  FirestoreAudioTranscription,
} from '../../firebase/firestoreService';

export const AudioTranscriber: React.FC = () => {
  const { user } = useAuth();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [transcription, setTranscription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [recentTranscriptions, setRecentTranscriptions] = useState<FirestoreAudioTranscription[]>([]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);

  // Load user transcriptions from Firestore
  React.useEffect(() => {
    if (user?.id) {
      getAudioTranscriptionsFromFirestore(user.id).then((items) => {
        setRecentTranscriptions(items);
      });
    }
  }, [user?.id]);

  const startRecording = async () => {
    setError(null);
    setTranscription('');
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType || 'audio/webm',
        });
        stream.getTracks().forEach((track) => track.stop());
        await processAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Microphone access denied or unavailable.');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const processAudioBlob = async (blob: Blob) => {
    setLoading(true);
    setError(null);
    try {
      const base64Audio = await blobToBase64(blob);
      const mimeType = blob.type || 'audio/webm';
      const text = await transcribeAudioWithGemini({
        audioBase64: base64Audio,
        mimeType,
        prompt:
          'Transcribe this healthcare audio recording accurately. Include patient symptoms, clinical details, and medical terminology.',
      });

      setTranscription(text);

      // Persist to Cloud Firestore if logged in
      if (user?.id && text) {
        const item: FirestoreAudioTranscription = {
          id: `trans-${Date.now()}`,
          userId: user.id,
          text,
          category: 'Clinical Voice Dictation',
          createdAt: new Date().toISOString(),
        };
        await saveAudioTranscriptionToFirestore(item);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
        setRecentTranscriptions((prev) => [item, ...prev]);
      }
    } catch (err: any) {
      setError(err.message || 'Audio transcription failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processAudioBlob(file);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(transcription);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-linear-to-tr from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-md">
            <Mic className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-slate-900">Clinical Speech-to-Text Transcription</h2>
              <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 rounded-full">
                gemini-3.5-transcribe
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Dictate symptoms, clinical observations, or doctor consultation notes using microphone audio
            </p>
          </div>
        </div>
      </div>

      {/* Recording Stage */}
      <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-5">
        <div className="relative">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={loading}
            className={`w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-lg cursor-pointer ${
              isRecording
                ? 'bg-rose-600 text-white animate-pulse ring-8 ring-rose-200'
                : 'bg-amber-500 hover:bg-amber-600 text-white ring-8 ring-amber-100'
            }`}
          >
            {isRecording ? <Square className="w-8 h-8 fill-current" /> : <Mic className="w-10 h-10" />}
          </button>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-800">
            {isRecording ? `Recording Audio... (${formatSeconds(recordingSeconds)})` : 'Click to Record Microphone'}
          </p>
          <p className="text-xs text-slate-500">
            {isRecording
              ? 'Speak symptoms clearly into your microphone, then click stop.'
              : 'Or upload an existing audio file (.mp3, .wav, .webm)'}
          </p>
        </div>

        {/* Upload File Alternative */}
        {!isRecording && (
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 transition cursor-pointer shadow-2xs">
            <Upload className="w-4 h-4 text-slate-500" />
            <span>Upload Audio File</span>
            <input type="file" accept="audio/*" onChange={handleFileUpload} className="hidden" />
          </label>
        )}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-center gap-3 text-xs text-amber-900 font-semibold animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-600 animate-spin" />
          <span>Processing audio with gemini-3.5-transcribe...</span>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-2xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Transcription Output */}
      {transcription && (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Transcribed Clinical Text
              </span>
            </div>

            <div className="flex items-center gap-2">
              {savedSuccess && (
                <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded-full">
                  Saved to Firestore
                </span>
              )}
              <button
                onClick={copyToClipboard}
                className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                {copied ? 'Copied' : 'Copy Text'}
              </button>
            </div>
          </div>

          <div className="text-xs sm:text-sm text-slate-800 leading-relaxed bg-white p-4 rounded-xl border border-slate-200 shadow-2xs font-normal whitespace-pre-line">
            {transcription}
          </div>
        </div>
      )}

      {/* Recent Transcriptions Saved to Firestore */}
      {recentTranscriptions.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Bookmark className="w-4 h-4 text-amber-600" /> Saved Voice Dictations ({recentTranscriptions.length})
          </h3>
          <div className="space-y-2">
            {recentTranscriptions.slice(0, 3).map((item) => (
              <div
                key={item.id}
                className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs shadow-2xs"
              >
                <div className="min-w-0">
                  <p className="text-slate-800 font-medium truncate">{item.text}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(item.createdAt).toLocaleString()} • {item.category}
                  </span>
                </div>
                <button
                  onClick={() => setTranscription(item.text)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-amber-50 text-slate-700 hover:text-amber-800 rounded-lg text-[11px] font-bold shrink-0 transition cursor-pointer"
                >
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

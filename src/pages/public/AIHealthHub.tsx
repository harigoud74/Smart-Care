import React, { useState } from 'react';
import {
  Volume2,
  Bot,
  Globe,
  Mic,
  Sparkles,
  Database,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { LiveVoiceConsultation } from '../../components/ai/LiveVoiceConsultation';
import { GeminiChatbot } from '../../components/ai/GeminiChatbot';
import { SearchGroundingTool } from '../../components/ai/SearchGroundingTool';
import { AudioTranscriber } from '../../components/ai/AudioTranscriber';
import { useAuth } from '../../context/AuthContext';

interface AIHealthHubProps {
  initialTab?: 'voice' | 'chat' | 'search' | 'transcribe';
}

export const AIHealthHub: React.FC<AIHealthHubProps> = ({ initialTab = 'chat' }) => {
  const [activeTab, setActiveTab] = useState<'voice' | 'chat' | 'search' | 'transcribe'>(initialTab);
  const { firebaseUser, user } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Hero Header */}
      <div className="bg-linear-to-r from-slate-900 via-sky-950 to-indigo-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-sky-300" /> SmartCare Intelligent Clinical AI Suite
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Gemini Multimodal AI & Cloud Healthcare Intelligence
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Experience real-time interactive voice conversations with <strong className="text-white">gemini-3.8-live</strong>,
            multi-turn clinical reasoning across <strong className="text-white">gemini-3.1-pro-preview</strong>,{' '}
            <strong className="text-white">gemini-3.5-flash</strong>, and <strong className="text-white">gemini-3.1-flash-lite</strong>,
            web search grounding with Google, and medical speech transcription with{' '}
            <strong className="text-white">gemini-3.5-transcribe</strong> — with secure data persistence in{' '}
            <strong className="text-white">Firebase Firestore</strong>.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl">
              <Database className="w-3.5 h-3.5" />
              <span>Firestore Persistence Active</span>
            </div>
            {firebaseUser ? (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-sky-200 bg-sky-900/60 border border-sky-500/30 px-3 py-1 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-sky-400" />
                <span>Authenticated via Google (Firebase Auth)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300 bg-slate-800/60 border border-slate-700 px-3 py-1 rounded-xl">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Google Sign-in Supported</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Feature Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
        <button
          onClick={() => setActiveTab('chat')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'chat'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Bot className="w-4 h-4 text-sky-600" />
          <span>Gemini Chatbot</span>
        </button>

        <button
          onClick={() => setActiveTab('voice')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'voice'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Volume2 className="w-4 h-4 text-indigo-600" />
          <span>Live Voice (3.8 Live)</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'search'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Globe className="w-4 h-4 text-emerald-600" />
          <span>Search Grounding</span>
        </button>

        <button
          onClick={() => setActiveTab('transcribe')}
          className={`py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'transcribe'
              ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
          }`}
        >
          <Mic className="w-4 h-4 text-amber-600" />
          <span>Voice Transcription</span>
        </button>
      </div>

      {/* Active Feature Component */}
      <div>
        {activeTab === 'chat' && <GeminiChatbot />}
        {activeTab === 'voice' && <LiveVoiceConsultation />}
        {activeTab === 'search' && <SearchGroundingTool />}
        {activeTab === 'transcribe' && <AudioTranscriber />}
      </div>
    </div>
  );
};

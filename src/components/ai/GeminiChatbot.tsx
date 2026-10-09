import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Zap,
  BrainCircuit,
  MessageSquare,
  Trash2,
  Bookmark,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';
import { sendGeminiChat, ChatMessage } from '../../services/geminiClient';
import { useAuth } from '../../context/AuthContext';
import {
  saveChatThreadToFirestore,
  getChatThreadsFromFirestore,
  FirestoreChatThread,
} from '../../firebase/firestoreService';

interface ChatRoleConfig {
  id: string;
  name: string;
  model: 'gemini-3.1-pro-preview' | 'gemini-3.5-flash' | 'gemini-3.1-flash-lite';
  speedBadge: string;
  badgeColor: string;
  systemInstruction: string;
  description: string;
}

const ROLES: ChatRoleConfig[] = [
  {
    id: 'general-consult',
    name: 'General Health Guidance',
    model: 'gemini-3.5-flash',
    speedBadge: 'Balanced • gemini-3.5-flash',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    description: 'Everyday patient counseling, symptoms explanation, and wellness inquiries.',
    systemInstruction:
      'You are SmartCare General Health Assistant. Provide warm, clear, structured, and empathetic medical advice. Always clearly advise in-person physician visits or ER for acute distress.',
  },
  {
    id: 'complex-clinical',
    name: 'Complex Clinical Case Analysis',
    model: 'gemini-3.1-pro-preview',
    speedBadge: 'Deep Reasoning • gemini-3.1-pro-preview',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'In-depth differential diagnostics, complex multi-morbidity reviews, and lab correlation.',
    systemInstruction:
      'You are SmartCare Senior Clinical Diagnostician (gemini-3.1-pro-preview). Perform deep differential reasoning, evaluate multi-system interactions, medication contraindications, and provide evidence-based clinical breakdowns.',
  },
  {
    id: 'fast-triage',
    name: 'Instant Triage & First Aid',
    model: 'gemini-3.1-flash-lite',
    speedBadge: 'Ultra Fast • gemini-3.1-flash-lite',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Instant first aid checklists, emergency triage evaluation, and rapid clinic guidance.',
    systemInstruction:
      'You are SmartCare Rapid Triage Specialist (gemini-3.1-flash-lite). Prioritize instant response speed, concise bullet points, emergency red-flags, and actionable first steps.',
  },
];

export const GeminiChatbot: React.FC = () => {
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<ChatRoleConfig>(ROLES[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'model',
      text: 'Hello! I am SmartCare AI. How can I assist you today with symptoms, medical questions, or appointments?',
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeThreadId, setActiveThreadId] = useState<string>(() => `thread-${Date.now()}`);
  const [savedThreads, setSavedThreads] = useState<FirestoreChatThread[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load chat threads from Firestore for authenticated user
  useEffect(() => {
    if (user?.id) {
      getChatThreadsFromFirestore(user.id).then((threads) => {
        setSavedThreads(threads);
      });
    }
  }, [user?.id]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || loading) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const newMessages: ChatMessage[] = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const response = await sendGeminiChat({
        message: userText,
        history: messages,
        model: selectedRole.model,
        role: selectedRole.name,
        systemInstruction: selectedRole.systemInstruction,
      });

      const updatedWithModel: ChatMessage[] = [
        ...newMessages,
        { role: 'model', text: response.reply },
      ];
      setMessages(updatedWithModel);

      // Persist to Cloud Firestore if user is signed in
      if (user?.id) {
        const thread: FirestoreChatThread = {
          id: activeThreadId,
          userId: user.id,
          title: userText.slice(0, 45) + (userText.length > 45 ? '...' : ''),
          model: response.modelUsed || selectedRole.model,
          role: selectedRole.name,
          messages: updatedWithModel.map((m) => ({ ...m, timestamp: new Date().toISOString() })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveChatThreadToFirestore(thread);
        setSaveStatus('Thread synced with Firestore');
        setTimeout(() => setSaveStatus(null), 3000);
      }
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: `I encountered an issue processing your request: ${err.message || 'Network error'}. Please try again.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        role: 'model',
        text: `Starting a fresh consultation with ${selectedRole.name}. How can I help you?`,
      },
    ]);
    setActiveThreadId(`thread-${Date.now()}`);
  };

  const handleLoadThread = (thread: FirestoreChatThread) => {
    setMessages(thread.messages.map((m) => ({ role: m.role, text: m.text })));
    setActiveThreadId(thread.id);
    const matchedRole = ROLES.find((r) => r.name === thread.role);
    if (matchedRole) {
      setSelectedRole(matchedRole);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[750px]">
      {/* Top Header & Role Selector */}
      <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-linear-to-tr from-sky-600 to-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-slate-900">SmartCare AI Clinical Chat</h2>
              {saveStatus && (
                <span className="text-[10px] text-emerald-700 bg-emerald-100 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {saveStatus}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Multi-turn clinical conversation thread with role-specific system instructions
            </p>
          </div>
        </div>

        {/* Role & Model selector */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 overflow-x-auto">
          {ROLES.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                selectedRole.id === role.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {role.model === 'gemini-3.1-pro-preview' && <BrainCircuit className="w-3.5 h-3.5 text-purple-400" />}
              {role.model === 'gemini-3.5-flash' && <Sparkles className="w-3.5 h-3.5 text-sky-400" />}
              {role.model === 'gemini-3.1-flash-lite' && <Zap className="w-3.5 h-3.5 text-amber-400" />}
              <span>{role.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Role Details Bar */}
      <div className="px-5 py-2 bg-slate-100/60 border-b border-slate-200 flex items-center justify-between text-[11px] text-slate-600">
        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded-md border font-mono font-bold text-[10px] ${selectedRole.badgeColor}`}>
            {selectedRole.speedBadge}
          </span>
          <span className="hidden sm:inline text-slate-500">{selectedRole.description}</span>
        </div>

        <button
          onClick={handleClearChat}
          className="text-slate-500 hover:text-slate-800 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Clear Thread
        </button>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/40">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'model' && (
              <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed shadow-2xs whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-sky-600 text-white rounded-tr-xs'
                  : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs'
              }`}
            >
              {msg.text}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-2xs mt-1">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-600 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 text-xs text-slate-500 flex items-center gap-2 shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-sky-600 animate-ping" />
              <span>SmartCare AI ({selectedRole.model}) is formulating a clinical response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-white border-t border-slate-200">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Ask ${selectedRole.name}...`}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          />
          <button
            type="submit"
            disabled={loading || !inputMessage.trim()}
            className="px-5 py-3 bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>

        {/* Firestore Saved Threads history strip */}
        {savedThreads.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="font-bold text-slate-400 uppercase tracking-wider shrink-0">
              <Bookmark className="w-3 h-3 inline mr-1" /> Saved in Firestore:
            </span>
            {savedThreads.slice(0, 4).map((t) => (
              <button
                key={t.id}
                onClick={() => handleLoadThread(t)}
                className="bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 rounded-lg px-2.5 py-1 whitespace-nowrap cursor-pointer transition text-[10px]"
              >
                {t.title}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

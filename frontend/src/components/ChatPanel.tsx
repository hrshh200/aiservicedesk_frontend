import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, AlertCircle, ClipboardList, Loader2, ChevronDown } from 'lucide-react';
import { Message } from '../types';

interface ChatPanelProps {
  sessionId: string;
  onTicketCreated: () => void;
}

interface LocalMessage extends Message {
  isTyping?: boolean;
}

const API_BASE = "http://localhost:3000/api";

function renderContent(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) =>
    part.startsWith('**') && part.endsWith('**')
      ? <strong key={i}>{part.slice(2, -2)}</strong>
      : part
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const isIncident = intent === 'incident';
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${isIncident ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
      }`}>
      {isIncident ? <AlertCircle size={10} /> : <ClipboardList size={10} />}
      {isIncident ? 'Incident' : 'Service Request'}
    </span>
  );
}

export default function ChatPanel({ sessionId, onTicketCreated }: ChatPanelProps) {
  const [messages, setMessages] = useState<LocalMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentIntent, setCurrentIntent] = useState<string | null>(null);
  const [currentStage, setCurrentStage] = useState<string>('greeting');
  const [convId, setConvId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // loadHistory();
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // async function loadHistory() {
  //   const { data: conv } = await supabase
  //     .from('conversations')
  //     .select('*')
  //     .eq('session_id', sessionId)
  //     .neq('stage', 'submitted')
  //     .order('created_at', { ascending: false })
  //     .limit(1)
  //     .maybeSingle();

  //   if (conv) {
  //     setConvId(conv.id);
  //     setCurrentIntent(conv.intent);
  //     setCurrentStage(conv.stage);

  //     const { data: msgs } = await supabase
  //       .from('messages')
  //       .select('*')
  //       .eq('conversation_id', conv.id)
  //       .order('created_at', { ascending: true });

  //     if (msgs && msgs.length > 0) {
  //       setMessages(msgs as LocalMessage[]);
  //       return;
  //     }
  //   }

  //   setMessages([{
  //     id: 'welcome',
  //     role: 'assistant',
  //     content: 'Hello! I\'m your IT Support Assistant. Please describe your **IT issue or request** and I\'ll help create a support ticket for you.',
  //     created_at: new Date().toISOString(),
  //   }]);
  // }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  function handleScroll() {
    const el = containerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  }

 async function sendMessage() {
  if (!input.trim() || loading) return;

  const userMsg: LocalMessage = {
    id: crypto.randomUUID(),
    role: 'user',
    content: input.trim(),
    created_at: new Date().toISOString(),
  };

  const typingMsg: LocalMessage = {
    id: 'typing',
    role: 'assistant',
    content: '',
    isTyping: true,
    created_at: new Date().toISOString(),
  };

  setMessages(prev => [...prev, userMsg, typingMsg]);
  setInput('');
  setLoading(true);

  try {
    const res = await fetch(`${API_BASE}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMsg.content,
        session_id: sessionId,
      }),
    });

    const data = await res.json();

    const ai = data.data || {};

    const assistantMsg: LocalMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: data.reply ?? 'Something went wrong.',
      metadata: {
        intent: ai.intent,
        priority: ai.priority,
        category: ai.category,
      },
      created_at: new Date().toISOString(),
    };

    setMessages(prev =>
      prev.filter(m => m.id !== 'typing').concat(assistantMsg)
    );

    setCurrentIntent(ai.intent ?? null);
    setCurrentStage("submitted");

    if (data.ticket_id) {
      onTicketCreated();
    }

  } catch (err) {
    setMessages(prev =>
      prev.filter(m => m.id !== 'typing').concat({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Backend error. Please try again.',
        created_at: new Date().toISOString(),
      })
    );
  } finally {
    setLoading(false);
    inputRef.current?.focus();
  }
}
  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const stageLabels: Record<string, string> = {
    greeting: 'Waiting for input',
    gathering_what: 'Gathering details',
    gathering_when: 'Gathering details',
    gathering_impact: 'Gathering details',
    review: 'Ready for review',
    submitted: 'Ticket submitted',
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shadow-sm">
        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
          <Bot size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">IT Support Assistant</p>
          <p className="text-xs text-green-500 font-medium">Online</p>
        </div>
        <div className="flex items-center gap-2">
          {currentIntent && <IntentBadge intent={currentIntent} />}
          <span className="hidden sm:inline-block text-xs text-gray-400 bg-gray-50 border border-gray-200 rounded-full px-2 py-0.5">
            {stageLabels[currentStage] ?? currentStage}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gray-50"
        style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #e5e7eb 1px, transparent 0)', backgroundSize: '24px 24px' }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-white border border-gray-200'
              }`}>
              {msg.role === 'user'
                ? <User size={14} className="text-white" />
                : <Bot size={14} className="text-blue-600" />}
            </div>

            {/* Bubble */}
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-white text-gray-800 rounded-bl-sm border border-gray-100'
              }`}>
              {msg.isTyping ? (
                <div className="flex items-center gap-1 py-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              ) : (
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {renderContent(msg.content)}
                </p>
              )}
              {!msg.isTyping && (
                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-blue-200' : 'text-gray-400'} text-right`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-6 w-8 h-8 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <ChevronDown size={16} />
        </button>
      )}
      {/* Input area */}
      <div className="px-4 py-3 border-t border-gray-100 bg-white">
        <div className="flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your IT issue or request..."
            rows={1}
            className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none outline-none max-h-28 leading-5"
            style={{ minHeight: '24px' }}
          />
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 size={14} className="text-white animate-spin" /> : <Send size={14} className="text-white" />}
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">Press Enter to send · Shift+Enter for new line</p>
      </div>
    </div>
  );
}

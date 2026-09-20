import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, MessageSquare, ArrowRight } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "My flight was cancelled. Can I get a full refund?",
  "What meal and lounge compensation am I entitled to?",
  "Can you arrange hotel accommodation for my delay?",
  "I want to rebook onto the next available flight."
];

const ChatInterface = ({ messages, onSendMessage, isResolving, customer }) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const scrollContainerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isResolving]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isResolving) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleSuggestionClick = (prompt) => {
    if (isResolving) return;
    onSendMessage(prompt);
  };

  return (
    <div className="h-full flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-sm overflow-hidden">
      {/* Chat Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-sky-600/10 text-sky-600 flex items-center justify-center">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">AirResolve Agent</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>
          </div>
        </div>

        {customer && (
          <div className="text-right">
            <span className="text-xs font-semibold text-slate-500">
              Assisting: <strong className="text-slate-800">{customer.name}</strong>
            </span>
          </div>
        )}
      </div>

      {/* Scrollable Message List (Strictly isolated scroll) */}
      <div 
        ref={scrollContainerRef}
        className="flex-1 min-h-0 overflow-y-auto p-4 md:p-5 space-y-4 custom-scrollbar bg-gradient-to-b from-white to-slate-50/30"
      >
        {messages.map((msg, idx) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={idx}
              className={`flex gap-3 items-end ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm shadow-sky-600/20">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`px-4 py-3 rounded-2xl text-[13.5px] leading-relaxed max-w-[85%] md:max-w-[78%] transition-all ${
                  isUser
                    ? 'bg-sky-600 text-white rounded-br-xs shadow-sm shadow-sky-600/20 font-medium'
                    : 'bg-white border border-slate-200/80 text-slate-800 rounded-bl-xs shadow-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* AI Typing / Resolving State */}
        {isResolving && (
          <div className="flex gap-3 items-end justify-start">
            <div className="w-7 h-7 rounded-lg bg-sky-600 text-white flex items-center justify-center shrink-0 mb-1 shadow-sm">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white border border-slate-200/80 text-slate-600 rounded-bl-xs shadow-sm flex items-center gap-3 text-xs font-medium">
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce"></span>
              </div>
              <span className="text-slate-500 font-medium">Evaluating policy rules & generating resolution...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Actions if conversation is fresh */}
      {messages.length <= 1 && (
        <div className="px-4 py-2.5 bg-slate-50/70 border-t border-slate-100 flex flex-wrap gap-2 shrink-0">
          <div className="w-full flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
            <Sparkles className="w-3 h-3 text-sky-600" />
            Quick Suggestions
          </div>
          {SUGGESTED_PROMPTS.map((prompt, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(prompt)}
              className="text-xs text-left bg-white hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 text-slate-600 border border-slate-200 px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs group"
            >
              <span>{prompt}</span>
              <ArrowRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-sky-600" />
            </button>
          ))}
        </div>
      )}

      {/* Input Form Footer */}
      <div className="p-3.5 bg-white border-t border-slate-100 shrink-0">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type passenger inquiry, compensation request, or instruction..."
            className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-sky-500 focus:ring-3 focus:ring-sky-500/10 rounded-xl px-4 py-3 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all outline-none"
            disabled={isResolving}
          />
          <button
            type="submit"
            disabled={!input.trim() || isResolving}
            className="absolute right-1.5 p-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg disabled:opacity-30 disabled:hover:bg-sky-600 transition-all shadow-sm shadow-sky-600/20 active:scale-95"
            title="Send Message"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;

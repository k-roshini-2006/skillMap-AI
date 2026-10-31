import React, { useState, useRef, useEffect } from 'react';
import API from '../api/axiosInstance';
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react';

export default function FloatingChatbot({ resumeSummary }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I am your AI Resume & Skill Coach. Ask me anything about improving your profile or bridging your skill gaps!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      const res = await API.post('/chat', {
        message: userMsg,
        resumeSummary: resumeSummary || null,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I hit a temporary hiccup. Please try asking again!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-medium px-4 py-3 rounded-full shadow-2xl transition-all transform hover:scale-105 border border-sky-400/30"
        >
          <MessageSquare className="w-5 h-5" />
          <span className="text-sm font-semibold">AI Resume Coach</span>
        </button>
      )}

      {isOpen && (
        <div className="w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl flex flex-col h-[480px] overflow-hidden backdrop-blur-xl">
          {/* Header */}
          <div className="p-4 bg-slate-800/80 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-sky-500/20 text-sky-400 rounded-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">SkillMap AI Coach</h3>
                <span className="text-[10px] text-emerald-400 flex items-center">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block mr-1"></span> Online
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-950/50 text-xs">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex items-start space-x-2 ${
                  m.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                }`}
              >
                <div
                  className={`p-1.5 rounded-lg text-white ${
                    m.role === 'user' ? 'bg-sky-600' : 'bg-slate-800 text-sky-400'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`p-3 rounded-2xl max-w-[78%] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-sky-500 text-white rounded-tr-none'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/50 rounded-tl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
                <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                <span>AI is analyzing your query...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your skill gaps..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-sky-500 hover:bg-sky-400 text-white p-2 rounded-xl disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
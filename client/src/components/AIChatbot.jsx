import React, { useState, useRef, useEffect } from 'react';
import API from '../api/axiosInstance';
import { Bot, User, Send, X, RefreshCw, Sparkles } from 'lucide-react';

const AIChatbot = ({ resumeData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${resumeData?.candidateName || 'there'}! I'm your AI Resume & Career Coach. Ask me how to boost your ATS score for ${resumeData?.targetRole || 'your target role'}, bridge critical skill gaps, or unlock job opportunities.`
    }
  ]);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setMessages((prev) => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setLoading(true);

    try {
      const response = await API.post('/chat', {
        message: userMessage,
        resumeContext: resumeData
      });

      const reply = response.data?.reply || "I analyzed your query based on your resume context.";
      setMessages((prev) => [...prev, { sender: 'bot', text: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: `Focus on mastering your missing skills (${resumeData?.missingSkills?.[0]?.skill || 'core requirements'}) in the Learning Path to gain +6% per completed course!`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2.5 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold px-4 py-3 rounded-full shadow-2xl shadow-cyan-500/40 transition-all hover:scale-105 active:scale-95"
        >
          <Bot className="w-5 h-5 text-slate-950" />
          <span className="text-xs sm:text-sm font-black">AI Resume Coach</span>
        </button>
      )}

      {/* Chat Window Popup */}
      {isOpen && (
        <div className="w-80 sm:w-96 h-[480px] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl animate-fade-in">
          {/* Header */}
          <div className="bg-slate-800/95 p-3.5 border-b border-slate-700/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 font-black shadow-md">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-white leading-tight">SkillMap AI Coach</h3>
                <span className="text-[10px] text-emerald-400 font-medium">● Online • Resume Context Linked</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-950/70">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-start gap-2 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                    msg.sender === 'user' ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                  }`}
                >
                  {msg.sender === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                </div>
                <div
                  className={`p-3 rounded-2xl text-xs max-w-[82%] leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-medium rounded-tr-none shadow-md'
                      : 'bg-slate-800/90 text-slate-200 border border-slate-700/70 rounded-tl-none shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/60 p-2.5 rounded-xl w-max">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                <span>AI Coach is analyzing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Guidance Prompts */}
          <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800/80 flex gap-1.5 overflow-x-auto text-[10px]">
            <button
              onClick={() => setInput('How can I improve my ATS score?')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 whitespace-nowrap"
            >
              How to improve ATS?
            </button>
            <button
              onClick={() => setInput('Which course should I take first?')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 whitespace-nowrap"
            >
              Recommended courses?
            </button>
            <button
              onClick={() => setInput('Am I eligible for jobs?')}
              className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 whitespace-nowrap"
            >
              Are jobs unlocked?
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI Coach a question..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-bold p-2.5 rounded-xl transition-all shadow-md shadow-cyan-500/20"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default AIChatbot;
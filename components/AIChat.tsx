import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { ChatMessage } from '../types';
import { User } from '../services/authService';

interface AIChatProps { user: User; }

export const AIChat: React.FC<AIChatProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: `Operational, ${user.name.split(' ')[0]}. FocusPilot Concierge ready for input.`, timestamp: new Date().toISOString() }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const toggleChat = async () => {
    setIsOpen(!isOpen);
    if (!chatRef.current) chatRef.current = await GeminiService.createChatSession();
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    try {
      if (!chatRef.current) chatRef.current = await GeminiService.createChatSession();
      const response = await chatRef.current.sendMessage({ message: input });
      const modelMsg: ChatMessage = { role: 'model', text: response.text || "Encryption error. Please retry.", timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'model', text: "Uplink failed. Connectivity check required.", timestamp: new Date().toISOString() }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-[380px] h-[520px] bg-white airbnb-shadow rounded-3xl overflow-hidden flex flex-col animate-scaleIn border border-gray-200">
          <div className="p-5 bg-[#1e210d] text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-white/10 rounded flex items-center justify-center">✨</div>
              <h3 className="font-bold text-[14px] tracking-tight">AI Concierge</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white transition-colors">✕</button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fbfbfb]">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[#1e210d] text-white rounded-br-none' : 'bg-white text-[#1e210d] border border-gray-100 rounded-bl-none'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {isLoading && <div className="flex justify-start"><div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-bl-none animate-pulse">...</div></div>}
          </div>
          <div className="p-4 border-t border-gray-100 bg-white">
            <div className="flex items-center gap-2 bg-gray-50 rounded-full border border-gray-200 px-4 py-1 focus-within:ring-2 focus-within:ring-[#1e210d]/5">
              <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Message concierge..." className="flex-1 bg-transparent py-2 text-[13px] outline-none text-[#1e210d]" />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} className="p-2 text-[#1e210d] hover:bg-[#1e210d] hover:text-white rounded-full transition-all disabled:opacity-20"><svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-2"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path></svg></button>
            </div>
          </div>
        </div>
      )}
      <button onClick={toggleChat} className={`w-14 h-14 rounded-full airbnb-shadow flex items-center justify-center transition-all transform active:scale-90 ${isOpen ? 'bg-white text-[#1e210d]' : 'bg-[#1e210d] text-white hover:bg-black'}`}>
        {isOpen ? <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2"><path d="M6 18L18 6M6 6l12 12"></path></svg> : <span className="text-xl">✨</span>}
      </button>
    </div>
  );
};
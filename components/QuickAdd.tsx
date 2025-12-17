import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';
import { DataStore } from '../services/dataStore';

interface QuickAddProps {
  onDataChange: () => void;
}

export const QuickAdd: React.FC<QuickAddProps> = ({ onDataChange }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clarification, setClarification] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const handleCommand = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setClarification(null);

    try {
      const result = await GeminiService.parseCommand(input);
      if (result.clarification_question) {
        setClarification(result.clarification_question);
      } else {
        await executeAction(result);
        setInput('');
      }
    } catch (err) {
      setClarification("FocusPilot: Command parsing issue. Please clarify.");
    } finally {
      setLoading(false);
    }
  };

  const executeAction = async (command: any) => {
    const { type, payload } = command;
    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    switch (type) {
      case 'create_task':
        await DataStore.addItem('tasks', { id, title: payload.title || "New Task", status: 'todo', priority: payload.priority || 'P1', createdAt: now, updatedAt: now, ...payload });
        break;
      case 'create_bill':
        await DataStore.addItem('bills', { id, status: 'scheduled', reminderCadence: ['3d', '1d'], currency: 'USD', createdAt: now, updatedAt: now, ...payload });
        break;
      case 'create_note':
        await DataStore.addItem('notes', { id, content: payload.notes || payload.title, tags: [], createdAt: now, updatedAt: now });
        break;
    }
    onDataChange();
  };

  const toggleVoice = () => {
    if (!('webkitSpeechRecognition' in window)) return;
    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (e: any) => setInput(e.results[0][0].transcript);
    recognition.start();
  };

  return (
    <div className="bg-white px-6 pt-4 pb-2 z-30 lg:pt-8 flex justify-center">
      <div className="w-full max-w-3xl flex flex-col items-center">
        <div className="w-full flex items-center bg-white border border-gray-200 pill-shadow rounded-full p-2 transition-all duration-300 hover:shadow-md focus-within:ring-2 focus-within:ring-[#1e210d]/5">
          <div className="flex-1 flex items-center px-4">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCommand()}
              placeholder="Tell FocusPilot what's next..."
              className="w-full bg-transparent text-[14px] font-medium text-[#1e210d] placeholder-[#717171] outline-none py-2"
              disabled={loading}
            />
          </div>
          <div className="flex items-center gap-2 pr-1">
            <button
              onClick={toggleVoice}
              className={`p-2.5 rounded-full transition-colors ${isListening ? 'bg-red-50 text-red-500' : 'text-[#717171] hover:bg-gray-100'}`}
            >
              🎤
            </button>
            <button
              onClick={handleCommand}
              disabled={loading || !input.trim()}
              className="p-3 bg-[#1e210d] text-white rounded-full hover:bg-black disabled:opacity-50 transition-all transform active:scale-95 flex items-center justify-center"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current stroke-[4px]"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.35-4.35"></path></svg>}
            </button>
          </div>
        </div>
        {clarification && (
          <div className="mt-4 bg-gray-50 text-[#1e210d] px-6 py-3 rounded-2xl text-[14px] border border-gray-100 animate-scaleIn max-w-lg shadow-sm">
            <span className="font-bold">FocusPilot:</span> {clarification}
          </div>
        )}
      </div>
    </div>
  );
};
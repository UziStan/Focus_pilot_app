
import React, { useEffect, useState } from 'react';
import { DataStore } from '../../services/dataStore';
import { Note } from '../../types';

export const NotesView: React.FC<any> = ({ onDataChange }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch all captured notes asynchronously.
  const loadNotes = async () => {
    const db = await DataStore.get();
    setNotes(db.notes);
    setLoading(false);
  };

  useEffect(() => {
    loadNotes();
  }, []);
  
  const deleteNote = async (id: string) => {
    if(confirm('Delete note?')) {
        await DataStore.deleteItem('notes', id);
        loadNotes();
        onDataChange();
    }
  };

  if (loading) return <div className="animate-pulse py-12 text-center text-[#717171]">Gathering notes...</div>;

  return (
    <div className="max-w-6xl mx-auto pb-24">
      <h2 className="text-4xl font-bold text-[#222222] mb-12">Notes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {notes.map(note => (
          <div key={note.id} className="bg-[#FFF8E1] p-8 rounded-[32px] shadow-sm border border-[#FFE082]/30 relative group min-h-[220px] flex flex-col transition-all hover:shadow-md hover:-translate-y-1">
            <p className="whitespace-pre-wrap text-[#424242] text-[15px] leading-relaxed flex-1 font-light italic">
              {note.content}
            </p>
            <div className="mt-6 pt-4 border-t border-[#FFE082]/20 text-[11px] text-[#717171] font-bold uppercase tracking-widest flex justify-between items-center">
              <span>{new Date(note.createdAt).toLocaleDateString()}</span>
              <button 
                onClick={() => deleteNote(note.id)} 
                className="opacity-0 group-hover:opacity-100 text-[#FF385C] hover:underline transition-opacity"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {notes.length === 0 && (
          <div className="col-span-full py-24 text-center text-[#717171] font-light italic">
            Quiet in here. Capture your thoughts using the quick bar.
          </div>
        )}
      </div>
    </div>
  );
};

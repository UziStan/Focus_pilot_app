
import React, { useEffect, useState } from 'react';
import { DataStore } from '../../services/dataStore';

export const CalendarView: React.FC<any> = () => {
  const [itemsByDate, setItemsByDate] = useState<Record<string, any[]>>({});
  const [loading, setLoading] = useState(true);

  // Group scheduled tasks and bills by date for an agenda-style view.
  useEffect(() => {
    const loadAgenda = async () => {
      const db = await DataStore.get();
      const grouped: Record<string, any[]> = {};
      
      const addToDate = (dateStr: string | undefined, item: any) => {
        if (!dateStr) return;
        const date = dateStr.split('T')[0];
        if (!grouped[date]) grouped[date] = [];
        grouped[date].push(item);
      };

      db.tasks.forEach(t => addToDate(t.dueAt, { ...t, type: 'task' }));
      db.bills.forEach(b => addToDate(b.dueDate, { ...b, type: 'bill' }));
      
      setItemsByDate(grouped);
      setLoading(false);
    };

    loadAgenda();
  }, []);

  const sortedDates = Object.keys(itemsByDate).sort();

  if (loading) return <div className="animate-pulse py-12 text-center text-[#717171]">Loading agenda...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <h2 className="text-4xl font-bold text-[#222222] mb-12">Agenda</h2>
      
      <div className="space-y-12">
        {sortedDates.map(date => (
          <div key={date}>
            <h3 className="text-sm font-bold text-[#717171] uppercase tracking-[0.1em] mb-4 sticky top-0 bg-white/90 backdrop-blur-sm py-3 z-10 border-b border-gray-100">
              {new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
            </h3>
            <div className="space-y-3">
              {itemsByDate[date].map((item: any) => (
                <div key={item.id} className={`p-5 rounded-2xl border-l-[6px] shadow-sm bg-white border transition-all hover:shadow-md flex items-center justify-between ${item.type === 'task' ? 'border-l-[#FF385C] border-gray-100' : 'border-l-[#00A699] border-gray-100'}`}>
                   <div>
                     <span className="text-[17px] font-semibold text-[#222222]">{item.title || item.payee}</span>
                     <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${item.type === 'task' ? 'bg-red-50 text-[#FF385C]' : 'bg-teal-50 text-[#00A699]'}`}>
                          {item.type}
                        </span>
                        {item.type === 'bill' && <span className="text-sm text-[#717171] font-light">${item.amount} {item.currency}</span>}
                     </div>
                   </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {sortedDates.length === 0 && (
          <div className="text-center py-24 text-[#717171] font-light italic">No items found for this period.</div>
        )}
      </div>
    </div>
  );
};

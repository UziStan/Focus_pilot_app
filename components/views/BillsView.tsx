
import React, { useEffect, useState } from 'react';
import { DataStore } from '../../services/dataStore';
import { Bill } from '../../types';

interface BillsViewProps {
  onDataChange: () => void;
}

export const BillsView: React.FC<BillsViewProps> = ({ onDataChange }) => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const loadBills = async () => {
    const db = await DataStore.get();
    const now = new Date();
    
    // Auto-calculate overdue status
    const updatedBills = db.bills.map(bill => {
      const due = new Date(bill.dueDate + (bill.dueTime ? 'T' + bill.dueTime : 'T00:00:00'));
      const isSnoozed = bill.snoozedUntil && new Date(bill.snoozedUntil) > now;
      
      if (bill.status !== 'paid' && due < now && !isSnoozed) {
        return { ...bill, status: 'overdue' as const };
      }
      return bill;
    });

    const sorted = updatedBills.sort((a, b) => a.dueDate > b.dueDate ? 1 : -1);
    setBills(sorted);
    setLoading(false);
  };

  useEffect(() => {
    loadBills();
  }, []);

  const markPaid = async (bill: Bill) => {
    await DataStore.updateItem('bills', {
      id: bill.id,
      status: 'paid',
      paidAt: new Date().toISOString()
    });
    loadBills();
    onDataChange();
  };

  const snoozeBill = async (bill: Bill) => {
    // Snooze for 4 hours
    const snoozeUntil = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();
    await DataStore.updateItem('bills', {
      id: bill.id,
      snoozedUntil: snoozeUntil,
      status: 'scheduled'
    });
    loadBills();
    onDataChange();
  };

  const deleteBill = async (id: string) => {
    await DataStore.deleteItem('bills', id);
    loadBills();
    onDataChange();
  };

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200 ring-4 ring-red-100/50';
      case 'paid': return 'bg-[#1e210d]/10 text-[#1e210d] border-[#1e210d]/20';
      default: return 'bg-gray-50 text-gray-500 border-gray-100';
    }
  };

  const getRecurrenceIcon = (rec: string | undefined) => {
    switch(rec) {
      case 'monthly': return '🔄';
      case 'biweekly': return '🔁';
      case 'custom': return '🛠️';
      default: return null;
    }
  };

  if (loading) return <div className="animate-pulse py-12 text-center text-[#717171] uppercase tracking-widest text-[11px] font-bold">Auditing accounts...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-end mb-14">
        <div>
          <h2 className="text-3xl font-bold text-[#1e210d]">Financials</h2>
          <p className="text-[#717171] mt-1 font-light">Asset management and liability tracking.</p>
        </div>
        <div className="text-2xl font-bold text-[#1e210d] tracking-tight">
          ${bills.filter(b => b.status !== 'paid').reduce((sum, b) => sum + b.amount, 0).toFixed(2)}
          <span className="text-[10px] text-[#717171] ml-2 uppercase font-black tracking-widest">total due</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {bills.map(bill => (
          <div 
            key={bill.id} 
            className={`bg-white p-6 rounded-3xl shadow-sm border transition-all duration-300 flex items-center gap-6 group ${bill.status === 'overdue' ? 'border-red-300 ring-2 ring-red-50 bg-red-50/5' : 'border-gray-100 hover:border-[#1e210d]/20'}`}
          >
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${getStatusStyle(bill.status)} border transition-transform group-hover:scale-105`}>
              {bill.status === 'paid' ? '✓' : '🏦'}
              {bill.recurrence && bill.recurrence !== 'none' && (
                <div className="absolute -top-1 -right-1 bg-white rounded-full shadow-sm text-[9px] w-5 h-5 flex items-center justify-center border border-gray-100" title={`Recurring: ${bill.recurrence}`}>
                  {getRecurrenceIcon(bill.recurrence)}
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="text-[17px] font-bold text-[#1e210d] truncate">{bill.payee}</h3>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${getStatusStyle(bill.status)}`}>
                  {bill.status}
                </span>
                {bill.snoozedUntil && new Date(bill.snoozedUntil) > new Date() && (
                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-100 animate-pulse">
                    Snoozed ⏰
                  </span>
                )}
              </div>
              <div className="text-[13px] text-[#717171] font-medium mt-0.5">
                 Due {new Date(bill.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                 {bill.autopay && <span className="ml-3 text-[#1e210d] bg-[#1e210d]/5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest">Autopay</span>}
              </div>
            </div>

            <div className="text-right flex items-center gap-4">
               <div className="text-lg font-bold text-[#1e210d]">
                 {bill.amount.toFixed(2)} <span className="text-[10px] font-black opacity-30 uppercase ml-1 tracking-widest">{bill.currency}</span>
               </div>
               
               <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                 {bill.status !== 'paid' && (
                   <>
                    <button 
                      onClick={() => markPaid(bill)}
                      className="px-5 py-2.5 bg-[#1e210d] text-white text-[13px] font-bold rounded-xl hover:bg-black transition-all active:scale-95 shadow-sm"
                    >
                      Paid
                    </button>
                    {bill.status === 'overdue' && (
                      <button 
                        onClick={() => snoozeBill(bill)}
                        className="p-2.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all border border-amber-100 bg-white shadow-sm"
                        title="Snooze for 4 hours"
                      >
                        Snooze 💤
                      </button>
                    )}
                   </>
                 )}
                 <button 
                  onClick={() => deleteBill(bill.id)}
                  className="p-2.5 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                 >
                   <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
                 </button>
               </div>
            </div>
          </div>
        ))}

        {bills.length === 0 && (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-[#717171] font-medium tracking-wide uppercase text-[10px] opacity-60">No pending liabilities found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

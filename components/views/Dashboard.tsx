import React, { useEffect, useState } from 'react';
import { DataStore } from '../../services/dataStore';
import { ViewState } from '../../types';

interface DashboardProps {
  onNavigate: (view: ViewState) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    DataStore.get().then(setData);
  }, []);

  if (!data) return null;

  const today = new Date().toISOString().split('T')[0];
  const dueTasks = data.tasks.filter((t: any) => t.status !== 'done' && (!t.dueAt || t.dueAt.startsWith(today)));
  const overdueBills = data.bills.filter((b: any) => b.status === 'overdue');

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-24">
      <header>
        <h2 className="text-3xl font-bold text-[#1e210d]">Welcome back.</h2>
        <p className="text-[#717171] text-lg mt-1 font-light">Operational status: <span className="text-[#1e210d] font-semibold">Optimal</span>.</p>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="group cursor-pointer" onClick={() => onNavigate('tasks')}>
          <div className="aspect-[4/3] bg-[#1e210d] rounded-3xl p-8 text-white transition-transform hover:scale-[1.01] flex flex-col justify-end shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <svg viewBox="0 0 24 24" className="w-24 h-24 fill-current"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" /></svg>
            </div>
            <h3 className="text-2xl font-bold leading-tight">Daily Focus</h3>
            <p className="text-white/60 text-sm mt-2 uppercase tracking-widest font-bold text-[10px]">{dueTasks.length} pending objectives</p>
          </div>
        </div>
        <div className="group cursor-pointer" onClick={() => onNavigate('bills')}>
          <div className="aspect-[4/3] bg-white border border-gray-200 rounded-3xl p-8 text-[#1e210d] transition-all hover:scale-[1.01] hover:border-[#1e210d] flex flex-col justify-end card-shadow relative overflow-hidden">
            <h3 className="text-2xl font-bold leading-tight">Financials</h3>
            <p className="text-[#717171] text-sm mt-2 uppercase tracking-widest font-bold text-[10px]">{overdueBills.length} alerts detected</p>
          </div>
        </div>
        <div className="group cursor-pointer" onClick={() => onNavigate('receipts')}>
          <div className="aspect-[4/3] bg-white border border-gray-200 rounded-3xl p-8 text-[#1e210d] transition-all hover:scale-[1.01] hover:border-[#1e210d] flex flex-col justify-end card-shadow relative overflow-hidden">
            <h3 className="text-2xl font-bold leading-tight">Documents</h3>
            <p className="text-[#717171] text-sm mt-2 uppercase tracking-widest font-bold text-[10px]">{data.receipts.length} encrypted archives</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-8">
        <div className="bg-white p-8 rounded-3xl border border-gray-200 card-shadow">
           <h3 className="text-lg font-bold mb-6 text-[#1e210d]">Mission Critical</h3>
           <div className="space-y-4">
             {dueTasks.length === 0 ? <p className="text-[#717171] font-light italic">All objectives completed.</p> : dueTasks.slice(0, 5).map((t: any) => (
                <div key={t.id} className="p-4 bg-[#f7f7f7] rounded-2xl border border-gray-100 flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg bg-[#1e210d] flex items-center justify-center text-white text-xs">🎯</div>
                  <div className="font-semibold text-[#1e210d] text-[15px]">{t.title}</div>
                </div>
             ))}
           </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-gray-200 card-shadow">
           <h3 className="text-lg font-bold mb-6 text-[#1e210d]">Asset Health</h3>
           <div className="space-y-4">
             {overdueBills.length === 0 ? <p className="text-[#717171] font-light italic">Financial liquidity optimal.</p> : overdueBills.map((b: any) => (
                <div key={b.id} className="p-4 bg-red-50 rounded-2xl border border-red-100 flex justify-between items-center">
                   <div className="font-bold text-red-900 text-[15px]">{b.payee}</div>
                   <div className="text-red-700 font-bold">${b.amount.toFixed(2)}</div>
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
};
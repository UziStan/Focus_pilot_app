
import React, { useState, useEffect } from 'react';
import { DataStore } from '../../services/dataStore';
import { GeminiService } from '../../services/geminiService';
import { Receipt, Bill } from '../../types';

export const ReceiptsView: React.FC<any> = ({ onDataChange }) => {
  const [processing, setProcessing] = useState(false);
  const [isAddingBill, setIsAddingBill] = useState(false);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for manual bill
  const [newBill, setNewBill] = useState({
    payee: '',
    amount: '',
    dueDate: new Date().toISOString().split('T')[0],
    autopay: false,
    recurrence: 'none' as 'none' | 'monthly' | 'biweekly' | 'custom'
  });

  const loadReceipts = async () => {
    const db = await DataStore.get();
    setReceipts(db.receipts);
    setLoading(false);
  };

  useEffect(() => {
    loadReceipts();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = (reader.result as string).split(',')[1];
        
        // Call Gemini to extract structured data from the receipt image
        const extracted = await GeminiService.extractReceipt(base64String);
        
        const newReceipt: Receipt = {
          id: crypto.randomUUID(),
          vendorName: extracted.vendorName || "Unknown Vendor",
          date: extracted.date || new Date().toISOString(),
          total: extracted.total || 0,
          currency: extracted.currency || "USD",
          category: extracted.category,
          extractedData: extracted,
          imageUrl: reader.result as string,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        await DataStore.addItem('receipts', newReceipt);
        await loadReceipts();
        onDataChange();
        setProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      alert("Failed to process receipt");
      setProcessing(false);
    }
  };

  const handleManualBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.payee || !newBill.amount) return;

    const bill: Bill = {
      id: crypto.randomUUID(),
      payee: newBill.payee,
      amount: parseFloat(newBill.amount),
      currency: 'USD',
      dueDate: newBill.dueDate,
      autopay: newBill.autopay,
      recurrence: newBill.recurrence,
      reminderCadence: ['3d', '1d'],
      status: 'scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await DataStore.addItem('bills', bill);
    setIsAddingBill(false);
    setNewBill({ payee: '', amount: '', dueDate: new Date().toISOString().split('T')[0], autopay: false, recurrence: 'none' });
    onDataChange();
  };

  const exportToCSV = (receipt: Receipt) => {
    const headers = ["Date", "Vendor", "Total", "Currency", "Category"];
    const row = [
        receipt.date, 
        receipt.vendorName, 
        receipt.total, 
        receipt.currency, 
        receipt.category || ''
    ].join(',');
    
    const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + row;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `receipt_${receipt.vendorName}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="animate-pulse py-12 text-center text-[#717171] uppercase tracking-widest text-[11px] font-bold">Accessing documents...</div>;

  return (
    <div className="max-w-5xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
        <div>
          <h2 className="text-3xl font-bold text-[#1e210d]">Archives</h2>
          <p className="text-[#717171] mt-1 font-light">Digital intelligence vault.</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:auto">
          <button 
            onClick={() => setIsAddingBill(true)}
            className="flex-1 md:flex-none px-6 py-2.5 bg-white border border-gray-200 text-[#1e210d] text-[14px] font-bold rounded-xl hover:bg-gray-50 transition-all pill-shadow active:scale-95 flex items-center gap-2"
          >
            <span>➕</span> Add Bill
          </button>
          
          <label className={`
            flex-1 md:flex-none px-6 py-2.5 bg-[#1e210d] text-white text-[14px] font-bold rounded-xl cursor-pointer hover:bg-black transition-all shadow-lg shadow-[#1e210d]/10 text-center active:scale-95
            ${processing ? 'opacity-50 cursor-not-allowed' : ''}
          `}>
            {processing ? 'Analyzing...' : 'Snap Receipt'}
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleFileUpload} 
              disabled={processing}
            />
          </label>
        </div>
      </div>

      <div className="bg-white rounded-[28px] border border-gray-100 overflow-hidden shadow-sm">
        <table className="min-w-full divide-y divide-gray-100">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="px-8 py-5 text-left text-[11px] font-black text-[#1e210d] uppercase tracking-[0.2em]">Date</th>
              <th className="px-8 py-5 text-left text-[11px] font-black text-[#1e210d] uppercase tracking-[0.2em]">Vendor</th>
              <th className="px-8 py-5 text-left text-[11px] font-black text-[#1e210d] uppercase tracking-[0.2em]">Total</th>
              <th className="px-8 py-5 text-left text-[11px] font-black text-[#1e210d] uppercase tracking-[0.2em]">Category</th>
              <th className="px-8 py-5 text-right text-[11px] font-black text-[#1e210d] uppercase tracking-[0.2em]">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {receipts.map(receipt => (
              <tr key={receipt.id} className="hover:bg-gray-50/30 transition-colors">
                <td className="px-8 py-5 whitespace-nowrap text-[14px] text-[#717171] font-medium">
                    {new Date(receipt.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-[15px] font-bold text-[#1e210d]">
                    {receipt.vendorName}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-[15px] font-black text-[#1e210d]">
                    {receipt.total.toFixed(2)} <span className="text-[10px] text-[#717171] font-medium uppercase tracking-widest ml-1">{receipt.currency}</span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap">
                    <span className="text-[10px] text-[#1e210d] bg-[#1e210d]/5 px-3 py-1 rounded-md font-bold uppercase tracking-widest border border-[#1e210d]/10">
                        {receipt.category || 'General'}
                    </span>
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right">
                  <button 
                    onClick={() => exportToCSV(receipt)}
                    className="text-[#717171] hover:text-[#1e210d] text-[12px] font-bold transition-colors uppercase tracking-widest"
                  >
                    CSV 💾
                  </button>
                </td>
              </tr>
            ))}
            {receipts.length === 0 && (
                <tr>
                    <td colSpan={5} className="px-8 py-20 text-center text-[#717171] font-light italic">
                        No documents stored in archives.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>

      {isAddingBill && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1e210d]/20 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-md rounded-[32px] p-8 airbnb-shadow animate-scaleIn border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-10">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1e210d] rounded-lg flex items-center justify-center text-white text-xs">🏦</div>
                <h3 className="text-xl font-bold text-[#1e210d]">Manual Entry</h3>
              </div>
              <button 
                onClick={() => setIsAddingBill(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-[#1e210d] opacity-40 hover:opacity-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleManualBillSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-[#1e210d] uppercase tracking-[0.2em] mb-2 ml-1">Payee Name</label>
                <input 
                  type="text" 
                  required
                  value={newBill.payee}
                  onChange={e => setNewBill({...newBill, payee: e.target.value})}
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#1e210d] focus:ring-1 focus:ring-[#1e210d] outline-none transition-all placeholder-gray-300 text-[14px]"
                  placeholder="e.g. Utility Corp"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#1e210d] uppercase tracking-[0.2em] mb-2 ml-1">Amount</label>
                  <input 
                    type="number" 
                    required
                    step="0.01"
                    value={newBill.amount}
                    onChange={e => setNewBill({...newBill, amount: e.target.value})}
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#1e210d] focus:ring-1 focus:ring-[#1e210d] outline-none transition-all placeholder-gray-300 text-[14px]"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#1e210d] uppercase tracking-[0.2em] mb-2 ml-1">Due Date</label>
                  <input 
                    type="date" 
                    required
                    value={newBill.dueDate}
                    onChange={e => setNewBill({...newBill, dueDate: e.target.value})}
                    className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#1e210d] focus:ring-1 focus:ring-[#1e210d] outline-none transition-all text-[14px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-[#1e210d] uppercase tracking-[0.2em] mb-2 ml-1">Recurrence</label>
                <select 
                  value={newBill.recurrence}
                  onChange={e => setNewBill({...newBill, recurrence: e.target.value as any})}
                  className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-[#1e210d] focus:ring-1 focus:ring-[#1e210d] outline-none transition-all text-[14px] appearance-none bg-white"
                >
                  <option value="none">One-time</option>
                  <option value="monthly">Monthly</option>
                  <option value="biweekly">Bi-weekly</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <label className="flex items-center gap-4 cursor-pointer group p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <input 
                  type="checkbox"
                  checked={newBill.autopay}
                  onChange={e => setNewBill({...newBill, autopay: e.target.checked})}
                  className="w-5 h-5 rounded border-gray-300 text-[#1e210d] focus:ring-[#1e210d]"
                />
                <div>
                    <span className="text-[14px] text-[#1e210d] font-bold">Enabled Autopay</span>
                    <p className="text-[11px] text-[#717171] font-medium">Automatic debit scheduled</p>
                </div>
              </label>

              <button 
                type="submit"
                className="w-full py-4 bg-[#1e210d] text-white font-bold rounded-2xl hover:bg-black transition-all transform active:scale-95 shadow-lg shadow-[#1e210d]/20 mt-4 uppercase tracking-widest text-[11px]"
              >
                Save Objective
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

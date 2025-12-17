import React, { useEffect, useState } from 'react';
import { DataStore } from '../../services/dataStore';
import { Task } from '../../types';

interface TasksViewProps {
  onDataChange: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onDataChange }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const loadTasks = async () => {
    const db = await DataStore.get();
    const sorted = db.tasks.sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1;
      if (a.status !== 'done' && b.status === 'done') return -1;
      return (a.dueAt || '') > (b.dueAt || '') ? 1 : -1;
    });
    setTasks(sorted);
    setLoading(false);
  };

  useEffect(() => { loadTasks(); }, []);

  const toggleTask = async (task: Task) => {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await DataStore.updateItem('tasks', { 
      id: task.id, 
      status: newStatus,
      completedAt: newStatus === 'done' ? new Date().toISOString() : undefined
    });
    loadTasks();
    onDataChange();
  };

  const deleteTask = async (id: string) => {
    await DataStore.deleteItem('tasks', id);
    loadTasks();
    onDataChange();
  };

  if (loading) return <div className="animate-pulse py-12 text-center text-[#717171] uppercase tracking-widest text-xs font-bold">Decrypting objectives...</div>;

  return (
    <div className="max-w-4xl mx-auto pb-24">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h2 className="text-3xl font-bold text-[#1e210d]">Mission Log</h2>
          <p className="text-[#717171] mt-1 font-light">Execution status: {tasks.filter(t => t.status !== 'done').length} active.</p>
        </div>
      </div>
      
      <div className="space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id} 
            className={`group flex items-center gap-4 p-5 bg-white rounded-2xl border transition-all duration-300 hover:border-[#1e210d] ${task.status === 'done' ? 'opacity-40 grayscale' : 'border-gray-200'}`}
          >
            <div className="relative">
              <input 
                type="checkbox" 
                checked={task.status === 'done'}
                onChange={() => toggleTask(task)}
                className="w-6 h-6 rounded-lg border-gray-300 text-[#1e210d] focus:ring-[#1e210d] cursor-pointer appearance-none checked:bg-[#1e210d] checked:border-transparent border-2 flex items-center justify-center transition-colors"
              />
              {task.status === 'done' && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white text-[10px] font-bold">✓</div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className={`text-[15px] leading-snug font-medium text-[#1e210d] ${task.status === 'done' ? 'line-through' : ''}`}>
                  {task.title}
                </span>
                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${task.priority === 'P0' ? 'bg-[#1e210d] text-white' : 'bg-gray-50 text-gray-500 border-gray-200'}`}>
                  {task.priority}
                </span>
              </div>
            </div>

            <button 
              onClick={() => deleteTask(task.id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-300 hover:text-red-600 transition-all"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-none stroke-current stroke-2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path></svg>
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            <p className="text-[#717171] font-light">Agenda clear. Operational efficiency at 100%.</p>
          </div>
        )}
      </div>
    </div>
  );
};
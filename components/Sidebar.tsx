import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onViewChange: (view: ViewState) => void;
}

const NavItem = ({ view, label, icon, active, onClick }: any) => (
  <button
    onClick={() => onClick(view)}
    className={`w-full flex items-center space-x-3 px-4 py-3 text-[14px] font-medium rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-[#1e210d]/5 text-[#1e210d] font-semibold' 
        : 'text-[#484848] hover:bg-gray-50 hover:text-[#1e210d]'
    }`}
  >
    <span className="text-xl opacity-80">{icon}</span>
    <span>{label}</span>
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  return (
    <>
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-2 py-1 z-50 flex justify-around items-center">
        {[
          { view: 'dashboard', label: 'Home', icon: '🏠' },
          { view: 'tasks', label: 'Tasks', icon: '✅' },
          { view: 'bills', label: 'Bills', icon: '💳' },
          { view: 'receipts', label: 'Docs', icon: '🧾' },
          { view: 'settings', label: 'Profile', icon: '👤' },
        ].map(item => (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view as ViewState)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg ${currentView === item.view ? 'text-[#1e210d] font-semibold' : 'text-[#717171]'}`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] mt-0.5">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="hidden lg:flex flex-col w-[280px] bg-white border-r border-gray-100 h-full">
        <div className="p-8">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#1e210d] rounded-lg flex items-center justify-center text-white shadow-sm">
              <svg viewBox="0 0 24 24" className="w-6 h-6 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[#1e210d]">
              FocusPilot
            </h1>
          </div>
        </div>

        <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto">
          <NavItem view="dashboard" label="Home" icon="🏠" active={currentView === 'dashboard'} onClick={onViewChange} />
          <NavItem view="tasks" label="Tasks" icon="✅" active={currentView === 'tasks'} onClick={onViewChange} />
          <NavItem view="bills" label="Bills" icon="💳" active={currentView === 'bills'} onClick={onViewChange} />
          <NavItem view="calendar" label="Calendar" icon="📅" active={currentView === 'calendar'} onClick={onViewChange} />
          <NavItem view="notes" label="Notes" icon="📝" active={currentView === 'notes'} onClick={onViewChange} />
          <NavItem view="receipts" label="Documents" icon="🧾" active={currentView === 'receipts'} onClick={onViewChange} />
        </nav>

        <div className="p-6 border-t border-gray-100">
          <NavItem view="settings" label="Settings" icon="👤" active={currentView === 'settings'} onClick={onViewChange} />
        </div>
      </div>
    </>
  );
};
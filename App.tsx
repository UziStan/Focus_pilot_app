
import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { QuickAdd } from './components/QuickAdd';
import { Dashboard } from './components/views/Dashboard';
import { TasksView } from './components/views/TasksView';
import { BillsView } from './components/views/BillsView';
import { CalendarView } from './components/views/CalendarView';
import { NotesView } from './components/views/NotesView';
import { ReceiptsView } from './components/views/ReceiptsView';
import { SettingsView } from './components/views/SettingsView';
import { AIChat } from './components/AIChat';
import { LoginView } from './components/auth/LoginView';
import { AuthService, User } from './services/authService';
import { DataStore } from './services/dataStore';
import { checkReminders } from './services/notificationService';
import { ViewState } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      DataStore.init();
    }
    setIsInitializing(false);

    const interval = setInterval(() => {
      checkReminders();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleDataChange = () => {
    setIsSyncing(true);
    setRefreshTrigger(prev => prev + 1);
    setTimeout(() => setIsSyncing(false), 800);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    DataStore.init();
  };

  if (isInitializing) return null;
  if (!currentUser) return <LoginView onLoginSuccess={handleLoginSuccess} />;

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard onNavigate={setCurrentView} />;
      case 'tasks': return <TasksView onDataChange={handleDataChange} />;
      case 'bills': return <BillsView onDataChange={handleDataChange} />;
      case 'calendar': return <CalendarView onDataChange={handleDataChange} />;
      case 'notes': return <NotesView onDataChange={handleDataChange} />;
      case 'receipts': return <ReceiptsView onDataChange={handleDataChange} />;
      case 'settings': return <SettingsView onDataChange={handleDataChange} />;
      default: return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="flex h-full w-full bg-white selection:bg-[#1e210d]/5 selection:text-[#1e210d]">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {isSyncing && (
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gray-50 overflow-hidden z-[200]">
            <div className="h-full bg-[#1e210d] animate-syncProgress"></div>
          </div>
        )}
        
        <QuickAdd onDataChange={handleDataChange} />
        
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {renderView()}
          </div>
        </div>

        <AIChat user={currentUser} />
      </main>
    </div>
  );
};

export default App;

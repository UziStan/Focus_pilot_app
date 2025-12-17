import { Task, Bill, CalendarEvent, Note, Receipt, Settings, DailySummary } from '../types';
import { AuthService } from './authService';

const STORAGE_PREFIX = 'focuspilot_db_';

interface DB {
  tasks: Task[];
  bills: Bill[];
  events: CalendarEvent[];
  notes: Note[];
  receipts: Receipt[];
  summaries: DailySummary[];
  settings: Settings;
}

const DEFAULT_SETTINGS: Settings = {
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  workHoursStart: "09:00",
  workHoursEnd: "17:00",
  notificationsEnabled: false,
  currency: "USD"
};

const INITIAL_DB: DB = {
  tasks: [],
  bills: [],
  events: [],
  notes: [],
  receipts: [],
  summaries: [],
  settings: DEFAULT_SETTINGS
};

export const DataStore = {
  getUserKey: () => {
    const user = AuthService.getCurrentUser();
    return user ? `${STORAGE_PREFIX}${user.id}` : null;
  },

  init: () => {
    const key = DataStore.getUserKey();
    if (key && !localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(INITIAL_DB));
      DataStore.seedSampleData();
    }
  },

  get: async (): Promise<DB> => {
    const key = DataStore.getUserKey();
    if (!key) return INITIAL_DB;
    
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 100));
    
    try {
      return JSON.parse(localStorage.getItem(key) || JSON.stringify(INITIAL_DB));
    } catch (e) {
      return INITIAL_DB;
    }
  },

  save: async (db: DB) => {
    const key = DataStore.getUserKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(db));
    // Simulate background sync
    console.log("Synced to cloud storage");
  },

  seedSampleData: async () => {
    const db = await DataStore.get();
    if (db.tasks.length > 0) return;

    const today = new Date().toISOString();
    db.tasks.push({
      id: crypto.randomUUID(),
      title: "Explore FocusPilot features",
      priority: "P1",
      status: "todo",
      tags: ["onboarding"],
      createdAt: today,
      updatedAt: today
    });
    DataStore.save(db);
  },

  addItem: async <T>(collection: keyof Omit<DB, 'settings'>, item: T) => {
    const db = await DataStore.get();
    (db[collection] as T[]).unshift(item); // New items first
    await DataStore.save(db);
  },

  updateItem: async <T extends { id: string }>(collection: keyof Omit<DB, 'settings'>, item: Partial<T> & { id: string }) => {
    const db = await DataStore.get();
    const list = db[collection] as any[];
    const index = list.findIndex(i => i.id === item.id);
    if (index !== -1) {
      list[index] = { ...list[index], ...item, updatedAt: new Date().toISOString() };
      await DataStore.save(db);
    }
  },

  deleteItem: async (collection: keyof Omit<DB, 'settings'>, id: string) => {
    const db = await DataStore.get();
    const list = db[collection] as any[];
    db[collection] = list.filter(i => i.id !== id) as any;
    await DataStore.save(db);
  },
  
  updateSettings: async (settings: Partial<Settings>) => {
    const db = await DataStore.get();
    db.settings = { ...db.settings, ...settings };
    await DataStore.save(db);
  }
};
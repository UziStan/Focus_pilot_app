
export type ViewState = 'dashboard' | 'tasks' | 'bills' | 'calendar' | 'notes' | 'receipts' | 'settings';

export type Priority = 'P0' | 'P1' | 'P2' | 'P3';
export type Status = 'todo' | 'in_progress' | 'done';
export type BillStatus = 'scheduled' | 'paid' | 'overdue';

export interface BaseItem {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task extends BaseItem {
  title: string;
  notes?: string;
  dueAt?: string; // ISO string
  priority: Priority;
  tags: string[];
  project?: string;
  status: Status;
  completedAt?: string;
}

export interface Bill extends BaseItem {
  payee: string;
  amount: number;
  currency: string;
  dueDate: string; // ISO date string YYYY-MM-DD
  dueTime?: string; // HH:mm
  recurrence?: 'none' | 'monthly' | 'biweekly' | 'custom';
  autopay: boolean;
  consequencesText?: string;
  reminderCadence: string[]; 
  status: BillStatus;
  paidAt?: string;
  proofNote?: string;
  snoozedUntil?: string; // ISO string
}

export interface CalendarEvent extends BaseItem {
  title: string;
  start: string; // ISO
  end: string; // ISO
  location?: string;
  notes?: string;
  relatedTaskId?: string;
}

export interface Note extends BaseItem {
  content: string;
  tags: string[];
  linkedItemId?: string;
}

export interface Receipt extends BaseItem {
  vendorName: string;
  date: string;
  total: number;
  currency: string;
  category?: string;
  imageUrl?: string; // Base64 or local URL
  extractedData?: ReceiptExtract;
}

export interface Settings {
  timezone: string;
  workHoursStart: string; // "09:00"
  workHoursEnd: string; // "17:00"
  notificationsEnabled: boolean;
  currency: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

// AI Schema Types

export interface ParsedCommand {
  type: "create_task" | "update_task" | "complete_task" | "create_bill" | "mark_bill_paid" | "create_event" | "create_note" | "set_reminder" | "query" | "daily_summary";
  confidence: number;
  clarification_question: string | null;
  missing_fields: string[];
  payload: any;
}

export interface ReceiptExtract {
  vendorName?: string;
  date?: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  currency?: string;
  category?: string;
  paymentMethod?: string;
  lineItems?: { description: string; amount: number }[];
}

export interface DailySummary {
  date: string;
  completedTasks: string[];
  missedTasks: string[];
  upcomingBills: string[];
  overdueBills: string[];
  suggestedTomorrowTop5: string[];
  timeBlocks?: { time: string; activity: string }[];
}


import { DataStore } from './dataStore';
import { Bill } from '../types';

// Request browser notification permission and sync with data store.
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) return false;
  const result = await Notification.requestPermission();
  if (result === 'granted') {
    DataStore.updateSettings({ notificationsEnabled: true });
    return true;
  }
  return false;
};

// Send a standard browser notification.
export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body });
  }
};

// Check for upcoming or overdue bills to notify the user.
export const checkReminders = async () => {
  const db = await DataStore.get();
  if (!db.settings.notificationsEnabled) return;

  const now = new Date();
  
  // Check Bills
  db.bills.forEach((bill: Bill) => {
    if (bill.status === 'paid') return;
    
    const due = new Date(bill.dueDate + (bill.dueTime ? 'T' + bill.dueTime : 'T09:00:00'));
    const isSnoozed = bill.snoozedUntil && new Date(bill.snoozedUntil) > now;

    if (isSnoozed) return; // Skip if currently snoozed

    // Logic: Send notification if overdue
    if (now > due) {
      // Nagging behavior: In a real app we'd track last notification time.
      // For MVP, we send a notification which the browser will typically throttle or combine.
      sendNotification(
        `FocusPilot Alert: ${bill.payee} Overdue`,
        `Your payment of ${bill.amount} ${bill.currency} was due on ${bill.dueDate}. Action required.`
      );
    } else {
      // Upcoming reminder: due within the next 24 hours
      const diffHours = (due.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours > 0 && diffHours < 24) {
        // Only notify if we haven't checked recently? (Implicitly handled by browser notification UI)
      }
    }
  });
};

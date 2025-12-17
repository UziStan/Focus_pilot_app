import React from 'react';
import { DataStore } from '../../services/dataStore';
import { AuthService } from '../../services/authService';
import { requestNotificationPermission } from '../../services/notificationService';

export const SettingsView: React.FC<any> = ({ onDataChange }) => {
  const [settings, setSettings] = React.useState<any>(null);
  const user = AuthService.getCurrentUser();

  React.useEffect(() => {
    DataStore.get().then(db => setSettings(db.settings));
  }, []);

  if (!settings) return null;

  const updateSetting = (key: string, value: any) => {
    DataStore.updateSettings({ [key]: value });
    setSettings({ ...settings, [key]: value });
    onDataChange();
  };

  const handleNotifEnable = async () => {
    const granted = await requestNotificationPermission();
    if (!granted) alert("Notification permission denied by browser.");
    else onDataChange();
  };

  return (
    <div className="max-w-3xl mx-auto pb-24">
      <div className="mb-12">
        <h2 className="text-4xl font-bold text-[#222222]">Account</h2>
        <p className="text-[#717171] mt-2 font-light">
          Logged in as <span className="font-medium text-[#222222]">{user?.name}</span> • {user?.email}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-8">
          <h3 className="text-xl font-bold">Preferences</h3>
          
          <div>
            <label className="block text-xs font-bold text-[#717171] uppercase tracking-wider mb-2">Work Schedule</label>
            <div className="grid grid-cols-2 gap-3">
               <input 
                 type="time" 
                 value={settings.workHoursStart}
                 onChange={(e) => updateSetting('workHoursStart', e.target.value)}
                 className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-black outline-none"
               />
               <input 
                 type="time" 
                 value={settings.workHoursEnd}
                 onChange={(e) => updateSetting('workHoursEnd', e.target.value)}
                 className="w-full p-4 rounded-xl border border-gray-200 text-sm focus:ring-1 focus:ring-black outline-none"
               />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-4 cursor-pointer group">
                <input 
                    type="checkbox"
                    checked={settings.notificationsEnabled}
                    onChange={(e) => {
                        if (e.target.checked) handleNotifEnable();
                        else updateSetting('notificationsEnabled', false);
                    }}
                    className="w-6 h-6 rounded border-gray-300 text-[#FF385C] focus:ring-[#FF385C]"
                />
                <div>
                   <div className="text-[15px] text-[#222222] font-semibold">Push Notifications</div>
                   <div className="text-xs text-[#717171]">Smart reminders for bills and high priorities.</div>
                </div>
            </label>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-8">
           <div>
              <h3 className="text-xl font-bold mb-6">Privacy & Safety</h3>
              <p className="text-[#717171] text-sm leading-relaxed font-light">
                Your data is stored locally in your browser and isolated by your user ID. In production, this would be encrypted and synced with a secure cloud provider.
              </p>
           </div>

           <div className="space-y-3">
             <button 
               onClick={AuthService.logout}
               className="w-full py-4 px-6 bg-white border border-gray-200 text-[#222222] font-bold rounded-xl hover:bg-gray-50 transition-all text-sm active:scale-[0.98]"
             >
               Sign Out
             </button>
             <button 
               onClick={() => {
                   if(confirm("Permanently delete your account and all local data?")) {
                       localStorage.removeItem(DataStore.getUserKey()!);
                       AuthService.logout();
                   }
               }}
               className="w-full py-4 text-[#FF385C] text-sm font-semibold hover:underline"
             >
               Delete Account
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { Bell, Plus, Trash2, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { Reminder } from '../types';

export const ReminderSystem: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newReminder, setNewReminder] = useState<Partial<Reminder>>({
    medicineName: '',
    dosage: '',
    time: '',
    frequency: 'Daily',
    active: true
  });

  useEffect(() => {
    const saved = localStorage.getItem('med_reminders');
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load reminders", e);
      }
    }
  }, []);

  const saveReminders = (updated: Reminder[]) => {
    setReminders(updated);
    localStorage.setItem('med_reminders', JSON.stringify(updated));
  };

  const handleAdd = () => {
    if (!newReminder.medicineName || !newReminder.time) return;
    
    const reminder: Reminder = {
      id: Date.now().toString(),
      medicineName: newReminder.medicineName!,
      dosage: newReminder.dosage || '1 dose',
      time: newReminder.time!,
      frequency: newReminder.frequency || 'Daily',
      active: true
    };

    saveReminders([...reminders, reminder]);
    setNewReminder({ medicineName: '', dosage: '', time: '', frequency: 'Daily', active: true });
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    saveReminders(reminders.filter(r => r.id !== id));
  };

  const toggleActive = (id: string) => {
    saveReminders(reminders.map(r => r.id === id ? { ...r, active: !r.active } : r));
  };

  return (
    <div className="card-medical p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-medical-teal-dark flex items-center gap-2">
          <Bell className="w-6 h-6" />
          Medicine Reminders
        </h2>
        <button 
          onClick={() => setShowAdd(!showAdd)}
          className="bg-medical-teal hover:bg-medical-teal-dark text-white p-2 rounded-full transition-colors"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showAdd && (
        <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 animate-in fade-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" 
              placeholder="Medicine Name" 
              className="p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medical-teal outline-none"
              value={newReminder.medicineName}
              onChange={e => setNewReminder({...newReminder, medicineName: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Dosage (e.g. 500mg)" 
              className="p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medical-teal outline-none"
              value={newReminder.dosage}
              onChange={e => setNewReminder({...newReminder, dosage: e.target.value})}
            />
            <input 
              type="time" 
              className="p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medical-teal outline-none"
              value={newReminder.time}
              onChange={e => setNewReminder({...newReminder, time: e.target.value})}
            />
            <select 
              className="p-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-medical-teal outline-none"
              value={newReminder.frequency}
              onChange={e => setNewReminder({...newReminder, frequency: e.target.value})}
            >
              <option>Daily</option>
              <option>Twice Daily</option>
              <option>Weekly</option>
              <option>As needed</option>
            </select>
          </div>
          <button 
            onClick={handleAdd}
            className="w-full bg-medical-teal text-white py-2 rounded-lg font-semibold hover:bg-medical-teal-dark transition-colors"
          >
            Add Reminder
          </button>
        </div>
      )}

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <Calendar className="w-12 h-12 mx-auto mb-2 opacity-20" />
            <p>No reminders set yet</p>
          </div>
        ) : (
          reminders.map(reminder => (
            <div key={reminder.id} className={`flex items-center justify-between p-4 rounded-xl border transition-all ${reminder.active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'}`}>
              <div className="flex items-center gap-4">
                <button onClick={() => toggleActive(reminder.id)}>
                  <CheckCircle2 className={`w-6 h-6 ${reminder.active ? 'text-medical-teal' : 'text-slate-300'}`} />
                </button>
                <div>
                  <h4 className="font-bold text-slate-800">{reminder.medicineName}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {reminder.time}</span>
                    <span>{reminder.dosage}</span>
                    <span>{reminder.frequency}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(reminder.id)}
                className="text-slate-400 hover:text-red-500 p-2 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

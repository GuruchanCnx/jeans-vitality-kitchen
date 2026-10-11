import React, { useState, useEffect } from 'react';
import { 
  Bell, BellRing, BellOff, X, Droplets, Utensils, ShoppingCart, 
  CheckCircle2, Clock, Volume2, ShieldCheck, Smartphone, Sparkles, AlertCircle 
} from 'lucide-react';

export interface NotificationSettings {
  enabled: boolean;
  hydrationAlerts: boolean;
  hydrationIntervalHours: number; // 1, 2, 3 hours
  mealAlerts: boolean;
  breakfastTime: string; // '08:00'
  lunchTime: string; // '12:30'
  dinnerTime: string; // '18:00'
  shoppingAlerts: boolean;
  soundEnabled: boolean;
  lastHydrationTrigger?: number;
}

export interface InAppAlert {
  id: string;
  title: string;
  message: string;
  type: 'hydration' | 'meal' | 'shopping' | 'general';
  timestamp: string;
}

export interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  theme?: string;
  highContrast?: boolean;
}

const STORAGE_KEY = 'jeans_vitality_notifications_config';
const HISTORY_KEY = 'jeans_vitality_notifications_history';

// Gentle senior-friendly audio chime synthesizer using Web Audio API
export const playSeniorChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Play warm three-tone welcoming chime (C5 -> E5 -> G5)
    const tones = [523.25, 659.25, 783.99];
    tones.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.16);
      gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.16);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.16 + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + idx * 0.16);
      osc.stop(ctx.currentTime + idx * 0.16 + 0.5);
    });
  } catch (e) {
    console.warn("Audio chime playback error:", e);
  }
};

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  theme = 'light',
  highContrast = false
}) => {
  const isLight = theme === 'light';

  // Notification Settings State
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      enabled: true,
      hydrationAlerts: true,
      hydrationIntervalHours: 2,
      mealAlerts: true,
      breakfastTime: '08:00',
      lunchTime: '12:30',
      dinnerTime: '18:00',
      shoppingAlerts: true,
      soundEnabled: true,
      lastHydrationTrigger: Date.now()
    };
  });

  const [browserPermission, setBrowserPermission] = useState<string>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'unsupported';
  });

  const [testSent, setTestSent] = useState(false);
  const [activeTab, setActiveTab] = useState<'reminders' | 'history'>('reminders');
  
  // Notification history
  const [history, setHistory] = useState<InAppAlert[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'initial-1',
        title: 'Welcome to Jean\'s Vitality Alerts',
        message: 'Hydration and meal reminders will prompt you throughout the day to support energy and hydration.',
        type: 'general',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Save settings
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  // Save history
  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    } catch {}
  }, [history]);

  // Request system notification permission (iOS 16.4+ / Android / Desktop)
  const handleRequestPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("System notifications require adding this app to your Home Screen on iOS, or using Android Chrome. In-app chimes will work directly in your browser!");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
      }
    } catch (e) {
      console.warn("Could not request notification permission:", e);
    }
  };

  // Trigger test alert
  const handleTriggerTest = () => {
    if (settings.soundEnabled) {
      playSeniorChime();
    }

    const newAlert: InAppAlert = {
      id: `alert-${Date.now()}`,
      title: 'Senior Hydration Reminder',
      message: 'Time for a fresh cup of water or herbal tea! Keep your muscles energized and kidneys healthy.',
      type: 'hydration',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setHistory(prev => [newAlert, ...prev.slice(0, 19)]);

    // Try system notification if permitted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(newAlert.title, {
          body: newAlert.message,
          icon: '/favicon.ico'
        });
      } catch (e) {
        console.warn("System notification dispatch error:", e);
      }
    }

    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  if (!isOpen) return null;

  return (
    <div 
      id="notification-center-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="notification-center-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className={`relative w-full max-w-xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] transition-all duration-300 ${
          isLight 
            ? 'bg-white text-stone-900 border-amber-300 shadow-[0_20px_60px_rgba(217,119,6,0.15)]' 
            : 'bg-slate-900 text-white border-slate-700 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 p-5 sm:p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
              <BellRing className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 id="notification-center-title" className="text-xl sm:text-2xl font-black tracking-tight">
                iOS & Android Notifications
              </h2>
              <p className="text-xs sm:text-sm font-medium text-amber-100">
                Hydration & Meal Prep Reminders for Seniors
              </p>
            </div>
          </div>

          <button
            type="button"
            id="close-notification-center"
            onClick={onClose}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all active:scale-95"
            aria-label="Close notification settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: Reminders vs History */}
        <div className="flex border-b border-amber-200 dark:border-slate-800 px-6 pt-3 bg-stone-50/50 dark:bg-slate-900/50">
          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === 'reminders'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-white'
            }`}
          >
            Reminder Schedules
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'border-amber-600 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-stone-500 dark:text-slate-400 hover:text-stone-800 dark:hover:text-white'
            }`}
          >
            <span>Alert History</span>
            {history.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-amber-200 dark:bg-amber-950 text-amber-900 dark:text-amber-300">
                {history.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'reminders' ? (
            <>
              {/* iOS / Android Device Compatibility Banner */}
              <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
                isLight ? 'bg-amber-50/70 border-amber-200 text-stone-800' : 'bg-slate-800/60 border-slate-700 text-slate-200'
              }`}>
                <Smartphone className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <div className="text-xs sm:text-sm space-y-1">
                  <span className="font-black block">Tailored for iPad, iPhone & Android</span>
                  <p className="text-stone-600 dark:text-slate-300">
                    Works on Apple iOS and Android devices. Audio chime reminders alert you even while resting or cooking.
                  </p>
                  {browserPermission !== 'granted' && (
                    <button
                      type="button"
                      onClick={handleRequestPermission}
                      className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-all shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Enable Browser System Notifications</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Master Notifications Toggle */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-800/40">
                <div>
                  <h4 className="font-bold text-sm sm:text-base">All Daily Vitality Alerts</h4>
                  <p className="text-xs text-stone-500 dark:text-slate-400">Master switch for all scheduled alerts and chimes</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSettings(prev => ({ ...prev, enabled: !prev.enabled }))}
                  className={`w-12 h-7 rounded-full transition-colors relative flex items-center p-0.5 ${
                    settings.enabled ? 'bg-amber-600' : 'bg-stone-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle notifications master switch"
                >
                  <div className={`w-6 h-6 rounded-full bg-white shadow-md transform transition-transform ${
                    settings.enabled ? 'translate-x-5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Hydration Reminders */}
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                      <Droplets className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Senior Hydration Reminders</h4>
                      <p className="text-xs text-stone-500 dark:text-slate-400">Reminds you to sip water throughout the day</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.hydrationAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, hydrationAlerts: e.target.checked }))}
                    className="w-5 h-5 rounded-md accent-amber-600 cursor-pointer"
                  />
                </div>

                {settings.hydrationAlerts && (
                  <div className="flex items-center space-x-2 pt-2 border-t border-stone-100 dark:border-slate-800">
                    <span className="text-xs font-bold text-stone-600 dark:text-slate-300">Repeat Every:</span>
                    {[1, 2, 3].map(hours => (
                      <button
                        key={hours}
                        type="button"
                        onClick={() => setSettings(prev => ({ ...prev, hydrationIntervalHours: hours }))}
                        className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                          settings.hydrationIntervalHours === hours
                            ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                            : 'border-stone-200 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        {hours} {hours === 1 ? 'Hour' : 'Hours'}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Meal Plan Alerts */}
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">Meal Prep & Fuel Alerts</h4>
                      <p className="text-xs text-stone-500 dark:text-slate-400">Gentle chimes when it's time for high-protein meals</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.mealAlerts}
                    onChange={(e) => setSettings(prev => ({ ...prev, mealAlerts: e.target.checked }))}
                    className="w-5 h-5 rounded-md accent-amber-600 cursor-pointer"
                  />
                </div>

                {settings.mealAlerts && (
                  <div className="grid grid-cols-3 gap-2 pt-2 border-t border-stone-100 dark:border-slate-800 text-xs font-medium">
                    <div className="flex flex-col space-y-1">
                      <span className="text-stone-500 dark:text-slate-400">Breakfast</span>
                      <input
                        type="time"
                        value={settings.breakfastTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, breakfastTime: e.target.value }))}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-stone-500 dark:text-slate-400">Lunch</span>
                      <input
                        type="time"
                        value={settings.lunchTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, lunchTime: e.target.value }))}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>
                    <div className="flex flex-col space-y-1">
                      <span className="text-stone-500 dark:text-slate-400">Dinner</span>
                      <input
                        type="time"
                        value={settings.dinnerTime}
                        onChange={(e) => setSettings(prev => ({ ...prev, dinnerTime: e.target.value }))}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Sound & Audio Chime Setting */}
              <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-slate-800">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">Gentle Audio Chime</h4>
                    <p className="text-xs text-stone-500 dark:text-slate-400">Pleasant acoustic chime when a reminder fires</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => setSettings(prev => ({ ...prev, soundEnabled: e.target.checked }))}
                  className="w-5 h-5 rounded-md accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Test Alert Button */}
              <div className="pt-2">
                <button
                  type="button"
                  id="btn-test-notification-alert"
                  onClick={handleTriggerTest}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-2xl font-black text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md transition-all active:scale-95"
                >
                  <Bell className="w-4 h-4" />
                  <span>{testSent ? 'Chime Played & Alert Logged!' : 'Test Notification & Sound Now'}</span>
                </button>
              </div>
            </>
          ) : (
            /* Notification History Tab */
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-stone-500 dark:text-slate-400 uppercase tracking-wider">
                  Recent Daily Reminders
                </span>
                {history.length > 0 && (
                  <button
                    type="button"
                    onClick={clearHistory}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {history.length === 0 ? (
                <div className="text-center py-10 text-stone-400 dark:text-slate-500 text-sm">
                  No reminders logged yet.
                </div>
              ) : (
                history.map(item => (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-2xl border flex items-start space-x-3 ${
                      isLight ? 'bg-stone-50 border-stone-200' : 'bg-slate-800/60 border-slate-700'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 mt-0.5">
                      {item.type === 'hydration' ? <Droplets className="w-4 h-4 text-sky-600" /> : <Clock className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="font-bold text-xs sm:text-sm">{item.title}</h5>
                        <span className="text-[10px] text-stone-400">{item.timestamp}</span>
                      </div>
                      <p className="text-xs text-stone-600 dark:text-slate-300 mt-0.5">
                        {item.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 dark:bg-slate-900 border-t border-amber-200 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl text-sm font-bold bg-stone-200 dark:bg-slate-800 hover:bg-stone-300 dark:hover:bg-slate-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationCenter;

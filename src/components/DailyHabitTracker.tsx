import React, { useState, useEffect, useMemo } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  Award, 
  Plus, 
  Trash2, 
  Flame, 
  Heart, 
  Sun, 
  Pill, 
  Footprints, 
  Droplet, 
  Utensils, 
  Moon,
  RotateCcw
} from 'lucide-react';

export interface HabitItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'sun' | 'pill' | 'walk' | 'water' | 'food' | 'moon' | 'heart';
  isCustom?: boolean;
}

const DEFAULT_HABITS: HabitItem[] = [
  {
    id: 'habit-stretch',
    title: 'Morning Stretch & Mobility',
    subtitle: '5–10 mins of gentle neck, shoulder, and ankle mobility to loosen joints',
    iconName: 'sun'
  },
  {
    id: 'habit-vitamins',
    title: 'Daily Vitamins & Medications',
    subtitle: 'Vitamin D3, Calcium, Omega-3s, or physician-prescribed medications',
    iconName: 'pill'
  },
  {
    id: 'habit-walk',
    title: '15–20 Min Light Movement or Walk',
    subtitle: 'Gentle walk outdoors in natural sunlight or comfortable indoor steps',
    iconName: 'walk'
  },
  {
    id: 'habit-water',
    title: 'Midday Hydration Check',
    subtitle: 'Log at least 4 glasses (32 oz) of fresh water before early afternoon',
    iconName: 'water'
  },
  {
    id: 'habit-protein',
    title: 'Vitality Protein Snack',
    subtitle: 'Enjoy 15–20g protein (Greek yogurt with berries, cottage cheese, or walnuts)',
    iconName: 'food'
  },
  {
    id: 'habit-winddown',
    title: 'Evening Calm & Joint Relaxation',
    subtitle: 'Warm herbal tea, light reading, and comfortable wind-down for restorative sleep',
    iconName: 'moon'
  }
];

export interface DailyHabitTrackerProps {
  theme?: string;
  highContrast?: boolean;
}

export const DailyHabitTracker: React.FC<DailyHabitTrackerProps> = ({
  theme = 'light',
  highContrast = false
}) => {
  const isLight = theme === 'light';
  const todayKey = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Custom Habits list
  const [habits, setHabits] = useState<HabitItem[]>(() => {
    try {
      const saved = localStorage.getItem('jeans_senior_habits_list');
      return saved ? JSON.parse(saved) : DEFAULT_HABITS;
    } catch {
      return DEFAULT_HABITS;
    }
  });

  // Completed status for today
  const [checkedIds, setCheckedIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(`jeans_habits_completed_${todayKey}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Habit Streak
  const [streakDays, setStreakDays] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jeans_senior_habit_streak');
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  const [newHabitTitle, setNewHabitTitle] = useState('');
  const [isAddingHabit, setIsAddingHabit] = useState(false);
  const [celebrateAllDone, setCelebrateAllDone] = useState(false);

  // Save checked states
  useEffect(() => {
    try {
      localStorage.setItem(`jeans_habits_completed_${todayKey}`, JSON.stringify(checkedIds));
    } catch (e) {
      console.warn('Could not save completed habits', e);
    }
  }, [checkedIds, todayKey]);

  // Save habits list
  useEffect(() => {
    try {
      localStorage.setItem('jeans_senior_habits_list', JSON.stringify(habits));
    } catch (e) {
      console.warn('Could not save habits list', e);
    }
  }, [habits]);

  const totalCount = habits.length;
  const completedCount = habits.filter(h => !!checkedIds[h.id]).length;
  const percentComplete = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isAllComplete = completedCount === totalCount && totalCount > 0;

  useEffect(() => {
    if (isAllComplete) {
      setCelebrateAllDone(true);
      const timer = setTimeout(() => setCelebrateAllDone(false), 4500);
      return () => clearTimeout(timer);
    }
  }, [isAllComplete]);

  const toggleHabit = (id: string) => {
    setCheckedIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleAddCustomHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;

    const newId = `habit-custom-${Date.now()}`;
    const newHabit: HabitItem = {
      id: newId,
      title: newHabitTitle.trim(),
      subtitle: 'Personalized wellness habit for active daily senior living',
      iconName: 'heart',
      isCustom: true
    };

    setHabits(prev => [...prev, newHabit]);
    setNewHabitTitle('');
    setIsAddingHabit(false);
  };

  const handleDeleteHabit = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHabits(prev => prev.filter(h => h.id !== id));
    setCheckedIds(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const handleResetDefaults = () => {
    setHabits(DEFAULT_COLLECTIONS ? DEFAULT_HABITS : DEFAULT_HABITS);
    setCheckedIds({});
  };

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'sun': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'pill': return <Pill className="w-5 h-5 text-rose-500" />;
      case 'walk': return <Footprints className="w-5 h-5 text-emerald-500" />;
      case 'water': return <Droplet className="w-5 h-5 text-sky-500" />;
      case 'food': return <Utensils className="w-5 h-5 text-amber-600" />;
      case 'moon': return <Moon className="w-5 h-5 text-indigo-400" />;
      default: return <Heart className="w-5 h-5 text-rose-500" />;
    }
  };

  return (
    <section 
      id="daily-habit-tracker" 
      aria-label="Daily Senior Health Habit Tracker"
      className={`rounded-3xl p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 border shadow-lg relative overflow-hidden ${
        highContrast
          ? 'bg-black text-white border-amber-400'
          : isLight
            ? 'bg-gradient-to-br from-amber-50/70 via-white/95 to-orange-50/50 border-amber-200/90 shadow-[0_8px_30px_rgba(217,119,6,0.07)] ring-1 ring-amber-900/5'
            : 'bg-gradient-to-br from-slate-900/95 via-stone-900/90 to-slate-900/95 border-slate-700/80 shadow-2xl ring-1 ring-white/10'
      }`}
    >
      {/* Background Refraction Glow */}
      <div 
        className={`absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-opacity ${
          isLight ? 'bg-amber-300/30' : 'bg-amber-500/10'
        }`} 
      />

      <div className="relative z-10 space-y-6">
        {/* Title Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-amber-200/60 dark:border-slate-800">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Sparkles className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-0.5">
                <Heart className="w-3.5 h-3.5" />
                <span>Senior Wellness & Daily Routine</span>
              </div>
              <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
                isLight ? 'text-stone-900' : 'text-white'
              }`}>
                Daily Health & Habit Tracker
              </h2>
              <p className={`text-xs sm:text-sm font-medium ${isLight ? 'text-stone-600' : 'text-slate-300'}`}>
                Check off healthy daily habits that complement your water intake and 100g protein menu
              </p>
            </div>
          </div>

          {/* Quick Metrics & Streak Badge */}
          <div className="flex items-center gap-2 self-start md:self-auto">
            {/* Streak Counter */}
            <div className={`px-3.5 py-2 rounded-2xl border text-center flex items-center space-x-2 ${
              isLight ? 'bg-amber-100/80 border-amber-300/80 text-amber-950' : 'bg-slate-800 border-slate-700 text-amber-300'
            }`}>
              <Flame className="w-5 h-5 text-orange-500 animate-pulse" />
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider block text-stone-500 dark:text-slate-400 leading-none">
                  Streak
                </span>
                <span className="text-sm font-black">
                  {streakDays} Days Strong
                </span>
              </div>
            </div>

            {/* Today Completed Counter */}
            <div className={`px-4 py-2 rounded-2xl border text-center ${
              isAllComplete
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
                : isLight
                  ? 'bg-white border-amber-200 text-stone-900 shadow-2xs'
                  : 'bg-slate-800 border-slate-700 text-white'
            }`}>
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-75 leading-none">
                Completed
              </span>
              <span className="text-sm sm:text-base font-black">
                {completedCount} of {totalCount} Done ({percentComplete}%)
              </span>
            </div>
          </div>
        </div>

        {/* Progress Bar & Congratulatory Banner */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
            <span className={isLight ? 'text-stone-700' : 'text-slate-300'}>
              Today's Wellness Completion:
            </span>
            <span className={`font-black ${isAllComplete ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isAllComplete ? '🎉 All Daily Habits Completed!' : `${totalCount - completedCount} habits left today`}
            </span>
          </div>

          <div className={`h-3.5 w-full rounded-full overflow-hidden p-0.5 border ${
            isLight ? 'bg-amber-100/70 border-amber-200' : 'bg-slate-800 border-slate-700'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                isAllComplete
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-sm'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-sm'
              }`}
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>

        {/* Celebrate Modal Banner */}
        {celebrateAllDone && (
          <div className="p-4 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 border-2 border-emerald-400 text-emerald-950 dark:text-emerald-100 flex items-center justify-between shadow-md animate-in fade-in duration-300">
            <div className="flex items-center space-x-3">
              <Award className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <h4 className="text-sm font-black">Splendid Work on Your Health Today, Dear!</h4>
                <p className="text-xs font-medium">You've completed every daily wellness habit. Your joints, muscles, and mind thank you!</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setCelebrateAllDone(false)}
              className="text-xs font-black underline hover:text-emerald-800 shrink-0 ml-2"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Habits Checklist Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {habits.map((habit) => {
            const isDone = !!checkedIds[habit.id];
            return (
              <div
                key={habit.id}
                id={`habit-card-${habit.id}`}
                onClick={() => toggleHabit(habit.id)}
                className={`flex items-start justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none active:scale-98 ${
                  isDone
                    ? isLight
                      ? 'bg-emerald-50/90 border-emerald-300/80 shadow-2xs'
                      : 'bg-emerald-950/40 border-emerald-800/70'
                    : isLight
                      ? 'bg-white hover:bg-amber-50/60 border-stone-200 hover:border-amber-300 shadow-2xs'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-slate-600'
                }`}
                style={{ minHeight: '68px' }}
                role="checkbox"
                aria-checked={isDone}
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === ' ' || e.key === 'Enter') {
                    e.preventDefault();
                    toggleHabit(habit.id);
                  }
                }}
              >
                <div className="flex items-start space-x-3.5 min-w-0">
                  {/* Big Touch-Friendly Checkbox Square */}
                  <div className={`w-7 h-7 rounded-xl border-2 shrink-0 flex items-center justify-center transition-colors mt-0.5 ${
                    isDone
                      ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                      : 'border-stone-400 dark:border-slate-500 bg-stone-50 dark:bg-slate-700'
                  }`}>
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    ) : (
                      <Circle className="w-4 h-4 text-stone-300 dark:text-slate-500" />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="shrink-0">{renderIcon(habit.iconName)}</span>
                      <h4 className={`text-sm sm:text-base font-black truncate leading-snug ${
                        isDone
                          ? isLight ? 'line-through text-stone-500' : 'line-through text-slate-400'
                          : isLight ? 'text-stone-900' : 'text-white'
                      }`}>
                        {habit.title}
                      </h4>
                    </div>
                    <p className={`text-xs mt-1 leading-relaxed ${
                      isDone
                        ? isLight ? 'text-stone-400' : 'text-slate-500'
                        : isLight ? 'text-stone-600' : 'text-slate-300'
                    }`}>
                      {habit.subtitle}
                    </p>
                  </div>
                </div>

                {habit.isCustom && (
                  <button
                    type="button"
                    onClick={(e) => handleDeleteHabit(habit.id, e)}
                    className="p-1 text-stone-400 hover:text-rose-600 transition-colors ml-2 shrink-0"
                    title="Remove custom habit"
                    aria-label={`Remove ${habit.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Actions: Add Custom Habit & Reset */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-amber-200/50 dark:border-slate-800">
          {isAddingHabit ? (
            <form onSubmit={handleAddCustomHabit} className="flex-1 flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={newHabitTitle}
                onChange={(e) => setNewHabitTitle(e.target.value)}
                placeholder="e.g. 10 min afternoon puzzle, check blood pressure, evening chamomile tea..."
                className={`flex-1 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                  isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-800 border-slate-700 text-white'
                }`}
                autoFocus
              />
              <div className="flex items-center space-x-2">
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
                >
                  Save Habit
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingHabit(false)}
                  className="px-3 py-2.5 rounded-2xl text-xs font-bold text-stone-600 dark:text-slate-300 hover:bg-stone-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-add-daily-habit"
                onClick={() => setIsAddingHabit(true)}
                className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl text-xs font-bold border transition-all active:scale-95 ${
                  isLight 
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300/80 shadow-2xs' 
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
                }`}
              >
                <Plus className="w-4 h-4" />
                <span>Add Custom Daily Habit</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaults}
                className="inline-flex items-center space-x-1 px-3 py-2 rounded-2xl text-xs font-semibold text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Habits</span>
              </button>
            </div>
          )}

          <div className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
            Progress updates automatically daily • Consistent routines promote healthy senior longevity
          </div>
        </div>
      </div>
    </section>
  );
};

export default DailyHabitTracker;

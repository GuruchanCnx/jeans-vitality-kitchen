import React, { useState, useEffect, useMemo } from 'react';
import { 
  Droplet, 
  Droplets, 
  Plus, 
  Minus, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Info, 
  HeartPulse,
  Award,
  TrendingUp,
  Calendar,
  Check,
  X
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

// Realistic senior-friendly Water Glass SVG with liquid fill level and glossy reflection
function WaterGlassIcon({ isFilled, isHalf, className = "w-7 h-9" }) {
  return (
    <svg viewBox="0 0 36 48" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="water-fill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      {/* Glass Wall Outer Shape */}
      <path
        d="M6 7 L9.5 41 C10 43.5 12 45 14.5 45 L21.5 45 C24 45 26 43.5 26.5 41 L30 7 Z"
        className={isFilled ? "stroke-sky-300 dark:stroke-sky-400" : "stroke-stone-400 dark:stroke-slate-500"}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Top Glass Rim */}
      <ellipse
        cx="18"
        cy="7"
        rx="12"
        ry="3"
        className={isFilled ? "stroke-sky-300 dark:stroke-sky-400" : "stroke-stone-400 dark:stroke-slate-500"}
        strokeWidth="2.5"
      />
      {/* Liquid Fill */}
      {isFilled && (
        <>
          <path
            d="M8.2 13 L10.5 41 C11 43 12.5 43.5 14.5 43.5 L21.5 43.5 C23.5 43.5 25 43 25.5 41 L27.8 13 Z"
            fill="url(#water-fill-gradient)"
          />
          {/* Water meniscus surface */}
          <ellipse cx="18" cy="13" rx="9.8" ry="2.2" fill="#bae6fd" />
          {/* Glass reflection highlight */}
          <path d="M12 18 L13 36" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" strokeLinecap="round" />
        </>
      )}
      {isHalf && !isFilled && (
        <>
          <path
            d="M9.8 27 L10.5 41 C11 43 12.5 43.5 14.5 43.5 L21.5 43.5 C23.5 43.5 25 43 25.5 41 L26.2 27 Z"
            fill="url(#water-fill-gradient)"
          />
          <ellipse cx="18" cy="27" rx="8.2" ry="2" fill="#bae6fd" />
        </>
      )}
    </svg>
  );
}

export default function WaterTracker({ theme = 'light' }) {
  const isLight = theme === 'light';
  
  // Daily target in cups/glasses (default 8 cups = 64 oz senior baseline, customizable)
  const [dailyGoalCups, setDailyGoalCups] = useState(() => {
    try {
      const saved = localStorage.getItem('jeans_water_goal_cups');
      return saved ? JSON.parse(saved) : 8;
    } catch {
      return 8;
    }
  });

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [consumedCups, setConsumedCups] = useState(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(`jeans_water_intake_${today}`);
      return saved ? JSON.parse(saved) : 0;
    } catch {
      return 0;
    }
  });

  const [showTip, setShowTip] = useState(false);
  const [showChart, setShowChart] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [celebrateEffect, setCelebrateEffect] = useState(false);

  // Save consumed cups and goal to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('jeans_water_goal_cups', JSON.stringify(dailyGoalCups));
      localStorage.setItem(`jeans_water_intake_${todayStr}`, JSON.stringify(consumedCups));
    } catch {
      // Ignore localStorage errors in restricted environments
    }

    if (consumedCups >= dailyGoalCups && consumedCups > 0) {
      setCelebrateEffect(true);
      const timer = setTimeout(() => setCelebrateEffect(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [consumedCups, dailyGoalCups, todayStr]);

  const addCup = (amount = 1) => {
    setConsumedCups(prev => Math.min(16, Math.max(0, Math.round((prev + amount) * 10) / 10)));
  };

  const removeCup = (amount = 1) => {
    setConsumedCups(prev => Math.max(0, Math.round((prev - amount) * 10) / 10));
  };

  const handleConfirmReset = () => {
    setConsumedCups(0);
    setShowResetConfirm(false);
  };

  const percentage = Math.min(100, Math.round((consumedCups / dailyGoalCups) * 100));
  const ozTotal = Math.round(consumedCups * 8);
  const mlTotal = Math.round(consumedCups * 240);
  const goalOz = dailyGoalCups * 8;
  const isGoalReached = consumedCups >= dailyGoalCups;

  // Build current week's 7-day data (Monday through Sunday)
  const weeklyData = useMemo(() => {
    const now = new Date();
    // Monday as start of week
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
    const distanceToMonday = (currentDay + 6) % 7;
    const monday = new Date(now);
    monday.setDate(now.getDate() - distanceToMonday);

    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const baselines = [7, 8, 7.5, 8, 8.5, 7, 8]; // senior baseline for days prior to logging

    return dayLabels.map((dayName, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const dateKey = d.toISOString().split('T')[0];
      const isToday = dateKey === todayStr;

      let cups = 0;
      if (isToday) {
        cups = consumedCups;
      } else {
        try {
          const saved = localStorage.getItem(`jeans_water_intake_${dateKey}`);
          if (saved !== null) {
            cups = JSON.parse(saved);
          } else if (d < now) {
            // Prior days in current week get realistic senior intake
            cups = baselines[index];
          } else {
            cups = 0;
          }
        } catch {
          cups = d < now ? baselines[index] : 0;
        }
      }

      return {
        day: dayName,
        date: dateKey,
        cups: Math.round(cups * 10) / 10,
        oz: Math.round(cups * 8),
        goal: dailyGoalCups,
        isToday
      };
    });
  }, [consumedCups, dailyGoalCups, todayStr]);

  const weeklyAverageCups = useMemo(() => {
    const logged = weeklyData.filter(d => d.cups > 0);
    if (!logged.length) return consumedCups;
    const total = logged.reduce((acc, curr) => acc + curr.cups, 0);
    return Math.round((total / logged.length) * 10) / 10;
  }, [weeklyData, consumedCups]);

  const hydrationTips = [
    "Thirst signals naturally diminish with age. Sip water steadily throughout the day rather than waiting until you feel thirsty.",
    "Pair each of your 4 daily meals and snacks with a full 8 oz glass of water to easily reach half your daily goal.",
    "Higher protein intake increases water needs. Staying hydrated helps your kidneys process dietary protein efficiently.",
    "Good hydration lubricates joints, prevents afternoon fatigue, and supports healthy digestion."
  ];

  return (
    <section 
      id="water-tracker" 
      aria-labelledby="water-tracker-heading"
      className={`rounded-3xl p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 border shadow-lg relative overflow-hidden ${
        isLight
          ? 'bg-gradient-to-br from-cyan-50/90 via-sky-50/70 to-white/95 border-sky-200/90 shadow-[0_8px_30px_rgba(14,165,233,0.08)] ring-1 ring-sky-900/5'
          : 'bg-gradient-to-br from-slate-900/95 via-sky-950/40 to-slate-900/90 border-sky-800/50 shadow-xl ring-1 ring-sky-400/10'
      }`}
    >
      {/* Subtle Background Glow */}
      <div 
        className={`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-opacity ${
          isLight ? 'bg-sky-200/40' : 'bg-sky-500/10'
        }`} 
      />

      <div className="relative z-10 space-y-6">
        {/* Header with Title and Goal Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-sky-100 dark:border-slate-800/80">
          <div className="flex items-center space-x-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-md shadow-sky-500/25 shrink-0">
              <Droplets className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <div className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-0.5">
                <HeartPulse className="w-3.5 h-3.5" />
                <span>Senior Hydration Companion</span>
              </div>
              <h2 
                id="water-tracker-heading" 
                className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                  isLight ? 'text-stone-900' : 'text-white'
                }`}
              >
                Daily Water Intake Tracker
              </h2>
              <p className={`text-sm font-medium ${isLight ? 'text-stone-600' : 'text-slate-300'}`}>
                Stay energized and protect kidney health alongside your 100g protein menu
              </p>
            </div>
          </div>

          {/* Quick Metrics Badge */}
          <div className="flex items-center gap-2 sm:self-auto self-start">
            <div className={`px-4 py-2 rounded-2xl border text-center ${
              isGoalReached 
                ? isLight 
                  ? 'bg-emerald-100/90 border-emerald-300 text-emerald-950' 
                  : 'bg-emerald-950/80 border-emerald-700 text-emerald-200'
                : isLight
                  ? 'bg-white/90 border-sky-200 text-stone-800 shadow-2xs'
                  : 'bg-slate-800/90 border-slate-700 text-slate-200'
            }`}>
              <div className="text-xs font-semibold text-stone-500 dark:text-slate-400">Total Today</div>
              <div className="text-lg sm:text-xl font-black text-sky-600 dark:text-sky-400 flex items-center justify-center gap-1">
                {consumedCups} <span className="text-xs font-bold text-stone-600 dark:text-slate-300">/ {dailyGoalCups} cups</span>
              </div>
            </div>

            <div className={`px-3 py-2 rounded-2xl border text-center hidden sm:block ${
              isLight ? 'bg-white/90 border-sky-200 text-stone-800' : 'bg-slate-800/90 border-slate-700 text-slate-200'
            }`}>
              <div className="text-xs font-semibold text-stone-500 dark:text-slate-400">Volume</div>
              <div className="text-sm font-bold text-stone-800 dark:text-slate-100">
                {ozTotal} oz <span className="text-xs text-stone-500 dark:text-slate-400">({mlTotal} ml)</span>
              </div>
            </div>

            <div className={`px-3 py-2 rounded-2xl border text-center hidden lg:block ${
              isLight ? 'bg-white/90 border-sky-200 text-stone-800' : 'bg-slate-800/90 border-slate-700 text-slate-200'
            }`}>
              <div className="text-xs font-semibold text-stone-500 dark:text-slate-400">Week Avg</div>
              <div className="text-sm font-black text-sky-600 dark:text-sky-400">
                {weeklyAverageCups} cups
              </div>
            </div>
          </div>
        </div>

        {/* Daily Hydration Goal Selector Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-sky-200/80 dark:border-slate-700 shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-sky-500 text-white shadow-2xs">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-black block leading-none text-stone-800 dark:text-white">
                Daily Hydration Goal
              </span>
              <span className="text-[11px] text-stone-500 dark:text-slate-400">
                {dailyGoalCups * 8} oz / {Math.round(dailyGoalCups * 0.236 * 10) / 10} Liters baseline for active seniors
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
            {[6, 8, 10, 12].map(cups => (
              <button
                key={cups}
                type="button"
                id={`btn-water-goal-${cups}`}
                onClick={() => setDailyGoalCups(cups)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                  dailyGoalCups === cups
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : isLight
                      ? 'bg-sky-50 hover:bg-sky-100 text-sky-900 border-sky-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
                title={`Set daily hydration goal to ${cups} glasses (${cups * 8} oz)`}
              >
                {cups} Glasses ({cups * 8} oz)
              </button>
            ))}

            {/* Stepper for custom goal */}
            <div className="flex items-center space-x-1 pl-1">
              <button
                type="button"
                onClick={() => setDailyGoalCups(prev => Math.max(4, prev - 1))}
                className="p-1 rounded-lg border border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-700"
                title="Decrease daily goal"
                aria-label="Decrease daily goal"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDailyGoalCups(prev => Math.min(16, prev + 1))}
                className="p-1 rounded-lg border border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-700"
                title="Increase daily goal"
                aria-label="Increase daily goal"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Progress Bar & Goal Status */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs sm:text-sm font-bold">
            <span className={`flex items-center gap-1.5 ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
              <span>Hydration Progress:</span>
              <strong className="text-sky-600 dark:text-sky-400 font-extrabold">{percentage}%</strong>
            </span>
            <span className={`${isGoalReached ? 'text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1' : isLight ? 'text-stone-600' : 'text-slate-400'}`}>
              {isGoalReached ? (
                <>
                  <Award className="w-4 h-4" />
                  <span>Daily Goal Achieved ({goalOz} oz)!</span>
                </>
              ) : (
                `${Math.max(0, dailyGoalCups - consumedCups)} glasses (${Math.max(0, goalOz - ozTotal)} oz) to goal`
              )}
            </span>
          </div>

          {/* Progress track */}
          <div className={`h-4 w-full rounded-full overflow-hidden p-0.5 border ${
            isLight ? 'bg-sky-100/80 border-sky-200' : 'bg-slate-800 border-slate-700'
          }`}>
            <div 
              className={`h-full rounded-full transition-all duration-500 relative ${
                isGoalReached
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/30'
                  : 'bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-md shadow-sky-500/30'
              }`}
              style={{ width: `${percentage}%` }}
            >
              {percentage > 15 && (
                <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
              )}
            </div>
          </div>
        </div>

        {/* Interactive Water Glass Icons (Click to Log Throughout Day) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-xs sm:text-sm font-bold text-stone-700 dark:text-slate-200">
              <span>Click any water glass icon to log your intake throughout the day:</span>
            </div>
            <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400">
              8 oz per glass
            </span>
          </div>

          <div className="grid grid-cols-3 xs:grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2.5 sm:gap-3">
            {Array.from({ length: dailyGoalCups }).map((_, idx) => {
              const glassNumber = idx + 1;
              const isFilled = consumedCups >= glassNumber;
              const isHalf = !isFilled && consumedCups >= glassNumber - 0.5;

              return (
                <button
                  key={idx}
                  type="button"
                  id={`water-glass-btn-${glassNumber}`}
                  onClick={() => {
                    // Clicking this glass fills up to this glass; if already filled, toggles down
                    if (consumedCups === glassNumber) {
                      setConsumedCups(glassNumber - 1);
                    } else {
                      setConsumedCups(glassNumber);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 active:scale-95 group relative ${
                    isFilled
                      ? isLight
                        ? 'bg-gradient-to-b from-sky-100 to-blue-100/80 text-sky-950 border-sky-300 shadow-md shadow-sky-500/15 ring-2 ring-sky-400/30'
                        : 'bg-gradient-to-b from-sky-950/80 to-blue-900/60 text-white border-sky-500 shadow-md shadow-sky-600/30 ring-2 ring-sky-400/40'
                      : isHalf
                        ? isLight
                          ? 'bg-sky-50 border-sky-300 text-sky-800'
                          : 'bg-sky-950/60 border-sky-700 text-sky-300'
                        : isLight
                          ? 'bg-white hover:bg-sky-50 border-sky-200/90 text-stone-500 hover:text-sky-700 hover:border-sky-300 shadow-2xs'
                          : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-400 hover:text-sky-300'
                  }`}
                  aria-label={`Glass ${glassNumber}: ${isFilled ? 'Filled (Click to empty)' : 'Empty (Click to log)'}`}
                  title={`Glass ${glassNumber} (8 oz) - Click to log intake`}
                >
                  <div className="relative py-1">
                    <WaterGlassIcon 
                      isFilled={isFilled} 
                      isHalf={isHalf} 
                      className="w-8 h-10 transition-transform duration-200 group-hover:scale-110" 
                    />
                    {isFilled && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-white absolute -bottom-0.5 -right-1 fill-blue-600" />
                    )}
                  </div>
                  <span className={`text-[11px] font-black mt-1.5 ${
                    isFilled ? (isLight ? 'text-sky-900' : 'text-sky-100') : isLight ? 'text-stone-700' : 'text-slate-300'
                  }`}>
                    Glass {glassNumber}
                  </span>
                  <span className={`text-[9px] font-bold ${
                    isFilled ? 'text-sky-600 dark:text-sky-300' : 'text-stone-400 dark:text-slate-500'
                  }`}>
                    8 oz {isFilled ? '✓' : ''}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Controls & Fast Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* Quick-Add Buttons (Touch target friendly >= 44px) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => addCup(1)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md shadow-sky-600/25 active:scale-95 transition-all min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>+1 Glass (8 oz)</span>
            </button>

            <button
              type="button"
              onClick={() => addCup(2)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border transition-all active:scale-95 min-h-[44px] ${
                isLight
                  ? 'bg-white hover:bg-sky-50 text-sky-800 border-sky-200 hover:border-sky-300 shadow-2xs'
                  : 'bg-slate-800 hover:bg-slate-700 text-sky-300 border-slate-700 hover:border-sky-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>+1 Bottle (16 oz)</span>
            </button>

            <button
              type="button"
              onClick={() => removeCup(1)}
              disabled={consumedCups <= 0}
              className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all disabled:opacity-40 disabled:pointer-events-none active:scale-95 min-h-[44px] ${
                isLight
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title="Remove 1 glass"
            >
              <Minus className="w-4 h-4" />
              <span>-1 Glass</span>
            </button>
          </div>

          {/* Goal Setting, Chart Toggle & Reset Actions */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowChart(!showChart)}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 min-h-[44px] ${
                showChart
                  ? isLight
                    ? 'bg-sky-100 text-sky-900 border-sky-300 shadow-xs'
                    : 'bg-sky-950 text-sky-200 border-sky-700'
                  : isLight
                    ? 'bg-white/80 hover:bg-white text-stone-700 border-stone-200'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
              aria-expanded={showChart}
            >
              <TrendingUp className="w-4 h-4 text-sky-600 dark:text-sky-400" />
              <span>{showChart ? 'Hide Weekly Chart' : 'Weekly Trends Chart'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowTip(!showTip)}
              className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 min-h-[44px] ${
                showTip
                  ? isLight
                    ? 'bg-sky-100 text-sky-900 border-sky-300'
                    : 'bg-sky-950 text-sky-200 border-sky-700'
                  : isLight
                    ? 'bg-white/80 hover:bg-white text-stone-600 border-stone-200'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Info className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Tips</span>
            </button>

            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 min-h-[44px] ${
                isLight
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
              title="Reset today's water tracker"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Inline Reset Confirmation (Replaces unsafe window.confirm) */}
        {showResetConfirm && (
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-150 ${
            isLight
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-amber-950/70 border-amber-700 text-amber-200'
          }`}>
            <span className="text-xs sm:text-sm font-bold text-center sm:text-left">
              Are you sure you want to reset today's water intake back to 0 glasses?
            </span>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={handleConfirmReset}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-xs active:scale-95 transition-all"
              >
                Yes, Reset
              </button>
              <button
                type="button"
                onClick={() => setShowResetConfirm(false)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                  isLight ? 'bg-white hover:bg-stone-50 border-stone-300 text-stone-700' : 'bg-slate-800 hover:bg-slate-700 border-slate-600 text-slate-200'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Weekly Water Intake Recharts Line Chart */}
        {showChart && (
          <div className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 ${
            isLight
              ? 'bg-white/95 border-sky-200/90 shadow-xs'
              : 'bg-slate-900/90 border-slate-800 shadow-md'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                <h3 className={`text-sm sm:text-base font-bold tracking-tight ${isLight ? 'text-stone-900' : 'text-white'}`}>
                  Weekly Hydration Progress (Monday – Sunday)
                </h3>
              </div>
              <div className="flex items-center space-x-4 text-xs font-bold text-stone-500 dark:text-slate-400">
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-1 rounded-full bg-sky-500 inline-block" />
                  <span className={isLight ? 'text-stone-700' : 'text-slate-300'}>Intake (Cups)</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <span className="w-3 h-0.5 border-t-2 border-dashed border-emerald-500 inline-block" />
                  <span className="text-emerald-700 dark:text-emerald-400">8-Cup Goal</span>
                </span>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="h-56 sm:h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={weeklyData}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <CartesianGrid 
                    strokeDasharray="3 3" 
                    vertical={false} 
                    stroke={isLight ? '#e0f2fe' : '#1e293b'} 
                  />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: isLight ? '#44403c' : '#cbd5e1', fontSize: 12, fontWeight: 700 }}
                    axisLine={{ stroke: isLight ? '#bae6fd' : '#334155' }}
                    tickLine={false}
                  />
                  <YAxis 
                    domain={[0, 12]} 
                    ticks={[0, 2, 4, 6, 8, 10, 12]}
                    tick={{ fill: isLight ? '#44403c' : '#cbd5e1', fontSize: 11, fontWeight: 600 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className={`p-3 rounded-xl border shadow-lg text-xs space-y-1 ${
                            isLight 
                              ? 'bg-white border-sky-200 text-stone-900 shadow-sky-900/10' 
                              : 'bg-slate-900 border-slate-700 text-white shadow-black/40'
                          }`}>
                            <div className="font-extrabold flex items-center justify-between gap-3">
                              <span>{data.day} ({data.date})</span>
                              {data.isToday && (
                                <span className="px-1.5 py-0.5 rounded-sm bg-sky-500 text-white text-[10px] font-bold">
                                  Today
                                </span>
                              )}
                            </div>
                            <div className="text-sm font-black text-sky-600 dark:text-sky-400">
                              {data.cups} cups <span className="text-xs font-normal text-stone-500 dark:text-slate-400">({data.oz} oz)</span>
                            </div>
                            <div className={`font-semibold text-[11px] ${
                              data.cups >= data.goal ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                            }`}>
                              {data.cups >= data.goal ? '✓ Daily Goal Met (64+ oz)' : `${Math.max(0, data.goal - data.cups)} cups under goal`}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine 
                    y={8} 
                    stroke="#10b981" 
                    strokeDasharray="4 4" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cups" 
                    stroke="#0284c7" 
                    strokeWidth={3}
                    dot={{ fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, fill: '#0369a1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className={`text-[11px] text-center mt-2 font-medium ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
              Consistent hydration supports healthy kidney processing of dietary protein and protects bone joints.
            </p>
          </div>
        )}

        {/* Celebratory Banner when Goal Reached */}
        {isGoalReached && (
          <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 animate-in fade-in zoom-in-95 duration-300 ${
            isLight
              ? 'bg-emerald-500/10 border-emerald-300/80 text-emerald-950'
              : 'bg-emerald-950/60 border-emerald-700/80 text-emerald-200'
          }`}>
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-sm shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="text-xs sm:text-sm">
              <span className="font-extrabold">Wonderful job staying hydrated today!</span>
              <p className="opacity-90 font-medium mt-0.5">
                Reaching 64 oz of fluid helps maximize protein synthesis, preserves cartilage joint fluid, and promotes healthy blood pressure.
              </p>
            </div>
          </div>
        )}

        {/* Collapsible Hydration Tips Box */}
        {showTip && (
          <div className={`p-4 rounded-2xl border text-xs sm:text-sm space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-200 ${
            isLight 
              ? 'bg-sky-50/80 border-sky-200 text-stone-800' 
              : 'bg-slate-800/90 border-slate-700 text-slate-200'
          }`}>
            <div className="font-bold flex items-center gap-1.5 text-sky-700 dark:text-sky-400">
              <HeartPulse className="w-4 h-4" />
              <span>Hydration Wisdom for Active Seniors:</span>
            </div>
            <ul className="space-y-1.5 list-disc list-inside pl-1 text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
              {hydrationTips.map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

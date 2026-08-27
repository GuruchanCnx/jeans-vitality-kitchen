import React, { useState, useEffect } from 'react';
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
  Award
} from 'lucide-react';

export default function WaterTracker({ theme = 'light' }) {
  const isLight = theme === 'light';
  
  // Daily target in cups (8 cups = 64 oz / 1.9L standard senior hydration baseline)
  const [dailyGoalCups, setDailyGoalCups] = useState(8);
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
  const [celebrateEffect, setCelebrateEffect] = useState(false);

  // Save to localStorage
  useEffect(() => {
    try {
      const today = new Date().toISOString().split('T')[0];
      localStorage.setItem(`jeans_water_intake_${today}`, JSON.stringify(consumedCups));
    } catch {
      // Ignore localStorage errors in restricted environments
    }

    if (consumedCups >= dailyGoalCups && consumedCups > 0) {
      setCelebrateEffect(true);
      const timer = setTimeout(() => setCelebrateEffect(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [consumedCups, dailyGoalCups]);

  const addCup = (amount = 1) => {
    setConsumedCups(prev => Math.min(16, Math.max(0, Math.round((prev + amount) * 10) / 10)));
  };

  const removeCup = (amount = 1) => {
    setConsumedCups(prev => Math.max(0, Math.round((prev - amount) * 10) / 10));
  };

  const resetIntake = () => {
    if (window.confirm('Reset today’s water tracker to 0 glasses?')) {
      setConsumedCups(0);
    }
  };

  const percentage = Math.min(100, Math.round((consumedCups / dailyGoalCups) * 100));
  const ozTotal = Math.round(consumedCups * 8);
  const mlTotal = Math.round(consumedCups * 240);
  const goalOz = dailyGoalCups * 8;
  const isGoalReached = consumedCups >= dailyGoalCups;

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
                `${Math.max(0, dailyGoalCups - consumedCups)} cups (${Math.max(0, goalOz - ozTotal)} oz) to goal`
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

        {/* Interactive Glass Icons (Senior-Friendly Visual Indicator) */}
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400 mb-2.5">
            Click glass to fill or log your daily cups:
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
            {Array.from({ length: dailyGoalCups }).map((_, idx) => {
              const glassNumber = idx + 1;
              const isFilled = consumedCups >= glassNumber;
              const isHalf = !isFilled && consumedCups >= glassNumber - 0.5;

              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    // If clicking the current filled level, toggle it
                    if (consumedCups === glassNumber) {
                      setConsumedCups(glassNumber - 1);
                    } else {
                      setConsumedCups(glassNumber);
                    }
                  }}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all duration-200 active:scale-95 group relative ${
                    isFilled
                      ? isLight
                        ? 'bg-gradient-to-b from-sky-400 to-blue-500 text-white border-blue-400 shadow-md shadow-sky-500/20'
                        : 'bg-gradient-to-b from-sky-500 to-blue-600 text-white border-sky-400 shadow-md shadow-sky-600/30'
                      : isHalf
                        ? isLight
                          ? 'bg-sky-100 border-sky-300 text-sky-800'
                          : 'bg-sky-950/70 border-sky-700 text-sky-300'
                        : isLight
                          ? 'bg-white hover:bg-sky-50 border-sky-200/80 text-stone-400 hover:text-sky-600 hover:border-sky-300'
                          : 'bg-slate-800/80 hover:bg-slate-750 border-slate-700 text-slate-500 hover:text-sky-400'
                  }`}
                  aria-label={`Cup ${glassNumber}: ${isFilled ? 'Filled' : 'Empty'}`}
                >
                  <div className="relative">
                    <Droplet 
                      className={`w-6 h-6 transition-transform duration-200 group-hover:scale-110 ${
                        isFilled 
                          ? 'fill-current text-white' 
                          : isHalf 
                            ? 'text-sky-500 fill-sky-200' 
                            : 'text-stone-300 dark:text-slate-600'
                      }`} 
                    />
                    {isFilled && (
                      <CheckCircle2 className="w-3 h-3 text-white absolute -bottom-1 -right-1 fill-blue-600" />
                    )}
                  </div>
                  <span className={`text-[11px] font-bold mt-1 ${
                    isFilled ? 'text-white' : isLight ? 'text-stone-600' : 'text-slate-400'
                  }`}>
                    Cup {glassNumber}
                  </span>
                  <span className={`text-[9px] font-medium opacity-80 ${
                    isFilled ? 'text-sky-100' : 'text-stone-400 dark:text-slate-500'
                  }`}>
                    8 oz
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

          {/* Goal Setting & Reset Actions */}
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setShowTip(!showTip)}
              className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
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
              <span>Hydration Tips</span>
            </button>

            <button
              type="button"
              onClick={resetIntake}
              className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 ${
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

        {/* Celebratory Banner when Goal Reached */}
        {isGoalReached && (
          <div className={`p-4 rounded-2xl border flex items-center space-x-3.5 animate-in fade-in zoom-in-95 duration-300 ${
            isLight
              ? 'bg-emerald-500/10 border-emerald-300/80 text-emerald-900'
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

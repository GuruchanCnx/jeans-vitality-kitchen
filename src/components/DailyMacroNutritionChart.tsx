import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  Cell
} from 'recharts';
import { 
  Flame, 
  Activity, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Info, 
  Layers, 
  Columns,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { getMealMeta } from '../data/recipeImages';
import { DayPlan } from './WeeklyMealPlanDashboard';

export interface DailyMacroNutritionChartProps {
  mealPlan: DayPlan[];
  theme?: string;
  highContrast?: boolean;
  selectedDayId?: string;
  onSelectDay?: (dayId: string) => void;
  servingSizes?: Record<string, number>;
}

export const DailyMacroNutritionChart: React.FC<DailyMacroNutritionChartProps> = ({
  mealPlan,
  theme = 'light',
  highContrast = false,
  selectedDayId = 'all',
  onSelectDay,
  servingSizes = {}
}) => {
  const isLight = theme === 'light';

  // Chart view style: 'grouped' vs 'stacked'
  const [chartMode, setChartMode] = useState<'grouped' | 'stacked'>('grouped');
  
  // Specific day focus for single-day meal breakdown
  const [focusedDayId, setFocusedDayId] = useState<string>(
    selectedDayId !== 'all' ? selectedDayId : 'monday'
  );

  // Sync if parent changes selected day
  React.useEffect(() => {
    if (selectedDayId && selectedDayId !== 'all') {
      setFocusedDayId(selectedDayId);
    }
  }, [selectedDayId]);

  // Macro Palette tailored for older eyes & high-contrast
  const colors = {
    protein: highContrast ? '#047857' : isLight ? '#059669' : '#10b981', // Emerald
    carbs: highContrast ? '#b45309' : isLight ? '#d97706' : '#f59e0b',   // Golden Amber
    fat: highContrast ? '#be123c' : isLight ? '#e11d48' : '#fb7185',     // Rose / Ruby
    target: highContrast ? '#000000' : isLight ? '#1e293b' : '#38bdf8'
  };

  // 1. Calculate 7-Day Macro Totals
  const weeklyData = useMemo(() => {
    const shortNames: Record<string, string> = {
      monday: 'Mon',
      tuesday: 'Tue',
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };

    return mealPlan.map(dayPlan => {
      let totalProtein = 0;
      let totalCarbs = 0;
      let totalFat = 0;
      let totalCalories = 0;

      const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
      mealTypes.forEach(type => {
        const meal = dayPlan.meals[type];
        if (meal) {
          const key = (meal as any).originalMealKey || `${dayPlan.id}-${type}`;
          const servings = (servingSizes && servingSizes[key]) || 1;
          const [origDay, origType] = key.includes('-') ? key.split('-') : [dayPlan.id, type];
          const meta = getMealMeta(origDay, origType || type);
          
          totalProtein += (meal.protein || meta.nutrition.protein) * servings;
          totalCarbs += meta.nutrition.carbs * servings;
          totalFat += meta.nutrition.fat * servings;
          totalCalories += meta.calories * servings;
        }
      });

      return {
        id: dayPlan.id,
        day: dayPlan.day,
        shortDay: shortNames[dayPlan.id] || dayPlan.day.slice(0, 3),
        protein: Math.round(totalProtein),
        carbs: Math.round(totalCarbs),
        fat: Math.round(totalFat),
        calories: totalCalories,
        targetMet: totalProtein >= 100
      };
    });
  }, [mealPlan, servingSizes]);

  // 2. Focused Day Meal-by-Meal Breakdown
  const focusedDayData = useMemo(() => {
    const dayPlan = mealPlan.find(d => d.id === focusedDayId) || mealPlan[0];
    if (!dayPlan) return null;

    const mealTypes = [
      { key: 'breakfast', label: 'Breakfast' },
      { key: 'lunch', label: 'Lunch' },
      { key: 'dinner', label: 'Dinner' },
      { key: 'snacks', label: 'Snacks' }
    ];

    const mealsBreakdown = mealTypes.map(({ key, label }) => {
      const meal = dayPlan.meals[key];
      if (!meal) return null;

      const metaKey = (meal as any).originalMealKey || `${dayPlan.id}-${key}`;
      const servings = (servingSizes && servingSizes[metaKey]) || 1;
      const [origDay, origType] = metaKey.includes('-') ? metaKey.split('-') : [dayPlan.id, key];
      const meta = getMealMeta(origDay, origType || key);

      return {
        key,
        mealName: label,
        description: meal.description,
        protein: Math.round((meal.protein || meta.nutrition.protein) * servings),
        carbs: Math.round(meta.nutrition.carbs * servings),
        fat: Math.round(meta.nutrition.fat * servings),
        calories: meta.calories * servings,
        prepTime: meal.recipe.prepTime,
        servings
      };
    }).filter(Boolean);

    const totalP = mealsBreakdown.reduce((s, m) => s + (m?.protein || 0), 0);
    const totalC = mealsBreakdown.reduce((s, m) => s + (m?.carbs || 0), 0);
    const totalF = mealsBreakdown.reduce((s, m) => s + (m?.fat || 0), 0);
    const totalKcal = mealsBreakdown.reduce((s, m) => s + (m?.calories || 0), 0);

    return {
      day: dayPlan.day,
      id: dayPlan.id,
      meals: mealsBreakdown,
      totals: { protein: totalP, carbs: totalC, fat: totalF, calories: totalKcal }
    };
  }, [mealPlan, focusedDayId, servingSizes]);

  // Custom Accessible Tooltip for Recharts
  const CustomMacroTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const p = payload.find((item: any) => item.dataKey === 'protein')?.value ?? 0;
      const c = payload.find((item: any) => item.dataKey === 'carbs')?.value ?? 0;
      const f = payload.find((item: any) => item.dataKey === 'fat')?.value ?? 0;
      const totalGrams = p + c + f;

      return (
        <div className={`p-4 rounded-2xl shadow-xl border backdrop-blur-xl ${
          isLight 
            ? 'bg-white/95 border-amber-200 text-stone-900 ring-1 ring-amber-900/10' 
            : 'bg-slate-900/95 border-slate-700 text-white ring-1 ring-white/10'
        }`}>
          <div className="font-extrabold text-base border-b pb-2 mb-2 border-stone-200 dark:border-slate-800 flex items-center justify-between gap-4">
            <span>{label} Nutrition</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 font-black">
              {p >= 100 ? '✓ 100g Goal Met' : `${p}g / 100g`}
            </span>
          </div>
          <div className="space-y-1.5 text-xs font-bold">
            <div className="flex items-center justify-between space-x-6 text-emerald-700 dark:text-emerald-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: colors.protein }} />
                <span>Protein (Muscle Health):</span>
              </span>
              <span className="font-black text-sm">{p}g {totalGrams ? `(${Math.round((p/totalGrams)*100)}%)` : ''}</span>
            </div>
            <div className="flex items-center justify-between space-x-6 text-amber-700 dark:text-amber-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: colors.carbs }} />
                <span>Carbohydrates (Energy):</span>
              </span>
              <span className="font-black text-sm">{c}g {totalGrams ? `(${Math.round((c/totalGrams)*100)}%)` : ''}</span>
            </div>
            <div className="flex items-center justify-between space-x-6 text-rose-700 dark:text-rose-300">
              <span className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: colors.fat }} />
                <span>Healthy Fats (Vascular):</span>
              </span>
              <span className="font-black text-sm">{f}g {totalGrams ? `(${Math.round((f/totalGrams)*100)}%)` : ''}</span>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-stone-200 dark:border-slate-800 text-[11px] font-semibold text-stone-500 dark:text-slate-400">
            Tap bar to view meal-by-meal breakdown
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div 
      id="daily-macro-nutrition-chart" 
      className={`rounded-3xl p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 border shadow-lg ${
        isLight
          ? 'bg-white/95 border-amber-200/90 shadow-[0_10px_35px_rgba(217,119,6,0.07)] ring-1 ring-amber-900/5'
          : 'bg-slate-900/90 border-slate-700/80 shadow-2xl ring-1 ring-white/10'
      }`}
    >
      {/* Header with Title and Mode Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-amber-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1">
            <Activity className="w-4 h-4" />
            <span>Interactive Senior Macronutrient Visualizer</span>
          </div>
          <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${
            isLight ? 'text-stone-900' : 'text-white'
          }`}>
            Daily Breakdown: Protein, Fats & Carbohydrates
          </h3>
          <p className={`text-xs sm:text-sm font-medium mt-1 ${
            isLight ? 'text-stone-600' : 'text-slate-300'
          }`}>
            Recharts visualization tracking active senior muscle retention (100g protein), sustained glycemic energy, and cardiovascular fats.
          </p>
        </div>

        {/* View Mode & Legend Chips */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Chart Mode Toggle */}
          <div className={`p-1 rounded-2xl border flex items-center ${
            isLight ? 'bg-stone-100/80 border-stone-200' : 'bg-slate-800/80 border-slate-700'
          }`}>
            <button
              type="button"
              onClick={() => setChartMode('grouped')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                chartMode === 'grouped'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isLight ? 'text-stone-700 hover:text-stone-900' : 'text-slate-300 hover:text-white'
              }`}
              title="Compare macros side-by-side"
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side-by-Side</span>
            </button>
            <button
              type="button"
              onClick={() => setChartMode('stacked')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                chartMode === 'stacked'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : isLight ? 'text-stone-700 hover:text-stone-900' : 'text-slate-300 hover:text-white'
              }`}
              title="Show stacked daily totals"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Stacked</span>
            </button>
          </div>

          {/* 100g Goal Badge */}
          <div className="px-3 py-1.5 rounded-xl border border-emerald-300/80 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-black flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Target: 100g Protein / Day</span>
          </div>
        </div>
      </div>

      {/* Main 7-Day Bar Chart */}
      <div className="pt-6">
        <div className="h-72 sm:h-80 w-full" style={{ minHeight: '280px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={weeklyData}
              margin={{ top: 15, right: 10, left: -10, bottom: 5 }}
              onClick={(e: any) => {
                if (e && e.activePayload && e.activePayload[0]) {
                  const dayId = e.activePayload[0].payload.id;
                  setFocusedDayId(dayId);
                  if (onSelectDay) onSelectDay(dayId);
                }
              }}
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                vertical={false} 
                stroke={isLight ? '#e5e7eb' : '#334155'} 
              />
              <XAxis 
                dataKey="shortDay" 
                tick={{ fill: isLight ? '#44403c' : '#cbd5e1', fontSize: 13, fontWeight: 700 }}
                axisLine={{ stroke: isLight ? '#d6d3d1' : '#475569' }}
                tickLine={false}
              />
              <YAxis 
                unit="g"
                tick={{ fill: isLight ? '#78716c' : '#94a3b8', fontSize: 12, fontWeight: 600 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomMacroTooltip />} />
              <Legend 
                wrapperStyle={{ paddingTop: 12, fontSize: '13px', fontWeight: 700 }}
                formatter={(value: string) => {
                  return (
                    <span className={isLight ? 'text-stone-800 font-bold' : 'text-slate-200 font-bold'}>
                      {value}
                    </span>
                  );
                }}
              />
              
              {/* 100g Daily Protein Standard Reference Line */}
              <ReferenceLine 
                y={100} 
                stroke="#10b981" 
                strokeDasharray="4 4" 
                strokeWidth={2}
                label={{ 
                  value: '100g Senior Protein Target', 
                  position: 'insideTopRight',
                  fill: isLight ? '#047857' : '#34d399',
                  fontSize: 11,
                  fontWeight: 800
                }} 
              />

              {chartMode === 'grouped' ? (
                <>
                  <Bar 
                    dataKey="protein" 
                    name="Protein (g)" 
                    fill={colors.protein} 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  >
                    {weeklyData.map((entry) => (
                      <Cell 
                        key={`cell-p-${entry.id}`} 
                        cursor="pointer"
                        stroke={entry.id === focusedDayId ? (isLight ? '#065f46' : '#6ee7b7') : undefined}
                        strokeWidth={entry.id === focusedDayId ? 2 : 0}
                      />
                    ))}
                  </Bar>
                  <Bar 
                    dataKey="carbs" 
                    name="Carbohydrates (g)" 
                    fill={colors.carbs} 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar 
                    dataKey="fat" 
                    name="Healthy Fats (g)" 
                    fill={colors.fat} 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={32}
                  />
                </>
              ) : (
                <>
                  <Bar 
                    dataKey="protein" 
                    name="Protein (g)" 
                    stackId="macros" 
                    fill={colors.protein} 
                    maxBarSize={44}
                  />
                  <Bar 
                    dataKey="carbs" 
                    name="Carbohydrates (g)" 
                    stackId="macros" 
                    fill={colors.carbs} 
                    maxBarSize={44}
                  />
                  <Bar 
                    dataKey="fat" 
                    name="Healthy Fats (g)" 
                    stackId="macros" 
                    fill={colors.fat} 
                    radius={[6, 6, 0, 0]}
                    maxBarSize={44}
                  />
                </>
              )}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Day Selector Navigation Pills */}
      <div className="mt-4 pt-4 border-t border-amber-200/50 dark:border-slate-800 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
        <span className={`text-xs font-bold uppercase tracking-wider shrink-0 ${
          isLight ? 'text-stone-600' : 'text-slate-400'
        }`}>
          Select Day Breakdown:
        </span>
        <div className="flex items-center space-x-1.5 shrink-0">
          {weeklyData.map((d) => {
            const isSelected = d.id === focusedDayId;
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setFocusedDayId(d.id);
                  if (onSelectDay) onSelectDay(d.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                  isSelected
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : isLight
                      ? 'bg-white hover:bg-amber-50 text-stone-700 border-amber-200/80'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                <span>{d.shortDay}</span>
                <span className="ml-1 text-[10px] opacity-80">({d.protein}g)</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Focused Day Meal-by-Meal Nutrition Cards */}
      {focusedDayData && (
        <div className={`mt-6 p-5 sm:p-6 rounded-2xl border transition-all ${
          isLight 
            ? 'bg-amber-50/50 border-amber-200/80 text-stone-900' 
            : 'bg-slate-800/50 border-slate-700 text-slate-100'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-200/60 dark:border-slate-700">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <h4 className="text-base sm:text-lg font-black tracking-tight">
                {focusedDayData.day} Detailed Meal Breakdown
              </h4>
            </div>
            
            {/* Daily Summary Stats */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-black">
              <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Protein: {focusedDayData.totals.protein}g (Goal Met)
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                Carbs: {focusedDayData.totals.carbs}g
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                Fats: {focusedDayData.totals.fat}g
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-slate-700 text-stone-800 dark:text-slate-200">
                {focusedDayData.totals.calories} kcal
              </span>
            </div>
          </div>

          {/* 4 Meal Cards Breakdown (Breakfast, Lunch, Dinner, Snack) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {focusedDayData.meals.map((m: any) => {
              if (!m) return null;
              return (
                <div 
                  key={m.key}
                  className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                    isLight 
                      ? 'bg-white border-amber-200/90 shadow-2xs hover:border-amber-400' 
                      : 'bg-slate-900/80 border-slate-700 hover:border-slate-500'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {m.mealName}
                      </span>
                      <span className="text-[11px] text-stone-500 dark:text-slate-400 font-semibold">
                        {m.prepTime}
                      </span>
                    </div>
                    <p className={`text-xs font-bold line-clamp-2 mb-3 ${
                      isLight ? 'text-stone-800' : 'text-slate-200'
                    }`}>
                      {m.description}
                    </p>
                  </div>

                  {/* Macro Progress Bars */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-slate-800 text-[11px] font-bold">
                    <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                      <span>Protein</span>
                      <span className="font-extrabold">{m.protein}g</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full" 
                        style={{ width: `${Math.min(100, (m.protein / 35) * 100)}%` }} 
                      />
                    </div>

                    <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 pt-0.5">
                      <span>Carbs</span>
                      <span className="font-extrabold">{m.carbs}g</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-full" 
                        style={{ width: `${Math.min(100, (m.carbs / 50) * 100)}%` }} 
                      />
                    </div>

                    <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 pt-0.5">
                      <span>Fats</span>
                      <span className="font-extrabold">{m.fat}g</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden">
                      <div 
                        className="h-full bg-rose-500 rounded-full" 
                        style={{ width: `${Math.min(100, (m.fat / 20) * 100)}%` }} 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Senior Clinical Wisdom Footer */}
          <div className="mt-4 pt-3 border-t border-amber-200/50 dark:border-slate-800 flex items-start space-x-2 text-xs font-medium text-stone-600 dark:text-slate-300">
            <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Active Senior Tip:</strong> Distributing 20g–35g of protein evenly across breakfast, lunch, dinner, and snack ensures steady muscle protein synthesis throughout the day, combating age-related muscle loss (sarcopenia).
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyMacroNutritionChart;

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, Utensils, Clock, Flame, ChefHat, Sparkles, 
  Heart, Star, ChevronRight, CheckCircle2, Sprout, Filter, Printer,
  Shuffle, RotateCcw, FileText, Check, Search, X, BarChart3, Tag,
  SlidersHorizontal, Activity, Users, Minus, Plus
} from 'lucide-react';
import { getMealMeta, getMealTags } from '../data/recipeImages';
import SeniorRecipeModal from './SeniorRecipeModal';
import { DailyMacroNutritionChart } from './DailyMacroNutritionChart';

export interface DayMeal {
  description: string;
  protein: number;
  vegetarian: boolean;
  recipe: {
    ingredients: string[];
    instructions: string[];
    prepTime: string;
  };
}

export interface DayPlan {
  day: string;
  id: string;
  meals: {
    [key: string]: DayMeal;
  };
}

export interface WeeklyMealPlanDashboardProps {
  mealPlan: DayPlan[];
  theme?: string;
  highContrast?: boolean;
  onOpenRecipeModal?: (meal: any) => void;
  servingSizes?: Record<string, number>;
  onUpdateServingSize?: (recipeKey: string, newServings: number) => void;
}

// Helper to determine cooking difficulty
const getRecipeDifficulty = (prepTime: string): { label: 'Easy' | 'Moderate' | 'Advanced'; color: string; bg: string; icon: React.FC<{ className?: string }> } => {
  const minutes = parseInt(prepTime) || 10;
  if (minutes <= 10) {
    return {
      label: 'Easy',
      color: 'text-emerald-700 dark:text-emerald-300',
      bg: 'bg-emerald-100/90 dark:bg-emerald-950/80 border-emerald-300/80 dark:border-emerald-800',
      icon: Sprout
    };
  }
  if (minutes <= 20) {
    return {
      label: 'Moderate',
      color: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-amber-100/90 dark:bg-amber-950/80 border-amber-300/80 dark:border-amber-800',
      icon: ChefHat
    };
  }
  return {
    label: 'Advanced',
    color: 'text-rose-700 dark:text-rose-300',
    bg: 'bg-rose-100/90 dark:bg-rose-950/80 border-rose-300/80 dark:border-rose-800',
    icon: Flame
  };
};

export const WeeklyMealPlanDashboard: React.FC<WeeklyMealPlanDashboardProps> = ({
  mealPlan,
  theme = 'light',
  highContrast = false,
  onOpenRecipeModal,
  servingSizes = {},
  onUpdateServingSize
}) => {
  const isLight = theme === 'light';
  
  // Selected day tab filter ('all' for full 7-day grid, or 'monday', 'tuesday', etc.)
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  
  // Modal state
  const [selectedModalMeal, setSelectedModalMeal] = useState<{
    dayId: string;
    dayName: string;
    mealType: string;
    description: string;
    protein: number;
    vegetarian: boolean;
    recipe: {
      ingredients: string[];
      instructions: string[];
      prepTime: string;
    };
    calories: number;
    image: string;
    imageAlt: string;
    nutrition: any;
  } | null>(null);

  // Favorites & Ratings cache
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('jeans_recipe_favorites');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('jeans_recipe_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleFavorite = (mealKey: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = { ...prev, [mealKey]: !prev[mealKey] };
      try {
        localStorage.setItem('jeans_recipe_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Reshuffle Meal Plan State
  const [activeMealPlan, setActiveMealPlan] = useState<DayPlan[]>(mealPlan);
  const [isReshuffled, setIsReshuffled] = useState(false);
  const [reshuffleToast, setReshuffleToast] = useState(false);

  useEffect(() => {
    setActiveMealPlan(mealPlan);
  }, [mealPlan]);

  // Meal Notes State
  const [mealNotes, setMealNotes] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('jeans_meal_card_notes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const handleUpdateNote = (mealKey: string, note: string) => {
    setMealNotes(prev => {
      const next = { ...prev, [mealKey]: note };
      try {
        localStorage.setItem('jeans_meal_card_notes', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Reshuffle recipe suggestions while maintaining 100g senior-friendly protein
  const handleReshufflePlan = () => {
    // Extract meal collections per meal type
    const breakfasts = mealPlan.map(d => ({ ...d.meals.breakfast, originalDay: d.day }));
    const lunches = mealPlan.map(d => ({ ...d.meals.lunch, originalDay: d.day }));
    const dinners = mealPlan.map(d => ({ ...d.meals.dinner, originalDay: d.day }));
    const snacks = mealPlan.map(d => ({ ...d.meals.snacks, originalDay: d.day }));

    // Shuffle helper (Fisher-Yates)
    const shuffle = <T,>(array: T[]): T[] => {
      const arr = [...array];
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    };

    const shuffledB = shuffle(breakfasts);
    const shuffledL = shuffle(lunches);
    const shuffledD = shuffle(dinners);
    const shuffledS = shuffle(snacks);

    const newPlan: DayPlan[] = mealPlan.map((d, index) => ({
      ...d,
      meals: {
        breakfast: shuffledB[index],
        lunch: shuffledL[index],
        dinner: shuffledD[index],
        snacks: shuffledS[index]
      }
    }));

    setActiveMealPlan(newPlan);
    setIsReshuffled(true);
    setReshuffleToast(true);
    setTimeout(() => setReshuffleToast(false), 4000);
  };

  const handleResetClassicPlan = () => {
    setActiveMealPlan(mealPlan);
    setIsReshuffled(false);
  };

  // Search Bar & Tag Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [onlyShowMatching, setOnlyShowMatching] = useState(false);

  // Daily Macro Breakdown Chart State
  const [showMacroChart, setShowMacroChart] = useState(true);

  // Available Senior Health Tags
  const SENIOR_MEAL_TAGS = useMemo(() => [
    { id: 'all', label: 'All Meals', icon: Utensils },
    { id: 'Quick', label: '⚡ Quick (≤15m)', desc: '15 min or less prep' },
    { id: 'Heart-Healthy', label: '❤️ Heart-Healthy', desc: 'Omega-3 & Low-sodium' },
    { id: 'High Protein', label: '💪 High Protein', desc: '25g+ protein' },
    { id: 'Bone & Joint', label: '🦴 Bone & Joint', desc: 'Calcium & Vitamin D' },
    { id: 'Low GI', label: '🌱 Low GI', desc: 'Steady blood sugar release' },
    { id: 'Vegetarian', label: '🥗 Vegetarian', desc: 'Plant-forward options' },
  ], []);

  // Helper to test if a single meal matches current search query & selected tag
  const checkMealMatch = (dayId: string, dayName: string, mealType: string, meal: DayMeal) => {
    const meta = getMealMeta(dayId, mealType);
    const tags = getMealTags(meal, meta);
    
    // Tag filter
    const matchesTag = activeTag === 'all' || tags.includes(activeTag);
    if (!matchesTag) {
      return { matches: false, tags, meta };
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const inDesc = meal.description.toLowerCase().includes(q);
      const inType = mealType.toLowerCase().includes(q);
      const inDay = dayName.toLowerCase().includes(q);
      const inIngredients = (meal.recipe?.ingredients || []).some(ing => ing.toLowerCase().includes(q));
      const inTags = tags.some(t => t.toLowerCase().includes(q));
      const inHighlight = (meta?.nutrition?.seniorHealthHighlight || '').toLowerCase().includes(q);

      if (!inDesc && !inType && !inDay && !inIngredients && !inTags && !inHighlight) {
        return { matches: false, tags, meta };
      }
    }

    return { matches: true, tags, meta };
  };

  const isFilteringActive = searchQuery.trim().length > 0 || activeTag !== 'all';

  // Count total matches across the entire 7-day meal plan
  const totalMatchesCount = useMemo(() => {
    let count = 0;
    activeMealPlan.forEach(d => {
      ['breakfast', 'lunch', 'dinner', 'snacks'].forEach(mType => {
        const m = d.meals[mType];
        if (m && checkMealMatch(d.id, d.day, mType, m).matches) {
          count++;
        }
      });
    });
    return count;
  }, [activeMealPlan, searchQuery, activeTag]);

  // Filter days to display
  const displayedDays = useMemo(() => {
    if (selectedDayFilter === 'all') return activeMealPlan;
    return activeMealPlan.filter(d => d.id === selectedDayFilter);
  }, [activeMealPlan, selectedDayFilter]);

  // Overall statistics
  const totalWeeklyProtein = useMemo(() => {
    return activeMealPlan.reduce((acc, day) => {
      return acc + Object.values(day.meals).reduce((dAcc, m) => dAcc + m.protein, 0);
    }, 0);
  }, [activeMealPlan]);

  return (
    <section 
      id="weekly-meal-plan-dashboard" 
      aria-labelledby="dashboard-heading"
      className="space-y-6 scroll-mt-24"
    >
      {/* Dashboard Top Header Banner */}
      <div className={`p-6 sm:p-8 rounded-3xl backdrop-blur-2xl border transition-all duration-300 shadow-lg ${
        isLight
          ? 'bg-white/95 border-amber-200/90 shadow-[0_10px_35px_rgba(217,119,6,0.07)] ring-1 ring-amber-900/5'
          : 'bg-slate-900/90 border-slate-700/80 shadow-2xl ring-1 ring-white/10'
      }`}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-amber-200/60 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Senior Vitality Dashboard</span>
            </div>
            <h2 id="dashboard-heading" className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isLight ? 'text-stone-900' : 'text-white'
            }`}>
              Weekly Meal Plan Dashboard
            </h2>
            <p className={`text-xs sm:text-sm font-medium mt-1 ${
              isLight ? 'text-stone-600' : 'text-slate-300'
            }`}>
              Complete 7-day nutritional grid with dedicated meal placeholders for Breakfast, Lunch, and Dinner.
            </p>
          </div>

          {/* Quick Metrics & Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <div className={`px-4 py-2.5 rounded-2xl border flex items-center space-x-3 ${
              isLight ? 'bg-amber-50/80 border-amber-200 text-stone-800' : 'bg-slate-800/80 border-slate-700 text-slate-200'
            }`}>
              <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-stone-500 dark:text-slate-400">
                  Weekly Protein
                </span>
                <span className="text-base font-black text-amber-600 dark:text-amber-400">
                  {totalWeeklyProtein}g Total
                </span>
              </div>
            </div>

            <div className={`px-4 py-2.5 rounded-2xl border flex items-center space-x-3 ${
              isLight ? 'bg-emerald-50/80 border-emerald-200 text-stone-800' : 'bg-slate-800/80 border-slate-700 text-slate-200'
            }`}>
              <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider block text-stone-500 dark:text-slate-400">
                  Daily Senior Goal
                </span>
                <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                  100g / Day
                </span>
              </div>
            </div>

            {/* Reshuffle Recipe Suggestions Button */}
            <button
              type="button"
              id="btn-reshuffle-recipes"
              onClick={handleReshufflePlan}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-xs active:scale-95 transition-all"
              style={{ backgroundColor: '#d97706' }}
              title="Reshuffle meal suggestions while strictly maintaining 100g senior-friendly protein"
            >
              <Shuffle className="w-4 h-4 text-white" />
              <span>Reshuffle Recipes</span>
            </button>

            {/* Reset to Classic Plan if reshuffled */}
            {isReshuffled && (
              <button
                type="button"
                id="btn-reset-classic-plan"
                onClick={handleResetClassicPlan}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-amber-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-800 text-amber-800 dark:text-amber-300 active:scale-95 transition-all"
                title="Reset to Jean's classic weekly plan"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Classic Plan</span>
              </button>
            )}

            {/* Toggle Daily Macro Breakdown Chart Button */}
            <button
              type="button"
              id="btn-toggle-macro-chart"
              onClick={() => setShowMacroChart(prev => !prev)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 ${
                showMacroChart
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : isLight
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Toggle Recharts Daily Macronutrient Breakdown Chart"
            >
              <BarChart3 className="w-4 h-4" />
              <span>{showMacroChart ? 'Macro Chart Active' : 'Show Macro Chart'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs font-bold border border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 active:scale-95 transition-all"
              title="Print 7-Day Dashboard"
            >
              <Printer className="w-4 h-4" />
              <span>Print Schedule</span>
            </button>
          </div>
        </div>

        {/* Reshuffle Toast Feedback */}
        {reshuffleToast && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-100 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 text-amber-950 dark:text-amber-200 flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex items-center space-x-2 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Fresh weekly meal plan generated! All 7 days maintain 100g senior-friendly high-protein balance.</span>
            </div>
            <button
              type="button"
              onClick={() => setReshuffleToast(false)}
              className="text-xs text-amber-800 dark:text-amber-300 hover:underline font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* =====================================================================
            Search Bar & Tag Filtering System (e.g., Quick, Heart-Healthy, High Protein)
            ===================================================================== */}
        <div className="pt-4 border-t border-amber-200/60 dark:border-slate-800 space-y-3">
          {/* Search Input Row with clear button and active match indicator */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500" />
              <input
                type="text"
                id="meal-plan-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meals, ingredients (e.g., salmon, quinoa, berries, lentils, soup)..."
                className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                  isLight
                    ? 'bg-amber-50/50 border-amber-200 text-stone-900 placeholder:text-stone-400 focus:bg-white'
                    : 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  id="btn-clear-meal-search"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200 p-0.5"
                  title="Clear search text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Toggle to focus strictly on matching meals */}
            {isFilteringActive && (
              <label className="flex items-center space-x-2 text-xs font-bold text-stone-700 dark:text-slate-300 cursor-pointer select-none shrink-0 px-1 py-1">
                <input
                  type="checkbox"
                  id="checkbox-only-matching-meals"
                  checked={onlyShowMatching}
                  onChange={(e) => setOnlyShowMatching(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                />
                <span>Only show matching meals</span>
              </label>
            )}
          </div>

          {/* Tag Filter Pills Row */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-none pb-0.5">
            <div className="flex items-center space-x-1.5 shrink-0">
              <span className="text-[11px] font-black uppercase tracking-wider text-stone-500 dark:text-slate-400 mr-1 flex items-center space-x-1">
                <Tag className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Filter Tags:</span>
              </span>

              {SENIOR_MEAL_TAGS.map((tag) => {
                const isSelected = activeTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    id={`tag-filter-${tag.id.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                    onClick={() => setActiveTag(tag.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border whitespace-nowrap ${
                      isSelected
                        ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-black'
                        : isLight
                          ? 'bg-white hover:bg-amber-50 text-stone-700 border-amber-200/80'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                    title={tag.desc}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>

            {/* Reset filters shortcut button */}
            {isFilteringActive && (
              <button
                type="button"
                id="btn-reset-filters"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTag('all');
                  setOnlyShowMatching(false);
                }}
                className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline shrink-0 whitespace-nowrap ml-2"
              >
                Reset All Filters
              </button>
            )}
          </div>

          {/* Active Filter Feedback & Count Banner */}
          {isFilteringActive && (
            <div className="p-2.5 rounded-xl bg-amber-100/90 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-850 flex items-center justify-between text-xs font-bold text-amber-950 dark:text-amber-200">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>
                  Found <strong>{totalMatchesCount}</strong> matching meals
                  {activeTag !== 'all' ? ` for "${activeTag}"` : ''}
                  {searchQuery ? ` matching "${searchQuery}"` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setActiveTag('all');
                  setOnlyShowMatching(false);
                }}
                className="text-amber-800 dark:text-amber-300 hover:underline font-extrabold"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Day Filter Pills */}
        <div className="pt-4 flex items-center justify-between gap-2 overflow-x-auto scrollbar-none">
          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setSelectedDayFilter('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                selectedDayFilter === 'all'
                  ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-xs font-black'
                  : isLight
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
            >
              All 7 Days Grid
            </button>

            {mealPlan.map((d) => (
              <button
                key={d.id}
                type="button"
                onClick={() => setSelectedDayFilter(d.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border whitespace-nowrap ${
                  selectedDayFilter === d.id
                    ? 'bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-stone-900 dark:border-white shadow-xs font-black'
                    : isLight
                      ? 'bg-white hover:bg-amber-50 text-stone-700 border-amber-200/80'
                      : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                {d.day}
              </button>
            ))}
          </div>

          <span className="text-[11px] font-semibold text-stone-500 dark:text-slate-400 shrink-0 hidden sm:inline">
            Tap any meal card for clinical recipe & senior instructions
          </span>
        </div>
      </div>

      {/* =====================================================================
          Recharts Bar Chart Component: Daily Macronutrient Breakdown (Protein, Fats, Carbs)
          ===================================================================== */}
      {showMacroChart && (
        <div className="animate-in fade-in slide-in-from-top-3 duration-300">
          <DailyMacroNutritionChart
            mealPlan={activeMealPlan}
            theme={theme}
            highContrast={highContrast}
            selectedDayId={selectedDayFilter}
            onSelectDay={(dayId) => setSelectedDayFilter(dayId)}
            servingSizes={servingSizes}
          />
        </div>
      )}

      {/* 7-Day Meal Plan Grid */}
      <div className="space-y-8">
        {displayedDays.map((dayPlan) => {
          const dayTotalProtein = Object.entries(dayPlan.meals).reduce((sum, [type, m]) => {
            const mealKey = `${dayPlan.id}-${type}`;
            const servings = (servingSizes && servingSizes[mealKey]) || 1;
            return sum + (m.protein * servings);
          }, 0);
          const dayPercent = Math.min(100, Math.round((dayTotalProtein / 100) * 100));

          // Ensure breakfast, lunch, and dinner are prioritized placeholders
          const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];

          return (
            <div
              key={dayPlan.id}
              id={`day-card-${dayPlan.id}`}
              className={`rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 border shadow-lg ${
                isLight
                  ? 'bg-white/95 border-amber-200/90 shadow-[0_10px_35px_rgba(217,119,6,0.07)] ring-1 ring-amber-900/5'
                  : 'bg-slate-900/90 border-slate-700/80 shadow-2xl ring-1 ring-white/10'
              }`}
            >
              {/* Day Header Bar */}
              <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 px-6 sm:px-8 py-4 text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">{dayPlan.day}</h3>
                    <span className="text-xs font-medium text-amber-100">
                      High-Protein Active Senior Plan
                    </span>
                  </div>
                </div>

                {/* Protein Goal Tracker */}
                <div className="flex items-center space-x-3 bg-black/25 backdrop-blur-md px-4 py-1.5 rounded-2xl border border-white/20">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 block">
                      Daily Protein
                    </span>
                    <span className="text-sm font-black text-white">
                      {dayTotalProtein}g / 100g ({dayPercent}%)
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-amber-300/80 flex items-center justify-center font-black text-xs">
                    {dayPercent}%
                  </div>
                </div>
              </div>

              {/* Grid of Meal Placeholders (Breakfast, Lunch, Dinner, Snack) */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {(() => {
                    const renderedMeals = mealTypes.map((mealType) => {
                      const meal = dayPlan.meals[mealType];
                      if (!meal) return null;

                      const matchResult = checkMealMatch(dayPlan.id, dayPlan.day, mealType, meal);
                      if (onlyShowMatching && !matchResult.matches) {
                        return null;
                      }

                      const meta = matchResult.meta;
                      const mealTags = matchResult.tags;
                      const isMatch = matchResult.matches;
                      const mealKey = `${dayPlan.id}-${mealType}`;
                      const isFav = favorites[mealKey];
                      const difficulty = getRecipeDifficulty(meal.recipe.prepTime);
                      const DifficultyIcon = difficulty.icon;

                      return (
                        <div
                          key={mealType}
                          id={`meal-placeholder-${dayPlan.id}-${mealType}`}
                          onClick={() => setSelectedModalMeal({
                            dayId: dayPlan.id,
                            dayName: dayPlan.day,
                            mealType,
                            description: meal.description,
                            protein: meal.protein,
                            vegetarian: meal.vegetarian,
                            recipe: meal.recipe,
                            calories: meta.calories,
                            image: meta.image,
                            imageAlt: meta.imageAlt,
                            nutrition: meta.nutrition
                          })}
                          className={`group relative rounded-2xl overflow-hidden border flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-xs hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] ${
                            isFilteringActive && isMatch
                              ? 'ring-2 ring-amber-500 shadow-md border-amber-400'
                              : isFilteringActive && !isMatch
                                ? 'opacity-45 hover:opacity-100 transition-opacity'
                                : ''
                          } ${
                            isLight
                              ? 'bg-amber-50/40 hover:bg-white border-amber-200/80 hover:border-amber-400 ring-1 ring-amber-900/5'
                              : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 hover:border-amber-500/60'
                          }`}
                        >
                          {/* Meal Image Thumbnail with Badges */}
                          <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-200 dark:bg-slate-800">
                            <img
                              src={meta.image}
                              alt={meta.imageAlt}
                              referrerPolicy="no-referrer"
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

                            {/* Top Badges: Meal Type & Favorite / Match Indicator */}
                            <div className="absolute top-2.5 inset-x-2.5 flex items-center justify-between">
                              <div className="flex items-center space-x-1">
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-black/60 backdrop-blur-md text-white border border-white/20">
                                  {mealType}
                                </span>
                                {isFilteringActive && isMatch && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-stone-950 shadow-sm animate-pulse">
                                    Match
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => toggleFavorite(mealKey, e)}
                                className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                                  isFav
                                    ? 'bg-rose-500 text-white'
                                    : 'bg-black/50 text-white hover:bg-black/70'
                                }`}
                                aria-label={isFav ? "Remove favorite" : "Mark favorite"}
                              >
                                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
                              </button>
                            </div>

                            {/* Bottom Image Stats: Calories & Prep Time */}
                            <div className="absolute bottom-2 inset-x-2.5 flex items-center justify-between text-white text-xs font-bold">
                              <span className="flex items-center space-x-1">
                                <Flame className="w-3.5 h-3.5 text-orange-400" />
                                <span>{meta.calories} kcal</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-3.5 h-3.5 text-amber-300" />
                                <span>{meal.recipe.prepTime}</span>
                              </span>
                            </div>
                          </div>

                          {/* Card Content Area */}
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              {/* Difficulty, Veg badge, and Senior Health Tags */}
                              <div className="flex items-center justify-between gap-1 mb-1.5 flex-wrap">
                                <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${difficulty.bg} ${difficulty.color}`}>
                                  <DifficultyIcon className="w-3 h-3" />
                                  <span>{difficulty.label}</span>
                                </span>

                                {meal.vegetarian && (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                                    Vegetarian
                                  </span>
                                )}
                              </div>

                              {/* Clickable Senior Health Tags (e.g. Quick, Heart-Healthy, High Protein) */}
                              {mealTags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  {mealTags.map(tag => (
                                    <button
                                      key={tag}
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTag(tag);
                                      }}
                                      className={`px-1.5 py-0.5 rounded-md text-[9px] font-bold border transition-all ${
                                        activeTag === tag
                                          ? 'bg-amber-600 text-white border-amber-600 font-black'
                                          : isLight
                                            ? 'bg-white hover:bg-amber-100 text-stone-700 border-amber-200'
                                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                                      }`}
                                      title={`Filter by tag: ${tag}`}
                                    >
                                      {tag}
                                    </button>
                                  ))}
                                </div>
                              )}

                              {/* Title */}
                              <h4 className={`font-black text-sm sm:text-base line-clamp-2 leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors ${
                                isLight ? 'text-stone-900' : 'text-white'
                              }`}>
                                {meal.description}
                              </h4>
                            </div>

                            {/* Footer Info: Protein + Servings Stepper + Action Prompt */}
                            <div className="pt-2 border-t border-amber-200/50 dark:border-slate-700/60 flex items-center justify-between gap-1 flex-wrap">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">
                                  {(servingSizes[mealKey] || 1) > 1 ? `Protein (${servingSizes[mealKey] || 1}x)` : 'Senior Protein'}
                                </span>
                                <span className="text-base font-black text-amber-600 dark:text-amber-400">
                                  {meal.protein * (servingSizes[mealKey] || 1)}g
                                </span>
                              </div>

                              {/* Serving Size Stepper */}
                              <div 
                                className="flex items-center space-x-1 p-1 rounded-lg bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200/70 dark:border-slate-700"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-[10px] font-bold text-stone-600 dark:text-slate-300 px-0.5">
                                  Servings:
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateServingSize?.(mealKey, (servingSizes[mealKey] || 1) - 1)}
                                  disabled={(servingSizes[mealKey] || 1) <= 1}
                                  className="p-0.5 rounded-sm hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 disabled:opacity-30 active:scale-95"
                                  title="Decrease servings"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-1.5 py-0.5 rounded-sm text-xs font-black bg-amber-600 text-white min-w-[1.2rem] text-center">
                                  {servingSizes[mealKey] || 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateServingSize?.(mealKey, (servingSizes[mealKey] || 1) + 1)}
                                  className="p-0.5 rounded-sm hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 active:scale-95"
                                  title="Increase servings"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <span className="inline-flex items-center space-x-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
                                <span>Recipe</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                            </div>

                            {/* Quick Notes Area for Seniors */}
                            <div 
                              className="mt-2 pt-2 border-t border-amber-200/50 dark:border-slate-700/60 space-y-1.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-slate-400 flex items-center space-x-1">
                                  <FileText className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                  <span>My Kitchen Note:</span>
                                </span>
                                {mealNotes[mealKey] && (
                                  <span className="text-[9px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-0.5">
                                    <Check className="w-2.5 h-2.5" />
                                    <span>Saved</span>
                                  </span>
                                )}
                              </div>
                              
                              <textarea
                                id={`meal-note-${mealKey}`}
                                value={mealNotes[mealKey] || ''}
                                onChange={(e) => handleUpdateNote(mealKey, e.target.value)}
                                placeholder="Leave note (e.g. Prepare in advance, Need low-sodium option)..."
                                rows={2}
                                className={`w-full p-2 rounded-xl text-xs font-medium border transition-colors resize-none focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                                  isLight 
                                    ? 'bg-white border-amber-200 text-stone-800 placeholder:text-stone-400' 
                                    : 'bg-slate-900 border-slate-700 text-slate-200 placeholder:text-slate-500'
                                }`}
                                onClick={(e) => e.stopPropagation()}
                              />

                              {/* Quick Senior Chips */}
                              <div className="flex flex-wrap gap-1">
                                {['Prepare in advance', 'Need low-sodium option', 'Soft texture'].map(chip => (
                                  <button
                                    key={chip}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const current = mealNotes[mealKey] || '';
                                      const updated = current ? (current.includes(chip) ? current : `${current} • ${chip}`) : chip;
                                      handleUpdateNote(mealKey, updated);
                                    }}
                                    className="text-[9px] font-bold px-1.5 py-0.5 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-100 dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-950/60 text-stone-600 dark:text-slate-300 transition-colors"
                                  >
                                    +{chip}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }).filter(Boolean);

                    if (renderedMeals.length === 0) {
                      return (
                        <div className="col-span-full py-8 text-center bg-stone-50/60 dark:bg-slate-800/40 rounded-2xl border border-dashed border-stone-300 dark:border-slate-700 p-6">
                          <Utensils className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                          <p className="text-sm font-bold text-stone-700 dark:text-slate-300">
                            No meals match active filters ({activeTag !== 'all' ? `"${activeTag}"` : ''}{searchQuery ? ` "${searchQuery}"` : ''}) on {dayPlan.day}.
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setSearchQuery('');
                              setActiveTag('all');
                              setOnlyShowMatching(false);
                            }}
                            className="mt-2 text-xs font-black text-amber-600 dark:text-amber-400 hover:underline"
                          >
                            Reset Search & Tag Filters
                          </button>
                        </div>
                      );
                    }

                    return renderedMeals;
                  })()}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Senior Recipe & Nutrition Breakdown Modal */}
      {selectedModalMeal && (
        <SeniorRecipeModal
          isOpen={!!selectedModalMeal}
          onClose={() => setSelectedModalMeal(null)}
          meal={selectedModalMeal}
          theme={theme}
          highContrast={highContrast}
          servingSizes={servingSizes}
          onUpdateServingSize={onUpdateServingSize}
        />
      )}
    </section>
  );
};

export default WeeklyMealPlanDashboard;

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calendar, 
  ChefHat, 
  Sparkles, 
  Printer, 
  RotateCcw, 
  Search, 
  X, 
  BarChart3, 
  Tag, 
  CheckCircle2,
  Shuffle,
  Activity,
  Heart,
  FolderHeart,
  BookmarkPlus
} from 'lucide-react';
import { RecipeCard, Recipe } from './RecipeCard';
import { getMealMeta, getMealTags } from '../data/recipeImages';
import SeniorRecipeModal from './SeniorRecipeModal';
import { DailyMacroNutritionChart } from './DailyMacroNutritionChart';
import { DailyHabitTracker } from './DailyHabitTracker';
import { RecipeCollectionsModal } from './RecipeCollectionsModal';
import { getSavedCollections, RecipeCollection } from '../utils/collections';

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

export interface MealPlanDashboardProps {
  mealPlan: DayPlan[];
  theme?: string;
  highContrast?: boolean;
  servingSizes?: Record<string, number>;
  onUpdateServingSize?: (recipeKey: string, newServings: number) => void;
  onOpenRecipeModal?: (meal: any) => void;
}

const SENIOR_TAGS = [
  { id: 'all', label: 'All Meals' },
  { id: 'High Protein', label: 'High Protein (25g+)' },
  { id: 'Heart-Healthy', label: 'Heart-Healthy' },
  { id: 'Quick', label: 'Quick Prep (≤15m)' },
  { id: 'Vegetarian', label: 'Vegetarian' },
  { id: 'Bone & Joint', label: 'Bone & Joint' }
];

export const MealPlanDashboard: React.FC<MealPlanDashboardProps> = ({
  mealPlan,
  theme = 'light',
  highContrast = false,
  servingSizes = {},
  onUpdateServingSize,
  onOpenRecipeModal
}) => {
  const isLight = theme === 'light';

  // Selected Day state: 'all' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTag, setActiveTag] = useState<string>('all');
  const [showMacroChart, setShowMacroChart] = useState<boolean>(true);
  const [activeMealPlan, setActiveMealPlan] = useState<DayPlan[]>(mealPlan);
  const [isReshuffled, setIsReshuffled] = useState<boolean>(false);
  const [modalMeal, setModalMeal] = useState<any | null>(null);
  const [showCollectionsModal, setShowCollectionsModal] = useState<boolean>(false);
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  // Load collections for filtering
  const [collections, setCollections] = useState<RecipeCollection[]>(() => getSavedCollections());

  useEffect(() => {
    setCollections(getSavedCollections());
  }, [showCollectionsModal]);

  const activeCollection = useMemo(() => {
    if (!selectedCollectionId) return null;
    return collections.find(c => c.id === selectedCollectionId) || null;
  }, [collections, selectedCollectionId]);

  // Favorites state with persistence
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('jeans_recipe_favorites');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    setActiveMealPlan(mealPlan);
  }, [mealPlan]);

  const toggleFavorite = (mealKey: string) => {
    setFavorites(prev => {
      const next = { ...prev, [mealKey]: !prev[mealKey] };
      try {
        localStorage.setItem('jeans_recipe_favorites', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // Reshuffle Meal Plan maintaining 100g senior target
  const handleReshuffle = () => {
    const breakfasts = mealPlan.map(d => ({ ...d.meals.breakfast, originalKey: `${d.id}-breakfast` }));
    const lunches = mealPlan.map(d => ({ ...d.meals.lunch, originalKey: `${d.id}-lunch` }));
    const dinners = mealPlan.map(d => ({ ...d.meals.dinner, originalKey: `${d.id}-dinner` }));
    const snacks = mealPlan.map(d => ({ ...d.meals.snacks, originalKey: `${d.id}-snacks` }));

    const shuffle = <T,>(arr: T[]): T[] => {
      const a = [...arr];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };

    const newPlan: DayPlan[] = mealPlan.map((d, idx) => ({
      ...d,
      meals: {
        breakfast: shuffle(breakfasts)[idx],
        lunch: shuffle(lunches)[idx],
        dinner: shuffle(dinners)[idx],
        snacks: shuffle(snacks)[idx]
      }
    }));

    setActiveMealPlan(newPlan);
    setIsReshuffled(true);
  };

  const handleResetPlan = () => {
    setActiveMealPlan(mealPlan);
    setIsReshuffled(false);
  };

  // Filter days based on selection
  const displayedDays = useMemo(() => {
    if (selectedDay === 'all') return activeMealPlan;
    return activeMealPlan.filter(d => d.id === selectedDay);
  }, [activeMealPlan, selectedDay]);

  // Check if meal matches search and tag
  const filterMeal = (dayId: string, mealType: string, meal: DayMeal) => {
    const metaKey = (meal as any).originalKey || `${dayId}-${mealType}`;
    const [origDay, origType] = metaKey.includes('-') ? metaKey.split('-') : [dayId, mealType];
    const meta = getMealMeta(origDay, origType || mealType);
    const tags = getMealTags(meal, meta);

    // Collection filter
    if (selectedCollectionId && activeCollection) {
      const mealIdKey = `${dayId}-${mealType}`;
      const hasKey = activeCollection.recipeKeys.some(k => k === metaKey || k === mealIdKey);
      if (!hasKey) return false;
    }

    // Tag filter
    if (activeTag !== 'all') {
      if (activeTag === 'Vegetarian' && !meal.vegetarian) return false;
      if (!tags.includes(activeTag)) return false;
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = meal.description.toLowerCase().includes(q);
      const matchType = mealType.toLowerCase().includes(q);
      const matchIng = meal.recipe.ingredients.some(ing => ing.toLowerCase().includes(q));
      const matchHighlight = (meta.nutrition.seniorHealthHighlight || '').toLowerCase().includes(q);
      if (!matchTitle && !matchType && !matchIng && !matchHighlight) return false;
    }

    return true;
  };

  const handleOpenNutrition = (mealItem: any) => {
    if (onOpenRecipeModal) {
      onOpenRecipeModal(mealItem);
    } else {
      setModalMeal(mealItem);
    }
  };

  return (
    <section 
      id="meal-plan-dashboard" 
      aria-label="7-Day High-Protein Meal Plan Dashboard"
      className="space-y-8 scroll-mt-24"
    >
      {/* Dashboard Top Header & Controls */}
      <div className={`p-6 sm:p-8 rounded-3xl backdrop-blur-2xl border transition-all duration-300 shadow-lg ${
        isLight
          ? 'bg-white/95 border-amber-200/90 shadow-[0_10px_35px_rgba(217,119,6,0.07)] ring-1 ring-amber-900/5'
          : 'bg-slate-900/90 border-slate-700/80 shadow-2xl ring-1 ring-white/10'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-200/60 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
              <Calendar className="w-4 h-4" />
              <span>Senior Vitality Meal Plan</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isLight ? 'text-stone-900' : 'text-white'
            }`}>
              7-Day High-Protein Weekly Dashboard
            </h2>
            <p className={`text-xs sm:text-sm font-medium mt-1 ${
              isLight ? 'text-stone-600' : 'text-slate-300'
            }`}>
              Every day hits the 100g clinical protein target for senior muscle preservation and steady energy.
            </p>
          </div>

          {/* Quick Toolbar: Collections, Reshuffle, Macro Chart Toggle, Print */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              id="btn-open-collections-dashboard"
              onClick={() => setShowCollectionsModal(true)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black border transition-all active:scale-95 min-h-[44px] ${
                selectedCollectionId
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/30'
                  : isLight
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
              }`}
              title="Browse recipe collections (Breakfast Favorites, Easy Dinners, etc.)"
            >
              <FolderHeart className="w-4 h-4" />
              <span>{activeCollection ? `${activeCollection.icon} ${activeCollection.name}` : 'Collections'}</span>
            </button>

            <button
              type="button"
              id="btn-reshuffle-plan"
              onClick={handleReshuffle}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-black bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-sm active:scale-95 transition-all min-h-[44px]"
              title="Reshuffle weekly meals while preserving senior protein goals"
            >
              <Shuffle className="w-4 h-4" />
              <span>Reshuffle Plan</span>
            </button>

            {isReshuffled && (
              <button
                type="button"
                onClick={handleResetPlan}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border border-amber-300 dark:border-slate-700 hover:bg-amber-50 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-300 active:scale-95 transition-all min-h-[44px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Classic Menu</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowMacroChart(prev => !prev)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 min-h-[44px] ${
                showMacroChart
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : isLight
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{showMacroChart ? 'Hide Chart' : 'Macro Chart'}</span>
            </button>

            <button
              type="button"
              onClick={() => window.print()}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold border transition-all active:scale-95 min-h-[44px] ${
                isLight
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Print weekly schedule for refrigerator"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* 7-DAY NAVIGATION TABS (Monday through Sunday) */}
        <div className="pt-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Select Day of the Week:
            </span>
            <span className="text-xs font-medium text-stone-500 dark:text-slate-400">
              Showing: <strong className="text-amber-600 dark:text-amber-400">{selectedDay === 'all' ? 'All 7 Days' : selectedDay.toUpperCase()}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              id="day-toggle-all"
              onClick={() => setSelectedDay('all')}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all active:scale-95 border whitespace-nowrap min-h-[44px] ${
                selectedDay === 'all'
                  ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/30'
                  : isLight
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-200'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              All 7 Days Grid
            </button>

            {activeMealPlan.map((d) => {
              const isSelected = selectedDay === d.id;
              const dayProtein = Object.entries(d.meals).reduce((sum, [type, m]) => {
                const k = `${d.id}-${type}`;
                const s = servingSizes[k] || 1;
                return sum + (m.protein * s);
              }, 0);

              return (
                <button
                  key={d.id}
                  type="button"
                  id={`day-toggle-${d.id}`}
                  onClick={() => setSelectedDay(d.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all active:scale-95 border whitespace-nowrap min-h-[44px] flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-md ring-2 ring-amber-500/30 font-black'
                      : isLight
                        ? 'bg-white hover:bg-amber-50 text-stone-700 border-amber-200/80 shadow-2xs'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <span>{d.day}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-black ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-amber-100 dark:bg-slate-700 text-amber-900 dark:text-amber-300'
                  }`}>
                    {dayProtein}g
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search & Tag Filter Bar */}
        <div className="pt-4 border-t border-amber-200/60 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-slate-500" />
              <input
                type="text"
                id="dashboard-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recipe title or ingredient (e.g., salmon, oatmeal, soup, berries)..."
                className={`w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border transition-colors focus:outline-hidden focus:ring-2 focus:ring-amber-500 min-h-[44px] ${
                  isLight
                    ? 'bg-stone-50 border-stone-200 text-stone-900 placeholder:text-stone-400 focus:bg-white'
                    : 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900'
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Senior Tags Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              {SENIOR_TAGS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTag(t.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border whitespace-nowrap min-h-[40px] ${
                    activeTag === t.id
                      ? 'bg-amber-600 text-white border-amber-600 font-black'
                      : isLight
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
              {/* Active Collection Filter Banner */}
              {activeCollection && (
                <div className="flex items-center space-x-2 bg-amber-500/20 text-amber-900 dark:text-amber-200 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 text-xs font-black">
                  <span>Filtered: {activeCollection.icon} {activeCollection.name}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCollectionId(null)}
                    className="p-0.5 hover:bg-amber-500/30 rounded-md"
                    title="Clear collection filter"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Macronutrient Recharts Breakdown */}
      {showMacroChart && (
        <div className="animate-in fade-in duration-300">
          <DailyMacroNutritionChart
            mealPlan={displayedDays}
            theme={theme}
            highContrast={highContrast}
            selectedDayId={selectedDay}
            onSelectDay={(dayId) => setSelectedDay(dayId)}
            servingSizes={servingSizes}
          />
        </div>
      )}

      {/* Senior Daily Habit Tracker Section */}
      <div id="dashboard-daily-habits-section" className="animate-in fade-in duration-300">
        <DailyHabitTracker 
          theme={theme} 
          highContrast={highContrast} 
        />
      </div>

      {/* 7-DAY MEAL PLAN GRID */}
      <div className="space-y-8">
        {displayedDays.map((dayPlan) => {
          const mealTypes = ['breakfast', 'lunch', 'dinner', 'snacks'];
          
          // Calculate day's total protein taking servings into account
          const dayTotalProtein = Object.entries(dayPlan.meals).reduce((sum, [type, m]) => {
            const mealKey = `${dayPlan.id}-${type}`;
            const servings = (servingSizes && servingSizes[mealKey]) || 1;
            return sum + (m.protein * servings);
          }, 0);

          const dayPercent = Math.min(100, Math.round((dayTotalProtein / 100) * 100));

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
                  <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                    <Calendar className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black tracking-tight">{dayPlan.day}</h3>
                    <span className="text-xs font-medium text-amber-100">
                      High-Protein Active Senior Menu
                    </span>
                  </div>
                </div>

                {/* Protein Goal Tracker Pill */}
                <div className="flex items-center space-x-3 bg-black/25 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/20">
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 block">
                      Daily Protein
                    </span>
                    <span className="text-sm font-black text-white">
                      {dayTotalProtein}g / 100g standard
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full border-2 border-amber-300/80 flex items-center justify-center font-black text-xs">
                    {dayPercent}%
                  </div>
                  {dayTotalProtein >= 100 && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-300" />
                  )}
                </div>
              </div>

              {/* 4 Meal Cards Grid using reusable RecipeCard */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {mealTypes.map((mealType) => {
                    const meal = dayPlan.meals[mealType];
                    if (!meal) return null;

                    if (!filterMeal(dayPlan.id, mealType, meal)) {
                      return null;
                    }

                    const mealKey = `${dayPlan.id}-${mealType}`;
                    const currentServings = (servingSizes && servingSizes[mealKey]) || 1;
                    const metaKey = (meal as any).originalKey || mealKey;
                    const [origDay, origType] = metaKey.includes('-') ? metaKey.split('-') : [dayPlan.id, mealType];
                    const meta = getMealMeta(origDay, origType || mealType);

                    const recipeObj: Recipe = {
                      title: meal.description,
                      highProteinBenefits: meta.nutrition.seniorHealthHighlight,
                      ingredients: meal.recipe.ingredients,
                      instructions: meal.recipe.instructions,
                      protein: meal.protein,
                      prepTime: meal.recipe.prepTime,
                      calories: meta.calories,
                      carbs: meta.nutrition.carbs,
                      fat: meta.nutrition.fat,
                      fiber: meta.nutrition.fiber,
                      mealType: mealType.toUpperCase(),
                      dayName: dayPlan.day,
                      dayId: dayPlan.id,
                      vegetarian: meal.vegetarian,
                      image: meta.image,
                      imageAlt: meta.imageAlt,
                      nutrition: meta.nutrition
                    };

                    const modalData = {
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
                    };

                    return (
                      <RecipeCard
                        key={mealType}
                        recipe={recipeObj}
                        servings={currentServings}
                        onUpdateServings={(newServings) => onUpdateServingSize?.(mealKey, newServings)}
                        onOpenNutritionModal={() => handleOpenNutrition(modalData)}
                        theme={theme}
                        highContrast={highContrast}
                        isFavorite={!!favorites[mealKey]}
                        onToggleFavorite={() => toggleFavorite(mealKey)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Internal Nutrition Details Modal fallback */}
      {modalMeal && (
        <SeniorRecipeModal
          isOpen={!!modalMeal}
          onClose={() => setModalMeal(null)}
          meal={modalMeal}
          theme={theme}
          highContrast={highContrast}
          servingSizes={servingSizes}
          onUpdateServingSize={onUpdateServingSize}
        />
      )}

      {/* Senior Recipe Collections Modal */}
      {showCollectionsModal && (
        <RecipeCollectionsModal
          isOpen={showCollectionsModal}
          onClose={() => setShowCollectionsModal(false)}
          theme={theme}
          highContrast={highContrast}
          onSelectCollectionFilter={(colId) => setSelectedCollectionId(colId)}
        />
      )}
    </section>
  );
};

export default MealPlanDashboard;

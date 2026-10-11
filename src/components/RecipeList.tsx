import React, { useState, useEffect, useMemo } from 'react';
import { 
  Clock, Flame, ChefHat, Leaf, Utensils, Sparkles, ChevronDown, ChevronUp, 
  Activity, Heart, ShieldCheck, X, Droplets, Info, CheckCircle2, Apple, Scale,
  Star, Play, Pause, RotateCcw, Volume2, Bookmark, Copy, Check, Timer, Users, Minus, Plus
} from 'lucide-react';
import { getMealMeta, NutritionData } from '../data/recipeImages';
import SeniorRecipeModal from './SeniorRecipeModal';
import { scaleRecipeIngredients } from '../utils/servings';

export type RecipeDifficulty = 'easy' | 'moderate' | 'advanced';

export function getRecipeDifficulty(recipe: { prepTime: string; instructions?: string[]; ingredients?: string[] }): RecipeDifficulty {
  const prep = parseInt(recipe.prepTime) || 15;
  const steps = recipe.instructions?.length || 0;
  if (prep <= 10 && steps <= 4) return 'easy';
  if (prep <= 20) return 'moderate';
  return 'advanced';
}

export interface ActiveCookingTimer {
  recipeKey: string;
  recipeName: string;
  totalSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
}

export interface RecipeItem {
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
  calories?: number;
  image?: string;
  imageAlt?: string;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export interface RecipeListProps {
  recipes: RecipeItem[];
  theme?: string;
  onToggleRecipe?: (dayId: string, mealType: string) => void;
  expandedRecipes?: Record<string, boolean>;
  searchQuery?: string;
  title?: string;
  description?: string;
  servingSizes?: Record<string, number>;
  onUpdateServingSize?: (recipeKey: string, newServings: number) => void;
}

/**
 * RecipeList Component with Senior Nutrition Breakdown (Expandable & Modal)
 * Displays curated senior-friendly meals as individual interactive cards,
 * featuring AI meal thumbnails, calorie counts, prep-time indicators,
 * macronutrient breakdowns (protein, fiber, sugar, healthy fats), and senior vitality insights.
 */
export const RecipeList: React.FC<RecipeListProps> = ({
  recipes,
  theme = 'light',
  onToggleRecipe,
  expandedRecipes = {},
  searchQuery = '',
  title = "Jean's Vitality Recipe Collection",
  description = "Wholesome, senior-friendly meals packed with clean protein, digestive fiber, low added sugars, and bone-supporting nutrients.",
  servingSizes = {},
  onUpdateServingSize
}) => {
  const isLight = theme === 'light';
  
  // State for active modal view
  const [modalMeal, setModalMeal] = useState<{
    item: RecipeItem;
    meta: ReturnType<typeof getMealMeta>;
  } | null>(null);

  // Card active tab state: 'recipe' | 'nutrition'
  const [cardTab, setCardTab] = useState<Record<string, 'recipe' | 'nutrition'>>({});

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalMeal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Prevent background body scrolling when modal is active
  useEffect(() => {
    if (modalMeal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [modalMeal]);

  const toggleCardTab = (key: string, tab: 'recipe' | 'nutrition') => {
    setCardTab(prev => ({
      ...prev,
      [key]: tab
    }));
  };

  // 5-Star Rating state with persistence
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('jeans_recipe_ratings');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Favorites state with persistence
  const [favorites, setFavorites] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('jeans_recipe_favorites');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Step-by-step checked instructions state
  const [checkedSteps, setCheckedSteps] = useState<Record<string, boolean>>({});

  // Active cooking countdown timer state
  const [activeTimer, setActiveTimer] = useState<ActiveCookingTimer | null>(null);
  const [timerAlert, setTimerAlert] = useState<string | null>(null);

  // Copied recipe feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Day & Difficulty & Favorites filter states
  const [selectedDay, setSelectedDay] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);

  // Audio chime for when cooking timer expires
  const playTimerChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.16);
        gain.gain.setValueAtTime(0.25, now + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.16 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.16);
        osc.stop(now + idx * 0.16 + 0.4);
      });
    } catch (e) {
      console.warn('Audio chime notice:', e);
    }
  };

  // Cooking timer countdown ticker
  useEffect(() => {
    if (!activeTimer || !activeTimer.isRunning) return;

    const interval = setInterval(() => {
      setActiveTimer(prev => {
        if (!prev || !prev.isRunning) return prev;
        if (prev.remainingSeconds <= 1) {
          playTimerChime();
          setTimerAlert(`Ding! Cooking timer finished for "${prev.recipeName}". Bon appétit!`);
          return { ...prev, remainingSeconds: 0, isRunning: false };
        }
        return { ...prev, remainingSeconds: prev.remainingSeconds - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimer?.isRunning]);

  const handleRate = (key: string, star: number) => {
    setRatings(prev => {
      const updated = { ...prev, [key]: star };
      try {
        localStorage.setItem('jeans_recipe_ratings', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save rating:', e);
      }
      return updated;
    });
  };

  const handleToggleFavorite = (key: string) => {
    setFavorites(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('jeans_recipe_favorites', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save favorites:', e);
      }
      return updated;
    });
  };

  const handleStartTimer = (recipeKey: string, recipeName: string, prepTime: string) => {
    const minutes = parseInt(prepTime) || 15;
    const totalSeconds = Math.max(1, minutes) * 60;
    setActiveTimer({
      recipeKey,
      recipeName,
      totalSeconds,
      remainingSeconds: totalSeconds,
      isRunning: true
    });
    setTimerAlert(null);
  };

  const handleToggleTimerPlay = () => {
    setActiveTimer(prev => prev ? { ...prev, isRunning: !prev.isRunning } : null);
  };

  const handleResetTimer = () => {
    setActiveTimer(prev => prev ? { ...prev, remainingSeconds: prev.totalSeconds, isRunning: false } : null);
    setTimerAlert(null);
  };

  const handleAdjustTimer = (deltaSeconds: number) => {
    setActiveTimer(prev => {
      if (!prev) return null;
      const nextRemaining = Math.max(10, prev.remainingSeconds + deltaSeconds);
      return {
        ...prev,
        remainingSeconds: nextRemaining,
        totalSeconds: Math.max(prev.totalSeconds, nextRemaining)
      };
    });
  };

  const handleToggleStep = (stepKey: string) => {
    setCheckedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  const handleCopyRecipe = (item: RecipeItem) => {
    const text = `${item.description} (${item.dayName} - ${item.mealType})
Prep Time: ${item.recipe.prepTime}
Protein: ${item.protein}g

INGREDIENTS:
${item.recipe.ingredients.map(i => `• ${i}`).join('\n')}

INSTRUCTIONS:
${item.recipe.instructions.map((step, idx) => `${idx + 1}. ${step}`).join('\n')}`;

    navigator.clipboard?.writeText(text).then(() => {
      const key = `${item.dayId}-${item.mealType}`;
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2500);
    });
  };

  // Count total saved favorites
  const totalFavoritesCount = useMemo(() => {
    return Object.values(favorites).filter(Boolean).length;
  }, [favorites]);

  // Filter recipes based on selected day, difficulty, and favorites
  const displayedRecipes = useMemo(() => {
    return recipes.filter(r => {
      const key = `${r.dayId}-${r.mealType}`;
      if (selectedDay !== 'all' && r.dayId.toLowerCase() !== selectedDay.toLowerCase()) {
        return false;
      }
      if (showFavoritesOnly && !favorites[key]) {
        return false;
      }
      if (selectedDifficulty !== 'all') {
        const diff = getRecipeDifficulty(r.recipe);
        if (diff !== selectedDifficulty) return false;
      }
      return true;
    });
  }, [recipes, selectedDay, showFavoritesOnly, selectedDifficulty, favorites]);

  const daysList = [
    { id: 'all', label: 'All Days' },
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  const difficultyList = [
    { id: 'all', label: 'All Levels' },
    { id: 'easy', label: 'Easy Prep' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'advanced', label: 'Advanced' }
  ];

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div id="recipe-list-container" className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pb-2 border-b border-amber-200/60 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
            <ChefHat className="w-4 h-4" />
            <span>Recipe Gallery & Senior Nutrition</span>
          </div>
          <h3 className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isLight ? 'text-stone-900' : 'text-white'
          }`}>
            {title}
          </h3>
          <p className={`text-xs sm:text-sm font-medium mt-1 ${
            isLight ? 'text-stone-600' : 'text-slate-300'
          }`}>
            {description}
          </p>
        </div>
        
        <div className="flex items-center space-x-2 shrink-0">
          <span className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-bold border ${
            isLight 
              ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-2xs' 
              : 'bg-amber-950/80 text-amber-200 border-amber-700'
          }`}>
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>{displayedRecipes.length} of {recipes.length} Recipes</span>
          </span>
        </div>
      </div>

      {/* Filter Pills: Days, Favorites, and Difficulty Levels */}
      <div className="space-y-2.5">
        {/* Row 1: Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {daysList.map(day => {
            const isActive = selectedDay === day.id;
            return (
              <button
                key={day.id}
                onClick={() => setSelectedDay(day.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-150 ${
                  isActive
                    ? isLight
                      ? 'bg-amber-600 text-white shadow-sm ring-2 ring-amber-500/30'
                      : 'bg-amber-500 text-stone-950 shadow-md ring-2 ring-amber-400/40'
                    : isLight
                      ? 'bg-amber-100/70 hover:bg-amber-200/80 text-stone-700 hover:text-stone-900 border border-amber-200'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700'
                }`}
              >
                {day.label}
              </button>
            );
          })}
        </div>

        {/* Row 2: Difficulty Level Filter & Favorites Only Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-amber-200/40 dark:border-slate-800">
          <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
            Difficulty:
          </span>
          {difficultyList.map(diff => {
            const isActive = selectedDifficulty === diff.id;
            return (
              <button
                key={diff.id}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all duration-150 border ${
                  isActive
                    ? isLight
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : 'bg-amber-500 text-stone-950 border-amber-500 shadow-sm'
                    : isLight
                      ? 'bg-white hover:bg-amber-50 text-stone-700 border-stone-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                {diff.label}
              </button>
            );
          })}

          <div className="h-4 w-px bg-stone-300 dark:bg-slate-700 mx-1 hidden sm:block" />

          {/* Favorites Filter Toggle */}
          <button
            type="button"
            onClick={() => setShowFavoritesOnly(prev => !prev)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all border ${
              showFavoritesOnly
                ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                : isLight
                  ? 'bg-white hover:bg-rose-50 text-stone-700 border-stone-200'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${showFavoritesOnly ? 'fill-white text-white' : 'text-rose-500'}`} />
            <span>Favorites Only</span>
            {totalFavoritesCount > 0 && (
              <span className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                showFavoritesOnly ? 'bg-white text-rose-600' : 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
              }`}>
                {totalFavoritesCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Floating / Prominent Active Cooking Timer Banner */}
      {activeTimer && (
        <div className={`p-4 rounded-2xl border shadow-lg transition-all animate-in fade-in slide-in-from-top-2 ${
          isLight
            ? 'bg-amber-500/10 border-amber-400/80 text-stone-900 shadow-amber-900/5'
            : 'bg-amber-950/40 border-amber-600/60 text-white shadow-black/40'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-2xl shadow-sm ${
                activeTimer.isRunning
                  ? 'bg-amber-600 text-white animate-pulse'
                  : 'bg-stone-300 dark:bg-slate-700 text-stone-700 dark:text-slate-200'
              }`}>
                <Timer className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                    Active Kitchen Timer
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                    activeTimer.isRunning ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-stone-200 text-stone-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}>
                    {activeTimer.isRunning ? 'Running' : 'Paused'}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-black truncate max-w-md">
                  {activeTimer.recipeName}
                </h4>
              </div>
            </div>

            {/* Time Display and Timer Action Controls */}
            <div className="flex items-center space-x-3 self-end sm:self-auto">
              <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-amber-700 dark:text-amber-300 min-w-[5rem] text-right">
                {formatTime(activeTimer.remainingSeconds)}
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleToggleTimerPlay}
                  className={`p-2 rounded-xl text-white font-bold transition-all active:scale-95 shadow-xs ${
                    activeTimer.isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                  aria-label={activeTimer.isRunning ? 'Pause Timer' : 'Resume Timer'}
                  title={activeTimer.isRunning ? 'Pause Timer' : 'Resume Timer'}
                >
                  {activeTimer.isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={() => handleAdjustTimer(60)}
                  className="px-2 py-1.5 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-800 hover:bg-white border border-stone-200 dark:border-slate-700 active:scale-95"
                  title="Add 1 minute"
                >
                  +1m
                </button>

                <button
                  type="button"
                  onClick={() => handleAdjustTimer(-60)}
                  className="px-2 py-1.5 rounded-xl text-xs font-bold bg-white/80 dark:bg-slate-800 hover:bg-white border border-stone-200 dark:border-slate-700 active:scale-95"
                  title="Subtract 1 minute"
                >
                  -1m
                </button>

                <button
                  type="button"
                  onClick={handleResetTimer}
                  className="p-2 rounded-xl bg-white/80 dark:bg-slate-800 hover:bg-white border border-stone-200 dark:border-slate-700 active:scale-95 text-stone-700 dark:text-slate-300"
                  title="Reset Timer"
                  aria-label="Reset Timer"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTimer(null)}
                  className="p-2 rounded-xl bg-stone-200/80 hover:bg-stone-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-stone-700 dark:text-slate-200 active:scale-95"
                  title="Close Timer"
                  aria-label="Close Timer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-1.5 w-full bg-stone-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-amber-500 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(100, Math.max(0, ((activeTimer.totalSeconds - activeTimer.remainingSeconds) / activeTimer.totalSeconds) * 100))}%`
              }}
            />
          </div>
        </div>
      )}

      {/* Timer Finished Alert Message */}
      {timerAlert && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 animate-in zoom-in-95 duration-200 ${
          isLight ? 'bg-emerald-50 border-emerald-300 text-emerald-950 shadow-sm' : 'bg-emerald-950/80 border-emerald-700 text-emerald-100'
        }`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-emerald-500 text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-sm sm:text-base">{timerAlert}</p>
              <p className="text-xs opacity-90 font-medium">Your dish has finished its recommended cooking duration.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setTimerAlert(null)}
            className="p-1.5 rounded-lg hover:bg-emerald-200/60 dark:hover:bg-emerald-900 text-emerald-900 dark:text-emerald-100"
            aria-label="Dismiss timer notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Grid of Recipe Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayedRecipes.map((item) => {
          const key = `${item.dayId}-${item.mealType}`;
          const isExpanded = expandedRecipes[key] ?? false;
          const currentTab = cardTab[key] || 'recipe';
          const meta = getMealMeta(item.dayId, item.mealType);
          const nutrition = meta.nutrition;
          const calories = item.calories || meta.calories;
          const imageSrc = item.image || meta.image;
          const imageAlt = item.imageAlt || meta.imageAlt;

          // Prep time
          const prepMinutes = parseInt(item.recipe.prepTime) || 15;
          const isQuick = prepMinutes <= 15;
          const difficulty = getRecipeDifficulty(item.recipe);
          const rating = ratings[key] || 0;
          const isFavorite = favorites[key] || false;

          return (
            <div
              key={key}
              id={`recipe-card-${key}`}
              className={`group rounded-3xl overflow-hidden backdrop-blur-2xl transition-all duration-300 flex flex-col justify-between border shadow-md hover:shadow-xl ${
                isLight
                  ? 'bg-white/95 border-amber-200/90 shadow-[0_8px_30px_rgba(217,119,6,0.06)] hover:border-amber-400 ring-1 ring-amber-900/5'
                  : 'bg-slate-900/90 border-slate-700/80 shadow-xl hover:border-amber-500/60 ring-1 ring-white/10'
              }`}
            >
              <div>
                {/* Thumbnail Image Container with Specular Sheen & Badges */}
                <div className="relative aspect-4/3 w-full overflow-hidden bg-stone-200 dark:bg-slate-800">
                  <img
                    src={imageSrc}
                    alt={imageAlt}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  
                  {/* Top Specular Edge Glow */}
                  <div className="absolute inset-x-0 top-0 h-px bg-white/40" />

                  {/* Gradient Scrim for Readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black backdrop-blur-md bg-black/40 text-white border border-white/20 shadow-xs">
                      {item.dayName} • <span className="capitalize ml-1">{item.mealType}</span>
                    </span>

                    <div className="flex items-center space-x-1.5">
                      {/* 5-Star Favorite Bookmark Toggle Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleFavorite(key);
                        }}
                        className={`p-1.5 rounded-full backdrop-blur-md border transition-all duration-200 active:scale-90 ${
                          isFavorite
                            ? 'bg-rose-500 text-white border-rose-400 shadow-md scale-105'
                            : 'bg-black/40 text-white/80 hover:text-white border-white/20 hover:bg-black/60'
                        }`}
                        aria-label={isFavorite ? `Remove ${item.description} from favorites` : `Save ${item.description} to favorites`}
                        title={isFavorite ? 'Saved to Favorites' : 'Add to Favorites'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white text-white' : ''}`} />
                      </button>

                      {item.vegetarian ? (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-emerald-950/80 text-emerald-200 border border-emerald-500/40 shadow-xs">
                          <Leaf className="w-3 h-3 text-emerald-400" />
                          <span>Veg</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-stone-900/80 text-stone-200 border border-white/20 shadow-xs">
                          <Utensils className="w-3 h-3 text-amber-400" />
                          <span>Hearty</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Image Stats (Calories, Visual Difficulty, Prep Time Overlay) */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between gap-1.5">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md bg-black/55 text-white border border-white/20 text-xs font-bold shadow-xs">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>{calories} kcal</span>
                    </div>

                    {/* Color-Coded Visual Difficulty Indicator */}
                    <div className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl backdrop-blur-md text-white border text-xs font-bold shadow-xs ${
                      difficulty === 'easy'
                        ? 'bg-emerald-950/80 border-emerald-400/50 text-emerald-200'
                        : difficulty === 'moderate'
                          ? 'bg-amber-950/80 border-amber-400/50 text-amber-200'
                          : 'bg-rose-950/80 border-rose-400/50 text-rose-200'
                    }`}>
                      {difficulty === 'easy' && <Sparkles className="w-3 h-3 text-emerald-400" />}
                      {difficulty === 'moderate' && <Clock className="w-3 h-3 text-amber-400" />}
                      {difficulty === 'advanced' && <Flame className="w-3 h-3 text-rose-400" />}
                      <span className="capitalize">{difficulty}</span>
                    </div>

                    <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md text-white border text-xs font-bold shadow-xs ${
                      isQuick
                        ? 'bg-blue-950/75 border-blue-400/40 text-blue-100'
                        : 'bg-black/55 border-white/20'
                    }`}>
                      <Clock className="w-3.5 h-3.5 text-amber-300" />
                      <span>{item.recipe.prepTime}</span>
                    </div>
                  </div>
                </div>

                {/* Card Content Area */}
                <div className="p-5">
                  {/* Meal Title */}
                  <h4 className={`text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-2 mb-2 ${
                    isLight ? 'text-stone-900' : 'text-white'
                  }`}>
                    {item.description}
                  </h4>

                  {/* 5-Star Interactive Rating System & Quick Kitchen Timer Trigger */}
                  <div className="flex items-center justify-between gap-2 mb-3.5 py-1.5 px-2 rounded-xl bg-amber-50/50 dark:bg-slate-800/50 border border-amber-200/50 dark:border-slate-700/60">
                    <div className="flex items-center space-x-0.5" title={`Rate recipe: ${rating || 0}/5 stars`}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => handleRate(key, star)}
                          aria-label={`Rate ${star} out of 5 stars`}
                          className="p-0.5 rounded-sm transition-transform hover:scale-125 active:scale-95 text-stone-300 dark:text-slate-600"
                        >
                          <Star
                            className={`w-4 h-4 transition-colors ${
                              star <= (rating || 0)
                                ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                                : isLight ? 'hover:text-amber-300' : 'hover:text-amber-400'
                            }`}
                          />
                        </button>
                      ))}
                      <span className={`text-[11px] font-extrabold ml-1.5 ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                        {rating > 0 ? `${rating}.0` : 'Rate'}
                      </span>
                    </div>

                    {/* Quick Kitchen Timer Launch Button */}
                    <button
                      type="button"
                      onClick={() => handleStartTimer(key, item.description, item.recipe.prepTime)}
                      className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all border ${
                        activeTimer?.recipeKey === key && activeTimer.isRunning
                          ? 'bg-amber-600 text-white border-amber-600 animate-pulse'
                          : isLight
                            ? 'bg-white hover:bg-amber-100 text-amber-950 border-amber-200 shadow-2xs'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                      }`}
                      title={`Start ${item.recipe.prepTime} cooking timer`}
                    >
                      <Timer className="w-3.5 h-3.5 text-amber-500" />
                      <span>Timer</span>
                    </button>
                  </div>

                  {/* Serving Size Selector */}
                  <div className="flex items-center justify-between mb-3 p-2.5 rounded-xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700">
                    <div className="flex items-center space-x-2">
                      <div className="p-1.5 rounded-lg bg-amber-600/10 text-amber-600 dark:text-amber-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs font-black block leading-none">
                          Serving Size
                        </span>
                        <span className="text-[10px] text-stone-500 dark:text-slate-400 font-medium">
                          {(servingSizes[key] || 1) === 1 ? '1 portion' : `${servingSizes[key] || 1} portions`}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onUpdateServingSize?.(key, (servingSizes[key] || 1) - 1)}
                        disabled={(servingSizes[key] || 1) <= 1}
                        className="p-1 rounded-lg border border-stone-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 disabled:opacity-30 active:scale-95 transition-all"
                        title="Decrease servings"
                        aria-label="Decrease servings"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2.5 py-0.5 rounded-md font-black text-xs bg-amber-600 text-white min-w-[2rem] text-center shadow-2xs">
                        {servingSizes[key] || 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => onUpdateServingSize?.(key, (servingSizes[key] || 1) + 1)}
                        className="p-1 rounded-lg border border-stone-300 dark:border-slate-600 hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 active:scale-95 transition-all"
                        title="Increase servings"
                        aria-label="Increase servings"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Senior Macro Pills Grid (Protein, Fiber, Sugar) */}
                  <div className="grid grid-cols-3 gap-2 mb-3.5">
                    {/* Protein */}
                    <div className={`p-2 rounded-xl border text-center transition-colors ${
                      isLight 
                        ? 'bg-amber-50/90 border-amber-200/90' 
                        : 'bg-amber-950/40 border-amber-800/60'
                    }`}>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        {(servingSizes[key] || 1) > 1 ? `Protein (${servingSizes[key] || 1}x)` : 'Protein'}
                      </span>
                      <span className={`text-sm font-black ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>
                        {nutrition.protein * (servingSizes[key] || 1)}g
                      </span>
                    </div>

                    {/* Fiber */}
                    <div className={`p-2 rounded-xl border text-center transition-colors ${
                      isLight 
                        ? 'bg-emerald-50/90 border-emerald-200/90' 
                        : 'bg-emerald-950/40 border-emerald-800/60'
                    }`}>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                        Fiber
                      </span>
                      <span className={`text-sm font-black ${isLight ? 'text-emerald-950' : 'text-emerald-200'}`}>
                        {nutrition.fiber}g
                      </span>
                    </div>

                    {/* Sugar */}
                    <div className={`p-2 rounded-xl border text-center transition-colors ${
                      isLight 
                        ? 'bg-blue-50/90 border-blue-200/90' 
                        : 'bg-blue-950/40 border-blue-800/60'
                    }`}>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400">
                        Sugar
                      </span>
                      <span className={`text-sm font-black ${isLight ? 'text-blue-950' : 'text-blue-200'}`}>
                        {nutrition.sugar}g
                      </span>
                    </div>
                  </div>

                  {/* Senior Quick Health Highlight */}
                  <div className={`p-2.5 rounded-xl border text-xs leading-relaxed font-medium mb-1 flex items-start space-x-2 ${
                    isLight
                      ? 'bg-stone-50 border-stone-200 text-stone-700'
                      : 'bg-slate-800/60 border-slate-700 text-slate-300'
                  }`}>
                    <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-[11px] sm:text-xs">
                      {nutrition.seniorHealthHighlight}
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Actions: Nutrition Modal Trigger & Expand Drawer */}
              <div className="px-5 pb-5 pt-0 space-y-2">
                {/* Detailed Nutrition Modal Trigger Button */}
                <button
                  type="button"
                  id={`btn-nutrition-${key}`}
                  onClick={() => setModalMeal({ item, meta })}
                  className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all duration-150 active:scale-98 border ${
                    isLight
                      ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300/80 shadow-2xs'
                      : 'bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-200 border-emerald-800/70'
                  }`}
                  aria-label={`Open detailed nutrition breakdown for ${item.description}`}
                >
                  <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Senior Nutrition Breakdown</span>
                </button>

                {/* Recipe Cooking Steps Expand Button */}
                <button
                  type="button"
                  id={`btn-recipe-toggle-${key}`}
                  onClick={() => onToggleRecipe?.(item.dayId, item.mealType)}
                  className={`w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-all duration-150 active:scale-98 border ${
                    isExpanded
                      ? isLight
                        ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                        : 'bg-amber-600 text-white border-amber-500 shadow-md'
                      : isLight
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200/90 shadow-2xs'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
                  }`}
                  aria-expanded={isExpanded}
                >
                  <ChefHat className="w-4 h-4" />
                  <span>{isExpanded ? 'Hide Details' : 'View Recipe & Nutrition'}</span>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Expanded Drawer with Sub-Tabs */}
                {isExpanded && (
                  <div className={`mt-4 pt-4 border-t space-y-3.5 transition-all duration-300 text-left ${
                    isLight ? 'border-amber-200/70' : 'border-slate-800'
                  }`}>
                    {/* Inline Tab Switcher */}
                    <div className={`grid grid-cols-2 p-1 rounded-xl border text-xs font-bold ${
                      isLight ? 'bg-stone-100 border-stone-200' : 'bg-slate-800 border-slate-700'
                    }`}>
                      <button
                        type="button"
                        onClick={() => toggleCardTab(key, 'recipe')}
                        className={`py-1.5 rounded-lg transition-all ${
                          currentTab === 'recipe'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : isLight ? 'text-stone-700 hover:text-stone-900' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Cooking Steps
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleCardTab(key, 'nutrition')}
                        className={`py-1.5 rounded-lg transition-all ${
                          currentTab === 'nutrition'
                            ? 'bg-amber-600 text-white shadow-xs'
                            : isLight ? 'text-stone-700 hover:text-stone-900' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        Senior Macros
                      </button>
                    </div>

                    {currentTab === 'recipe' ? (
                      /* Cooking Steps & Ingredients */
                      <div className="space-y-4">
                        {/* Senior Cooking Action Toolbar */}
                        <div className="flex flex-wrap items-center gap-2 p-2 rounded-xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700">
                          <button
                            type="button"
                            onClick={() => handleStartTimer(key, item.description, item.recipe.prepTime)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs active:scale-95 transition-all"
                          >
                            <Timer className="w-3.5 h-3.5" />
                            <span>Start Timer ({item.recipe.prepTime})</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleCopyRecipe(item)}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-white dark:bg-slate-700 hover:bg-stone-100 dark:hover:bg-slate-600 border border-stone-200 dark:border-slate-600 text-stone-700 dark:text-slate-200 active:scale-95 transition-all"
                          >
                            {copiedKey === key ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span>Copy Recipe</span>
                              </>
                            )}
                          </button>
                        </div>

                        {/* Ingredients */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`text-xs font-black uppercase tracking-wider ${
                              isLight ? 'text-stone-900' : 'text-white'
                            }`}>
                              Ingredients:
                            </h5>
                            {(servingSizes[key] || 1) > 1 && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                Scaled for {servingSizes[key] || 1} servings (synced to Shopping List)
                              </span>
                            )}
                          </div>
                          <ul className={`space-y-1.5 text-xs font-medium ${
                            isLight ? 'text-stone-800' : 'text-slate-200'
                          }`}>
                            {scaleRecipeIngredients(item.recipe.ingredients, servingSizes[key] || 1).map((ing, i) => {
                              const isMatch = searchQuery && ing.toLowerCase().includes(searchQuery.toLowerCase());
                              return (
                                <li 
                                  key={i} 
                                  className={`flex items-start p-1.5 rounded-lg ${
                                    isMatch 
                                      ? isLight 
                                        ? 'bg-amber-200/80 text-stone-950 font-bold' 
                                        : 'bg-amber-900/60 text-white font-bold' 
                                      : ''
                                  }`}
                                >
                                  <span className="mr-2 text-amber-600 dark:text-amber-400 font-black text-sm leading-none">•</span>
                                  <span>{ing}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Checkable Steps */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <h5 className={`text-xs font-black uppercase tracking-wider ${
                              isLight ? 'text-stone-900' : 'text-white'
                            }`}>
                              Cooking Steps:
                            </h5>
                            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                              Tap step to check off
                            </span>
                          </div>
                          <ol className="space-y-2 text-xs font-medium">
                            {item.recipe.instructions.map((step, idx) => {
                              const stepKey = `${key}-step-${idx}`;
                              const isChecked = !!checkedSteps[stepKey];
                              return (
                                <li
                                  key={idx}
                                  onClick={() => handleToggleStep(stepKey)}
                                  className={`flex items-start p-2 rounded-xl border cursor-pointer select-none transition-all ${
                                    isChecked
                                      ? isLight
                                        ? 'bg-emerald-50/80 border-emerald-300 text-stone-500 line-through'
                                        : 'bg-emerald-950/40 border-emerald-700 text-slate-400 line-through'
                                      : isLight
                                        ? 'bg-white hover:bg-amber-50/60 border-amber-100 text-stone-800'
                                        : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                                  }`}
                                >
                                  <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-2.5 shrink-0 border text-[11px] font-black transition-colors ${
                                    isChecked
                                      ? 'bg-emerald-500 border-emerald-500 text-white'
                                      : 'bg-stone-100 dark:bg-slate-700 border-stone-300 dark:border-slate-600 text-amber-700 dark:text-amber-400'
                                  }`}>
                                    {isChecked ? <Check className="w-3 h-3 stroke-[3]" /> : idx + 1}
                                  </div>
                                  <span className="leading-relaxed">{step}</span>
                                </li>
                              );
                            })}
                          </ol>
                        </div>
                      </div>
                    ) : (
                      /* Inline Macronutrient Breakdown */
                      <div className="space-y-3">
                        {/* Macro Visual Progress Bars */}
                        <div className="space-y-2.5">
                          {/* Protein Bar */}
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className={isLight ? 'text-stone-800' : 'text-slate-200'}>
                                Protein ({nutrition.protein}g)
                              </span>
                              <span className="text-amber-600 dark:text-amber-400">
                                {Math.round((nutrition.protein / 100) * 100)}% daily goal
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-slate-700 overflow-hidden">
                              <div 
                                className="h-full bg-amber-500 rounded-full" 
                                style={{ width: `${Math.min(100, (nutrition.protein / 40) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Fiber Bar */}
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className={isLight ? 'text-stone-800' : 'text-slate-200'}>
                                Dietary Fiber ({nutrition.fiber}g)
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400">
                                {Math.round((nutrition.fiber / 28) * 100)}% senior target
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-slate-700 overflow-hidden">
                              <div 
                                className="h-full bg-emerald-500 rounded-full" 
                                style={{ width: `${Math.min(100, (nutrition.fiber / 15) * 100)}%` }}
                              />
                            </div>
                          </div>

                          {/* Sugar Bar */}
                          <div>
                            <div className="flex justify-between text-xs font-bold mb-1">
                              <span className={isLight ? 'text-stone-800' : 'text-slate-200'}>
                                Sugar ({nutrition.sugar}g total • {nutrition.addedSugar}g added)
                              </span>
                              <span className="text-blue-600 dark:text-blue-400">
                                Glycemic: {nutrition.glycemicIndex}
                              </span>
                            </div>
                            <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-slate-700 overflow-hidden">
                              <div 
                                className="h-full bg-blue-500 rounded-full" 
                                style={{ width: `${Math.min(100, (nutrition.sugar / 20) * 100)}%` }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Micronutrient Summary */}
                        <div className={`p-2.5 rounded-xl border text-xs space-y-1 ${
                          isLight ? 'bg-stone-50 border-stone-200 text-stone-700' : 'bg-slate-800 border-slate-700 text-slate-300'
                        }`}>
                          <div className="flex justify-between">
                            <span>Heart-Healthy Fats:</span>
                            <strong className={isLight ? 'text-stone-900' : 'text-white'}>{nutrition.fat}g</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Carbohydrates:</span>
                            <strong className={isLight ? 'text-stone-900' : 'text-white'}>{nutrition.carbs}g</strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Low Sodium Safety:</span>
                            <strong className={isLight ? 'text-stone-900' : 'text-white'}>{nutrition.sodium}mg</strong>
                          </div>
                          {nutrition.calcium && (
                            <div className="flex justify-between">
                              <span>Bone Calcium:</span>
                              <strong className={isLight ? 'text-stone-900' : 'text-white'}>{nutrition.calcium}mg</strong>
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setModalMeal({ item, meta })}
                          className="w-full py-1.5 text-xs font-bold text-center text-amber-700 dark:text-amber-400 hover:underline"
                        >
                          View Full Screen Clinical Breakdown →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Senior Recipe & Nutrition Breakdown Modal */}
      {modalMeal && (
        <SeniorRecipeModal
          isOpen={!!modalMeal}
          onClose={() => setModalMeal(null)}
          meal={{
            dayId: modalMeal.item.dayId,
            dayName: modalMeal.item.dayName,
            mealType: modalMeal.item.mealType,
            description: modalMeal.item.description,
            protein: modalMeal.item.protein,
            vegetarian: modalMeal.item.vegetarian,
            recipe: modalMeal.item.recipe,
            calories: modalMeal.meta.calories,
            image: modalMeal.item.image || modalMeal.meta.image,
            imageAlt: modalMeal.item.imageAlt || modalMeal.meta.imageAlt,
            nutrition: modalMeal.meta.nutrition
          }}
          theme={theme}
          servingSizes={servingSizes}
          onUpdateServingSize={onUpdateServingSize}
        />
      )}
    </div>
  );
};

export default RecipeList;

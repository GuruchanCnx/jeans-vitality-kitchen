import React, { useState, useEffect } from 'react';
import { 
  X, Clock, Flame, Heart, Scale, ShieldCheck, CheckCircle2, 
  Copy, Check, Printer, Timer, Play, Pause, RotateCcw, Plus, Minus,
  Star, Sparkles, ChefHat, Info, Utensils, AlertCircle, Users,
  Volume2, VolumeX, BookmarkPlus, FolderHeart
} from 'lucide-react';
import { NutritionData } from '../data/recipeImages';
import { scaleRecipeIngredients } from '../utils/servings';
import { RecipeSpeaker } from '../utils/speech';
import { RecipeCollectionsModal } from './RecipeCollectionsModal';

export interface SeniorRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  meal: {
    dayId?: string;
    dayName?: string;
    mealType: string;
    description: string;
    protein: number;
    vegetarian?: boolean;
    recipe: {
      ingredients: string[];
      instructions: string[];
      prepTime: string;
    };
    calories?: number;
    image?: string;
    imageAlt?: string;
    nutrition?: NutritionData;
  } | null;
  theme?: string;
  highContrast?: boolean;
  servingSizes?: Record<string, number>;
  onUpdateServingSize?: (recipeKey: string, newServings: number) => void;
}

export const SeniorRecipeModal: React.FC<SeniorRecipeModalProps> = ({
  isOpen,
  onClose,
  meal,
  theme = 'light',
  highContrast = false,
  servingSizes = {},
  onUpdateServingSize
}) => {
  if (!isOpen || !meal) return null;

  const isLight = theme === 'light';
  const mealKey = `${meal.dayId || 'recipe'}-${meal.mealType}`;

  // Checked cooking steps state
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  
  // Rating and Favorite state
  const [rating, setRating] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('jeans_recipe_ratings');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed[mealKey] || 0;
      }
    } catch {}
    return 0;
  });

  const [isFavorite, setIsFavorite] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('jeans_recipe_favorites');
      if (saved) {
        const parsed = JSON.parse(saved);
        return !!parsed[mealKey];
      }
    } catch {}
    return false;
  });

  // Cooking Countdown Timer state
  const prepMinutes = parseInt(meal.recipe.prepTime) || 15;
  const [timerSeconds, setTimerSeconds] = useState(prepMinutes * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerFinished, setTimerFinished] = useState(false);

  // Copy recipe feedback
  const [copied, setCopied] = useState(false);

  // Text-to-Speech (TTS) State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingStep, setActiveSpeakingStep] = useState<number | null>(null);

  // Collections Modal state
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);

  // Stop speech when unmounting or modal closes
  useEffect(() => {
    return () => {
      RecipeSpeaker.stop();
    };
  }, []);

  const handleSpeakAll = () => {
    if (isSpeaking) {
      RecipeSpeaker.stop();
      setIsSpeaking(false);
      setActiveSpeakingStep(null);
    } else {
      setIsSpeaking(true);
      RecipeSpeaker.speakAllSteps(
        meal.recipe.instructions,
        meal.description,
        (speaking, stepIdx) => {
          setIsSpeaking(speaking);
          setActiveSpeakingStep(stepIdx);
        }
      );
    }
  };

  const handleSpeakSingleStep = (stepText: string, idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpeaking && activeSpeakingStep === idx) {
      RecipeSpeaker.stop();
      setIsSpeaking(false);
      setActiveSpeakingStep(null);
    } else {
      setIsSpeaking(true);
      RecipeSpeaker.speakStep(`Step ${idx + 1}: ${stepText}`, idx, (speaking, stepIdx) => {
        setIsSpeaking(speaking);
        setActiveSpeakingStep(stepIdx);
      });
    }
  };

  // Subtle mount animation state for senior-friendly fade-in and scale
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setIsMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        RecipeSpeaker.stop();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Timer interval countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => {
          if (prev <= 1) {
            setIsTimerRunning(false);
            setTimerFinished(true);
            playChimeSound();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timerSeconds]);

  // Accessible sound chime upon timer completion
  const playChimeSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.18);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.18);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.18 + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.18);
        osc.stop(ctx.currentTime + idx * 0.18 + 0.55);
      });
    } catch {
      // Audio not permitted in restricted contexts
    }
  };

  const handleRate = (star: number) => {
    setRating(star);
    try {
      const saved = localStorage.getItem('jeans_recipe_ratings');
      const ratings = saved ? JSON.parse(saved) : {};
      ratings[mealKey] = star;
      localStorage.setItem('jeans_recipe_ratings', JSON.stringify(ratings));
    } catch {}
  };

  const handleToggleFavorite = () => {
    const nextFav = !isFavorite;
    setIsFavorite(nextFav);
    try {
      const saved = localStorage.getItem('jeans_recipe_favorites');
      const favs = saved ? JSON.parse(saved) : {};
      if (nextFav) {
        favs[mealKey] = true;
      } else {
        delete favs[mealKey];
      }
      localStorage.setItem('jeans_recipe_favorites', JSON.stringify(favs));
    } catch {}
  };

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const nutrition = meal.nutrition;
  const currentServings = (servingSizes && servingSizes[mealKey]) || 1;
  const scaledIngredients = scaleRecipeIngredients(meal.recipe.ingredients, currentServings);

  const handleCopyRecipe = () => {
    const text = `
JEAN'S VITALITY KITCHEN
${meal.description} (${meal.dayName ? `${meal.dayName} • ` : ''}${meal.mealType.toUpperCase()})
Serving Size: ${currentServings} ${currentServings === 1 ? 'portion' : 'portions'}
Total Protein: ${meal.protein * currentServings}g (${meal.protein}g/portion) | Calories: ${(meal.calories || 350) * currentServings} kcal | Prep Time: ${meal.recipe.prepTime}

INGREDIENTS (${currentServings} SERVING${currentServings > 1 ? 'S' : ''}):
${scaledIngredients.map(ing => `• ${ing}`).join('\n')}

INSTRUCTIONS:
${meal.recipe.instructions.map((inst, i) => `${i + 1}. ${inst}`).join('\n')}

SENIOR HEALTH BENEFITS:
${meal.nutrition?.seniorHealthHighlight || "Optimized for muscle protein synthesis, steady energy, and digestive comfort."}
`.trim();

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  };

  const handlePrint = () => {
    window.print();
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div 
      id="senior-recipe-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="senior-recipe-title"
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md transition-opacity duration-300 ease-out ${
        isMounted ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="senior-recipe-modal-card"
        className={`relative w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[92vh] transition-all duration-300 ease-out transform ${
          isMounted 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-3'
        } ${
          isLight 
            ? 'bg-white text-stone-900 border-amber-200 shadow-[0_25px_70px_rgba(217,119,6,0.18)]' 
            : 'bg-slate-900 text-white border-slate-700 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Banner with Meal Image */}
        <div className="relative h-48 sm:h-60 w-full overflow-hidden shrink-0 bg-stone-900">
          {meal.image ? (
            <img 
              src={meal.image} 
              alt={meal.imageAlt || meal.description}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-amber-600 to-orange-600 flex items-center justify-center">
              <ChefHat className="w-16 h-16 text-white/50" />
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Close Button - Large and accessible */}
          <button
            type="button"
            id="close-senior-recipe-modal"
            onClick={() => {
              RecipeSpeaker.stop();
              onClose();
            }}
            className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all active:scale-95 shadow-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-400"
            aria-label="Close recipe details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Quick Actions overlay: Favorite, Collection & Rating */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleToggleFavorite}
              className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border flex items-center space-x-1.5 transition-all shadow-md active:scale-95 ${
                isFavorite 
                  ? 'bg-rose-500 text-white border-rose-400' 
                  : 'bg-black/60 text-white hover:bg-black/80 border-white/20'
              }`}
              aria-label={isFavorite ? "Remove from favorite recipes" : "Save as favorite recipe"}
            >
              <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : 'text-rose-400'}`} />
              <span>{isFavorite ? 'Saved' : 'Favorite'}</span>
            </button>

            {/* Save to Collections Modal Trigger */}
            <button
              type="button"
              id="btn-save-to-collection-modal"
              onClick={() => setShowCollectionsModal(true)}
              className="px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border bg-black/60 text-amber-300 hover:bg-black/80 border-white/20 flex items-center space-x-1.5 transition-all shadow-md active:scale-95"
              aria-label="Add this recipe to a senior collection"
              title="Organize recipe into collections (e.g. Breakfast Favorites, Easy Dinners)"
            >
              <BookmarkPlus className="w-3.5 h-3.5 text-amber-300" />
              <span>Collection</span>
            </button>

            {/* 5-Star Rating Buttons */}
            <div className="flex items-center space-x-0.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  className="p-0.5 hover:scale-125 transition-transform"
                  aria-label={`Rate ${star} stars out of 5`}
                >
                  <Star className={`w-3.5 h-3.5 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-white/40'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Banner Title and Metadata */}
          <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div className="space-y-1 max-w-xl">
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white uppercase tracking-wider">
                  {meal.dayName ? `${meal.dayName} • ` : ''}{meal.mealType}
                </span>
                {meal.vegetarian && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500 text-white">
                    Vegetarian
                  </span>
                )}
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                  Senior Vitality Menu
                </span>
              </div>
              <h2 id="senior-recipe-title" className="text-xl sm:text-2xl font-black text-white leading-tight">
                {meal.description}
              </h2>
            </div>

            <div className="shrink-0 flex items-center space-x-2 bg-black/70 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/20 text-white self-start sm:self-auto">
              <Flame className="w-4 h-4 text-orange-400" />
              <span className="text-sm font-black">{meal.calories || nutrition?.calories || 350} kcal</span>
              <span className="text-white/40">|</span>
              <span className="text-sm font-black text-amber-300">{meal.protein}g Protein</span>
            </div>
          </div>
        </div>

        {/* Modal Body - Scrollable */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          
          {/* Active Senior Health Benefits Callout */}
          <div className={`p-4 sm:p-5 rounded-2xl border flex items-start space-x-3.5 shadow-xs ${
            isLight 
              ? 'bg-amber-50/90 border-amber-200/90 text-stone-800' 
              : 'bg-amber-950/40 border-amber-800/60 text-slate-200'
          }`}>
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className={`text-base font-black tracking-tight ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>
                Jean's Clinical Senior Health Benefits
              </h3>
              <p className="text-xs sm:text-sm leading-relaxed font-medium">
                {nutrition?.seniorHealthHighlight || (
                  "Carefully formulated to provide concentrated complete protein for lean muscle preservation (sarcopenia defense), alongside dietary fiber and micronutrients to support joint comfort and steady all-day vitality."
                )}
              </p>
            </div>
          </div>

          {/* Interactive Cooking Countdown Timer Banner */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 ${
            timerFinished
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-400 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30'
              : isTimerRunning
                ? 'bg-amber-500/10 border-amber-400/80 ring-2 ring-amber-500/20'
                : isLight
                  ? 'bg-stone-50 border-stone-200 text-stone-800'
                  : 'bg-slate-800/60 border-slate-700 text-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`p-2.5 rounded-2xl ${
                timerFinished ? 'bg-emerald-500 text-white animate-bounce' : isTimerRunning ? 'bg-amber-500 text-white' : 'bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-slate-300'
              }`}>
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-bold uppercase tracking-wider block text-stone-500 dark:text-slate-400">
                  Active Prep Timer
                </span>
                <span className="text-2xl font-black font-mono tracking-tight">
                  {formatTimer(timerSeconds)}
                </span>
                {timerFinished && (
                  <span className="ml-2 text-xs font-black text-emerald-600 dark:text-emerald-400">
                    Done! Time to serve.
                  </span>
                )}
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setTimerSeconds(prev => Math.max(60, prev - 60))}
                className="p-2 rounded-xl border border-stone-300 dark:border-slate-600 text-stone-700 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95"
                title="Subtract 1 minute"
                aria-label="Subtract 1 minute from timer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setTimerSeconds(prev => prev + 60)}
                className="p-2 rounded-xl border border-stone-300 dark:border-slate-600 text-stone-700 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95"
                title="Add 1 minute"
                aria-label="Add 1 minute to timer"
              >
                <Plus className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsTimerRunning(prev => !prev)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm active:scale-95 transition-all ${
                  isTimerRunning
                    ? 'bg-amber-600 hover:bg-amber-700 text-white'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                }`}
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    <span>Start Timer</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsTimerRunning(false);
                  setTimerSeconds(prepMinutes * 60);
                  setTimerFinished(false);
                }}
                className="p-2 rounded-xl border border-stone-300 dark:border-slate-600 text-stone-700 dark:text-slate-300 hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95"
                title="Reset timer"
                aria-label="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Serving Size Selector */}
          <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs ${
            isLight
              ? 'bg-amber-50/80 border-amber-200/90 text-stone-800'
              : 'bg-slate-800/80 border-slate-700 text-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-amber-600 text-white shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black">Serving Size & Ingredient Scaling</h4>
                <p className="text-xs text-stone-500 dark:text-slate-400">
                  Automatically recalculates ingredient amounts for this recipe and your shopping list
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-stone-200 dark:border-slate-700 shadow-2xs">
                <button
                  type="button"
                  onClick={() => onUpdateServingSize?.(mealKey, currentServings - 1)}
                  disabled={currentServings <= 1}
                  className="p-1 rounded-lg border border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-700 dark:text-slate-200 disabled:opacity-30 active:scale-95"
                  title="Decrease servings"
                  aria-label="Decrease servings"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <div className="px-2 text-center">
                  <span className="text-base font-black text-amber-600 dark:text-amber-400">
                    {currentServings}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-slate-400 font-bold block leading-none">
                    {currentServings === 1 ? 'portion' : 'portions'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onUpdateServingSize?.(mealKey, currentServings + 1)}
                  className="p-1 rounded-lg border border-stone-300 dark:border-slate-600 hover:bg-stone-100 dark:hover:bg-slate-800 active:scale-95 text-stone-700 dark:text-slate-200"
                  title="Increase servings"
                  aria-label="Increase servings"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {currentServings > 1 && (
                <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 px-2.5 py-1 rounded-xl">
                  {currentServings}x Scaled
                </span>
              )}
            </div>
          </div>

          {/* Senior Nutritional Matrix Breakdown */}
          <div>
            <h3 className={`text-xs font-black uppercase tracking-wider mb-3 flex items-center space-x-2 ${
              isLight ? 'text-stone-800' : 'text-white'
            }`}>
              <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Senior Clinical Nutritional Breakdown</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Protein */}
              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-800/80 border-slate-700'
              }`}>
                <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block uppercase tracking-wider">
                  Protein Power
                </span>
                <span className="text-xl sm:text-2xl font-black block">
                  {meal.protein * currentServings}g
                </span>
                <span className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                  {currentServings > 1 ? `${meal.protein}g/portion • ${currentServings} portions` : `${Math.round((meal.protein / 100) * 100)}% of 100g daily target`}
                </span>
              </div>

              {/* Fiber */}
              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-emerald-50/70 border-emerald-200' : 'bg-slate-800/80 border-slate-700'
              }`}>
                <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block uppercase tracking-wider">
                  Dietary Fiber
                </span>
                <span className="text-xl sm:text-2xl font-black block">
                  {(nutrition?.fiber || 6) * currentServings}g
                </span>
                <span className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                  Gut & digestive health
                </span>
              </div>

              {/* Sodium */}
              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-sky-50/70 border-sky-200' : 'bg-slate-800/80 border-slate-700'
              }`}>
                <span className="text-[11px] font-bold text-sky-700 dark:text-sky-400 block uppercase tracking-wider">
                  Heart Sodium
                </span>
                <span className="text-xl sm:text-2xl font-black block">
                  {nutrition?.sodium || 220}mg
                </span>
                <span className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                  Heart & BP safe (&lt;400mg)
                </span>
              </div>

              {/* Sugar */}
              <div className={`p-3.5 rounded-2xl border ${
                isLight ? 'bg-stone-50 border-stone-200' : 'bg-slate-800/80 border-slate-700'
              }`}>
                <span className="text-[11px] font-bold text-stone-600 dark:text-slate-400 block uppercase tracking-wider">
                  Glycemic Sugar
                </span>
                <span className="text-xl sm:text-2xl font-black block">
                  {nutrition?.addedSugar || 0}g added
                </span>
                <span className="text-[11px] text-stone-500 dark:text-slate-400 font-medium">
                  Low glycemic index
                </span>
              </div>
            </div>
          </div>

          {/* Ingredients & Cooking Instructions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Ingredients List */}
            <div className={`p-4 sm:p-5 rounded-2xl border ${
              isLight ? 'bg-white border-amber-200/90' : 'bg-slate-800/50 border-slate-700'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className={`text-sm font-black uppercase tracking-wider flex items-center space-x-1.5 ${
                  isLight ? 'text-stone-900' : 'text-white'
                }`}>
                  <Utensils className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Fresh Ingredients ({scaledIngredients.length})</span>
                </h3>
                {currentServings > 1 && (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    Scaled for {currentServings}
                  </span>
                )}
              </div>
              <ul className="space-y-2 text-xs sm:text-sm font-medium">
                {scaledIngredients.map((ing, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0 mt-0.5">•</span>
                    <span className={isLight ? 'text-stone-800' : 'text-slate-200'}>{ing}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Checkable Cooking Instructions with Senior Text-to-Speech (TTS) */}
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-3 ${
              isLight ? 'bg-white border-amber-200/90' : 'bg-slate-800/50 border-slate-700'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-amber-200/50 dark:border-slate-700">
                <div className="flex items-center space-x-1.5">
                  <ChefHat className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <h3 className={`text-sm font-black uppercase tracking-wider ${
                    isLight ? 'text-stone-900' : 'text-white'
                  }`}>
                    Step-by-Step Directions
                  </h3>
                </div>

                {/* Senior Audio Voice Bar (SpeechSynthesis) */}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    id="btn-speak-all-instructions"
                    onClick={handleSpeakAll}
                    className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all active:scale-95 border min-h-[36px] ${
                      isSpeaking
                        ? 'bg-amber-600 text-white border-amber-600 ring-2 ring-amber-500/30 animate-pulse'
                        : isLight
                          ? 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-amber-950/60 hover:bg-amber-900 text-amber-200 border-amber-800'
                    }`}
                    title="Have Jean's kitchen assistant read instructions aloud at a gentle 0.9x speed"
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5" />
                        <span>Stop Audio</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>Read Aloud</span>
                      </>
                    )}
                  </button>
                  <span className="text-[11px] text-stone-500 dark:text-slate-400 hidden sm:inline">
                    (0.9x Senior Pace)
                  </span>
                </div>
              </div>

              {isSpeaking && (
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs text-amber-800 dark:text-amber-200">
                  <div className="flex items-center space-x-2">
                    <span className="flex h-2 w-2 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="font-bold">
                      {activeSpeakingStep !== null && activeSpeakingStep >= 0 
                        ? `Reading Step ${activeSpeakingStep + 1} aloud...` 
                        : "Preparing to read instructions aloud..."}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      RecipeSpeaker.stop();
                      setIsSpeaking(false);
                      setActiveSpeakingStep(null);
                    }}
                    className="text-[11px] font-black underline hover:text-amber-900"
                  >
                    Cancel
                  </button>
                </div>
              )}

              <ol className="space-y-2.5 text-xs sm:text-sm font-medium">
                {meal.recipe.instructions.map((inst, idx) => {
                  const isDone = completedSteps[idx];
                  const isCurrentSpeaking = isSpeaking && activeSpeakingStep === idx;

                  return (
                    <li 
                      key={idx} 
                      onClick={() => toggleStep(idx)}
                      className={`flex items-start justify-between space-x-2.5 p-2.5 rounded-xl cursor-pointer transition-all border ${
                        isCurrentSpeaking
                          ? 'bg-amber-100/90 dark:bg-amber-950/80 border-amber-400 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400 shadow-sm'
                          : isDone 
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200 line-through opacity-75' 
                            : isLight
                              ? 'bg-stone-50/50 hover:bg-amber-50/70 border-stone-200 text-stone-800'
                              : 'bg-slate-850 hover:bg-slate-800 border-slate-750 text-slate-200'
                      }`}
                    >
                      <div className="flex items-start space-x-2.5 min-w-0">
                        <button 
                          type="button" 
                          aria-label={`Step ${idx + 1}`}
                          className="mt-0.5 shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStep(idx);
                          }}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black ${
                              isCurrentSpeaking 
                                ? 'bg-amber-500 text-white border-amber-500' 
                                : 'border-stone-400 dark:border-slate-500'
                            }`}>
                              {idx + 1}
                            </span>
                          )}
                        </button>
                        <span className="leading-relaxed">{inst}</span>
                      </div>

                      {/* Individual Step Speaker Button */}
                      <button
                        type="button"
                        onClick={(e) => handleSpeakSingleStep(inst, idx, e)}
                        className={`p-1.5 rounded-lg border shrink-0 transition-all active:scale-95 ${
                          isCurrentSpeaking
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 text-stone-600 dark:text-slate-300 border-stone-200 dark:border-slate-700'
                        }`}
                        title={`Read step ${idx + 1} aloud`}
                        aria-label={`Read step ${idx + 1} aloud`}
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>

          {/* Jean's Kitchen Comfort Advice for Seniors */}
          <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
            isLight ? 'bg-amber-50/60 border-amber-200 text-stone-700' : 'bg-slate-800/40 border-slate-700 text-slate-300'
          }`}>
            <h4 className={`font-black uppercase tracking-wider flex items-center space-x-1.5 ${
              isLight ? 'text-stone-900' : 'text-white'
            }`}>
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Senior Kitchen Comfort Notes:</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-stone-200/60 dark:border-slate-700">
                <strong className="block text-amber-800 dark:text-amber-300">Chewing Ease</strong>
                Steam veggies an extra 2 minutes if you prefer a softer, gentler texture.
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-stone-200/60 dark:border-slate-700">
                <strong className="block text-amber-800 dark:text-amber-300">Hydration Pair</strong>
                Drink 1 tall glass of water alongside this meal to optimize digestive motility.
              </div>
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-900/60 border border-stone-200/60 dark:border-slate-700">
                <strong className="block text-amber-800 dark:text-amber-300">Flavor Boost</strong>
                Season with lemon juice or herbs rather than table salt to protect vascular elasticity.
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className={`p-4 sm:p-5 border-t flex flex-wrap items-center justify-between gap-3 shrink-0 ${
          isLight ? 'bg-stone-50 border-stone-200' : 'bg-slate-800/80 border-slate-700'
        }`}>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleCopyRecipe}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-slate-600 hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Recipe!' : 'Copy Recipe'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border border-stone-300 dark:border-slate-600 hover:bg-stone-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              RecipeSpeaker.stop();
              onClose();
            }}
            className="px-6 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 active:scale-95 transition-all"
          >
            Close Recipe
          </button>
        </div>
      </div>

      {/* Senior Recipe Collections Modal */}
      {showCollectionsModal && (
        <RecipeCollectionsModal
          isOpen={showCollectionsModal}
          onClose={() => setShowCollectionsModal(false)}
          recipeKey={mealKey}
          recipeTitle={meal.description}
          theme={theme}
          highContrast={highContrast}
        />
      )}
    </div>
  );
};

export default SeniorRecipeModal;

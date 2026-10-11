import React, { useState } from 'react';
import { 
  ChefHat, 
  Clock, 
  Flame, 
  Activity, 
  Heart, 
  Users, 
  Minus, 
  Plus, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  ShieldCheck,
  Utensils,
  Leaf
} from 'lucide-react';
import { scaleRecipeIngredients } from '../utils/servings';

export interface Recipe {
  title: string;
  highProteinBenefits?: string;
  ingredients: string[];
  instructions: string[];
  protein?: number;
  prepTime?: string;
  calories?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  mealType?: string;
  dayName?: string;
  dayId?: string;
  vegetarian?: boolean;
  image?: string;
  imageAlt?: string;
  nutrition?: {
    protein: number;
    fiber: number;
    sugar: number;
    carbs?: number;
    fat?: number;
    seniorHealthHighlight?: string;
  };
}

export interface RecipeCardProps {
  recipe: Recipe;
  onOpenNutritionModal?: (recipe: Recipe) => void;
  servings?: number;
  onUpdateServings?: (newServings: number) => void;
  theme?: string;
  highContrast?: boolean;
  className?: string;
  isFavorite?: boolean;
  onToggleFavorite?: (recipe: Recipe) => void;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({
  recipe,
  onOpenNutritionModal,
  servings = 1,
  onUpdateServings,
  theme = 'light',
  highContrast = false,
  className = '',
  isFavorite = false,
  onToggleFavorite
}) => {
  const isLight = theme === 'light';
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps'>('ingredients');
  const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

  const scaledIngredients = scaleRecipeIngredients(recipe.ingredients, servings);
  const baseProtein = recipe.protein || recipe.nutrition?.protein || 25;
  const scaledProtein = baseProtein * servings;
  const baseCalories = recipe.calories || 350;
  const scaledCalories = baseCalories * servings;

  const seniorHighlight = recipe.highProteinBenefits || 
    recipe.nutrition?.seniorHealthHighlight || 
    `Provides ${scaledProtein}g of high-quality complete protein to preserve lean muscle, maintain bone density, and promote steady senior energy.`;

  const toggleStep = (idx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCheckedSteps(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  const handleCardClick = () => {
    if (onOpenNutritionModal) {
      onOpenNutritionModal(recipe);
    } else {
      setIsExpanded(prev => !prev);
    }
  };

  return (
    <article
      id={`recipe-card-${recipe.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
      onClick={handleCardClick}
      className={`group relative rounded-3xl overflow-hidden border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] focus-within:ring-2 focus-within:ring-amber-500 ${
        isLight
          ? 'bg-white border-amber-200/90 text-stone-900 shadow-[0_4px_20px_rgba(217,119,6,0.06)]'
          : 'bg-slate-900/95 border-slate-700/80 text-white shadow-xl'
      } ${className}`}
    >
      {/* Top Media / Thumbnail Section */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-200 dark:bg-slate-800">
        {recipe.image ? (
          <img
            src={recipe.image}
            alt={recipe.imageAlt || recipe.title}
            referrerPolicy="no-referrer"
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <ChefHat className="w-16 h-16 opacity-80" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Top Floating Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <div className="flex items-center space-x-1.5 flex-wrap gap-1">
            {recipe.mealType && (
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-amber-300 border border-white/20">
                {recipe.mealType}
              </span>
            )}
            {recipe.vegetarian && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white flex items-center space-x-1 shadow-sm">
                <Leaf className="w-3 h-3" />
                <span>Veg</span>
              </span>
            )}
            {servings > 1 && (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-stone-950 shadow-sm">
                {servings}x Servings
              </span>
            )}
          </div>

          {/* Favorite Button */}
          {onToggleFavorite && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(recipe);
              }}
              className={`p-2 rounded-full backdrop-blur-md pointer-events-auto transition-transform active:scale-95 ${
                isFavorite
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'bg-black/50 text-white hover:bg-black/75 border border-white/20'
              }`}
              aria-label={isFavorite ? `Remove ${recipe.title} from favorites` : `Add ${recipe.title} to favorites`}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-white' : ''}`} />
            </button>
          )}
        </div>

        {/* Bottom Image Stats: Calories, Time, Day */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-xs font-bold">
          <span className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-xl">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>{scaledCalories} kcal</span>
          </span>

          {recipe.prepTime && (
            <span className="flex items-center space-x-1 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-xl">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>{recipe.prepTime}</span>
            </span>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {/* Day Label if provided */}
          {recipe.dayName && (
            <span className="text-xs font-black uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-1">
              {recipe.dayName} Menu
            </span>
          )}

          {/* Recipe Title */}
          <h3 className={`text-lg sm:text-xl font-black tracking-tight leading-snug group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors ${
            isLight ? 'text-stone-900' : 'text-white'
          }`}>
            {recipe.title}
          </h3>

          {/* High-Protein Senior Benefits Box */}
          <div className={`mt-3 p-3 rounded-2xl border text-xs sm:text-sm leading-relaxed flex items-start space-x-2.5 ${
            isLight
              ? 'bg-amber-50/90 border-amber-200/90 text-stone-800'
              : 'bg-amber-950/40 border-amber-800/60 text-slate-200'
          }`}>
            <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-black text-amber-900 dark:text-amber-200 block text-xs uppercase tracking-wide mb-0.5">
                Senior Vitality & High-Protein Power
              </span>
              <p className="font-medium text-xs sm:text-[13px] leading-relaxed">
                {seniorHighlight}
              </p>
            </div>
          </div>
        </div>

        {/* Protein Matrix & Servings Stepper */}
        <div className="pt-3 border-t border-amber-200/60 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          {/* Protein Metric */}
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Senior Protein
            </span>
            <div className="flex items-baseline space-x-1">
              <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {scaledProtein}g
              </span>
              <span className="text-xs font-bold text-stone-500 dark:text-slate-400">
                / {baseProtein}g portion
              </span>
            </div>
          </div>

          {/* Serving Size Stepper */}
          {onUpdateServings && (
            <div 
              className="flex items-center space-x-1.5 p-1.5 rounded-2xl bg-stone-100 dark:bg-slate-800 border border-stone-200 dark:border-slate-700"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-1 text-stone-600 dark:text-slate-300 px-1">
                <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-black">Servings:</span>
              </div>
              <button
                type="button"
                onClick={() => onUpdateServings(Math.max(1, servings - 1))}
                disabled={servings <= 1}
                className="w-7 h-7 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-stone-800 dark:text-slate-100 disabled:opacity-30 active:scale-95 transition-all shadow-2xs"
                title="Decrease serving size"
                aria-label="Decrease serving size"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-black text-xs min-w-[1.5rem] text-center text-amber-700 dark:text-amber-300">
                {servings}
              </span>
              <button
                type="button"
                onClick={() => onUpdateServings(Math.min(12, servings + 1))}
                className="w-7 h-7 rounded-xl flex items-center justify-center bg-white dark:bg-slate-700 hover:bg-stone-200 dark:hover:bg-slate-600 text-stone-800 dark:text-slate-100 active:scale-95 transition-all shadow-2xs"
                title="Increase serving size"
                aria-label="Increase serving size"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Action Controls: Nutrition Details Modal & Expand Recipe */}
        <div className="space-y-2 pt-1" onClick={(e) => e.stopPropagation()}>
          {/* Nutrition Details Modal Button */}
          <button
            type="button"
            id={`btn-open-nutrition-${recipe.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
            onClick={() => onOpenNutritionModal?.(recipe)}
            className={`w-full py-2.5 px-4 rounded-2xl text-xs sm:text-sm font-black flex items-center justify-center space-x-2 transition-all active:scale-98 border shadow-xs ${
              isLight
                ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border-emerald-300/80 shadow-emerald-500/10'
                : 'bg-emerald-950/70 hover:bg-emerald-900 text-emerald-200 border-emerald-800/80'
            }`}
            style={{ minHeight: '44px' }}
            aria-label={`Open clinical senior nutrition breakdown for ${recipe.title}`}
          >
            <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Senior Nutrition Breakdown</span>
          </button>

          {/* Quick Expand Toggle for Ingredients & Cooking Steps */}
          <button
            type="button"
            onClick={() => setIsExpanded(prev => !prev)}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-all active:scale-98 border ${
              isExpanded
                ? 'bg-amber-600 text-white border-amber-600'
                : isLight
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            style={{ minHeight: '40px' }}
            aria-expanded={isExpanded}
          >
            <ChefHat className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Hide Ingredients & Steps' : 'View Ingredients & Steps'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {/* Expandable Drawer */}
          {isExpanded && (
            <div className={`mt-3 pt-3 border-t space-y-3 animate-in fade-in duration-200 text-left ${
              isLight ? 'border-amber-200/80' : 'border-slate-800'
            }`}>
              {/* Tab Selector */}
              <div className={`grid grid-cols-2 p-1 rounded-xl border text-xs font-bold ${
                isLight ? 'bg-stone-100 border-stone-200' : 'bg-slate-800 border-slate-700'
              }`}>
                <button
                  type="button"
                  onClick={() => setActiveTab('ingredients')}
                  className={`py-1.5 rounded-lg transition-all ${
                    activeTab === 'ingredients'
                      ? 'bg-amber-600 text-white shadow-xs font-black'
                      : isLight ? 'text-stone-700 hover:text-stone-900' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Ingredients ({scaledIngredients.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('steps')}
                  className={`py-1.5 rounded-lg transition-all ${
                    activeTab === 'steps'
                      ? 'bg-amber-600 text-white shadow-xs font-black'
                      : isLight ? 'text-stone-700 hover:text-stone-900' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  Directions ({recipe.instructions.length})
                </button>
              </div>

              {/* Tab Content */}
              {activeTab === 'ingredients' ? (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {servings > 1 && (
                    <div className="text-[11px] font-black text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 p-2 rounded-lg border border-amber-200 dark:border-amber-800">
                      Scaled for {servings} servings (synchronized with Grocery List)
                    </div>
                  )}
                  <ul className="space-y-1 text-xs font-medium">
                    {scaledIngredients.map((ing, i) => (
                      <li key={i} className="flex items-start space-x-2 py-0.5">
                        <span className="text-amber-600 dark:text-amber-400 font-black">•</span>
                        <span>{ing}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400 block">
                    Tap a step to check off as you cook:
                  </span>
                  <ol className="space-y-1.5 text-xs font-medium">
                    {recipe.instructions.map((step, idx) => {
                      const isChecked = !!checkedSteps[idx];
                      return (
                        <li
                          key={idx}
                          onClick={(e) => toggleStep(idx, e)}
                          className={`flex items-start p-2 rounded-xl border cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-stone-500 line-through'
                              : isLight
                                ? 'bg-white hover:bg-amber-50/60 border-stone-200 text-stone-800'
                                : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700 text-slate-200'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-md flex items-center justify-center mr-2 shrink-0 border text-[11px] font-black ${
                            isChecked
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-stone-100 dark:bg-slate-700 border-stone-300 text-stone-700 dark:text-slate-200'
                          }`}>
                            {isChecked ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                          </div>
                          <span className="leading-relaxed">{step}</span>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default RecipeCard;

import React, { useState, useEffect } from 'react';
import { 
  Clock, Flame, ChefHat, Leaf, Utensils, Sparkles, ChevronDown, ChevronUp, 
  Activity, Heart, ShieldCheck, X, Droplets, Info, CheckCircle2, Apple, Scale
} from 'lucide-react';
import { getMealMeta, NutritionData } from '../data/recipeImages';

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
  description = "Wholesome, senior-friendly meals packed with clean protein, digestive fiber, low added sugars, and bone-supporting nutrients."
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

  // Day filter state
  const [selectedDay, setSelectedDay] = useState<string>('all');

  // Filter recipes based on selected day
  const displayedRecipes = selectedDay === 'all' 
    ? recipes 
    : recipes.filter(r => r.dayId.toLowerCase() === selectedDay.toLowerCase());

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

      {/* Day Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
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

                  {/* Bottom Image Stats (Calories & Prep Time Overlay) */}
                  <div className="absolute bottom-3 inset-x-3 flex items-center justify-between">
                    <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl backdrop-blur-md bg-black/55 text-white border border-white/20 text-xs font-bold shadow-xs">
                      <Flame className="w-3.5 h-3.5 text-orange-400" />
                      <span>{calories} kcal</span>
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
                  <h4 className={`text-base sm:text-lg font-black tracking-tight leading-snug line-clamp-2 mb-3 ${
                    isLight ? 'text-stone-900' : 'text-white'
                  }`}>
                    {item.description}
                  </h4>

                  {/* Senior Macro Pills Grid (Protein, Fiber, Sugar) */}
                  <div className="grid grid-cols-3 gap-2 mb-3.5">
                    {/* Protein */}
                    <div className={`p-2 rounded-xl border text-center transition-colors ${
                      isLight 
                        ? 'bg-amber-50/90 border-amber-200/90' 
                        : 'bg-amber-950/40 border-amber-800/60'
                    }`}>
                      <span className="block text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                        Protein
                      </span>
                      <span className={`text-sm font-black ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>
                        {nutrition.protein}g
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
                      <div className="space-y-3">
                        {/* Ingredients */}
                        <div>
                          <h5 className={`text-xs font-black uppercase tracking-wider mb-2 ${
                            isLight ? 'text-stone-900' : 'text-white'
                          }`}>
                            Ingredients:
                          </h5>
                          <ul className={`space-y-1 text-xs font-medium ${
                            isLight ? 'text-stone-800' : 'text-slate-200'
                          }`}>
                            {item.recipe.ingredients.map((ing, i) => {
                              const isMatch = searchQuery && ing.toLowerCase().includes(searchQuery.toLowerCase());
                              return (
                                <li 
                                  key={i} 
                                  className={`flex items-start p-1 rounded-md ${
                                    isMatch 
                                      ? isLight 
                                        ? 'bg-amber-200/80 text-stone-950 font-bold' 
                                        : 'bg-amber-900/60 text-white font-bold' 
                                      : ''
                                  }`}
                                >
                                  <span className="mr-1.5 text-amber-600 dark:text-amber-400 font-black">•</span>
                                  <span>{ing}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>

                        {/* Steps */}
                        <div>
                          <h5 className={`text-xs font-black uppercase tracking-wider mb-2 ${
                            isLight ? 'text-stone-900' : 'text-white'
                          }`}>
                            Cooking Steps:
                          </h5>
                          <ol className={`space-y-1.5 text-xs font-medium ${
                            isLight ? 'text-stone-800' : 'text-slate-200'
                          }`}>
                            {item.recipe.instructions.map((step, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="font-black mr-2 text-amber-700 dark:text-amber-400 shrink-0">
                                  {idx + 1}.
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
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

      {/* Detailed Senior Nutrition Breakdown Modal */}
      {modalMeal && (
        <div 
          id="nutrition-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-nutrition-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/70 backdrop-blur-md transition-all duration-300 animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalMeal(null);
          }}
        >
          <div 
            id="nutrition-modal-content"
            className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border transition-all duration-300 max-h-[90vh] flex flex-col ${
              isLight 
                ? 'bg-white text-stone-900 border-amber-200 shadow-[0_20px_60px_rgba(217,119,6,0.15)]' 
                : 'bg-slate-900 text-white border-slate-700 shadow-2xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header Image Banner */}
            <div className="relative h-44 sm:h-52 w-full overflow-hidden shrink-0 bg-stone-900">
              <img 
                src={modalMeal.item.image || modalMeal.meta.image} 
                alt={modalMeal.item.imageAlt || modalMeal.meta.imageAlt}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent" />

              {/* Close Button */}
              <button
                type="button"
                id="btn-close-nutrition-modal"
                onClick={() => setModalMeal(null)}
                className="absolute top-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white border border-white/20 transition-all active:scale-95 shadow-md"
                aria-label="Close nutrition modal"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Modal Banner Text */}
              <div className="absolute bottom-4 inset-x-4 sm:inset-x-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
                <div>
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white uppercase tracking-wider">
                      {modalMeal.item.dayName} • {modalMeal.item.mealType}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                      Senior Nutrition Guide
                    </span>
                  </div>
                  <h3 id="modal-nutrition-title" className="text-xl sm:text-2xl font-black text-white leading-tight">
                    {modalMeal.item.description}
                  </h3>
                </div>

                <div className="shrink-0 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-2xl border border-white/20 text-white">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-sm font-black">{modalMeal.meta.calories} kcal</span>
                </div>
              </div>
            </div>

            {/* Modal Body - Scrollable */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
              
              {/* Senior Vitality Insight Callout */}
              <div className={`p-4 rounded-2xl border flex items-start space-x-3.5 ${
                isLight 
                  ? 'bg-amber-50/90 border-amber-200/90 text-stone-800' 
                  : 'bg-amber-950/40 border-amber-800/60 text-slate-200'
              }`}>
                <div className="p-2 rounded-xl bg-amber-500 text-white shrink-0 shadow-xs">
                  <Heart className="w-5 h-5" />
                </div>
                <div>
                  <h4 className={`text-sm font-black tracking-tight mb-1 ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>
                    Jean's Clinical Senior Vitality Analysis
                  </h4>
                  <p className="text-xs sm:text-sm leading-relaxed font-medium">
                    {modalMeal.meta.nutrition.seniorHealthHighlight}
                  </p>
                </div>
              </div>

              {/* Core Macronutrient Triad Matrix: Fiber, Protein, Sugar */}
              <div>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-3.5 flex items-center space-x-2 ${
                  isLight ? 'text-stone-800' : 'text-white'
                }`}>
                  <Scale className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Essential Senior Macronutrients Breakdown</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* 1. Protein Card */}
                  <div className={`p-4 rounded-2xl border relative overflow-hidden ${
                    isLight ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-800/80 border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider">
                        High-Grade Protein
                      </span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-amber-200/80 dark:bg-amber-900 text-amber-950 dark:text-amber-200">
                        {modalMeal.meta.nutrition.protein}g
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black mb-1">
                      {Math.round((modalMeal.meta.nutrition.protein / 100) * 100)}%
                      <span className="text-xs font-medium text-stone-500 dark:text-slate-400 ml-1">of 100g daily</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
                      Provides essential branched-chain amino acids (BCAAs) to counteract age-related sarcopenia & support joint integrity.
                    </p>
                  </div>

                  {/* 2. Dietary Fiber Card */}
                  <div className={`p-4 rounded-2xl border relative overflow-hidden ${
                    isLight ? 'bg-emerald-50/60 border-emerald-200' : 'bg-slate-800/80 border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
                        Dietary Fiber
                      </span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-emerald-200/80 dark:bg-emerald-900 text-emerald-950 dark:text-emerald-200">
                        {modalMeal.meta.nutrition.fiber}g
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black mb-1">
                      {Math.round((modalMeal.meta.nutrition.fiber / 28) * 100)}%
                      <span className="text-xs font-medium text-stone-500 dark:text-slate-400 ml-1">of 28g target</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
                      Prebiotic soluble & insoluble fiber promotes smooth digestive transit and helps bind excess circulating cholesterol.
                    </p>
                  </div>

                  {/* 3. Sugar Content Card */}
                  <div className={`p-4 rounded-2xl border relative overflow-hidden ${
                    isLight ? 'bg-blue-50/60 border-blue-200' : 'bg-slate-800/80 border-slate-700'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">
                        Low Sugar Impact
                      </span>
                      <span className="text-xs font-black px-2 py-0.5 rounded-md bg-blue-200/80 dark:bg-blue-900 text-blue-950 dark:text-blue-200">
                        {modalMeal.meta.nutrition.sugar}g total
                      </span>
                    </div>
                    <div className="text-xl sm:text-2xl font-black mb-1">
                      {modalMeal.meta.nutrition.addedSugar}g
                      <span className="text-xs font-medium text-stone-500 dark:text-slate-400 ml-1">added refined sugars</span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-slate-300 leading-relaxed font-medium">
                      Natural whole-food sugars paired with fiber deliver a gentle glycemic load to avoid post-meal fatigue and glucose spikes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Comprehensive Macro & Micro Table */}
              <div className={`rounded-2xl border p-4 sm:p-5 ${
                isLight ? 'bg-stone-50/80 border-stone-200' : 'bg-slate-800/60 border-slate-700'
              }`}>
                <h4 className={`text-xs font-black uppercase tracking-wider mb-3 ${
                  isLight ? 'text-stone-800' : 'text-white'
                }`}>
                  Complete Nutritional Profile per Serving
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-200' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-stone-500 dark:text-slate-400 block font-bold">Total Carbs</span>
                    <span className="text-base font-black">{modalMeal.meta.nutrition.carbs}g</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-200' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-stone-500 dark:text-slate-400 block font-bold">Heart Fats</span>
                    <span className="text-base font-black">{modalMeal.meta.nutrition.fat}g</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-200' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-stone-500 dark:text-slate-400 block font-bold">Sodium (Heart Safe)</span>
                    <span className="text-base font-black">{modalMeal.meta.nutrition.sodium}mg</span>
                  </div>

                  <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-200' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-stone-500 dark:text-slate-400 block font-bold">Glycemic Index</span>
                    <span className="text-base font-black text-emerald-600 dark:text-emerald-400">
                      {modalMeal.meta.nutrition.glycemicIndex}
                    </span>
                  </div>

                  {modalMeal.meta.nutrition.calcium && (
                    <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-200' : 'bg-slate-900 border-slate-800'}`}>
                      <span className="text-stone-500 dark:text-slate-400 block font-bold">Bone Calcium</span>
                      <span className="text-base font-black">{modalMeal.meta.nutrition.calcium}mg</span>
                    </div>
                  )}

                  {modalMeal.meta.nutrition.potassium && (
                    <div className={`p-3 rounded-xl border ${isLight ? 'bg-white border-stone-200' : 'bg-slate-900 border-slate-800'}`}>
                      <span className="text-stone-500 dark:text-slate-400 block font-bold">Potassium (BP Support)</span>
                      <span className="text-base font-black">{modalMeal.meta.nutrition.potassium}mg</span>
                    </div>
                  )}

                  <div className={`p-3 rounded-xl border col-span-2 ${isLight ? 'bg-white border-stone-200' : 'bg-slate-900 border-slate-800'}`}>
                    <span className="text-stone-500 dark:text-slate-400 block font-bold">Preparation Speed</span>
                    <span className="text-base font-black flex items-center space-x-1">
                      <Clock className="w-4 h-4 text-amber-500" />
                      <span>{modalMeal.item.recipe.prepTime} Quick Prep</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Senior Digestive & Preparation Tips */}
              <div className={`p-4 rounded-2xl border space-y-2 text-xs ${
                isLight ? 'bg-amber-50/50 border-amber-200 text-stone-700' : 'bg-slate-800/40 border-slate-700 text-slate-300'
              }`}>
                <h5 className={`font-black uppercase tracking-wider flex items-center space-x-1.5 ${
                  isLight ? 'text-stone-900' : 'text-white'
                }`}>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Jean's Senior Kitchen Tips:</span>
                </h5>
                <ul className="space-y-1.5 font-medium list-disc list-inside">
                  <li><strong>Chewing Ease:</strong> Feel free to steam or sauté vegetables an extra 2 minutes for gentler texture.</li>
                  <li><strong>Hydration Pair:</strong> Drink 1 glass of water alongside this high-fiber meal to optimize soluble fiber digestion.</li>
                  <li><strong>Flavor without Salt:</strong> Boost savory depth with fresh lemon squeeze, garlic, or culinary herbs rather than added sodium.</li>
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`p-4 sm:p-5 border-t flex items-center justify-between gap-3 ${
              isLight ? 'bg-stone-50 border-stone-200' : 'bg-slate-800/80 border-slate-700'
            }`}>
              <span className="text-xs font-medium text-stone-500 dark:text-slate-400">
                Crafted for Jean's 100g High-Protein Vitality Routine
              </span>

              <button
                type="button"
                onClick={() => setModalMeal(null)}
                className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-md shadow-amber-600/20 active:scale-95 transition-all"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeList;

import React from 'react';
import { 
  ChefHat, 
  Calendar, 
  Heart, 
  Activity, 
  Utensils, 
  Sparkles, 
  ArrowRight, 
  Clock, 
  ShieldCheck, 
  BookOpen,
  ChevronDown,
  ShoppingCart
} from 'lucide-react';

/**
 * Hero Component - Jean's Vitality Kitchen
 * Features a warm, inviting welcome message for seniors, Liquid Glass UI styling,
 * high-contrast readability in both light & dark themes, and a prominent 'View 7-Day Plan' CTA.
 */
export const Hero = ({
  theme = 'light',
  nutritionInfo = {
    dailyProtein: "100g",
    calories: "1800-2000",
    focus: "High-quality protein, fiber-rich foods, healthy fats, and essential nutrients"
  },
  mealPlan = [],
  onScrollToDay,
  onViewPlan,
  onViewShoppingList
}) => {
  const isLight = theme === 'light';

  const handleViewPlanClick = (e) => {
    e.preventDefault();
    if (onViewPlan) {
      onViewPlan();
    } else {
      const element = document.getElementById('meal-plan');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  const handleQuickJump = (dayId, e) => {
    e.preventDefault();
    if (onScrollToDay) {
      onScrollToDay(dayId);
    } else {
      const element = document.getElementById(dayId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <section 
      id="hero-section"
      className="relative overflow-hidden pt-6 pb-12 sm:pt-10 sm:pb-16"
      aria-label="Welcome Hero"
    >
      {/* Liquid Glass Ambient Background Refraction Orbs */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        <div className={`absolute -top-24 -left-20 w-96 h-96 rounded-full blur-3xl opacity-40 transition-colors duration-500 ${
          isLight ? 'bg-amber-300/60' : 'bg-amber-600/20'
        }`} />
        <div className={`absolute top-1/3 -right-24 w-96 h-96 rounded-full blur-3xl opacity-35 transition-colors duration-500 ${
          isLight ? 'bg-orange-300/50' : 'bg-orange-600/20'
        }`} />
        <div className={`absolute -bottom-20 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-30 transition-colors duration-500 ${
          isLight ? 'bg-emerald-300/40' : 'bg-emerald-600/15'
        }`} />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Liquid Glass Hero Card */}
        <div 
          id="hero-main-card"
          className={`relative rounded-3xl p-6 sm:p-10 lg:p-12 transition-all duration-300 backdrop-blur-2xl shadow-xl ${
            isLight
              ? 'bg-white/90 border border-amber-200/80 shadow-[0_12px_40px_rgba(217,119,6,0.12)] ring-1 ring-amber-900/5'
              : 'bg-slate-900/85 border border-slate-700/60 shadow-[0_12px_40px_rgba(0,0,0,0.5)] ring-1 ring-white/10'
          }`}
        >
          {/* Top Specular Liquid Light Beam */}
          <div className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-amber-400/60 dark:via-amber-300/40 to-transparent" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Welcome & Message */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Senior Vitality Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold tracking-wide backdrop-blur-md shadow-xs transition-transform hover:scale-105 border ${
                isLight 
                  ? 'bg-amber-100/90 text-amber-950 border-amber-300/80 shadow-amber-900/5' 
                  : 'bg-amber-950/80 text-amber-200 border-amber-700/60'
              }">
                <span className="flex h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                <ChefHat className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>Jean's Golden Years Nutrition Guide</span>
              </div>

              {/* Headline */}
              <div className="space-y-3">
                <h1 className={`text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight ${
                  isLight ? 'text-stone-900' : 'text-white'
                }`}>
                  Nourish Your Body, <br />
                  <span className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-300 dark:to-amber-400">
                    Energize Your Golden Days.
                  </span>
                </h1>
                
                {/* Inviting Welcome Note from Jean */}
                <p className={`text-base sm:text-lg leading-relaxed font-normal ${
                  isLight ? 'text-stone-700' : 'text-slate-200'
                }`}>
                  <strong className={isLight ? 'text-stone-900 font-semibold' : 'text-white font-semibold'}>
                    Welcome to my kitchen, dear friend!
                  </strong>{' '}
                  I've lovingly crafted this 7-day high-protein meal plan specifically for active seniors. 
                  Each day delivers <strong>100g of muscle-preserving protein</strong> through wholesome, comforting meals that are gentle on digestion, quick to prepare, and full of flavor.
                </p>
              </div>

              {/* Key Senior Benefits Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className={`flex items-center space-x-2.5 text-sm font-medium ${
                  isLight ? 'text-stone-800' : 'text-slate-200'
                }`}>
                  <div className={`p-1 rounded-full ${isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950 text-emerald-300'}`}>
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Supports muscle & bone strength</span>
                </div>

                <div className={`flex items-center space-x-2.5 text-sm font-medium ${
                  isLight ? 'text-stone-800' : 'text-slate-200'
                }`}>
                  <div className={`p-1 rounded-full ${isLight ? 'bg-amber-100 text-amber-800' : 'bg-amber-950 text-amber-300'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Quick 5 to 25-minute prep times</span>
                </div>

                <div className={`flex items-center space-x-2.5 text-sm font-medium ${
                  isLight ? 'text-stone-800' : 'text-slate-200'
                }`}>
                  <div className={`p-1 rounded-full ${isLight ? 'bg-rose-100 text-rose-800' : 'bg-rose-950 text-rose-300'}`}>
                    <Heart className="w-4 h-4" />
                  </div>
                  <span>Heart-healthy & gentle digestion</span>
                </div>

                <div className={`flex items-center space-x-2.5 text-sm font-medium ${
                  isLight ? 'text-stone-800' : 'text-slate-200'
                }`}>
                  <div className={`p-1 rounded-full ${isLight ? 'bg-blue-100 text-blue-800' : 'bg-blue-950 text-blue-300'}`}>
                    <Utensils className="w-4 h-4" />
                  </div>
                  <span>Simple everyday pantry ingredients</span>
                </div>
              </div>

              {/* Primary Call-to-Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-3">
                
                {/* Main 'View 7-Day Plan' CTA */}
                <a
                  id="hero-view-plan-cta"
                  href="#meal-plan"
                  onClick={handleViewPlanClick}
                  className="group relative inline-flex items-center justify-center px-7 py-4 text-base font-bold text-white rounded-2xl bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-lg shadow-amber-600/30 hover:shadow-xl hover:shadow-amber-600/40 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-amber-500/50"
                  aria-label="View 7-Day Meal Plan"
                >
                  {/* Glossy liquid glass reflection */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/25 via-transparent to-transparent opacity-80 pointer-events-none" />
                  <Calendar className="w-5 h-5 mr-2.5 transition-transform group-hover:scale-110" />
                  <span>View 7-Day Plan</span>
                  <ArrowRight className="w-5 h-5 ml-2.5 transition-transform group-hover:translate-x-1" />
                </a>

                {/* Secondary Kitchen Wisdom Button */}
                <a
                  id="hero-kitchen-tips-button"
                  href="#tips"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById('tips')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className={`inline-flex items-center justify-center px-5 py-4 text-base font-semibold rounded-2xl backdrop-blur-xl border transition-all duration-200 ${
                    isLight
                      ? 'bg-amber-50/80 hover:bg-amber-100 text-stone-900 border-amber-200/80 hover:border-amber-300 shadow-xs'
                      : 'bg-slate-800/80 hover:bg-slate-700/80 text-white border-slate-700 hover:border-slate-600 shadow-xs'
                  }`}
                >
                  <BookOpen className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                  <span>Kitchen Tips</span>
                </a>

                {/* Shopping List Button */}
                <a
                  id="hero-shopping-list-button"
                  href="#shopping-list"
                  onClick={(e) => {
                    e.preventDefault();
                    if (onViewShoppingList) {
                      onViewShoppingList();
                    } else {
                      document.getElementById('shopping-list')?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className={`inline-flex items-center justify-center px-5 py-4 text-base font-semibold rounded-2xl backdrop-blur-xl border transition-all duration-200 ${
                    isLight
                      ? 'bg-amber-100/80 hover:bg-amber-200 text-amber-950 border-amber-300 shadow-xs'
                      : 'bg-amber-950/70 hover:bg-amber-900 text-amber-200 border-amber-800 shadow-xs'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 mr-2 text-amber-600 dark:text-amber-400" />
                  <span>Grocery List</span>
                </a>
              </div>

            </div>

            {/* Right Column: Liquid Glass Nutrition Highlights */}
            <div className="lg:col-span-5 space-y-4">
              
              <div className={`p-6 sm:p-7 rounded-2xl backdrop-blur-xl border transition-all ${
                isLight
                  ? 'bg-amber-50/90 border-amber-200/90 shadow-md shadow-amber-900/5'
                  : 'bg-slate-800/70 border-slate-700/80 shadow-lg'
              }`}>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-amber-200/60 dark:border-slate-700/60">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
                      <Activity className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className={`text-base font-bold ${isLight ? 'text-stone-900' : 'text-white'}`}>
                        Daily Nutrition Targets
                      </h2>
                      <p className={`text-xs ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                        Optimized for senior vitality & satiety
                      </p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    isLight ? 'bg-amber-200/80 text-amber-950' : 'bg-amber-900/80 text-amber-200'
                  }`}>
                    7 Days
                  </span>
                </div>

                <div className="space-y-3.5">
                  
                  {/* Metric 1: Protein */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isLight 
                      ? 'bg-white/90 border-amber-200/70 text-stone-900' 
                      : 'bg-slate-900/80 border-slate-700/70 text-white'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`text-xs font-medium ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                          Target Protein
                        </div>
                        <div className={`text-sm font-semibold ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>
                          Muscle retention
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
                        {nutritionInfo.dailyProtein}
                      </span>
                      <span className={`block text-[11px] font-medium ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                        per day
                      </span>
                    </div>
                  </div>

                  {/* Metric 2: Calories */}
                  <div className={`p-3.5 rounded-xl border flex items-center justify-between ${
                    isLight 
                      ? 'bg-white/90 border-amber-200/70 text-stone-900' 
                      : 'bg-slate-900/80 border-slate-700/70 text-white'
                  }`}>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className={`text-xs font-medium ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                          Balanced Energy
                        </div>
                        <div className={`text-sm font-semibold ${isLight ? 'text-stone-900' : 'text-slate-100'}`}>
                          Daily calories
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {nutritionInfo.calories}
                      </span>
                      <span className={`block text-[11px] font-medium ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                        kcal / day
                      </span>
                    </div>
                  </div>

                  {/* Metric 3: Focus Area */}
                  <div className={`p-3.5 rounded-xl border ${
                    isLight 
                      ? 'bg-white/90 border-amber-200/70 text-stone-900' 
                      : 'bg-slate-900/80 border-slate-700/70 text-white'
                  }`}>
                    <div className="flex items-center space-x-2 mb-1">
                      <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className={`text-xs font-bold uppercase tracking-wider ${
                        isLight ? 'text-stone-700' : 'text-slate-300'
                      }`}>
                        Nutritional Focus
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed ${
                      isLight ? 'text-stone-700' : 'text-slate-300'
                    }`}>
                      {nutritionInfo.focus}
                    </p>
                  </div>

                </div>

                {/* Jean's Warm Signature / Quote */}
                <div className={`mt-4 pt-3.5 border-t flex items-center space-x-3 ${
                  isLight ? 'border-amber-200/60 text-stone-700' : 'border-slate-700/60 text-slate-300'
                }`}>
                  <div className="flex -space-x-1">
                    <span className="text-xl">👵</span>
                  </div>
                  <p className="text-xs italic leading-tight">
                    "Good food is the best medicine for body, mind, and spirit!" <br />
                    <span className="font-semibold not-italic text-amber-700 dark:text-amber-400">— Chef Jean</span>
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* Quick Jump Bar for 7 Days */}
          {mealPlan && mealPlan.length > 0 && (
            <div className={`mt-8 pt-6 border-t ${
              isLight ? 'border-amber-200/70' : 'border-slate-800'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${
                    isLight ? 'text-stone-800' : 'text-slate-200'
                  }`}>
                    Jump to Any Day:
                  </span>
                </div>
                <span className={`text-xs ${isLight ? 'text-stone-600' : 'text-slate-400'}`}>
                  Click a day to view its complete breakfast, lunch, dinner & snack recipes
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
                {mealPlan.map((day) => (
                  <a
                    key={day.id}
                    id={`hero-jump-${day.id}`}
                    href={`#${day.id}`}
                    onClick={(e) => handleQuickJump(day.id, e)}
                    className={`group flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-150 active:scale-95 ${
                      isLight
                        ? 'bg-white/80 hover:bg-amber-500 hover:text-white border-amber-200/80 text-stone-900 shadow-xs hover:border-amber-500 hover:shadow-md'
                        : 'bg-slate-800/80 hover:bg-amber-500 hover:text-white border-slate-700 text-slate-200 hover:border-amber-500'
                    }`}
                  >
                    <span className="text-xs font-bold group-hover:text-white">
                      {day.day}
                    </span>
                    <span className={`text-[10px] font-medium transition-colors ${
                      isLight ? 'text-amber-700 group-hover:text-amber-100' : 'text-amber-400 group-hover:text-amber-100'
                    }`}>
                      100g protein
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};

export default Hero;

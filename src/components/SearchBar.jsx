import React from 'react';
import { Search, X, Sparkles, Filter, Leaf, Clock, Flame, Utensils, Check } from 'lucide-react';

/**
 * SearchBar Component for Jean's Vitality Kitchen
 * Allows senior users to search through 7-day recipes by meal keyword, ingredient, or prep time.
 * Provides accessible touch targets, high contrast, liquid glass aesthetic, and quick-filter ingredient tags.
 */
export const SearchBar = ({
  searchQuery,
  onSearchChange,
  onClearSearch,
  activeCategory,
  onCategoryChange,
  totalMatches,
  totalRecipes = 28,
  theme = 'light',
  suggestedIngredients = [
    'Salmon',
    'Greek Yogurt',
    'Eggs',
    'Chicken',
    'Lentils',
    'Tofu',
    'Avocado',
    'Spinach',
    'Berries',
    'Quinoa'
  ]
}) => {
  const isLight = theme === 'light';

  const categories = [
    { id: 'all', label: 'All Recipes', icon: Utensils },
    { id: 'vegetarian', label: 'Vegetarian', icon: Leaf },
    { id: 'quick', label: 'Quick Prep (≤ 20m)', icon: Clock },
    { id: 'high-protein', label: 'High Protein (≥ 25g)', icon: Flame },
  ];

  return (
    <div 
      id="recipe-search-container"
      className={`rounded-3xl p-6 sm:p-8 backdrop-blur-2xl transition-all duration-300 border shadow-lg ${
        isLight
          ? 'bg-white/95 border-amber-200/90 shadow-[0_10px_35px_rgba(217,119,6,0.08)] ring-1 ring-amber-900/5'
          : 'bg-slate-900/90 border-slate-700/70 shadow-2xl ring-1 ring-white/10'
      }`}
    >
      {/* Header section with title and search status badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md shadow-amber-600/25">
            <Search className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight ${
              isLight ? 'text-stone-900' : 'text-white'
            }`}>
              Find a Recipe or Ingredient
            </h2>
            <p className={`text-xs sm:text-sm font-medium ${
              isLight ? 'text-stone-600' : 'text-slate-300'
            }`}>
              Search by favorite food, pantry ingredient, or cooking time
            </p>
          </div>
        </div>

        {/* Match Count Badge */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <span 
            id="search-results-badge"
            className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors ${
              searchQuery || activeCategory !== 'all'
                ? isLight
                  ? 'bg-amber-100 text-amber-950 border-amber-300 shadow-xs'
                  : 'bg-amber-950/80 text-amber-200 border-amber-700'
                : isLight
                  ? 'bg-stone-100 text-stone-700 border-stone-200'
                  : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>
              {searchQuery || activeCategory !== 'all'
                ? `${totalMatches} ${totalMatches === 1 ? 'match' : 'matches'} found`
                : `All ${totalRecipes} senior recipes`}
            </span>
          </span>
        </div>
      </div>

      {/* Main Search Input Form */}
      <div className="relative mb-5">
        <label htmlFor="recipe-search-input" className="sr-only">
          Search recipes by keyword or ingredient
        </label>
        
        <div className="relative flex items-center">
          <div className="absolute left-4.5 pointer-events-none text-amber-600 dark:text-amber-400">
            <Search className="w-5 h-5" />
          </div>

          <input
            id="recipe-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Try searching 'salmon', 'Greek yogurt', 'spinach', 'chia seeds'..."
            className={`w-full pl-12 pr-12 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg font-medium transition-all duration-200 backdrop-blur-xl border focus:outline-hidden focus:ring-4 ${
              isLight
                ? 'bg-amber-50/60 hover:bg-white focus:bg-white text-stone-900 placeholder:text-stone-400 border-amber-300/80 focus:border-amber-500 focus:ring-amber-500/20 shadow-inner'
                : 'bg-slate-800/80 hover:bg-slate-800 focus:bg-slate-800 text-white placeholder:text-slate-400 border-slate-700 focus:border-amber-400 focus:ring-amber-400/20 shadow-inner'
            }`}
          />

          {searchQuery && (
            <button
              id="clear-search-button"
              type="button"
              onClick={onClearSearch}
              aria-label="Clear search input"
              className={`absolute right-3.5 p-2 rounded-xl transition-all duration-150 active:scale-95 ${
                isLight
                  ? 'hover:bg-amber-200/80 text-stone-700'
                  : 'hover:bg-slate-700 text-slate-300'
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className={`text-xs font-bold uppercase tracking-wider mr-1 ${
          isLight ? 'text-stone-700' : 'text-slate-300'
        }`}>
          Filter:
        </span>
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              id={`filter-button-${cat.id}`}
              type="button"
              onClick={() => onCategoryChange(cat.id)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-150 active:scale-95 border ${
                isSelected
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-amber-600 shadow-sm shadow-amber-600/30'
                  : isLight
                    ? 'bg-amber-50/70 hover:bg-amber-100 text-stone-800 border-amber-200/90'
                    : 'bg-slate-800/80 hover:bg-slate-800 text-slate-200 border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-amber-600 dark:text-amber-400'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Quick Ingredient Suggestions Chips */}
      <div className="pt-3 border-t border-amber-200/50 dark:border-slate-800">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className={`text-xs font-semibold mr-1 ${
            isLight ? 'text-stone-600' : 'text-slate-400'
          }`}>
            Popular Ingredients:
          </span>
          {suggestedIngredients.map((ingredient) => {
            const isCurrent = searchQuery.toLowerCase().includes(ingredient.toLowerCase());

            return (
              <button
                key={ingredient}
                id={`ingredient-chip-${ingredient.toLowerCase().replace(/\s+/g, '-')}`}
                type="button"
                onClick={() => {
                  if (isCurrent) {
                    onClearSearch();
                  } else {
                    onSearchChange(ingredient);
                  }
                }}
                className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 border ${
                  isCurrent
                    ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                    : isLight
                      ? 'bg-white/80 hover:bg-amber-100/80 text-stone-700 hover:text-stone-900 border-amber-200/70'
                      : 'bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                }`}
              >
                <span>{ingredient}</span>
                {isCurrent && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SearchBar;

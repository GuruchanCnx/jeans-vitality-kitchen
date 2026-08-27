import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, CheckCircle2, Circle, Copy, Printer, RotateCcw, 
  Plus, Trash2, Search, Filter, Sparkles, Check, ChevronDown, ChevronUp,
  Apple, Fish, Egg, Wheat, Package, Heart, AlertCircle, Info, Calendar, Download
} from 'lucide-react';

export interface DayMealPlan {
  day: string;
  id: string;
  meals: {
    [key: string]: {
      description: string;
      protein: number;
      vegetarian: boolean;
      recipe: {
        ingredients: string[];
        instructions: string[];
        prepTime: string;
      };
    };
  };
}

export interface ShoppingItem {
  id: string;
  name: string;
  originalText: string;
  category: string;
  days: string[];
  meals: string[];
  checked: boolean;
  isCustom?: boolean;
}

export interface ShoppingListProps {
  mealPlan: DayMealPlan[];
  theme?: string;
}

// Category definition with icons & display colors
export const CATEGORY_DEFINITIONS = [
  { id: 'produce', name: 'Fresh Produce & Fruits', icon: Apple, color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60' },
  { id: 'meat_seafood', name: 'Poultry, Fish & Meats', icon: Fish, color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60' },
  { id: 'dairy_plant_protein', name: 'Dairy, Eggs & Tofu', icon: Egg, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60' },
  { id: 'grains_pantry', name: 'Grains, Seeds & Nuts', icon: Wheat, color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/50' },
  { id: 'canned_seasoning', name: 'Beans, Soups & Seasonings', icon: Package, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60' },
  { id: 'other', name: 'Other Essentials', icon: ShoppingCart, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800/60' }
];

/**
 * Heuristic ingredient categorizer based on common keywords
 */
function categorizeIngredient(text: string): string {
  const t = text.toLowerCase();
  
  // Produce & Fruits
  if (
    t.includes('berries') || t.includes('strawberry') || t.includes('blueberry') || t.includes('raspberry') ||
    t.includes('broccoli') || t.includes('spinach') || t.includes('avocado') || t.includes('greens') ||
    t.includes('lemon') || t.includes('banana') || t.includes('vegetable') || t.includes('green beans') ||
    t.includes('apple') || t.includes('cucumber') || t.includes('sweet potato') || t.includes('carrots') ||
    t.includes('asparagus') || t.includes('pear') || t.includes('mushrooms') || t.includes('bell pepper') ||
    t.includes('peppers') || t.includes('orange') || t.includes('peaches') || t.includes('pineapple') ||
    t.includes('lettuce') || t.includes('onion') || t.includes('garlic') || t.includes('herbs') || t.includes('tomato')
  ) {
    return 'produce';
  }

  // Meats & Seafood
  if (
    t.includes('salmon') || t.includes('turkey') || t.includes('chicken') || t.includes('tuna') ||
    t.includes('fillet') || t.includes('beef') || t.includes('ground turkey') || t.includes('breast') ||
    t.includes('fish') || t.includes('shrimp')
  ) {
    return 'meat_seafood';
  }

  // Dairy, Eggs & Tofu
  if (
    t.includes('yogurt') || t.includes('egg') || t.includes('tofu') || t.includes('cottage cheese') ||
    t.includes('cheese') || t.includes('milk') || t.includes('whey') || t.includes('parmesan')
  ) {
    return 'dairy_plant_protein';
  }

  // Grains, Seeds & Nuts
  if (
    t.includes('quinoa') || t.includes('chia') || t.includes('oat') || t.includes('oatmeal') ||
    t.includes('rice') || t.includes('toast') || t.includes('bread') || t.includes('walnut') ||
    t.includes('almond') || t.includes('crackers') || t.includes('flax') || t.includes('granola') ||
    t.includes('bar') || t.includes('roll') || t.includes('protein powder')
  ) {
    return 'grains_pantry';
  }

  // Beans, Soups & Seasonings
  if (
    t.includes('lentil') || t.includes('chickpea') || t.includes('bean') || t.includes('beans') ||
    t.includes('soup') || t.includes('broth') || t.includes('oil') || t.includes('olive oil') ||
    t.includes('honey') || t.includes('salsa') || t.includes('curry') || t.includes('pepper') ||
    t.includes('salt') || t.includes('dressing') || t.includes('sauce') || t.includes('vinegar')
  ) {
    return 'canned_seasoning';
  }

  return 'other';
}

const STORAGE_KEY = 'jeans_vitality_shopping_list_checks';
const CUSTOM_ITEMS_KEY = 'jeans_vitality_shopping_list_custom';

export const ShoppingList: React.FC<ShoppingListProps> = ({
  mealPlan,
  theme = 'light'
}) => {
  const isLight = theme === 'light';

  // Selected Days filter: default all days selected
  const [selectedDayIds, setSelectedDayIds] = useState<string[]>(() => mealPlan.map(d => d.id));
  
  // Search filter
  const [searchFilter, setSearchFilter] = useState('');
  
  // Checked item IDs state
  const [checkedItemIds, setCheckedItemIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Custom user items added
  const [customItems, setCustomItems] = useState<ShoppingItem[]>(() => {
    try {
      const saved = localStorage.getItem(CUSTOM_ITEMS_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // New custom item form input state
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('produce');
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Copy feedback state
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Category collapsed state
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Persist checked items
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(checkedItemIds));
    } catch (e) {
      console.error("Failed to save shopping checks", e);
    }
  }, [checkedItemIds]);

  // Persist custom items
  useEffect(() => {
    try {
      localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(customItems));
    } catch (e) {
      console.error("Failed to save custom shopping items", e);
    }
  }, [customItems]);

  // Aggregate ingredients from meal plan based on selected days
  const aggregatedItems = useMemo(() => {
    const itemMap = new Map<string, ShoppingItem>();

    mealPlan.forEach(dayPlan => {
      if (!selectedDayIds.includes(dayPlan.id)) return;

      Object.entries(dayPlan.meals).forEach(([mealType, meal]) => {
        meal.recipe.ingredients.forEach(ingredientStr => {
          // Normalize text key for grouping identical ingredients
          const cleanKey = ingredientStr.trim().toLowerCase();
          const existing = itemMap.get(cleanKey);

          if (existing) {
            if (!existing.days.includes(dayPlan.day)) {
              existing.days.push(dayPlan.day);
            }
            if (!existing.meals.includes(mealType)) {
              existing.meals.push(mealType);
            }
          } else {
            const category = categorizeIngredient(ingredientStr);
            const id = `recipe-item-${cleanKey.replace(/[^a-z0-9]/g, '-')}`;
            itemMap.set(cleanKey, {
              id,
              name: ingredientStr,
              originalText: ingredientStr,
              category,
              days: [dayPlan.day],
              meals: [mealType],
              checked: !!checkedItemIds[id]
            });
          }
        });
      });
    });

    // Combine with custom items
    const combined = Array.from(itemMap.values());
    customItems.forEach(custom => {
      combined.push({
        ...custom,
        checked: !!checkedItemIds[custom.id]
      });
    });

    return combined;
  }, [mealPlan, selectedDayIds, checkedItemIds, customItems]);

  // Filter items by search text
  const filteredItems = useMemo(() => {
    if (!searchFilter.trim()) return aggregatedItems;
    const q = searchFilter.toLowerCase().trim();
    return aggregatedItems.filter(item => 
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      item.days.some(d => d.toLowerCase().includes(q))
    );
  }, [aggregatedItems, searchFilter]);

  // Group filtered items by category
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {
      produce: [],
      meat_seafood: [],
      dairy_plant_protein: [],
      grains_pantry: [],
      canned_seasoning: [],
      other: []
    };

    filteredItems.forEach(item => {
      if (groups[item.category]) {
        groups[item.category].push(item);
      } else {
        groups.other.push(item);
      }
    });

    return groups;
  }, [filteredItems]);

  // Progress metrics
  const totalCount = aggregatedItems.length;
  const checkedCount = aggregatedItems.filter(i => checkedItemIds[i.id]).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  // Toggle item checked state
  const handleToggleItem = (id: string) => {
    setCheckedItemIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Toggle all items in a category
  const handleToggleCategory = (categoryKey: string, checkAll: boolean) => {
    const itemsInCat = groupedByCategory[categoryKey] || [];
    setCheckedItemIds(prev => {
      const next = { ...prev };
      itemsInCat.forEach(item => {
        next[item.id] = checkAll;
      });
      return next;
    });
  };

  // Reset all checks
  const handleResetAllChecks = () => {
    setCheckedItemIds({});
  };

  // Add custom item
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const id = `custom-${Date.now()}`;
    const newItem: ShoppingItem = {
      id,
      name: newItemText.trim(),
      originalText: newItemText.trim(),
      category: newItemCategory,
      days: ['Extra'],
      meals: ['Custom'],
      checked: false,
      isCustom: true
    };

    setCustomItems(prev => [newItem, ...prev]);
    setNewItemText('');
    setIsAddFormOpen(false);
  };

  // Delete custom item
  const handleDeleteCustomItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCustomItems(prev => prev.filter(i => i.id !== id));
    setCheckedItemIds(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  // Day filter selection toggle
  const toggleDaySelection = (dayId: string) => {
    setSelectedDayIds(prev => {
      if (prev.includes(dayId)) {
        if (prev.length === 1) return prev; // Keep at least one day
        return prev.filter(id => id !== dayId);
      } else {
        return [...prev, dayId];
      }
    });
  };

  // Select all / none days
  const handleSelectAllDays = () => {
    setSelectedDayIds(mealPlan.map(d => d.id));
  };

  // Toggle category collapse
  const toggleCategoryCollapse = (catId: string) => {
    setCollapsedCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  // Copy shopping list to clipboard
  const handleCopyToClipboard = async () => {
    try {
      let text = `🛒 JEAN'S VITALITY KITCHEN - WEEKLY GROCERY LIST\n`;
      text += `Plan: ${selectedDayIds.length} days selected | ${totalCount} total items\n\n`;

      CATEGORY_DEFINITIONS.forEach(cat => {
        const items = groupedByCategory[cat.id] || [];
        if (items.length > 0) {
          text += `📁 ${cat.name.toUpperCase()} (${items.length})\n`;
          items.forEach(item => {
            const isChecked = checkedItemIds[item.id] ? '[✓]' : '[ ]';
            text += `  ${isChecked} ${item.name}\n`;
          });
          text += `\n`;
        }
      });

      text += `\n👵 Jean's Senior Tip: Check for low-sodium options and buy pre-washed greens for convenient prep!`;

      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  };

  // Print shopping list
  const handlePrint = () => {
    window.print();
  };

  return (
    <section 
      id="shopping-list" 
      aria-label="Weekly Grocery Shopping List" 
      className="space-y-6 scroll-mt-24"
    >
      {/* Header Container */}
      <div className={`p-6 sm:p-8 rounded-3xl backdrop-blur-2xl border transition-all duration-300 shadow-lg ${
        isLight
          ? 'bg-white/95 border-amber-200/90 shadow-[0_10px_35px_rgba(217,119,6,0.07)] ring-1 ring-amber-900/5'
          : 'bg-slate-900/90 border-slate-700/80 shadow-2xl ring-1 ring-white/10'
      }`}>
        
        {/* Title Bar & Quick Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-amber-200/60 dark:border-slate-800">
          <div>
            <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
              <ShoppingCart className="w-4 h-4" />
              <span>Smart Grocery Aggregator</span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${
              isLight ? 'text-stone-900' : 'text-white'
            }`}>
              Weekly Shopping & Ingredient Checklist
            </h2>
            <p className={`text-xs sm:text-sm font-medium mt-1 ${
              isLight ? 'text-stone-600' : 'text-slate-300'
            }`}>
              Automatically compiled from your high-protein menu. Check off items as you shop in the aisles.
            </p>
          </div>

          {/* Action Buttons: Copy, Print, Reset, Add Custom */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Copy Button */}
            <button
              type="button"
              id="btn-copy-shopping-list"
              onClick={handleCopyToClipboard}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border shadow-2xs ${
                copyFeedback
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : isLight
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300/80'
                    : 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border-amber-800'
              }`}
              title="Copy formatted grocery list to clipboard"
            >
              {copyFeedback ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copyFeedback ? 'List Copied!' : 'Copy List'}</span>
            </button>

            {/* Print Button */}
            <button
              type="button"
              id="btn-print-shopping-list"
              onClick={handlePrint}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                isLight
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Print clean shopping checklist"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>

            {/* Add Custom Item Toggle */}
            <button
              type="button"
              id="btn-toggle-add-custom-item"
              onClick={() => setIsAddFormOpen(prev => !prev)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                isAddFormOpen
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                  : isLight
                    ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>Add Item</span>
            </button>

            {/* Reset Checks */}
            {checkedCount > 0 && (
              <button
                type="button"
                id="btn-reset-checks"
                onClick={handleResetAllChecks}
                className={`inline-flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-medium transition-all active:scale-95 text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-white`}
                title="Uncheck all items"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1" />
                <span>Reset ({checkedCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Summary Stats */}
        <div className="pt-5 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm font-bold">
            <div className="flex items-center space-x-2">
              <span className={isLight ? 'text-stone-800' : 'text-slate-200'}>
                Shopping Progress:
              </span>
              <span className="text-amber-600 dark:text-amber-400 font-black">
                {checkedCount} of {totalCount} items purchased ({progressPercent}%)
              </span>
            </div>

            {progressPercent === 100 && totalCount > 0 && (
              <span className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All ingredients gathered! Ready to cook.</span>
              </span>
            )}
          </div>

          {/* Progress Bar Track */}
          <div className="h-3 w-full rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-stone-300/60 dark:border-slate-700">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Day Selector Pill Filter */}
        <div className="pt-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-stone-700' : 'text-slate-300'}`}>
              Filter by Meal Plan Days:
            </span>
            <button
              type="button"
              onClick={handleSelectAllDays}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
            >
              Select All 7 Days
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {mealPlan.map(dayPlan => {
              const isSelected = selectedDayIds.includes(dayPlan.id);
              return (
                <button
                  key={dayPlan.id}
                  type="button"
                  onClick={() => toggleDaySelection(dayPlan.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                      : isLight
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                  aria-pressed={isSelected}
                >
                  {dayPlan.day}
                </button>
              );
            })}
          </div>
        </div>

        {/* Search within ingredients & Add Custom Item Form */}
        <div className="pt-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              id="shopping-search-input"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search ingredient, aisle, or day (e.g. berries, salmon, quinoa)..."
              className={`w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm font-medium border transition-all focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                isLight
                  ? 'bg-stone-50/80 border-stone-300 text-stone-900 placeholder:text-stone-400'
                  : 'bg-slate-800/80 border-slate-700 text-white placeholder:text-slate-500'
              }`}
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-500 hover:text-stone-800 dark:text-slate-400 dark:hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Collapsible Add Custom Item Form */}
          {isAddFormOpen && (
            <form 
              onSubmit={handleAddCustomItem}
              className={`p-4 rounded-2xl border space-y-3 animate-in fade-in transition-all ${
                isLight ? 'bg-amber-50/70 border-amber-200' : 'bg-slate-800 border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <h4 className={`text-xs font-black uppercase tracking-wider ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>
                  Add Extra Grocery Item to Checklist
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddFormOpen(false)}
                  className="text-xs font-bold text-stone-500 hover:text-stone-800 dark:text-slate-400"
                >
                  Cancel
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  id="custom-item-name"
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  placeholder="e.g., Earl Grey tea, Olive oil refill, Multi-vitamins..."
                  className={`flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                    isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                  autoFocus
                />

                <select
                  id="custom-item-category"
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border focus:outline-hidden focus:ring-2 focus:ring-amber-500 ${
                    isLight ? 'bg-white border-stone-300 text-stone-900' : 'bg-slate-900 border-slate-700 text-white'
                  }`}
                >
                  {CATEGORY_DEFINITIONS.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>

                <button
                  type="submit"
                  disabled={!newItemText.trim()}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white shadow-md shadow-amber-600/20 active:scale-95 transition-all shrink-0"
                >
                  Add Item
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Categorized Ingredient Aisle Cards */}
      <div className="space-y-5">
        {CATEGORY_DEFINITIONS.map(category => {
          const items = groupedByCategory[category.id] || [];
          if (items.length === 0) return null;

          const checkedInCat = items.filter(i => checkedItemIds[i.id]).length;
          const isAllChecked = items.length > 0 && checkedInCat === items.length;
          const isCollapsed = collapsedCategories[category.id] || false;
          const Icon = category.icon;

          return (
            <div
              key={category.id}
              id={`shopping-category-${category.id}`}
              className={`rounded-3xl overflow-hidden backdrop-blur-2xl border transition-all duration-200 shadow-md ${
                isLight
                  ? 'bg-white/95 border-amber-200/90 shadow-[0_6px_25px_rgba(217,119,6,0.05)] ring-1 ring-amber-900/5'
                  : 'bg-slate-900/90 border-slate-700/80 shadow-xl ring-1 ring-white/10'
              }`}
            >
              {/* Category Header Bar */}
              <div 
                className={`p-4 sm:p-5 flex items-center justify-between cursor-pointer select-none transition-colors border-b ${
                  isLight ? 'border-amber-200/60 hover:bg-amber-50/50' : 'border-slate-800 hover:bg-slate-800/50'
                }`}
                onClick={() => toggleCategoryCollapse(category.id)}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2.5 rounded-2xl border shadow-2xs ${category.bg}`}>
                    <Icon className={`w-5 h-5 ${category.color}`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className={`text-base sm:text-lg font-black tracking-tight ${
                        isLight ? 'text-stone-900' : 'text-white'
                      }`}>
                        {category.name}
                      </h3>
                      <span className={`text-xs font-black px-2 py-0.5 rounded-full border ${
                        isAllChecked
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-200 dark:border-emerald-800'
                          : isLight
                            ? 'bg-stone-100 text-stone-800 border-stone-200'
                            : 'bg-slate-800 text-slate-300 border-slate-700'
                      }`}>
                        {checkedInCat}/{items.length}
                      </span>
                    </div>
                    <span className={`text-xs font-medium ${isLight ? 'text-stone-500' : 'text-slate-400'}`}>
                      {items.length === 1 ? '1 item' : `${items.length} items`} in this section
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  {/* Category Bulk Check Toggle */}
                  <button
                    type="button"
                    onClick={() => handleToggleCategory(category.id, !isAllChecked)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                      isAllChecked
                        ? 'bg-stone-100 hover:bg-stone-200 text-stone-700 border-stone-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                        : isLight
                          ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                          : 'bg-amber-950 hover:bg-amber-900 text-amber-200 border-amber-800'
                    }`}
                  >
                    {isAllChecked ? 'Uncheck All' : 'Check All'}
                  </button>

                  <button
                    type="button"
                    onClick={() => toggleCategoryCollapse(category.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white"
                    aria-label={isCollapsed ? "Expand category" : "Collapse category"}
                  >
                    {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Items List */}
              {!isCollapsed && (
                <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((item) => {
                    const isChecked = checkedItemIds[item.id] || false;

                    return (
                      <div
                        key={item.id}
                        id={`item-${item.id}`}
                        onClick={() => handleToggleItem(item.id)}
                        className={`group p-3.5 rounded-2xl border transition-all duration-150 flex items-start justify-between gap-3 cursor-pointer select-none ${
                          isChecked
                            ? isLight
                              ? 'bg-stone-100/70 border-stone-200 opacity-60'
                              : 'bg-slate-800/40 border-slate-800 opacity-50'
                            : isLight
                              ? 'bg-amber-50/40 hover:bg-white border-amber-200/70 hover:border-amber-400 hover:shadow-sm'
                              : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 hover:border-amber-500/50 hover:shadow-md'
                        }`}
                        role="checkbox"
                        aria-checked={isChecked}
                      >
                        <div className="flex items-start space-x-3">
                          {/* Checkbox Icon */}
                          <div className="pt-0.5 shrink-0">
                            {isChecked ? (
                              <div className="w-5 h-5 rounded-lg bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </div>
                            ) : (
                              <div className={`w-5 h-5 rounded-lg border-2 transition-colors ${
                                isLight 
                                  ? 'border-stone-300 group-hover:border-amber-500 bg-white' 
                                  : 'border-slate-600 group-hover:border-amber-400 bg-slate-900'
                              }`} />
                            )}
                          </div>

                          {/* Ingredient Text & Day Tags */}
                          <div>
                            <span className={`text-xs sm:text-sm font-bold block leading-snug transition-all ${
                              isChecked
                                ? 'line-through text-stone-400 dark:text-slate-500 font-medium'
                                : isLight ? 'text-stone-900' : 'text-white'
                            }`}>
                              {item.name}
                            </span>

                            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                              {item.days.map((d, idx) => (
                                <span 
                                  key={idx}
                                  className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                                    isLight
                                      ? 'bg-stone-100 text-stone-600 border-stone-200'
                                      : 'bg-slate-800 text-slate-400 border-slate-700'
                                  }`}
                                >
                                  {d}
                                </span>
                              ))}

                              {item.isCustom && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800">
                                  Custom Item
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Delete button for custom items */}
                        {item.isCustom && (
                          <button
                            type="button"
                            onClick={(e) => handleDeleteCustomItem(item.id, e)}
                            className="p-1 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors shrink-0"
                            title="Delete custom item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Senior Grocery Shopping Wisdom Callout */}
      <div className={`rounded-3xl p-6 sm:p-7 backdrop-blur-2xl border transition-all shadow-md ${
        isLight
          ? 'bg-amber-50/80 border-amber-200/90 text-stone-800'
          : 'bg-slate-900/80 border-slate-700/80 text-slate-200'
      }`}>
        <div className="flex items-start space-x-3.5">
          <div className="p-2.5 rounded-2xl bg-amber-500 text-white shrink-0 shadow-xs">
            <Heart className="w-5 h-5" />
          </div>
          <div className="space-y-2">
            <h4 className={`text-base font-black tracking-tight ${isLight ? 'text-amber-950' : 'text-amber-200'}`}>
              Jean's Senior Grocery Shopping Guide
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-amber-200' : 'bg-slate-800/70 border-slate-700'}`}>
                <strong className="block text-amber-700 dark:text-amber-400 mb-0.5">1. Pre-cut Convenience</strong>
                Buy pre-washed spinach, broccoli florets, and pre-sliced mushrooms to minimize kitchen knife fatigue.
              </div>
              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-amber-200' : 'bg-slate-800/70 border-slate-700'}`}>
                <strong className="block text-amber-700 dark:text-amber-400 mb-0.5">2. Low Sodium Labels</strong>
                Always look for "No Salt Added" on canned lentils, chickpeas, and chicken broths to keep blood pressure safe.
              </div>
              <div className={`p-3 rounded-xl border ${isLight ? 'bg-white/80 border-amber-200' : 'bg-slate-800/70 border-slate-700'}`}>
                <strong className="block text-amber-700 dark:text-amber-400 mb-0.5">3. Frozen Berries Value</strong>
                Frozen organic berries retain 100% of their antioxidants, last longer, and blend wonderfully in Greek yogurt.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ShoppingList;

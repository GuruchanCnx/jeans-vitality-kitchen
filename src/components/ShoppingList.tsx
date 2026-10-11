import React, { useState, useMemo, useEffect } from 'react';
import { 
  ShoppingCart, CheckCircle2, Circle, Copy, Printer, RotateCcw, 
  Plus, Trash2, Search, Filter, Sparkles, Check, ChevronDown, ChevronUp,
  Apple, Fish, Egg, Wheat, Package, Heart, AlertCircle, Info, Calendar, Download,
  Bell, BellRing, BellOff, X, Users, Minus
} from 'lucide-react';
import { scaleIngredient } from '../utils/servings';

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
  servingsInfo?: string;
}

export interface ShoppingListProps {
  mealPlan: DayMealPlan[];
  theme?: string;
  servingSizes?: Record<string, number>;
  onUpdateServingSize?: (recipeKey: string, newServings: number) => void;
  onResetServingSizes?: () => void;
  onSetGlobalServingSize?: (servings: number) => void;
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
  theme = 'light',
  servingSizes = {},
  onUpdateServingSize,
  onResetServingSizes,
  onSetGlobalServingSize
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

  // Export Formatted Text Summary Modal state
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [exportCopied, setExportCopied] = useState(false);

  // Dedicated Senior Print-Friendly View Modal state
  const [isPrintViewOpen, setIsPrintViewOpen] = useState(false);
  const [printFontSize, setPrintFontSize] = useState<'normal' | 'large' | 'xlarge'>('large');
  const [printFilterMode, setPrintFilterMode] = useState<'all' | 'unpurchased'>('all');
  const [printIncludeNotesLines, setPrintIncludeNotesLines] = useState(true);

  // Category collapsed state
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Browser Push Notification Reminder State
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [reminderConfig, setReminderConfig] = useState<{
    enabled: boolean;
    dayOfWeek: string;
    time: string;
    lastNotifiedDate: string;
  }>(() => {
    try {
      const saved = localStorage.getItem('jeans_shopping_reminder_config');
      return saved ? JSON.parse(saved) : {
        enabled: false,
        dayOfWeek: 'sunday',
        time: '09:00',
        lastNotifiedDate: ''
      };
    } catch {
      return {
        enabled: false,
        dayOfWeek: 'sunday',
        time: '09:00',
        lastNotifiedDate: ''
      };
    }
  });

  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission;
    }
    return 'default';
  });

  // Request browser notification permission
  const requestNotificationAccess = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("Browser push notifications are not supported in your current browser.");
      return;
    }
    try {
      const perm = await Notification.requestPermission();
      setNotificationPermission(perm);
      if (perm === 'granted') {
        setReminderConfig(prev => ({ ...prev, enabled: true }));
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
    }
  };

  // Toggle Reminder
  const handleToggleReminderEnabled = async () => {
    if (!reminderConfig.enabled) {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        setNotificationPermission(perm);
        if (perm !== 'granted') {
          return;
        }
      }
      setReminderConfig(prev => ({ ...prev, enabled: true }));
    } else {
      setReminderConfig(prev => ({ ...prev, enabled: false }));
    }
  };

  // Send Test Browser Notification
  const handleSendTestNotification = () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert("Browser push notifications are not supported by this browser.");
      return;
    }

    if (Notification.permission === 'granted') {
      try {
        new Notification("Jean's Vitality Kitchen: Shopping Reminder", {
          body: "Friendly reminder to check your grocery list! Your high-protein meal plan ingredients are ready for your weekly trip.",
          icon: '/favicon.ico'
        });
        setTestNotificationSent(true);
        setTimeout(() => setTestNotificationSent(false), 3500);
      } catch (e) {
        console.error("Error sending test notification:", e);
      }
    } else {
      requestNotificationAccess();
    }
  };

  // Scheduled Reminder Check
  useEffect(() => {
    if (!reminderConfig.enabled) return;

    const checkReminder = () => {
      if (typeof window === 'undefined' || !('Notification' in window)) return;
      if (Notification.permission !== 'granted') return;

      const now = new Date();
      const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const currentDayName = days[now.getDay()];
      const todayStr = now.toISOString().split('T')[0];

      if (currentDayName === reminderConfig.dayOfWeek.toLowerCase() && reminderConfig.lastNotifiedDate !== todayStr) {
        try {
          new Notification("Jean's Vitality Kitchen: Shopping List Reminder", {
            body: `Today is your scheduled grocery day (${currentDayName.toUpperCase()})! Check off your ingredients to prepare for your active senior vitality meal plan.`,
            icon: '/favicon.ico'
          });
          setReminderConfig(prev => {
            const updated = { ...prev, lastNotifiedDate: todayStr };
            try {
              localStorage.setItem('jeans_shopping_reminder_config', JSON.stringify(updated));
            } catch (e) {
              console.error("Failed to save reminder config", e);
            }
            return updated;
          });
        } catch (e) {
          console.error("Error dispatching scheduled notification:", e);
        }
      }
    };

    checkReminder();
    const interval = setInterval(checkReminder, 60000);
    return () => clearInterval(interval);
  }, [reminderConfig]);

  // Persist reminder config
  useEffect(() => {
    try {
      localStorage.setItem('jeans_shopping_reminder_config', JSON.stringify(reminderConfig));
    } catch (e) {
      console.error("Failed to save reminder config", e);
    }
  }, [reminderConfig]);

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

  // Aggregate ingredients from meal plan based on selected days and serving sizes
  const aggregatedItems = useMemo(() => {
    const itemMap = new Map<string, ShoppingItem>();

    mealPlan.forEach(dayPlan => {
      if (!selectedDayIds.includes(dayPlan.id)) return;

      Object.entries(dayPlan.meals).forEach(([mealType, meal]) => {
        const mealKey = `${dayPlan.id}-${mealType}`;
        const servings = (servingSizes && servingSizes[mealKey]) || 1;

        meal.recipe.ingredients.forEach(ingredientStr => {
          // Scale ingredient by serving multiplier
          const scaledText = scaleIngredient(ingredientStr, servings);
          const cleanKey = scaledText.trim().toLowerCase();
          const existing = itemMap.get(cleanKey);

          const servingsTag = servings > 1 ? `${servings}x (${dayPlan.day} ${mealType})` : null;

          if (existing) {
            if (!existing.days.includes(dayPlan.day)) {
              existing.days.push(dayPlan.day);
            }
            if (!existing.meals.includes(mealType)) {
              existing.meals.push(mealType);
            }
            if (servingsTag && (!existing.servingsInfo || !existing.servingsInfo.includes(servingsTag))) {
              existing.servingsInfo = existing.servingsInfo ? `${existing.servingsInfo}, ${servingsTag}` : servingsTag;
            }
          } else {
            const category = categorizeIngredient(ingredientStr);
            const id = `recipe-item-${cleanKey.replace(/[^a-z0-9]/g, '-')}`;
            itemMap.set(cleanKey, {
              id,
              name: scaledText,
              originalText: ingredientStr,
              category,
              days: [dayPlan.day],
              meals: [mealType],
              checked: !!checkedItemIds[id],
              servingsInfo: servingsTag || undefined
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
  }, [mealPlan, selectedDayIds, checkedItemIds, customItems, servingSizes]);

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

  // Generate formatted text summary for easier printing / export
  const generateFormattedSummary = () => {
    const today = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    let text = `==========================================================\n`;
    text += `   JEAN'S VITALITY KITCHEN — WEEKLY GROCERY & PREP LIST   \n`;
    text += `==========================================================\n`;
    text += `Date Generated: ${today}\n`;
    text += `Meal Plan Coverage: ${selectedDayIds.length} Days (${selectedDayIds.map(d => d.toUpperCase()).join(', ')})\n`;
    text += `Total Ingredients: ${totalCount} | Purchased: ${checkedCount} | Remaining: ${totalCount - checkedCount}\n`;
    text += `Progress: ${progressPercent}% Complete\n`;
    text += `==========================================================\n\n`;

    CATEGORY_DEFINITIONS.forEach(cat => {
      const items = groupedByCategory[cat.id] || [];
      if (items.length > 0) {
        text += `[ ${cat.name.toUpperCase()} ] (${items.length} items)\n`;
        text += `----------------------------------------------------------\n`;
        items.forEach(item => {
          const checkMark = checkedItemIds[item.id] ? '[X]' : '[ ]';
          const namePadded = item.name.padEnd(36, ' ');
          text += `  ${checkMark} ${namePadded} [${item.days.join(', ')}]\n`;
        });
        text += `\n`;
      }
    });

    text += `==========================================================\n`;
    text += `SENIOR NUTRITION & SHOPPING TIPS:\n`;
    text += `• Opt for low-sodium or no-salt-added canned beans and broths.\n`;
    text += `• Choose pre-cut produce or pre-washed greens to reduce kitchen strain.\n`;
    text += `• Ensure each meal hits the 25-30g protein threshold for muscle preservation.\n`;
    text += `• Stay hydrated! Drink water while shopping and cooking.\n`;
    text += `==========================================================\n`;
    return text;
  };

  // Download formatted text summary as a .txt file
  const handleDownloadSummary = () => {
    const text = generateFormattedSummary();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `jeans-vitality-grocery-list-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyExportSummary = async () => {
    const text = generateFormattedSummary();
    try {
      await navigator.clipboard.writeText(text);
      setExportCopied(true);
      setTimeout(() => setExportCopied(false), 2500);
    } catch {
      console.warn("Could not copy export summary to clipboard");
    }
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

            {/* Dedicated Senior Print-Friendly View Button */}
            <button
              type="button"
              id="btn-print-friendly-view"
              onClick={() => setIsPrintViewOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border shadow-sm bg-amber-600 hover:bg-amber-700 text-white border-amber-600"
              title="Open senior-optimized printable grocery checklist for the store"
            >
              <Printer className="w-4 h-4 text-white" />
              <span>Print-Friendly View</span>
            </button>

            {/* Quick Print Button */}
            <button
              type="button"
              id="btn-print-shopping-list"
              onClick={handlePrint}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                isLight
                  ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border-stone-300'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Quick browser print of shopping list"
            >
              <Printer className="w-4 h-4" />
              <span>Quick Print</span>
            </button>

            {/* Export Formatted Text Summary Button */}
            <button
              type="button"
              id="btn-export-text-summary"
              onClick={() => setIsExportModalOpen(true)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                isLight
                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                  : 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border-amber-800'
              }`}
              title="Export formatted text summary for easier printing"
            >
              <Download className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>Export Summary</span>
            </button>

            {/* Weekly Browser Push Notification Reminder Trigger */}
            <button
              type="button"
              id="btn-shopping-reminder"
              onClick={() => setIsReminderModalOpen(true)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                reminderConfig.enabled
                  ? 'bg-amber-600 text-white border-amber-600 shadow-sm ring-2 ring-amber-500/30'
                  : isLight
                    ? 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200 shadow-2xs'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Configure weekly browser push notification reminder"
            >
              {reminderConfig.enabled ? (
                <BellRing className="w-4 h-4 text-white animate-pulse" />
              ) : (
                <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              )}
              <span>{reminderConfig.enabled ? `Remind: ${reminderConfig.dayOfWeek.slice(0, 3).toUpperCase()}` : 'Reminders'}</span>
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
          <div className="h-3.5 w-full rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden p-0.5 border border-stone-300/80 dark:border-slate-700">
            <div 
              className="h-full rounded-full transition-all duration-300 shadow-xs"
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: progressPercent === 100 ? '#059669' : '#d97706',
                backgroundImage: 'linear-gradient(to right, #d97706, #ea580c, #059669)'
              }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 dark:text-slate-400">
            <span>{totalCount - checkedCount} items left to pick up</span>
            <span>{progressPercent < 50 ? 'Getting started' : progressPercent < 100 ? 'Halfway there! Keep going' : 'All items checked! Great job'}</span>
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

          {/* Recipe Servings Multiplier & Quick Recalculator Banner */}
          <div className="mt-3 p-3 rounded-2xl bg-amber-50/80 dark:bg-slate-800/60 border border-amber-200/70 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black block leading-none">
                  Recipe Servings Synchronization
                </span>
                <span className="text-[11px] text-stone-500 dark:text-slate-400">
                  Ingredients automatically recalculate based on the serving sizes selected on your recipe cards
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-start sm:self-auto">
              <button
                type="button"
                id="btn-shopping-reset-servings"
                onClick={() => onResetServingSizes?.()}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                  Object.keys(servingSizes).length === 0 || Object.values(servingSizes).every(v => v === 1)
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : isLight
                      ? 'bg-white hover:bg-amber-100 text-stone-700 border-stone-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                }`}
                title="Reset all recipe ingredients to 1 standard portion"
              >
                1 Portion (Standard)
              </button>

              <button
                type="button"
                id="btn-shopping-double-servings"
                onClick={() => onSetGlobalServingSize?.(2)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all active:scale-95 ${
                  Object.keys(servingSizes).length > 0 && Object.values(servingSizes).every(v => v === 2)
                    ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                    : isLight
                      ? 'bg-white hover:bg-amber-100 text-stone-700 border-stone-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-600'
                }`}
                title="Double all recipe ingredients for 2 people"
              >
                Double All (2x Portions)
              </button>
            </div>
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
                              {item.servingsInfo && (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center space-x-1">
                                  <Users className="w-2.5 h-2.5" />
                                  <span>{item.servingsInfo}</span>
                                </span>
                              )}
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

      {/* Browser Push Notification Reminder Modal Dialog */}
      {isReminderModalOpen && (
        <div 
          id="shopping-reminder-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="reminder-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md transition-all animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsReminderModalOpen(false);
          }}
        >
          <div 
            id="shopping-reminder-modal-content"
            className={`relative w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border p-6 space-y-5 transition-all ${
              isLight ? 'bg-white text-stone-900 border-amber-200' : 'bg-slate-900 text-white border-slate-700'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-xs">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 id="reminder-modal-title" className="text-lg sm:text-xl font-black tracking-tight">
                    Weekly Grocery Reminder
                  </h3>
                  <p className="text-xs font-medium text-stone-500 dark:text-slate-400">
                    Browser push alert to review your high-protein list
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReminderModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 active:scale-95"
                aria-label="Close reminder modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Permission status callout */}
            <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
              notificationPermission === 'granted'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                : notificationPermission === 'denied'
                  ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200'
            }`}>
              <div className="flex items-center space-x-2">
                <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  notificationPermission === 'granted' ? 'bg-emerald-500' : notificationPermission === 'denied' ? 'bg-rose-500' : 'bg-amber-500'
                }`} />
                <span className="font-bold">
                  {notificationPermission === 'granted'
                    ? 'Browser Notifications Enabled'
                    : notificationPermission === 'denied'
                      ? 'Permission Denied in Browser'
                      : 'Permission Setup Needed'}
                </span>
              </div>
              {notificationPermission !== 'granted' && (
                <button
                  type="button"
                  onClick={requestNotificationAccess}
                  className="px-3 py-1 rounded-lg text-xs font-black bg-amber-600 hover:bg-amber-700 text-white active:scale-95 transition-all"
                >
                  Allow
                </button>
              )}
            </div>

            {/* Configuration Options */}
            <div className="space-y-4">
              {/* Enable Toggle Switch */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-800/40">
                <div>
                  <span className="font-extrabold text-sm block">Enable Weekly Reminder</span>
                  <span className="text-xs text-stone-500 dark:text-slate-400">Dispatches notification on selected day</span>
                </div>
                <button
                  type="button"
                  onClick={handleToggleReminderEnabled}
                  className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                    reminderConfig.enabled ? 'bg-emerald-500' : 'bg-stone-300 dark:bg-slate-600'
                  }`}
                  aria-pressed={reminderConfig.enabled}
                  aria-label="Toggle weekly reminder"
                >
                  <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    reminderConfig.enabled ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Day of Week Selector */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-stone-700 dark:text-slate-300">
                  Select Reminder Day:
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {[
                    { id: 'sunday', label: 'Sun' },
                    { id: 'monday', label: 'Mon' },
                    { id: 'tuesday', label: 'Tue' },
                    { id: 'wednesday', label: 'Wed' },
                    { id: 'thursday', label: 'Thu' },
                    { id: 'friday', label: 'Fri' },
                    { id: 'saturday', label: 'Sat' }
                  ].map(day => (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => setReminderConfig(prev => ({ ...prev, dayOfWeek: day.id }))}
                      className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                        reminderConfig.dayOfWeek === day.id
                          ? 'bg-amber-600 text-white border-amber-600 shadow-2xs'
                          : isLight
                            ? 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                      }`}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Information Note for Seniors */}
              <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-slate-800/60 border border-amber-200/60 dark:border-slate-700 text-[11px] leading-relaxed text-stone-600 dark:text-slate-300">
                <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 inline mr-1 -mt-0.5" />
                This reminder ensures you review your active meal plan items before visiting the grocery store or placing your online grocery order.
              </div>

              {/* Test Button & Save Actions */}
              <div className="pt-3 border-t border-stone-200 dark:border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleSendTestNotification}
                  className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-stone-100 hover:bg-stone-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-800 dark:text-slate-200 border border-stone-300 dark:border-slate-700 transition-all active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{testNotificationSent ? 'Sent!' : 'Test Notification'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsReminderModalOpen(false)}
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm active:scale-95 transition-all"
                >
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Export Formatted Text Summary Modal for Easy Printing */}
      {isExportModalOpen && (
        <div 
          id="export-summary-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="export-summary-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsExportModalOpen(false);
          }}
        >
          <div 
            className={`relative w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[90vh] transition-all duration-300 ${
              isLight 
                ? 'bg-white text-stone-900 border-amber-300 shadow-[0_20px_60px_rgba(217,119,6,0.15)]' 
                : 'bg-slate-900 text-white border-slate-700 shadow-2xl'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 p-5 sm:p-6 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                  <Download className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 id="export-summary-title" className="text-xl sm:text-2xl font-black tracking-tight">
                    Export Formatted Text Summary
                  </h3>
                  <p className="text-xs sm:text-sm font-medium text-amber-100">
                    Clean, high-contrast text ready for home printing or saving
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="close-export-modal-btn"
                onClick={() => setIsExportModalOpen(false)}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 text-white transition-all active:scale-95"
                aria-label="Close export summary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Text Area Preview */}
            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
              <div className="flex items-center justify-between text-xs font-bold text-stone-600 dark:text-slate-300">
                <span>Text Summary Preview (Fixed Width / Monospace)</span>
                <span>{totalCount} Total Items • {selectedDayIds.length} Days</span>
              </div>

              <div className="p-4 rounded-2xl bg-stone-100 dark:bg-slate-950 border border-stone-300 dark:border-slate-800 font-mono text-xs sm:text-sm leading-relaxed overflow-x-auto max-h-96 whitespace-pre text-stone-900 dark:text-amber-100">
                {generateFormattedSummary()}
              </div>

              <p className="text-xs text-stone-500 dark:text-slate-400">
                Tip: You can directly print this summary, copy the text to your clipboard for texting/emailing, or download it as a plain text file (.txt).
              </p>
            </div>

            {/* Modal Footer Actions */}
            <div className="p-4 sm:p-5 bg-stone-50 dark:bg-slate-950 border-t border-amber-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-copy-export-modal"
                  onClick={handleCopyExportSummary}
                  className={`inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-black border transition-all active:scale-95 ${
                    exportCopied
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-stone-200 hover:bg-stone-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-900 dark:text-white border-stone-300 dark:border-slate-700'
                  }`}
                >
                  {exportCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{exportCopied ? 'Summary Copied!' : 'Copy Summary'}</span>
                </button>

                <button
                  type="button"
                  id="btn-download-txt-file"
                  onClick={handleDownloadSummary}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-stone-200 hover:bg-stone-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-stone-900 dark:text-white border border-stone-300 dark:border-slate-700 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .txt</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="btn-print-export-modal"
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 px-5 py-2.5 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-md transition-all active:scale-95"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsExportModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-stone-600 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          Senior Print-Friendly Grocery Checklist Modal / Printable View
          ===================================================================== */}
      {isPrintViewOpen && (
        <div 
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-2 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="print-view-title"
        >
          <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-stone-300 overflow-hidden my-4 text-stone-950">
            {/* Top Interactive Controls Toolbar (Hidden when actually printing via .print-hide) */}
            <div className="print-hide sticky top-0 z-10 bg-amber-500 text-stone-950 p-4 sm:p-5 border-b border-amber-600 shadow-md flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-stone-900 text-amber-400 rounded-xl shadow-xs">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 id="print-view-title" className="text-lg font-black tracking-tight text-stone-950">
                    Senior Print-Friendly Grocery Checklist
                  </h3>
                  <p className="text-xs font-semibold text-amber-950">
                    High-contrast layout formatted for ink-saving paper printout & grocery store trip.
                  </p>
                </div>
              </div>

              {/* Print Controls (Font Size, Filter Mode, Print, Close) */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Font Size Selector for Senior Eyes */}
                <div className="flex items-center bg-white/90 rounded-xl p-1 border border-amber-600 text-xs font-bold shadow-2xs">
                  <span className="px-2 text-stone-700 text-[11px] font-black uppercase">Font:</span>
                  <button
                    type="button"
                    onClick={() => setPrintFontSize('normal')}
                    className={`px-2 py-1 rounded-lg transition-all ${
                      printFontSize === 'normal'
                        ? 'bg-amber-600 text-white font-black'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintFontSize('large')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      printFontSize === 'large'
                        ? 'bg-amber-600 text-white font-black'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Large ★
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintFontSize('xlarge')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      printFontSize === 'xlarge'
                        ? 'bg-amber-600 text-white font-black'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Extra Large
                  </button>
                </div>

                {/* Filter Mode Selector */}
                <div className="flex items-center bg-white/90 rounded-xl p-1 border border-amber-600 text-xs font-bold shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setPrintFilterMode('all')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      printFilterMode === 'all'
                        ? 'bg-stone-900 text-white font-black'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    All Items ({totalCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPrintFilterMode('unpurchased')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      printFilterMode === 'unpurchased'
                        ? 'bg-stone-900 text-white font-black'
                        : 'text-stone-700 hover:bg-stone-100'
                    }`}
                  >
                    Unpurchased Only ({totalCount - checkedCount})
                  </button>
                </div>

                {/* Action Buttons */}
                <button
                  type="button"
                  id="btn-trigger-print"
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-black bg-stone-900 hover:bg-black text-white shadow-md active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Print Now</span>
                </button>

                <button
                  type="button"
                  id="btn-close-print-view"
                  onClick={() => setIsPrintViewOpen(false)}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-stone-900 hover:bg-amber-400 transition-all border border-amber-700"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Printable Paper Document Container */}
            <div 
              id="printable-grocery-list" 
              className={`p-6 sm:p-10 bg-white text-stone-950 font-sans space-y-6 printable-area ${
                printFontSize === 'xlarge' ? 'text-lg leading-relaxed' : printFontSize === 'large' ? 'text-base leading-normal' : 'text-sm'
              }`}
            >
              {/* Document Header */}
              <div className="border-b-4 border-stone-900 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-black text-stone-600 block">
                      Jean's Vitality Kitchen • Active Senior Nutrition
                    </span>
                    <h1 className="text-2xl sm:text-3xl font-black text-stone-950 tracking-tight mt-1">
                      Weekly Grocery & Pantry Checklist
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-700 font-semibold mt-1">
                      High-Protein Ingredients for 100g Daily Senior Health Standard
                    </p>
                  </div>
                  <div className="text-right text-xs font-mono font-bold text-stone-700 border border-stone-400 p-2 rounded-lg bg-stone-50 shrink-0">
                    <div>Date: {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div>Days: {selectedDayIds.length} Selected</div>
                    <div>Items: {printFilterMode === 'unpurchased' ? totalCount - checkedCount : totalCount} Total</div>
                  </div>
                </div>

                {/* Legend & Senior Trip Instructions */}
                <div className="mt-3 text-xs bg-stone-100 p-2.5 rounded-lg border border-stone-300 flex flex-wrap items-center justify-between gap-2 font-medium">
                  <span><strong>Store Tip:</strong> Bring a pencil or pen. Use the large square checkboxes as you add items to your grocery cart.</span>
                  <span className="font-bold text-amber-800">Status: {progressPercent}% pre-checked in app</span>
                </div>
              </div>

              {/* Department Checklists */}
              <div className="space-y-6">
                {CATEGORY_DEFINITIONS.map(cat => {
                  const allCatItems = groupedByCategory[cat.id] || [];
                  const displayedItems = printFilterMode === 'unpurchased'
                    ? allCatItems.filter(item => !checkedItemIds[item.id])
                    : allCatItems;

                  if (displayedItems.length === 0) return null;

                  return (
                    <div key={cat.id} className="print-avoid-break border-2 border-stone-800 rounded-xl overflow-hidden print-border">
                      {/* Department Title Bar */}
                      <div className="bg-stone-200 px-4 py-2 border-b-2 border-stone-800 flex items-center justify-between">
                        <div className="flex items-center space-x-2 font-black tracking-wide uppercase text-sm sm:text-base text-stone-950">
                          <span className="text-lg">{cat.icon}</span>
                          <span>{cat.name}</span>
                        </div>
                        <span className="text-xs font-bold text-stone-700 bg-white px-2 py-0.5 rounded border border-stone-400">
                          {displayedItems.length} items
                        </span>
                      </div>

                      {/* Items Grid */}
                      <div className="p-3 sm:p-4 divide-y divide-stone-200">
                        {displayedItems.map(item => {
                          const isDone = checkedItemIds[item.id];
                          return (
                            <div 
                              key={item.id} 
                              className="py-2.5 flex items-center justify-between gap-3 print-avoid-break"
                            >
                              <div className="flex items-center space-x-3.5 min-w-0">
                                {/* Large Tactile Checkbox Square for Physical Pen Checking */}
                                <div className={`w-6 h-6 rounded border-2 shrink-0 flex items-center justify-center font-black print-checkbox-box ${
                                  isDone 
                                    ? 'border-stone-900 bg-stone-100 text-stone-900' 
                                    : 'border-stone-900 bg-white text-transparent'
                                }`}>
                                  {isDone ? '✓' : ''}
                                </div>

                                <div className="min-w-0">
                                  <span className={`font-bold block ${
                                    isDone ? 'line-through text-stone-400' : 'text-stone-950'
                                  }`}>
                                    {item.name}
                                    {item.servingsInfo && (
                                      <span className="text-[11px] font-bold text-amber-800 ml-1.5 inline-block">
                                        [{item.servingsInfo}]
                                      </span>
                                    )}
                                  </span>
                                  {item.days && item.days.length > 0 && (
                                    <span className="text-[11px] font-semibold text-stone-600 block">
                                      For: {item.days.map(d => d.slice(0, 3)).join(', ')}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Aisle / handwritten note space */}
                              <div className="hidden sm:block w-32 shrink-0 border-b border-dotted border-stone-400 text-right text-[11px] text-stone-400 pr-1">
                                aisle / qty
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Blank Ruled Lines for In-Store Handwritten Notes */}
              <div className="print-avoid-break border-2 border-stone-800 rounded-xl p-4 bg-stone-50 print-border space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black uppercase tracking-wider text-stone-900">
                    ✍️ Senior Kitchen Notes & Aisle Reminders
                  </h4>
                  <span className="text-xs text-stone-600 font-medium">Use pen for substitutions & prices</span>
                </div>
                <div className="space-y-3 pt-1">
                  <div className="h-6 border-b border-dashed border-stone-400 print-ruled-line"></div>
                  <div className="h-6 border-b border-dashed border-stone-400 print-ruled-line"></div>
                  <div className="h-6 border-b border-dashed border-stone-400 print-ruled-line"></div>
                </div>
              </div>

              {/* Senior Health & Shopping Nutrition Reminders Footer */}
              <div className="print-avoid-break border-t-2 border-stone-800 pt-4 text-xs text-stone-700 space-y-1">
                <p className="font-bold text-stone-900">👵 Jean's Senior Shopping Advice:</p>
                <ul className="list-disc pl-5 space-y-0.5">
                  <li>Choose low-sodium or no-salt-added beans, broths, and canned tuna to protect blood pressure.</li>
                  <li>Pre-cut butternut squash and pre-washed spinach save joint strain and reduce preparation effort.</li>
                  <li>Check expiration dates carefully on high-protein Greek yogurt, cottage cheese, and eggs.</li>
                  <li>Keep water handy to stay hydrated throughout your shopping trip!</li>
                </ul>
                <div className="text-center font-mono text-[10px] text-stone-500 pt-2">
                  Generated by Jean's Vitality Kitchen • 100g Daily Senior High-Protein Meal Planner
                </div>
              </div>
            </div>

            {/* Modal Bottom Sticky Controls (Hidden on print) */}
            <div className="print-hide bg-stone-100 p-4 border-t border-stone-300 flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-600">
                Tip: Press <kbd className="px-1.5 py-0.5 bg-white border rounded text-[10px] font-mono shadow-2xs">Ctrl + P</kbd> or tap "Print Now" to print.
              </span>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center space-x-1.5 px-5 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-md active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4 text-white" />
                  <span>Print Document</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrintViewOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-700 hover:bg-stone-200 transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default ShoppingList;

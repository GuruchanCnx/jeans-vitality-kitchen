import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  FolderHeart, 
  Check, 
  Trash2, 
  FolderPlus,
  BookMarked,
  ChefHat,
  Sparkles
} from 'lucide-react';
import { 
  RecipeCollection, 
  getSavedCollections, 
  toggleRecipeInCollection, 
  createCustomCollection, 
  deleteCollection 
} from '../utils/collections';

export interface RecipeCollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipeKey?: string; // If provided, allows toggling this recipe in/out of collections
  recipeTitle?: string;
  theme?: string;
  highContrast?: boolean;
  onSelectCollectionFilter?: (collectionId: string) => void;
}

export const RecipeCollectionsModal: React.FC<RecipeCollectionsModalProps> = ({
  isOpen,
  onClose,
  recipeKey,
  recipeTitle,
  theme = 'light',
  highContrast = false,
  onSelectCollectionFilter
}) => {
  const isLight = theme === 'light';
  const [collections, setCollections] = useState<RecipeCollection[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [newColIcon, setNewColIcon] = useState('⭐');

  const ICON_OPTIONS = ['⭐', '☀️', '🍽️', '💪', '⚡', '❤️', '🥗', '🍲', '🥑', '🥞'];

  useEffect(() => {
    if (isOpen) {
      setCollections(getSavedCollections());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleToggle = (colId: string) => {
    if (!recipeKey) {
      if (onSelectCollectionFilter) {
        onSelectCollectionFilter(colId);
        onClose();
      }
      return;
    }
    const { updated } = toggleRecipeInCollection(colId, recipeKey);
    setCollections(updated);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    const updated = createCustomCollection(newColName, newColDesc, newColIcon);
    setCollections(updated);
    setNewColName('');
    setNewColDesc('');
    setIsCreating(false);
  };

  const handleDelete = (colId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this custom collection?")) {
      const updated = deleteCollection(colId);
      setCollections(updated);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="collections-modal-title"
    >
      <div 
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all animate-in fade-in zoom-in-95 duration-200 ${
          highContrast
            ? 'bg-black text-white border-amber-400'
            : isLight
              ? 'bg-white text-stone-900 border-amber-200 shadow-[0_20px_60px_rgba(217,119,6,0.15)]'
              : 'bg-slate-900 text-white border-slate-700'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-200/60 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-sm">
              <FolderHeart className="w-5 h-5" />
            </div>
            <div>
              <h3 id="collections-modal-title" className="text-xl font-black tracking-tight">
                Recipe Collections
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400">
                {recipeKey 
                  ? `Select collections for "${recipeTitle || 'this recipe'}"`
                  : 'Organize and quickly access your preferred senior recipes'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-500 dark:text-slate-400 transition-colors"
            aria-label="Close collections window"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Collections List */}
        <div className="py-4 space-y-2.5 max-h-80 overflow-y-auto pr-1">
          {collections.map((col) => {
            const isIncluded = recipeKey ? col.recipeKeys.includes(recipeKey) : false;

            return (
              <div
                key={col.id}
                onClick={() => handleToggle(col.id)}
                className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-98 select-none ${
                  isIncluded
                    ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500/30'
                    : isLight
                      ? 'bg-stone-50 hover:bg-amber-50/60 border-stone-200'
                      : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700'
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <span className="text-2xl shrink-0">{col.icon}</span>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-black truncate">{col.name}</h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-200 dark:bg-slate-700 text-stone-700 dark:text-slate-300 shrink-0">
                        {col.recipeKeys.length} recipes
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 dark:text-slate-400 truncate mt-0.5">
                      {col.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 shrink-0 ml-2">
                  {recipeKey ? (
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center ${
                      isIncluded 
                        ? 'bg-amber-600 border-amber-600 text-white' 
                        : 'border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                    }`}>
                      {isIncluded && <Check className="w-4 h-4" />}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectCollectionFilter?.(col.id);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-2xs"
                    >
                      View
                    </button>
                  )}

                  {col.isCustom && (
                    <button
                      type="button"
                      onClick={(e) => handleDelete(col.id, e)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 transition-colors"
                      title="Delete custom collection"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Create New Collection Form */}
        {isCreating ? (
          <form onSubmit={handleCreate} className="p-4 rounded-2xl bg-amber-50/80 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 space-y-3 mt-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">
              Create New Custom Recipe Collection
            </h4>

            <div className="flex gap-2">
              {/* Icon Picker */}
              <select
                value={newColIcon}
                onChange={(e) => setNewColIcon(e.target.value)}
                className="px-3 py-2 rounded-xl text-base border bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-600"
              >
                {ICON_OPTIONS.map(icon => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>

              <input
                type="text"
                value={newColName}
                onChange={(e) => setNewColName(e.target.value)}
                placeholder="Collection name (e.g. Weekend Treats, Soup Nights)..."
                className="flex-1 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium border bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                autoFocus
              />
            </div>

            <input
              type="text"
              value={newColDesc}
              onChange={(e) => setNewColDesc(e.target.value)}
              placeholder="Short description (optional)..."
              className="w-full px-3.5 py-2 rounded-xl text-xs font-medium border bg-white dark:bg-slate-900 border-stone-300 dark:border-slate-600 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
            />

            <div className="flex items-center justify-end space-x-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-stone-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-700 text-white shadow-xs"
              >
                Create Collection
              </button>
            </div>
          </form>
        ) : (
          <div className="pt-3 border-t border-amber-200/60 dark:border-slate-800 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIsCreating(true)}
              className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black bg-amber-600 hover:bg-amber-700 text-white shadow-sm active:scale-95 transition-all"
            >
              <FolderPlus className="w-4 h-4" />
              <span>+ Create New Collection</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold border border-stone-300 dark:border-slate-700 hover:bg-stone-100 dark:hover:bg-slate-800 text-stone-800 dark:text-slate-200 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecipeCollectionsModal;

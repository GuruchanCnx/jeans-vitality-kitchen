/**
 * Recipe Collections Utility
 * Allows seniors to categorize, organize, and quickly retrieve their favorite recipes.
 */

export interface RecipeCollection {
  id: string;
  name: string;
  description: string;
  icon: string;
  recipeKeys: string[]; // e.g. ["monday-breakfast", "friday-dinner"]
  isCustom?: boolean;
}

const STORAGE_KEY = 'jeans_vitality_collections';

export const DEFAULT_COLLECTIONS: RecipeCollection[] = [
  {
    id: 'col-breakfast',
    name: 'Breakfast Favorites',
    description: 'Nourishing, energizing morning meals to start the day strong.',
    icon: '☀️',
    recipeKeys: [
      'monday-breakfast',
      'wednesday-breakfast',
      'friday-breakfast',
      'sunday-breakfast'
    ],
    isCustom: false
  },
  {
    id: 'col-dinners',
    name: 'Easy Dinners',
    description: 'Gentle, comforting evening dishes that are simple to prepare and digest.',
    icon: '🍽️',
    recipeKeys: [
      'monday-dinner',
      'tuesday-dinner',
      'wednesday-dinner',
      'friday-dinner'
    ],
    isCustom: false
  },
  {
    id: 'col-protein',
    name: 'High-Protein Superstars',
    description: 'Dishes with 28g+ clean protein to preserve lean muscle and vitality.',
    icon: '💪',
    recipeKeys: [
      'monday-lunch',
      'tuesday-lunch',
      'friday-dinner',
      'saturday-lunch'
    ],
    isCustom: false
  },
  {
    id: 'col-quick',
    name: 'Quick & Simple (≤15 Min)',
    description: 'Fast preparation with minimal stove time and effortless cleanup.',
    icon: '⚡',
    recipeKeys: [
      'monday-breakfast',
      'tuesday-snacks',
      'thursday-lunch',
      'friday-lunch'
    ],
    isCustom: false
  },
  {
    id: 'col-heart',
    name: 'Heart-Healthy Choices',
    description: 'Packed with omega-3s, soluble fiber, and low-sodium senior nutrition.',
    icon: '❤️',
    recipeKeys: [
      'monday-lunch',
      'wednesday-dinner',
      'friday-dinner',
      'sunday-lunch'
    ],
    isCustom: false
  }
];

export function getSavedCollections(): RecipeCollection[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveCollections(DEFAULT_COLLECTIONS);
      return DEFAULT_COLLECTIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      saveCollections(DEFAULT_COLLECTIONS);
      return DEFAULT_COLLECTIONS;
    }
    return parsed;
  } catch (e) {
    console.warn('Could not read saved collections', e);
    return DEFAULT_COLLECTIONS;
  }
}

export function saveCollections(collections: RecipeCollection[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
  } catch (e) {
    console.warn('Could not save collections', e);
  }
}

export function addRecipeToCollection(collectionId: string, recipeKey: string): RecipeCollection[] {
  const current = getSavedCollections();
  const updated = current.map(col => {
    if (col.id === collectionId) {
      if (!col.recipeKeys.includes(recipeKey)) {
        return { ...col, recipeKeys: [...col.recipeKeys, recipeKey] };
      }
    }
    return col;
  });
  saveCollections(updated);
  return updated;
}

export function removeRecipeFromCollection(collectionId: string, recipeKey: string): RecipeCollection[] {
  const current = getSavedCollections();
  const updated = current.map(col => {
    if (col.id === collectionId) {
      return { ...col, recipeKeys: col.recipeKeys.filter(k => k !== recipeKey) };
    }
    return col;
  });
  saveCollections(updated);
  return updated;
}

export function toggleRecipeInCollection(collectionId: string, recipeKey: string): { updated: RecipeCollection[]; added: boolean } {
  const current = getSavedCollections();
  let wasAdded = false;
  const updated = current.map(col => {
    if (col.id === collectionId) {
      const exists = col.recipeKeys.includes(recipeKey);
      wasAdded = !exists;
      return {
        ...col,
        recipeKeys: exists ? col.recipeKeys.filter(k => k !== recipeKey) : [...col.recipeKeys, recipeKey]
      };
    }
    return col;
  });
  saveCollections(updated);
  return { updated, added: wasAdded };
}

export function createCustomCollection(name: string, description = '', icon = '📁'): RecipeCollection[] {
  const current = getSavedCollections();
  const id = `col-${Date.now()}`;
  const newCol: RecipeCollection = {
    id,
    name: name.trim(),
    description: description.trim() || 'Custom senior vitality collection',
    icon,
    recipeKeys: [],
    isCustom: true
  };
  const updated = [...current, newCol];
  saveCollections(updated);
  return updated;
}

export function deleteCollection(collectionId: string): RecipeCollection[] {
  const current = getSavedCollections();
  const updated = current.filter(col => col.id !== collectionId);
  saveCollections(updated);
  return updated;
}

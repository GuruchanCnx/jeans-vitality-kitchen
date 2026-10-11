/**
 * Utility for parsing and scaling recipe ingredient quantities based on serving size.
 * Handles mixed numbers, fractions, decimals, unit pluralization, and aggregations.
 */

// Convert fractional number to a friendly fraction or mixed number string
export function formatQuantity(val: number): string {
  if (val <= 0) return '0';
  
  const epsilon = 0.05;
  const whole = Math.floor(val);
  const frac = val - whole;

  let fracStr = '';
  if (Math.abs(frac - 0.25) < epsilon) fracStr = '1/4';
  else if (Math.abs(frac - 0.333) < epsilon) fracStr = '1/3';
  else if (Math.abs(frac - 0.5) < epsilon) fracStr = '1/2';
  else if (Math.abs(frac - 0.666) < epsilon) fracStr = '2/3';
  else if (Math.abs(frac - 0.75) < epsilon) fracStr = '3/4';
  else if (Math.abs(frac - 0.125) < epsilon) fracStr = '1/8';
  else if (frac < epsilon) fracStr = '';
  else if (Math.abs(frac - 1) < epsilon) return (whole + 1).toString();
  else {
    // Round to 1 decimal place if irregular
    const rounded = Math.round(val * 10) / 10;
    return rounded.toString();
  }

  if (whole === 0) return fracStr || '0';
  if (fracStr) return `${whole} ${fracStr}`;
  return whole.toString();
}

// Parse initial number or fraction from string
export function parseInitialAmount(str: string): { amount: number; matchedLength: number } | null {
  const trimmed = str.trim();
  
  // Mixed number like "1 1/2" or "2 1/4"
  const mixedMatch = trimmed.match(/^(\d+)\s+(\d+)\/(\d+)/);
  if (mixedMatch) {
    const whole = parseInt(mixedMatch[1], 10);
    const num = parseInt(mixedMatch[2], 10);
    const den = parseInt(mixedMatch[3], 10);
    if (den !== 0) {
      return {
        amount: whole + num / den,
        matchedLength: mixedMatch[0].length
      };
    }
  }

  // Fraction like "1/2" or "3/4"
  const fracMatch = trimmed.match(/^(\d+)\/(\d+)/);
  if (fracMatch) {
    const num = parseInt(fracMatch[1], 10);
    const den = parseInt(fracMatch[2], 10);
    if (den !== 0) {
      return {
        amount: num / den,
        matchedLength: fracMatch[0].length
      };
    }
  }

  // Decimal or integer like "1.5", "4", "20"
  const numMatch = trimmed.match(/^(\d+(?:\.\d+)?)/);
  if (numMatch) {
    return {
      amount: parseFloat(numMatch[1]),
      matchedLength: numMatch[0].length
    };
  }

  return null;
}

// Pluralize common units when quantity > 1
const UNIT_PLURALS: Record<string, string> = {
  cup: 'cups',
  tablespoon: 'tablespoons',
  tbsp: 'tbsp',
  teaspoon: 'teaspoons',
  tsp: 'tsp',
  slice: 'slices',
  clove: 'cloves',
  fillet: 'fillets',
  can: 'cans',
  egg: 'eggs',
  bundle: 'bundles',
  spear: 'spears',
  head: 'heads',
  pinch: 'pinches',
  oz: 'oz',
  ounce: 'ounces',
  pound: 'pounds',
  lb: 'lbs',
  gram: 'grams',
  g: 'g'
};

const UNIT_SINGULARS: Record<string, string> = {
  cups: 'cup',
  tablespoons: 'tablespoon',
  teaspoons: 'teaspoon',
  slices: 'slice',
  cloves: 'clove',
  fillets: 'fillet',
  cans: 'can',
  eggs: 'egg',
  bundles: 'bundle',
  spears: 'spear',
  heads: 'head',
  pinches: 'pinch',
  ounces: 'ounce',
  pounds: 'pound'
};

/**
 * Scale a single recipe ingredient string by a serving size factor.
 * e.g., scaleIngredient("1 cup Greek yogurt", 2) -> "2 cups Greek yogurt"
 * e.g., scaleIngredient("1/2 cup berries", 2) -> "1 cup berries"
 */
export function scaleIngredient(ingredientText: string, servings: number): string {
  if (!ingredientText || servings <= 0 || servings === 1) {
    return ingredientText;
  }

  const parsed = parseInitialAmount(ingredientText);
  if (!parsed) {
    // If no leading number (e.g., "Salt, pepper, and herbs to taste"), keep as is
    return ingredientText;
  }

  const scaledAmount = parsed.amount * servings;
  const formattedAmount = formatQuantity(scaledAmount);
  const remainingText = ingredientText.slice(parsed.matchedLength);

  // Check if there is an immediately following unit to pluralize/singularize
  const unitMatch = remainingText.match(/^(\s+)([a-zA-Z]+)(\b.*)$/);
  if (unitMatch) {
    const space = unitMatch[1];
    const unitWord = unitMatch[2];
    const rest = unitMatch[3];
    const lowerUnit = unitWord.toLowerCase();

    let adjustedUnit = unitWord;
    if (scaledAmount > 1) {
      if (UNIT_PLURALS[lowerUnit]) {
        // preserve casing
        adjustedUnit = UNIT_PLURALS[lowerUnit];
      }
    } else if (scaledAmount <= 1) {
      if (UNIT_SINGULARS[lowerUnit]) {
        adjustedUnit = UNIT_SINGULARS[lowerUnit];
      }
    }

    return `${formattedAmount}${space}${adjustedUnit}${rest}`;
  }

  return `${formattedAmount}${remainingText}`;
}

/**
 * Scale all ingredients in a recipe list for a given serving count
 */
export function scaleRecipeIngredients(ingredients: string[], servings: number): string[] {
  if (servings === 1) return ingredients;
  return ingredients.map(ing => scaleIngredient(ing, servings));
}

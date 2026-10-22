import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Utensils, Leaf, Heart, Activity, Menu, X, ChevronUp, Coffee, Book, Scissors, Clock, ChefHat, Sun, Moon, Minus, Plus, Filter, Sparkles, CheckCircle2, AlertCircle, Search, RotateCcw, ChevronDown, LayoutGrid, ListFilter, ShoppingCart, Droplets, Contrast, Users } from 'lucide-react';
import Header from './components/Header';
import Hero from './components/Hero';
import SearchBar from './components/SearchBar';
import RecipeList from './components/RecipeList';
import ShoppingList from './components/ShoppingList';
import WaterTracker from './components/WaterTracker';
import { DailyHabitTracker } from './components/DailyHabitTracker';
import WeeklyMealPlanDashboard from './components/WeeklyMealPlanDashboard';
import MealPlanDashboard from './components/MealPlanDashboard';
import SeniorRecipeModal from './components/SeniorRecipeModal';
import { RecipeCollectionsModal } from './components/RecipeCollectionsModal';
import { getMealMeta } from './data/recipeImages';
import { scaleRecipeIngredients } from './utils/servings';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedRecipes, setExpandedRecipes] = useState({});
  const [showCollectionsModal, setShowCollectionsModal] = useState(false);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('jeans_vitality_theme') || 'light';
    } catch {
      return 'light';
    }
  });
  const [highContrast, setHighContrast] = useState(() => {
    try {
      return localStorage.getItem('jeans_high_contrast') === 'true';
    } catch {
      return false;
    }
  });
  const [fontSize, setFontSize] = useState('medium');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'vegetarian' | 'quick' | 'high-protein'
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' | 'cards' | 'daily' | 'shopping'
  const [selectedSeniorModalMeal, setSelectedSeniorModalMeal] = useState(null);

  // Recipe Serving Size state: Record<recipeKey, number> (e.g. 'monday-breakfast': 2)
  const [servingSizes, setServingSizes] = useState(() => {
    try {
      const saved = localStorage.getItem('jeans_vitality_serving_sizes');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const updateServingSize = (recipeKey, newServings) => {
    const valid = Math.max(1, Math.min(12, Math.round(newServings)));
    setServingSizes(prev => {
      const updated = { ...prev, [recipeKey]: valid };
      try {
        localStorage.setItem('jeans_vitality_serving_sizes', JSON.stringify(updated));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const resetAllServingSizes = () => {
    setServingSizes({});
    try {
      localStorage.removeItem('jeans_vitality_serving_sizes');
    } catch {
      // Ignore
    }
  };

  const setGlobalServingSize = (servings) => {
    const valid = Math.max(1, Math.min(12, Math.round(servings)));
    const updated = {};
    mealPlan.forEach(d => {
      Object.keys(d.meals).forEach(m => {
        updated[`${d.id}-${m}`] = valid;
      });
    });
    setServingSizes(updated);
    try {
      localStorage.setItem('jeans_vitality_serving_sizes', JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Apply theme and high-contrast classes to both documentElement and body
  useEffect(() => {
    try {
      localStorage.setItem('jeans_vitality_theme', theme);
      localStorage.setItem('jeans_high_contrast', String(highContrast));
    } catch {
      // Ignore in restricted iframe contexts
    }

    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }

    document.body.className = `${theme} ${highContrast ? 'high-contrast' : ''}`;
  }, [theme, highContrast]);

  // Font size mapping
  const fontSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg',
    xlarge: 'text-xl'
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToDay = (dayId) => {
    if (!dayId) return;

    if (dayId === 'shopping-list') {
      setViewMode('shopping');
      setTimeout(() => {
        const el = document.getElementById('shopping-list');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }

    if (dayId === 'recipes') {
      setViewMode('cards');
      setTimeout(() => {
        const el = document.getElementById('recipes');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }

    if (dayId === 'meal-plan' || dayId === 'schedule') {
      setViewMode('dashboard');
      setTimeout(() => {
        const el = document.getElementById('meal-plan-dashboard') || document.getElementById('recipes');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
      return;
    }

    // When jumping to a specific day in the meal plan:
    setViewMode('dashboard');
    setTimeout(() => {
      const element = document.getElementById(`day-card-${dayId}`) || document.getElementById(dayId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        element.classList.add('ring-4', 'ring-amber-500/50');
        setTimeout(() => {
          element.classList.remove('ring-4', 'ring-amber-500/50');
        }, 2200);
        setIsMenuOpen(false);
      }
    }, 100);
  };

  const handleNavigate = (href) => {
    if (!href) return;
    if (href === '#home' || href === '#top') {
      scrollToTop();
    } else if (href === '#shopping-list') {
      setViewMode('shopping');
      setTimeout(() => {
        const el = document.getElementById('shopping-list');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else if (href === '#recipes') {
      setViewMode('cards');
      setTimeout(() => {
        document.getElementById('recipes')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else if (href === '#meal-plan' || href === '#schedule') {
      setViewMode('dashboard');
      setTimeout(() => {
        const el = document.getElementById('meal-plan-dashboard') || document.getElementById('recipes');
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else if (href === '#water-tracker') {
      setTimeout(() => {
        document.getElementById('water-tracker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else if (href === '#daily-habit-tracker' || href === '#habits') {
      setTimeout(() => {
        document.getElementById('daily-habit-tracker')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else if (href === '#tips') {
      setTimeout(() => {
        document.getElementById('tips')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 60);
    } else {
      const targetId = href.startsWith('#') ? href.substring(1) : href;
      scrollToDay(targetId);
    }
  };

  const toggleRecipe = (dayId, mealType) => {
    const key = `${dayId}-${mealType}`;
    setExpandedRecipes(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleHighContrast = () => {
    setHighContrast(prev => !prev);
  };

  const increaseFontSize = () => {
    if (fontSize === 'small') setFontSize('medium');
    else if (fontSize === 'medium') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
  };

  const decreaseFontSize = () => {
    if (fontSize === 'xlarge') setFontSize('large');
    else if (fontSize === 'large') setFontSize('medium');
    else if (fontSize === 'medium') setFontSize('small');
  };

  const mealPlan = [
    {
      day: "Monday",
      id: "monday",
      meals: {
        breakfast: {
          description: "Greek yogurt (1 cup) with mixed berries and 1 tbsp chia seeds",
          protein: 20,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 cup plain Greek yogurt (2% or full-fat for better satiety)",
              "1/2 cup mixed fresh berries (blueberries, strawberries, raspberries)",
              "1 tablespoon chia seeds",
              "1 teaspoon honey (optional)"
            ],
            instructions: [
              "Grab your favorite bowl and add the Greek yogurt.",
              "Top with your mixed berries - I love using whatever's in season!",
              "Sprinkle those chia seeds on top for an extra protein and fiber boost.",
              "If you'd like a touch of sweetness, drizzle with a little honey.",
              "Give it a gentle stir and enjoy your morning fuel!"
            ],
            prepTime: "5 minutes"
          }
        },
        lunch: {
          description: "Grilled salmon (4 oz) with quinoa and steamed broccoli",
          protein: 30,
          vegetarian: false,
          recipe: {
            ingredients: [
              "4 oz salmon fillet",
              "1/2 cup cooked quinoa",
              "1 cup broccoli florets",
              "1 tablespoon olive oil",
              "Lemon wedge, salt, and pepper to taste"
            ],
            instructions: [
              "Preheat your grill or oven to 400°F (200°C).",
              "Pat the salmon dry and season with salt, pepper, and a squeeze of lemon.",
              "Place the salmon on the grill or baking sheet and cook for 12-15 minutes until it flakes easily.",
              "While the salmon cooks, steam your broccoli until tender-crisp (about 5 minutes).",
              "Fluff your quinoa with a fork and serve everything together with another lemon wedge. So satisfying!"
            ],
            prepTime: "20 minutes"
          }
        },
        dinner: {
          description: "Lentil soup with whole grain toast and side salad",
          protein: 25,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 cup cooked lentils (or 1 can, drained)",
              "2 cups vegetable broth",
              "1 carrot, diced",
              "1 celery stalk, diced",
              "1/2 onion, chopped",
              "1 clove garlic, minced",
              "1 slice whole grain bread, toasted",
              "Mixed greens with olive oil and vinegar"
            ],
            instructions: [
              "In a cozy pot, sauté the onion, carrot, and celery in a bit of olive oil until softened.",
              "Add the garlic and cook for another minute until fragrant.",
              "Pour in the vegetable broth and lentils, then simmer for 15-20 minutes.",
              "Season with salt, pepper, and maybe a pinch of cumin if you're feeling adventurous!",
              "Serve hot with your toasted whole grain bread and a simple side salad. Perfect for a relaxing evening!"
            ],
            prepTime: "25 minutes"
          }
        },
        snacks: {
          description: "Hard-boiled egg and small apple",
          protein: 25,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 large egg",
              "1 small apple"
            ],
            instructions: [
              "Place your egg in a small pot and cover with cold water.",
              "Bring to a boil, then cover and remove from heat. Let it sit for 10-12 minutes.",
              "Transfer to cold water to stop cooking, then peel when cool.",
              "Pair with a crisp, juicy apple for the perfect afternoon pick-me-up!",
              "This combo keeps me going through my afternoon knitting sessions!"
            ],
            prepTime: "12 minutes (plus cooling time)"
          }
        }
      }
    },
    {
      day: "Tuesday",
      id: "tuesday",
      meals: {
        breakfast: {
          description: "Scrambled eggs (2) with spinach and whole wheat toast",
          protein: 22,
          vegetarian: true,
          recipe: {
            ingredients: [
              "2 large eggs",
              "1 cup fresh spinach, chopped",
              "1 slice whole wheat toast",
              "1 teaspoon butter or olive oil",
              "Salt and pepper to taste"
            ],
            instructions: [
              "Crack your eggs into a bowl and whisk them up with a splash of water.",
              "Heat your butter or oil in a non-stick pan over medium heat.",
              "Add the spinach and let it wilt for about 30 seconds.",
              "Pour in the eggs and gently stir with a spatula until they're softly set.",
              "Toast your bread while the eggs cook, then serve everything together. Simple but so good!"
            ],
            prepTime: "10 minutes"
          }
        },
        lunch: {
          description: "Grilled chicken breast (4 oz) with brown rice and roasted vegetables",
          protein: 32,
          vegetarian: false,
          recipe: {
            ingredients: [
              "4 oz boneless, skinless chicken breast",
              "1/2 cup cooked brown rice",
              "1 cup mixed vegetables (bell peppers, zucchini, carrots)",
              "1 tablespoon olive oil",
              "Herbs of choice (rosemary, thyme, or oregano)",
              "Salt and pepper to taste"
            ],
            instructions: [
              "Preheat your oven to 425°F (220°C).",
              "Season the chicken breast with salt, pepper, and your favorite herbs.",
              "Toss your vegetables with olive oil, salt, and pepper on a baking sheet.",
              "Place the chicken on the same sheet and roast everything for 20-25 minutes.",
              "Fluff your brown rice and serve with the roasted chicken and veggies. My yoga energy is back!"
            ],
            prepTime: "30 minutes"
          }
        },
        dinner: {
          description: "Cottage cheese (1/2 cup) with pineapple and whole grain crackers",
          protein: 28,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1/2 cup low-fat cottage cheese",
              "1/2 cup fresh pineapple chunks",
              "6-8 whole grain crackers"
            ],
            instructions: [
              "Scoop your cottage cheese into a pretty bowl.",
              "Top with sweet, juicy pineapple chunks - the combination is heavenly!",
              "Arrange your crackers on the side for some satisfying crunch.",
              "This is my go-to easy dinner when I've had a long day of activities.",
              "Sometimes I add a sprinkle of cinnamon for extra warmth!"
            ],
            prepTime: "5 minutes"
          }
        },
        snacks: {
          description: "Protein shake with almond milk",
          protein: 20,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 scoop vanilla protein powder",
              "1 cup unsweetened almond milk",
              "1/2 banana (optional for creaminess)",
              "Ice cubes (optional)"
            ],
            instructions: [
              "Add all ingredients to your blender - I use my trusty one that's been with me for years!",
              "Blend until smooth and creamy. If it's too thick, add a splash more almond milk.",
              "Pour into your favorite glass and enjoy immediately.",
              "Perfect after my morning walk or as an afternoon boost before knitting time!",
              "Feel free to add a tablespoon of peanut butter for extra staying power!"
            ],
            prepTime: "5 minutes"
          }
        }
      }
    },
    {
      day: "Wednesday",
      id: "wednesday",
      meals: {
        breakfast: {
          description: "Overnight oats with Greek yogurt, nuts, and banana",
          protein: 24,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1/2 cup rolled oats",
              "1/4 cup Greek yogurt",
              "1/2 cup milk of choice",
              "1/2 banana, sliced",
              "1 tablespoon chopped nuts (walnuts or almonds)",
              "1 teaspoon maple syrup (optional)"
            ],
            instructions: [
              "In a mason jar or container with a lid, combine oats, Greek yogurt, and milk.",
              "Stir well, then top with banana slices and nuts.",
              "Cover and refrigerate overnight - it's like magic happens while you sleep!",
              "In the morning, give it a good stir and add a drizzle of maple syrup if desired.",
              "Grab it on your way to morning gymnastics - so convenient!"
            ],
            prepTime: "5 minutes (plus overnight chilling)"
          }
        },
        lunch: {
          description: "Turkey and avocado wrap with mixed greens",
          protein: 28,
          vegetarian: false,
          recipe: {
            ingredients: [
              "3 oz sliced turkey breast",
              "1/4 avocado, sliced",
              "1 whole wheat tortilla",
              "Handful of mixed greens",
              "1 tablespoon hummus or mustard",
              "Sliced tomato and cucumber (optional)"
            ],
            instructions: [
              "Lay your tortilla flat on a clean surface.",
              "Spread hummus or mustard evenly over the surface.",
              "Layer on the turkey slices, then add avocado, greens, and any extra veggies.",
              "Roll it up tightly, tucking in the sides as you go.",
              "Slice in half and pack for lunch. My walking group always asks for the recipe!"
            ],
            prepTime: "10 minutes"
          }
        },
        dinner: {
          description: "Baked chicken breast (4 oz) with sweet potato and green beans",
          protein: 30,
          vegetarian: false,
          recipe: {
            ingredients: [
              "4 oz skinless chicken breast",
              "1 medium sweet potato, cubed",
              "1 cup fresh green beans, trimmed",
              "1 tablespoon olive oil",
              "Lemon juice, garlic powder, rosemary, salt, and black pepper"
            ],
            instructions: [
              "Preheat oven to 400°F (200°C).",
              "Toss sweet potato cubes with olive oil, rosemary, salt, and pepper. Roast for 15 minutes.",
              "Add trimmed green beans to the baking sheet.",
              "Season chicken breast with garlic powder, salt, pepper, and olive oil.",
              "Place chicken on the baking sheet and roast for 18-20 minutes until thoroughly cooked (165°F).",
              "Plate the juicy baked chicken alongside roasted sweet potatoes and tender green beans!"
            ],
            prepTime: "30 minutes"
          }
        },
        snacks: {
          description: "Whole raw almonds and crisp sliced green pear",
          protein: 18,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1/4 cup whole raw unflavored almonds",
              "1 crisp ripe green pear, cored and sliced",
              "Pinch of cinnamon (optional)"
            ],
            instructions: [
              "Rinse and core your fresh green pear, slicing it into thin crisp wedges.",
              "Portion out 1/4 cup of whole raw almonds for healthy heart fats and clean protein.",
              "Dust pear slices with a pinch of ground cinnamon if you enjoy an aromatic kick.",
              "Pair together for the perfect afternoon balance of fiber, natural crunch, and sustained energy."
            ],
            prepTime: "3 minutes"
          }
        }
      }
    },
    {
      day: "Thursday",
      id: "thursday",
      meals: {
        breakfast: {
          description: "Protein smoothie with berries, spinach, and protein powder",
          protein: 26,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 scoop protein powder",
              "1 cup mixed berries (fresh or frozen)",
              "1 cup baby spinach",
              "1 cup unsweetened almond milk",
              "1/2 banana",
              "Ice cubes"
            ],
            instructions: [
              "Add spinach and almond milk to your blender first - this helps it blend smoothly!",
              "Add berries, banana, protein powder, and ice cubes.",
              "Blend until completely smooth and creamy - no green bits visible!",
              "Pour into your favorite glass and enjoy immediately.",
              "This gives me the energy I need for my morning coffee and book club prep!"
            ],
            prepTime: "5 minutes"
          }
        },
        lunch: {
          description: "Quinoa bowl with black beans, corn, avocado, and feta cheese",
          protein: 22,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1/2 cup cooked quinoa",
              "1/4 cup black beans, rinsed",
              "2 tablespoons corn kernels",
              "1/4 avocado, diced",
              "2 tablespoons crumbled feta cheese",
              "Lime juice, olive oil, salt, and cilantro"
            ],
            instructions: [
              "Fluff your cooked quinoa in a bowl.",
              "Add black beans, corn, and diced avocado.",
              "Sprinkle with crumbled feta cheese.",
              "Drizzle with lime juice and olive oil, then season with salt.",
              "Top with fresh cilantro if you have it. So colorful and satisfying!",
              "Perfect for lunch after my morning walk around the neighborhood."
            ],
            prepTime: "10 minutes"
          }
        },
        dinner: {
          description: "Lean beef stir-fry (3 oz) with mixed vegetables and brown rice",
          protein: 32,
          vegetarian: false,
          recipe: {
            ingredients: [
              "3 oz lean beef strips",
              "1 cup mixed stir-fry vegetables (broccoli florets, carrots, snap peas)",
              "1/2 cup cooked brown rice",
              "1 tablespoon low-sodium soy sauce",
              "1 teaspoon sesame oil",
              "1 clove garlic, minced",
              "1 teaspoon ginger, grated"
            ],
            instructions: [
              "Heat sesame oil in a large skillet or wok over high heat.",
              "Add beef strips and stir-fry for 2-3 minutes until browned.",
              "Add garlic and ginger, cook for 30 seconds until fragrant.",
              "Toss in mixed vegetables and stir-fry for 3-4 minutes until crisp-tender.",
              "Add low-sodium soy sauce and toss everything together.",
              "Serve hot over steamed brown rice for an iron-rich senior vitality dinner."
            ],
            prepTime: "15 minutes"
          }
        },
        snacks: {
          description: "Greek yogurt with honey and walnuts",
          protein: 20,
          vegetarian: true,
          recipe: {
            ingredients: [
              "3/4 cup Greek yogurt",
              "1 teaspoon honey",
              "1 tablespoon chopped walnuts"
            ],
            instructions: [
              "Scoop Greek yogurt into a small bowl.",
              "Drizzle with honey - just a little goes a long way!",
              "Sprinkle with chopped walnuts for crunch and healthy fats.",
              "This is my favorite afternoon treat with a cup of herbal tea.",
              "The walnuts remind me of the ones my grandmother used to keep in her kitchen!"
            ],
            prepTime: "3 minutes"
          }
        }
      }
    },
    {
      day: "Friday",
      id: "friday",
      meals: {
        breakfast: {
          description: "Warm rolled oatmeal with chia seeds and blueberries",
          protein: 18,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1/2 cup old-fashioned rolled oats",
              "1 cup unsweetened almond milk or water",
              "1 tablespoon black chia seeds",
              "1/2 cup fresh wild blueberries",
              "1/2 teaspoon ground cinnamon",
              "1 teaspoon pure maple syrup (optional)"
            ],
            instructions: [
              "Bring almond milk to a gentle simmer in a small saucepan over medium heat.",
              "Stir in rolled oats and reduce heat to low, simmering for 5-7 minutes until creamy.",
              "Fold in chia seeds and ground cinnamon during the last minute of cooking.",
              "Transfer oatmeal to a warm bowl and top generously with fresh wild blueberries.",
              "Drizzle with a touch of maple syrup if desired. Heart-healthy and full of polyphenols!"
            ],
            prepTime: "8 minutes"
          }
        },
        lunch: {
          description: "Tuna salad (3 oz) on whole grain crackers with side salad",
          protein: 28,
          vegetarian: false,
          recipe: {
            ingredients: [
              "3 oz light chunk tuna in water, thoroughly drained",
              "1 tablespoon plain Greek yogurt (or olive oil mayonnaise)",
              "1 teaspoon Dijon mustard",
              "2 tablespoons finely diced celery and red onion",
              "6-8 whole grain crackers (or 2 slices toasted whole grain bread)",
              "1 cup fresh baby arugula with a light lemon vinaigrette"
            ],
            instructions: [
              "In a bowl, flake the drained tuna and mix with Greek yogurt, Dijon mustard, celery, and red onion.",
              "Season with freshly cracked black pepper and a squeeze of fresh lemon juice.",
              "Spoon tuna salad onto crisp whole grain crackers or toast slices.",
              "Toss fresh baby arugula with olive oil and lemon juice, then plate alongside."
            ],
            prepTime: "10 minutes"
          }
        },
        dinner: {
          description: "Oven-baked salmon fillet with roasted asparagus and wild brown rice",
          protein: 34,
          vegetarian: false,
          recipe: {
            ingredients: [
              "4 oz wild salmon fillet",
              "1 bundle fresh asparagus spears (woody ends trimmed)",
              "1/2 cup cooked wild brown rice blend",
              "1 tablespoon extra virgin olive oil",
              "1/2 fresh lemon (juiced and sliced)",
              "Sea salt, garlic powder, and fresh cracked black pepper"
            ],
            instructions: [
              "Preheat oven to 400°F (200°C) and line a sheet pan with parchment paper.",
              "Arrange trimmed asparagus spears on one side, drizzle with olive oil, salt, and pepper.",
              "Place salmon fillet skin-side down on the sheet pan, brush with olive oil, and top with lemon slices.",
              "Roast in the oven for 12-14 minutes until salmon flakes tenderly with a fork.",
              "Serve hot with steamed wild brown rice for an omega-3 powerhouse dinner."
            ],
            prepTime: "20 minutes"
          }
        },
        snacks: {
          description: "Hard-boiled egg and carrot sticks with hummus",
          protein: 23,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 large pasture-raised egg (hard-boiled)",
              "1 cup fresh crunchy carrot sticks",
              "2 tablespoons classic garlic hummus",
              "Pinch of sea salt and smoked paprika"
            ],
            instructions: [
              "Peel the chilled hard-boiled egg and slice neatly in half.",
              "Lightly dust the yolk with a pinch of sea salt and smoked paprika.",
              "Wash and cut crisp carrots into sturdy dipping batons.",
              "Serve with 2 tablespoons of hummus for an energizing midday protein snack."
            ],
            prepTime: "5 minutes"
          }
        }
      }
    },
    {
      day: "Saturday",
      id: "saturday",
      meals: {
        breakfast: {
          description: "Egg white omelet with vegetables and whole grain toast",
          protein: 20,
          vegetarian: true,
          recipe: {
            ingredients: [
              "3 egg whites",
              "1/4 cup diced vegetables (bell peppers, onions, spinach)",
              "1 slice whole grain toast",
              "1 teaspoon olive oil",
              "Salt, pepper, and herbs to taste"
            ],
            instructions: [
              "Whisk egg whites with a splash of water and seasonings.",
              "Heat olive oil in a non-stick pan over medium heat.",
              "Add vegetables and sauté until softened, about 3 minutes.",
              "Pour in egg whites and cook, lifting edges to let uncooked egg flow underneath.",
              "When almost set, fold in half and slide onto your plate with toast.",
              "Light but satisfying - perfect before my Saturday morning yoga class!"
            ],
            prepTime: "12 minutes"
          }
        },
        lunch: {
          description: "Grilled chicken Caesar salad with crisp romaine and parmesan",
          protein: 30,
          vegetarian: false,
          recipe: {
            ingredients: [
              "4 oz grilled chicken breast, sliced",
              "2 cups chopped crisp romaine lettuce hearts",
              "2 tablespoons shaved parmesan cheese",
              "2 tablespoons whole grain croutons",
              "1.5 tablespoons light yogurt-based Caesar dressing",
              "Freshly cracked black pepper and lemon wedge"
            ],
            instructions: [
              "Wash and dry crisp romaine hearts thoroughly, then chop into bite-sized pieces.",
              "Toss romaine in a large bowl with light Caesar dressing until lightly coated.",
              "Top with sliced grilled chicken breast.",
              "Garnish with shaved parmesan, crunchy croutons, and cracked black pepper.",
              "Serve with a fresh lemon wedge for a vibrant, senior-friendly protein lunch!"
            ],
            prepTime: "15 minutes"
          }
        },
        dinner: {
          description: "Stuffed bell peppers with ground turkey and quinoa",
          protein: 32,
          vegetarian: false,
          recipe: {
            ingredients: [
              "2 bell peppers, halved and seeded",
              "3 oz lean ground turkey",
              "1/4 cup cooked quinoa",
              "1/4 cup diced tomatoes",
              "1/4 onion, chopped",
              "1 clove garlic, minced",
              "Italian herbs, salt, and pepper"
            ],
            instructions: [
              "Preheat oven to 375°F (190°C).",
              "Sauté onion and garlic until soft, then add ground turkey and cook until browned.",
              "Stir in quinoa, tomatoes, and seasonings. Cook for 2 more minutes.",
              "Stuff the mixture into bell pepper halves and place in a baking dish.",
              "Cover with foil and bake for 25 minutes, then uncover and bake 10 more minutes.",
              "So hearty and satisfying - my favorite weekend dinner recipe!"
            ],
            prepTime: "45 minutes"
          }
        },
        snacks: {
          description: "Protein bar and orange",
          protein: 18,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 high-protein bar (20g+ protein)",
              "1 medium orange"
            ],
            instructions: [
              "Choose a protein bar with minimal added sugar and at least 20g protein.",
              "Peel your orange and separate into segments.",
              "Enjoy together for a perfect balance of protein and vitamin C!",
              "I always pack this combo in my bag for post-gymnastics fuel.",
              "The orange reminds me of Sunday mornings with my grandchildren!"
            ],
            prepTime: "2 minutes"
          }
        }
      }
    },
    {
      day: "Sunday",
      id: "sunday",
      meals: {
        breakfast: {
          description: "Greek yogurt parfait with granola and mixed berries",
          protein: 22,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 cup Greek yogurt",
              "1/4 cup low-sugar granola",
              "1/2 cup mixed berries",
              "1 teaspoon honey (optional)"
            ],
            instructions: [
              "In a glass or bowl, layer half the Greek yogurt.",
              "Add half the berries and a sprinkle of granola.",
              "Repeat with remaining yogurt, berries, and granola.",
              "Drizzle with honey if desired for a touch of sweetness.",
              "So pretty and delicious - perfect for a leisurely Sunday morning with my coffee and book!",
              "I love making this while listening to my favorite Sunday morning radio show."
            ],
            prepTime: "5 minutes"
          }
        },
        lunch: {
          description: "Chicken and vegetable soup with whole grain roll",
          protein: 28,
          vegetarian: false,
          recipe: {
            ingredients: [
              "3 oz cooked chicken, shredded",
              "2 cups chicken broth",
              "1/2 cup mixed vegetables (carrots, celery, peas)",
              "1/4 cup cooked rice or noodles",
              "1 whole grain dinner roll",
              "Fresh herbs (parsley or thyme)"
            ],
            instructions: [
              "In a pot, bring chicken broth to a simmer.",
              "Add vegetables and cook until tender, about 8-10 minutes.",
              "Stir in shredded chicken and cooked rice/noodles. Heat through.",
              "Season with salt, pepper, and fresh herbs.",
              "Serve hot with your whole grain roll on the side.",
              "So comforting and perfect for Sunday lunch while planning my week ahead!"
            ],
            prepTime: "15 minutes"
          }
        },
        dinner: {
          description: "Baked tofu (4 oz) with wild rice and steamed asparagus",
          protein: 26,
          vegetarian: true,
          recipe: {
            ingredients: [
              "4 oz extra-firm tofu, pressed and cubed",
              "1/2 cup cooked wild rice blend",
              "1 cup asparagus spears",
              "1 tablespoon soy sauce or tamari",
              "1 teaspoon sesame oil",
              "1 clove garlic, minced"
            ],
            instructions: [
              "Preheat oven to 400°F (200°C).",
              "Toss tofu cubes with soy sauce, sesame oil, and garlic.",
              "Spread on a baking sheet and bake for 25-30 minutes, flipping halfway.",
              "Steam asparagus until bright green and tender-crisp, about 5 minutes.",
              "Fluff wild rice and serve with crispy tofu and asparagus.",
              "A peaceful, nourishing end to the week - perfect before my Sunday evening knitting!"
            ],
            prepTime: "35 minutes"
          }
        },
        snacks: {
          description: "Cottage cheese with peach slices",
          protein: 24,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1/2 cup cottage cheese",
              "1/2 fresh peach, sliced (or canned in juice)"
            ],
            instructions: [
              "Scoop cottage cheese into a small bowl.",
              "Top with sweet peach slices - fresh in summer, canned works year-round!",
              "The combination of creamy and sweet is absolutely delightful.",
              "This is my favorite evening snack while reading before bed.",
              "Sometimes I add a sprinkle of cinnamon for extra coziness!"
            ],
            prepTime: "3 minutes"
          }
        }
      }
    }
  ];

  const nutritionInfo = {
    dailyProtein: "100g",
    calories: "1800-2000",
    focus: "High-quality protein, fiber-rich foods, healthy fats, and essential nutrients"
  };

  const guidelines = [
    "Choose lean protein sources to support muscle maintenance while managing weight",
    "Include both animal and plant-based proteins for variety and complete amino acid profile",
    "Stay hydrated with water, herbal teas, and low-sodium broths",
    "Adjust portion sizes based on individual energy needs and activity level",
    "Consult with healthcare provider before making significant dietary changes",
    "Consider vitamin D and calcium supplementation if recommended by doctor"
  ];

  const navLinks = [
    { name: 'Home', href: '#home', icon: Coffee },
    { name: 'Recipes', href: '#recipes', icon: ChefHat },
    { name: '7-Day Plan', href: '#meal-plan', icon: Calendar },
    { name: 'Hydration', href: '#water-tracker', icon: Droplets },
    { name: 'Daily Habits', href: '#daily-habit-tracker', icon: Sparkles },
    { name: 'Shopping List', href: '#shopping-list', icon: ShoppingCart },
    { name: 'Kitchen Tips', href: '#tips', icon: Book },
  ];

  // Helper to check if a meal matches query & category
  const checkMealMatch = (meal, mealType, query, category) => {
    let categoryMatch = true;
    if (category === 'vegetarian') categoryMatch = meal.vegetarian;
    else if (category === 'quick') {
      const minutes = parseInt(meal.recipe.prepTime) || 0;
      categoryMatch = minutes <= 20;
    } else if (category === 'high-protein') {
      categoryMatch = meal.protein >= 25;
    }

    if (!categoryMatch) return { isMatch: false, matchedIngredient: null };

    if (!query || query.trim() === '') {
      return { isMatch: true, matchedIngredient: null };
    }

    const q = query.trim().toLowerCase();

    // Check description
    if (meal.description.toLowerCase().includes(q)) {
      return { isMatch: true, matchedIngredient: null };
    }

    // Check meal type
    if (mealType.toLowerCase().includes(q)) {
      return { isMatch: true, matchedIngredient: null };
    }

    // Check ingredients
    const matchedIng = meal.recipe.ingredients.find(ing => ing.toLowerCase().includes(q));
    if (matchedIng) {
      return { isMatch: true, matchedIngredient: matchedIng };
    }

    // Check instructions
    if (meal.recipe.instructions.some(inst => inst.toLowerCase().includes(q))) {
      return { isMatch: true, matchedIngredient: null };
    }

    // Check prep time
    if (meal.recipe.prepTime.toLowerCase().includes(q)) {
      return { isMatch: true, matchedIngredient: null };
    }

    return { isMatch: false, matchedIngredient: null };
  };

  // Compute total matches and per-day meal match results
  const searchResults = useMemo(() => {
    let totalMatches = 0;
    const daysData = mealPlan.map(dayPlan => {
      const mealMatches = {};
      let dayMatchCount = 0;

      Object.entries(dayPlan.meals).forEach(([mealType, meal]) => {
        const result = checkMealMatch(meal, mealType, searchQuery, activeCategory);
        mealMatches[mealType] = result;
        if (result.isMatch) {
          totalMatches++;
          dayMatchCount++;
        }
      });

      return {
        ...dayPlan,
        mealMatches,
        dayMatchCount,
        hasMatches: dayMatchCount > 0
      };
    });

    return {
      totalMatches,
      daysData,
      isFiltered: searchQuery.trim() !== '' || activeCategory !== 'all'
    };
  }, [mealPlan, searchQuery, activeCategory]);

  // Compute all recipes flat list for RecipeList component (filtered if search/category active)
  const filteredRecipeList = useMemo(() => {
    const list = [];
    mealPlan.forEach(dayPlan => {
      Object.entries(dayPlan.meals).forEach(([mealType, meal]) => {
        const matchResult = checkMealMatch(meal, mealType, searchQuery, activeCategory);
        if (matchResult.isMatch) {
          const meta = getMealMeta(dayPlan.id, mealType);
          list.push({
            dayId: dayPlan.id,
            dayName: dayPlan.day,
            mealType,
            description: meal.description,
            protein: meal.protein,
            vegetarian: meal.vegetarian,
            recipe: meal.recipe,
            calories: meta.calories,
            image: meta.image,
            imageAlt: meta.imageAlt
          });
        }
      });
    });
    return list;
  }, [mealPlan, searchQuery, activeCategory]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setActiveCategory('all');
  };

  // Toggle expanding all matching recipes
  const expandAllMatches = () => {
    const newExpanded = { ...expandedRecipes };
    searchResults.daysData.forEach(day => {
      Object.entries(day.mealMatches).forEach(([mealType, match]) => {
        if (match.isMatch) {
          newExpanded[`${day.id}-${mealType}`] = true;
        }
      });
    });
    setExpandedRecipes(newExpanded);
  };

  const collapseAllRecipes = () => {
    setExpandedRecipes({});
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 selection:bg-amber-500 selection:text-white ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-stone-100 text-stone-900' 
        : 'bg-gradient-to-br from-slate-950 via-slate-900 to-stone-900 text-slate-100'
    } ${fontSizeClasses[fontSize]}`}>
      
      {/* Responsive Navigation Header Component */}
      <Header
        title="Jean's Vitality Kitchen"
        subtitle="High-Protein Senior Nutrition & Vitality"
        links={navLinks}
        currentPath={viewMode === 'shopping' ? '#shopping-list' : viewMode === 'cards' ? '#recipes' : '#meal-plan'}
        theme={theme}
        highContrast={highContrast}
        onToggleTheme={toggleTheme}
        onToggleHighContrast={toggleHighContrast}
        onNavigate={handleNavigate}
        fontSize={fontSize}
        onIncreaseFontSize={increaseFontSize}
        onDecreaseFontSize={decreaseFontSize}
        onOpenCollections={() => setShowCollectionsModal(true)}
      />

      {/* Hero Component with Warm Inviting Welcome & 7-Day Plan CTA */}
      <Hero
        theme={theme}
        nutritionInfo={nutritionInfo}
        mealPlan={mealPlan}
        onScrollToDay={scrollToDay}
        onViewPlan={() => scrollToDay('meal-plan')}
        onViewShoppingList={() => handleNavigate('#shopping-list')}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 space-y-10">
        
        {/* Guidelines Section: Jean's Kitchen Wisdom */}
        <section 
          id="tips" 
          aria-labelledby="kitchen-wisdom-heading"
          className={`rounded-3xl p-6 sm:p-8 scroll-mt-24 backdrop-blur-2xl transition-all duration-300 shadow-lg ${
            theme === 'light'
              ? 'bg-white/95 border border-emerald-200/90 shadow-[0_8px_30px_rgba(16,185,129,0.08)] ring-1 ring-emerald-900/5'
              : 'bg-slate-900/85 border border-emerald-800/40 shadow-xl ring-1 ring-white/10'
          }`}
        >
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-emerald-100 dark:border-slate-800">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25">
              <Leaf className="h-7 w-7" aria-hidden="true" />
            </div>
            <div>
              <h2 id="kitchen-wisdom-heading" className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                theme === 'light' ? 'text-stone-900' : 'text-white'
              }`}>
                Jean's Kitchen Wisdom for Active Seniors
              </h2>
              <p className={`text-sm font-medium ${
                theme === 'light' ? 'text-stone-600' : 'text-slate-300'
              }`}>
                Simple, science-backed habits for lasting strength, mobility, and vitality
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {guidelines.map((guideline, index) => (
              <div 
                key={index} 
                className={`flex items-start space-x-3 p-4 rounded-2xl border transition-all ${
                  theme === 'light'
                    ? 'bg-emerald-50/60 border-emerald-100/90 text-stone-800 hover:bg-emerald-50'
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-sm sm:text-base font-medium leading-relaxed">
                  {guideline}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Daily Water Intake Tracker Section */}
        <WaterTracker theme={theme} />

        {/* Daily Senior Health Habit Tracker Section */}
        <DailyHabitTracker theme={theme} highContrast={highContrast} />

        {/* Recipe Search & Filter Section */}
        <section id="search-section" aria-label="Recipe Search">
          <SearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onClearSearch={handleClearSearch}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            totalMatches={searchResults.totalMatches}
            totalRecipes={28}
            theme={theme}
          />
        </section>

        {/* Recipe Presentation Mode & Main Content */}
        <section id="recipes" aria-label="Recipes and Meal Planning" className="space-y-6 scroll-mt-24">
          
          {/* View Toggle Bar */}
          <div className={`p-4 sm:p-5 rounded-3xl backdrop-blur-2xl border transition-all flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md ${
            theme === 'light'
              ? 'bg-white/95 border-amber-200/90 shadow-[0_8px_30px_rgba(217,119,6,0.06)]'
              : 'bg-slate-900/90 border-slate-700/70 shadow-xl'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md shadow-amber-500/20">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-base sm:text-lg font-black tracking-tight ${
                  theme === 'light' ? 'text-stone-900' : 'text-white'
                }`}>
                  Display Layout
                </h3>
                <p className={`text-xs ${theme === 'light' ? 'text-stone-600' : 'text-slate-400'}`}>
                  Choose how you'd like to browse Jean's high-protein recipes
                </p>
              </div>
            </div>

            {/* Segmented View Switcher */}
            <div className={`flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl border ${
              theme === 'light'
                ? 'bg-stone-100/90 border-stone-200'
                : 'bg-slate-800/90 border-slate-700'
            }`}>
              <button
                type="button"
                id="tab-view-dashboard"
                onClick={() => setViewMode('dashboard')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                  viewMode === 'dashboard'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : theme === 'light'
                      ? 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
                aria-pressed={viewMode === 'dashboard'}
              >
                <LayoutGrid className="w-4 h-4 shrink-0" />
                <span>Weekly Dashboard</span>
              </button>

              <button
                type="button"
                id="tab-view-cards"
                onClick={() => setViewMode('cards')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                  viewMode === 'cards'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : theme === 'light'
                      ? 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
                aria-pressed={viewMode === 'cards'}
              >
                <ChefHat className="w-4 h-4 shrink-0" />
                <span>Recipe Cards</span>
              </button>

              <button
                type="button"
                id="tab-view-daily"
                onClick={() => setViewMode('daily')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                  viewMode === 'daily'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : theme === 'light'
                      ? 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
                aria-pressed={viewMode === 'daily'}
              >
                <Calendar className="w-4 h-4 shrink-0" />
                <span>7-Day Schedule</span>
              </button>

              <button
                type="button"
                id="tab-view-shopping"
                onClick={() => setViewMode('shopping')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
                  viewMode === 'shopping'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : theme === 'light'
                      ? 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                }`}
                aria-pressed={viewMode === 'shopping'}
              >
                <ShoppingCart className="w-4 h-4 shrink-0" />
                <span>Grocery List</span>
              </button>
            </div>
          </div>

          {/* Render Active View */}
          {viewMode === 'dashboard' || viewMode === 'daily' ? (
            <div id="weekly-dashboard-container" className="animate-in fade-in duration-300">
              <MealPlanDashboard
                mealPlan={mealPlan}
                theme={theme}
                highContrast={highContrast}
                onOpenRecipeModal={(meal) => setSelectedSeniorModalMeal(meal)}
                servingSizes={servingSizes}
                onUpdateServingSize={updateServingSize}
              />
            </div>
          ) : viewMode === 'shopping' ? (
            <ShoppingList 
              mealPlan={mealPlan} 
              theme={theme}
              servingSizes={servingSizes}
              onUpdateServingSize={updateServingSize}
              onResetServingSizes={resetAllServingSizes}
              onSetGlobalServingSize={setGlobalServingSize}
            />
          ) : viewMode === 'cards' ? (
            /* RecipeList Component View */
            <div id="recipe-list-section">
              {filteredRecipeList.length === 0 ? (
                <div 
                  className={`rounded-3xl p-8 sm:p-12 text-center backdrop-blur-2xl border shadow-lg ${
                    theme === 'light'
                      ? 'bg-white/95 border-amber-200 shadow-[0_10px_35px_rgba(217,119,6,0.08)]'
                      : 'bg-slate-900/90 border-slate-700 shadow-2xl'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className={`text-xl sm:text-2xl font-extrabold mb-2 ${
                    theme === 'light' ? 'text-stone-900' : 'text-white'
                  }`}>
                    No Recipes Match Your Filter
                  </h3>
                  <p className={`text-sm sm:text-base max-w-md mx-auto mb-6 ${
                    theme === 'light' ? 'text-stone-600' : 'text-slate-300'
                  }`}>
                    No recipe cards found for <strong className="text-amber-600 dark:text-amber-400">"{searchQuery}"</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-600/25 active:scale-95 transition-all"
                  >
                    Reset & View All Recipes
                  </button>
                </div>
              ) : (
                <RecipeList
                  recipes={filteredRecipeList}
                  theme={theme}
                  onToggleRecipe={toggleRecipe}
                  expandedRecipes={expandedRecipes}
                  searchQuery={searchQuery}
                  servingSizes={servingSizes}
                  onUpdateServingSize={updateServingSize}
                />
              )}
            </div>
          ) : (
            /* 7-Day Meal Plan Section */
            <div id="meal-plan" aria-labelledby="meal-plan-heading" className="space-y-6 scroll-mt-24">
              {/* Section Header with Quick Actions */}
              <div className={`p-6 rounded-3xl backdrop-blur-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md ${
                theme === 'light'
                  ? 'bg-white/92 border-amber-200/80 shadow-[0_8px_30px_rgba(217,119,6,0.06)]'
                  : 'bg-slate-900/85 border-slate-700/60 shadow-xl'
              }`}>
                <div>
                  <div className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1">
                    <Utensils className="w-4 h-4" />
                    <span>Complete Weekly Menu</span>
                  </div>
                  <h2 id="meal-plan-heading" className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    theme === 'light' ? 'text-stone-900' : 'text-white'
                  }`}>
                    7-Day High-Protein Meal Plan
                  </h2>
                  <p className={`text-sm ${theme === 'light' ? 'text-stone-600' : 'text-slate-300'}`}>
                    {searchResults.isFiltered ? (
                      <span>
                        Showing <strong className="text-amber-600 dark:text-amber-400">{searchResults.totalMatches}</strong> matching {searchResults.totalMatches === 1 ? 'recipe' : 'recipes'} across the week
                      </span>
                    ) : (
                      '100g total protein everyday • Click any meal to view recipes & cooking steps'
                    )}
                  </p>
                </div>

                {/* Quick Bulk Expand/Collapse Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  {searchResults.isFiltered && (
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                        theme === 'light'
                          ? 'bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-300'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reset Filters</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={expandAllMatches}
                    className={`inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 border ${
                      theme === 'light'
                        ? 'bg-amber-100 hover:bg-amber-200 text-amber-950 border-amber-300'
                        : 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border-amber-800'
                    }`}
                  >
                    <ChefHat className="w-3.5 h-3.5" />
                    <span>{searchResults.isFiltered ? 'Expand Matched' : 'Expand All'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={collapseAllRecipes}
                    className={`inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-all active:scale-95 ${
                      theme === 'light'
                        ? 'bg-stone-100/90 hover:bg-stone-200 text-stone-700'
                        : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300'
                    }`}
                  >
                    <span>Collapse All</span>
                  </button>
                </div>
              </div>

              {/* Day Jump Pills Toolbar for Daily Schedule */}
              <div className={`p-3 rounded-2xl border backdrop-blur-xl flex items-center justify-between gap-2 overflow-x-auto scrollbar-none ${
                theme === 'light' 
                  ? 'bg-amber-50/90 border-amber-200/70 shadow-2xs' 
                  : 'bg-slate-800/80 border-slate-700 shadow-md'
              }`}>
                <div className="flex items-center space-x-2 shrink-0 pl-1">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    theme === 'light' ? 'text-stone-800' : 'text-slate-200'
                  }`}>
                    Jump to Day:
                  </span>
                </div>

                <div className="flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
                  {mealPlan.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => scrollToDay(d.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-150 active:scale-95 border ${
                        theme === 'light'
                          ? 'bg-white hover:bg-amber-500 hover:text-white border-amber-200 text-stone-800 shadow-2xs hover:border-amber-500'
                          : 'bg-slate-900/90 hover:bg-amber-500 hover:text-stone-950 border-slate-700 text-slate-200 hover:border-amber-500'
                      }`}
                    >
                      {d.day}
                    </button>
                  ))}
                </div>
              </div>

              {/* Empty Search Results State */}
              {searchResults.totalMatches === 0 && (
                <div 
                  className={`rounded-3xl p-8 sm:p-12 text-center backdrop-blur-2xl border shadow-lg ${
                    theme === 'light'
                      ? 'bg-white/95 border-amber-200 shadow-[0_10px_35px_rgba(217,119,6,0.08)]'
                      : 'bg-slate-900/90 border-slate-700 shadow-2xl'
                  }`}
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                    <Search className="w-8 h-8" />
                  </div>

                  <h3 className={`text-xl sm:text-2xl font-extrabold mb-2 ${
                    theme === 'light' ? 'text-stone-900' : 'text-white'
                  }`}>
                    No Recipes Found
                  </h3>
                  
                  <p className={`text-sm sm:text-base max-w-md mx-auto mb-6 ${
                    theme === 'light' ? 'text-stone-600' : 'text-slate-300'
                  }`}>
                    We couldn't find any recipes matching <strong className="text-amber-600 dark:text-amber-400">"{searchQuery}"</strong> with the current filter.
                  </p>

                  <div className="flex flex-wrap justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleClearSearch}
                      className="px-6 py-2.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white shadow-md shadow-amber-600/25 active:scale-95 transition-all"
                    >
                      View All 28 Recipes
                    </button>
                  </div>
                </div>
              )}

              {/* Daily Cards */}
              {searchResults.daysData.map((dayPlan, index) => {
                const isDayVisible = !searchResults.isFiltered || dayPlan.hasMatches;
                if (!isDayVisible) return null;

                return (
                  <div 
                    key={index} 
                    id={dayPlan.id} 
                    className={`rounded-3xl overflow-hidden scroll-mt-24 backdrop-blur-2xl transition-all duration-300 shadow-lg ${
                      theme === 'light'
                        ? 'bg-white/95 border border-amber-200/90 shadow-[0_10px_35px_rgba(217,119,6,0.07)] ring-1 ring-amber-900/5'
                        : 'bg-slate-900/90 border border-slate-700/70 shadow-2xl ring-1 ring-white/10'
                    }`}
                  >
                    {/* Glossy Header Bar with Liquid Reflection */}
                    <div className="relative bg-gradient-to-r from-amber-600 via-amber-500 to-orange-600 px-6 sm:px-8 py-4.5 text-white flex flex-wrap items-center justify-between gap-3 shadow-sm">
                      <div className="absolute inset-x-0 top-0 h-px bg-white/40" />
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-white/20 backdrop-blur-md">
                          <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl sm:text-2xl font-black tracking-tight">{dayPlan.day}</h3>
                          <span className="text-xs font-medium text-amber-100">
                            {searchResults.isFiltered 
                              ? `${dayPlan.dayMatchCount} of 4 meals match your search` 
                              : 'Senior High-Protein Menu'}
                          </span>
                        </div>
                      </div>
                      <div className="inline-flex items-center space-x-2 bg-black/20 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-100">Daily Total:</span>
                        <span className="text-sm font-black text-white">
                          {Object.values(dayPlan.meals).reduce((sum, meal) => sum + meal.protein, 0)}g Protein
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 sm:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                        {Object.entries(dayPlan.meals).map(([mealType, meal]) => {
                          const key = `${dayPlan.id}-${mealType}`;
                          const isExpanded = expandedRecipes[key];
                          const matchResult = dayPlan.mealMatches[mealType] || { isMatch: true, matchedIngredient: null };
                          const isMatch = matchResult.isMatch;
                          const meta = getMealMeta(dayPlan.id, mealType);
                          
                          return (
                            <div 
                              key={mealType} 
                              className={`rounded-2xl overflow-hidden transition-all duration-200 backdrop-blur-xl border flex flex-col justify-between ${
                                searchResults.isFiltered && !isMatch 
                                  ? 'opacity-35 grayscale-50 scale-[0.98]' 
                                  : isMatch && searchResults.isFiltered
                                    ? theme === 'light'
                                      ? 'bg-amber-50/90 border-amber-400 ring-2 ring-amber-400/40 shadow-md'
                                      : 'bg-slate-800/90 border-amber-400/60 ring-2 ring-amber-400/30 shadow-lg'
                                    : theme === 'light' 
                                      ? 'bg-amber-50/50 hover:bg-white border-amber-200/70 hover:border-amber-400 hover:shadow-md ring-1 ring-amber-900/5' 
                                      : 'bg-slate-800/70 hover:bg-slate-800 border-slate-700 hover:border-amber-500/50 hover:shadow-xl'
                              }`}
                            >
                              {/* Thumbnail preview */}
                              <div className="relative aspect-16/10 w-full overflow-hidden bg-stone-200 dark:bg-slate-800">
                                <img
                                  src={meta.image}
                                  alt={meta.imageAlt}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white text-xs font-bold">
                                  <span className="capitalize">{mealType}</span>
                                  <span>{meta.calories} kcal</span>
                                </div>
                              </div>

                              <div className="p-4">
                                {/* Meal Type & Protein Badge */}
                                <div className="flex justify-between items-start mb-2">
                                  <h4 className={`font-black text-base capitalize tracking-tight ${
                                    theme === 'light' ? 'text-stone-900' : 'text-white'
                                  }`}>
                                    {mealType}
                                  </h4>
                                  <span className={`text-xs font-black px-2.5 py-1 rounded-full shadow-2xs border ${
                                    theme === 'light' 
                                      ? 'bg-amber-100 text-amber-950 border-amber-300/80' 
                                      : 'bg-amber-950/90 text-amber-200 border-amber-700/80'
                                  }`}>
                                    {meal.protein}g protein
                                  </span>
                                </div>

                                {/* Meal Description */}
                                <p className={`text-sm mb-3 leading-relaxed font-medium ${
                                  theme === 'light' ? 'text-stone-700' : 'text-slate-200'
                                }`}>
                                  {meal.description}
                                </p>

                                {/* Matched Ingredient Indicator Tag */}
                                {matchResult.matchedIngredient && (
                                  <div className="mb-3">
                                    <span className={`inline-flex items-center space-x-1 text-xs font-bold px-2 py-0.5 rounded-md border ${
                                      theme === 'light'
                                        ? 'bg-amber-100 text-amber-900 border-amber-300'
                                        : 'bg-amber-950 text-amber-200 border-amber-800'
                                    }`}>
                                      <Sparkles className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                                      <span>Contains: {matchResult.matchedIngredient.split(',')[0]}</span>
                                    </span>
                                  </div>
                                )}
                              </div>

                              <div className="px-4 pb-4">
                                {/* Tags & Recipe Toggle Button */}
                                <div className="flex items-center justify-between pt-2 border-t border-amber-200/50 dark:border-slate-700/60">
                                  <div className="flex items-center">
                                    {meal.vegetarian ? (
                                      <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-md ${
                                        theme === 'light' 
                                          ? 'bg-emerald-100 text-emerald-900' 
                                          : 'bg-emerald-950 text-emerald-300'
                                      }`}>
                                        <Leaf className="h-3 w-3 mr-1" />
                                        Veg
                                      </span>
                                    ) : (
                                      <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
                                        theme === 'light' 
                                          ? 'bg-stone-200/80 text-stone-800' 
                                          : 'bg-slate-700/80 text-slate-300'
                                      }`}>
                                        <Utensils className="h-3 w-3 mr-1" />
                                        Hearty
                                      </span>
                                    )}
                                  </div>

                                  <button
                                    type="button"
                                    onClick={() => toggleRecipe(dayPlan.id, mealType)}
                                    className={`text-xs font-bold flex items-center px-2.5 py-1.5 rounded-lg transition-all active:scale-95 ${
                                      theme === 'light' 
                                        ? 'bg-amber-100/90 hover:bg-amber-200 text-amber-950 border border-amber-300/80' 
                                        : 'bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/60'
                                    }`}
                                    aria-expanded={isExpanded}
                                  >
                                    <ChefHat className="h-3.5 w-3.5 mr-1 text-amber-600 dark:text-amber-400" />
                                    {isExpanded ? 'Hide' : 'View'}
                                  </button>
                                </div>
                                
                                {/* Expandable Recipe Details with High Contrast */}
                                {isExpanded && (
                                  <div className={`mt-4 pt-4 border-t transition-all duration-300 space-y-3.5 ${
                                    theme === 'light' ? 'border-amber-200' : 'border-slate-700'
                                  }`}>
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                      <div className={`inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-md ${
                                        theme === 'light' 
                                          ? 'bg-amber-100/90 text-amber-950 border border-amber-300/70' 
                                          : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                                      }`}>
                                        <Clock className="h-3.5 w-3.5 mr-1" />
                                        Prep Time: {meal.recipe.prepTime}
                                      </div>

                                      {/* Serving Size Selector */}
                                      <div className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-xl border text-xs font-bold ${
                                        theme === 'light'
                                          ? 'bg-amber-50 border-amber-200 text-stone-800'
                                          : 'bg-slate-800 border-slate-700 text-slate-200'
                                      }`}>
                                        <Users className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                                        <span className="text-[11px]">Servings:</span>
                                        <div className="flex items-center space-x-1">
                                          <button
                                            type="button"
                                            onClick={() => updateServingSize(`${dayPlan.id}-${mealType}`, (servingSizes[`${dayPlan.id}-${mealType}`] || 1) - 1)}
                                            disabled={(servingSizes[`${dayPlan.id}-${mealType}`] || 1) <= 1}
                                            className="p-0.5 rounded-sm hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 disabled:opacity-30"
                                            title="Decrease servings"
                                          >
                                            <Minus className="w-3 h-3" />
                                          </button>
                                          <span className="w-5 text-center font-black text-amber-600 dark:text-amber-400">
                                            {servingSizes[`${dayPlan.id}-${mealType}`] || 1}
                                          </span>
                                          <button
                                            type="button"
                                            onClick={() => updateServingSize(`${dayPlan.id}-${mealType}`, (servingSizes[`${dayPlan.id}-${mealType}`] || 1) + 1)}
                                            className="p-0.5 rounded-sm hover:bg-white dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200"
                                            title="Increase servings"
                                          >
                                            <Plus className="w-3 h-3" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <div className="flex items-center justify-between mb-2">
                                        <h5 className={`font-bold text-xs uppercase tracking-wider ${
                                          theme === 'light' ? 'text-stone-900' : 'text-white'
                                        }`}>
                                          Ingredients:
                                        </h5>
                                        {(servingSizes[`${dayPlan.id}-${mealType}`] || 1) > 1 && (
                                          <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                                            Scaled for {servingSizes[`${dayPlan.id}-${mealType}`]} servings
                                          </span>
                                        )}
                                      </div>
                                      <ul className={`space-y-1.5 text-xs font-medium ${
                                        theme === 'light' ? 'text-stone-800' : 'text-slate-200'
                                      }`}>
                                        {scaleRecipeIngredients(meal.recipe.ingredients, servingSizes[`${dayPlan.id}-${mealType}`] || 1).map((ingredient, idx) => {
                                          const isIngredientMatch = searchQuery.trim() !== '' && 
                                            ingredient.toLowerCase().includes(searchQuery.trim().toLowerCase());

                                          return (
                                            <li 
                                              key={idx} 
                                              className={`flex items-start p-1 rounded-md transition-colors ${
                                                isIngredientMatch 
                                                  ? theme === 'light'
                                                    ? 'bg-amber-200/70 font-bold text-stone-900'
                                                    : 'bg-amber-900/60 font-bold text-white'
                                                  : ''
                                              }`}
                                            >
                                              <span className="mr-1.5 text-amber-600 dark:text-amber-400 font-bold">•</span>
                                              <span>{ingredient}</span>
                                            </li>
                                          );
                                        })}
                                      </ul>
                                    </div>
                                    
                                    <div>
                                      <h5 className={`font-bold text-xs uppercase tracking-wider mb-2 ${
                                        theme === 'light' ? 'text-stone-900' : 'text-white'
                                      }`}>
                                        Jean's Cooking Steps:
                                      </h5>
                                      <ol className={`space-y-2 text-xs font-medium ${
                                        theme === 'light' ? 'text-stone-800' : 'text-slate-200'
                                      }`}>
                                        {meal.recipe.instructions.map((instruction, idx) => (
                                          <li key={idx} className="flex items-start">
                                            <span className="font-black mr-2 text-amber-700 dark:text-amber-400 shrink-0">
                                              {idx + 1}.
                                            </span>
                                            <span>{instruction}</span>
                                          </li>
                                        ))}
                                      </ol>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      
                      {/* Day Total Bar */}
                      <div className={`mt-6 pt-5 border-t flex flex-col sm:flex-row justify-between items-center gap-3 ${
                        theme === 'light' ? 'border-amber-200/70' : 'border-slate-800'
                      }`}>
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span className={`text-sm font-bold ${theme === 'light' ? 'text-stone-900' : 'text-white'}`}>
                            Daily Target Accomplished
                          </span>
                        </div>
                        <span className={`font-black text-sm px-4 py-2 rounded-2xl backdrop-blur-md shadow-xs border ${
                          theme === 'light' 
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300' 
                            : 'bg-emerald-950 text-emerald-200 border-emerald-800'
                        }`}>
                          {Object.values(dayPlan.meals).reduce((sum, meal) => sum + meal.protein, 0)}g Total High-Quality Protein
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Footer Note: Jean's Kitchen Heart */}
        <section 
          aria-label="Chef Note"
          className={`rounded-3xl p-6 sm:p-8 backdrop-blur-2xl border transition-all shadow-lg ${
            theme === 'light' 
              ? 'bg-amber-50/95 border-amber-300/80 shadow-[0_8px_30px_rgba(217,119,6,0.08)] ring-1 ring-amber-900/5' 
              : 'bg-slate-900/90 border-slate-700/80 shadow-xl ring-1 ring-white/10'
          }`}
        >
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-3xl">👵</span>
            <div>
              <h3 className={`text-xl font-extrabold tracking-tight ${
                theme === 'light' ? 'text-amber-950' : 'text-amber-200'
              }`}>
                Jean's Kitchen Note & Medical Reminder
              </h3>
              <span className={`text-xs font-semibold ${
                theme === 'light' ? 'text-amber-800' : 'text-amber-400'
              }`}>
                Crafted with love for your lifelong wellness
              </span>
            </div>
          </div>
          <p className={`text-sm sm:text-base leading-relaxed font-normal ${
            theme === 'light' ? 'text-stone-800' : 'text-slate-200'
          }`}>
            These recipes are crafted with genuine love and care, just like I make for my own family! 
            Every body is unique, so listen to how you feel and adjust seasonings or portion sizes as needed. 
            Always consult with your healthcare professional before making significant dietary changes, 
            especially if you have kidney considerations, diabetes, or other underlying conditions. 
            Happy cooking and bon appétit, dear friend!
          </p>
        </section>
      </main>

      {/* Detailed Senior Recipe Modal */}
      {selectedSeniorModalMeal && (
        <SeniorRecipeModal
          isOpen={!!selectedSeniorModalMeal}
          onClose={() => setSelectedSeniorModalMeal(null)}
          meal={selectedSeniorModalMeal}
          theme={theme}
          highContrast={highContrast}
          servingSizes={servingSizes}
          onUpdateServingSize={updateServingSize}
        />
      )}

      {/* Global Recipe Collections Modal */}
      {showCollectionsModal && (
        <RecipeCollectionsModal
          isOpen={showCollectionsModal}
          onClose={() => setShowCollectionsModal(false)}
          theme={theme}
          highContrast={highContrast}
          onSelectCollectionFilter={() => {
            setViewMode('dashboard');
            setTimeout(() => {
              const el = document.getElementById('meal-plan-dashboard') || document.getElementById('recipes');
              el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 60);
          }}
        />
      )}



      {/* Back to Top Floating Glass Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          type="button"
          className={`fixed bottom-5 right-4 sm:right-6 p-3 rounded-full shadow-2xl transition-all duration-200 transform hover:scale-110 focus:outline-hidden focus-visible:ring-4 focus-visible:ring-amber-500/50 z-40 backdrop-blur-xl border ${
            theme === 'light'
              ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white border-amber-300/80 shadow-amber-900/20'
              : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white border-slate-600 shadow-black/50'
          }`}
          aria-label="Scroll back to top"
        >
          <ChevronUp className="h-5 w-5 stroke-[2.5]" />
        </button>
      )}
    </div>
  );
};

export default App;


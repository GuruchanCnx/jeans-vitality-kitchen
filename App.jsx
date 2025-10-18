import React, { useState, useEffect } from 'react';
import { Calendar, Utensils, Leaf, Heart, Activity, Menu, X, ChevronUp, Coffee, Book, Scissors, Clock, ChefHat, Sun, Moon, Minus, Plus } from 'lucide-react';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [expandedRecipes, setExpandedRecipes] = useState({});
  const [theme, setTheme] = useState('light');
  const [fontSize, setFontSize] = useState('medium');

  // Apply theme class to body
  useEffect(() => {
    document.body.className = theme;
  }, [theme]);

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
    const element = document.getElementById(dayId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsMenuOpen(false);
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
          description: "Baked cod (4 oz) with sweet potato and green beans",
          protein: 30,
          vegetarian: false,
          recipe: {
            ingredients: [
              "4 oz cod fillet",
              "1 medium sweet potato, cubed",
              "1 cup green beans, trimmed",
              "1 tablespoon olive oil",
              "Lemon juice, garlic powder, salt, and pepper"
            ],
            instructions: [
              "Preheat oven to 400°F (200°C).",
              "Toss sweet potato cubes with olive oil, salt, and pepper. Roast for 20 minutes.",
              "Add green beans to the pan and continue roasting for 10 more minutes.",
              "Season cod with lemon juice, garlic powder, salt, and pepper.",
              "Place cod on a separate baking sheet and bake for 12-15 minutes until flaky.",
              "Everything comes out perfectly timed - dinner is served!"
            ],
            prepTime: "35 minutes"
          }
        },
        snacks: {
          description: "String cheese and pear",
          protein: 18,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 string cheese",
              "1 ripe pear, sliced"
            ],
            instructions: [
              "Simply peel and slice your pear into bite-sized pieces.",
              "Unwrap your string cheese and you're ready to go!",
              "The sweet pear and savory cheese make such a satisfying combination.",
              "I keep this combo in my bag for post-yoga snacks. So easy and delicious!"
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
              "1 cup mixed stir-fry vegetables",
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
              "Add soy sauce and stir to combine. Serve over brown rice.",
              "Quick, flavorful, and perfect for busy evenings before my knitting circle!"
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
          description: "Cottage cheese pancakes with fresh fruit",
          protein: 25,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1/2 cup cottage cheese",
              "2 eggs",
              "1/4 cup oat flour or regular flour",
              "1/2 teaspoon baking powder",
              "Fresh fruit for topping",
              "Maple syrup (optional)"
            ],
            instructions: [
              "In a blender, combine cottage cheese, eggs, flour, and baking powder.",
              "Blend until smooth - the cottage cheese disappears completely!",
              "Heat a non-stick pan over medium heat and lightly grease with oil or butter.",
              "Pour 1/4 cup portions of batter and cook for 2-3 minutes per side.",
              "Serve with fresh fruit and a light drizzle of maple syrup if desired.",
              "These are so fluffy and satisfying - perfect for a leisurely Friday morning with my coffee!"
            ],
            prepTime: "15 minutes"
          }
        },
        lunch: {
          description: "Tuna salad (3 oz) on whole grain bread with side salad",
          protein: 28,
          vegetarian: false,
          recipe: {
            ingredients: [
              "3 oz canned tuna in water, drained",
              "1 tablespoon Greek yogurt or light mayo",
              "1 teaspoon Dijon mustard",
              "Celery and red onion, finely chopped",
              "2 slices whole grain bread",
              "Mixed greens with vinaigrette"
            ],
            instructions: [
              "In a bowl, mix tuna with Greek yogurt, mustard, celery, and onion.",
              "Season with salt and pepper to taste.",
              "Toast your bread slices if you like them crispy.",
              "Spread the tuna mixture on one slice and top with the other.",
              "Serve with a fresh side salad dressed with your favorite vinaigrette.",
              "My go-to lunch that keeps me energized for afternoon activities!"
            ],
            prepTime: "10 minutes"
          }
        },
        dinner: {
          description: "Vegetable and chickpea curry with basmati rice",
          protein: 24,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1/2 cup cooked chickpeas",
              "1 cup mixed vegetables (cauliflower, peas, carrots)",
              "1/2 cup coconut milk",
              "1 tablespoon curry powder",
              "1/2 onion, chopped",
              "1 clove garlic, minced",
              "1/2 cup cooked basmati rice"
            ],
            instructions: [
              "Sauté onion and garlic in a pot until softened.",
              "Add curry powder and cook for 1 minute until fragrant.",
              "Add vegetables and cook for 5 minutes, stirring occasionally.",
              "Pour in coconut milk and add chickpeas. Simmer for 10-15 minutes.",
              "Season with salt and serve over fluffy basmati rice.",
              "So comforting and perfect for a relaxing Friday evening with a good book!"
            ],
            prepTime: "25 minutes"
          }
        },
        snacks: {
          description: "Hard-boiled egg and carrot sticks",
          protein: 23,
          vegetarian: true,
          recipe: {
            ingredients: [
              "1 hard-boiled egg",
              "1/2 cup carrot sticks"
            ],
            instructions: [
              "Prepare your hard-boiled egg ahead of time (see Monday's snack instructions).",
              "Peel and slice the egg in half.",
              "Cut carrots into sticks - I like them thick enough to be satisfying!",
              "Pack together for a protein-packed, crunchy snack.",
              "This combo keeps me going through my evening knitting projects!"
            ],
            prepTime: "5 minutes (plus egg prep time)"
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
          description: "Grilled shrimp (4 oz) with couscous and roasted vegetables",
          protein: 30,
          vegetarian: false,
          recipe: {
            ingredients: [
              "4 oz shrimp, peeled and deveined",
              "1/2 cup cooked couscous",
              "1 cup mixed roasted vegetables",
              "1 tablespoon olive oil",
              "Lemon juice, garlic, salt, and pepper",
              "Fresh parsley for garnish"
            ],
            instructions: [
              "Marinate shrimp in olive oil, lemon juice, garlic, salt, and pepper for 10 minutes.",
              "Grill or sauté shrimp for 2-3 minutes per side until pink and opaque.",
              "Fluff couscous with a fork and mix with a little olive oil and lemon juice.",
              "Toss roasted vegetables with fresh parsley.",
              "Plate everything together and squeeze extra lemon on top.",
              "So fresh and light - perfect for a Saturday lunch after my morning walk!"
            ],
            prepTime: "20 minutes"
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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-gradient-to-br from-amber-50 to-orange-50 text-gray-900' 
        : 'bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100'
    } ${fontSizeClasses[fontSize]}`}>
      {/* Enhanced Navigation Bar with iOS Liquid Glass Design */}
      <nav className={`sticky top-0 z-50 backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border-b border-white/20 dark:border-gray-700/50 shadow-lg`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <Coffee className={`h-6 w-6 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
                <span className={`text-xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                  Jean's Vitality Kitchen
                </span>
              </div>
            </div>
            
            {/* Desktop Navigation - Always Visible */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Font Size Controls */}
              <div className={`flex items-center space-x-1 p-2 rounded-xl backdrop-blur-sm bg-white/60 dark:bg-gray-700/60 border border-white/30 dark:border-gray-600/30`}>
                <button
                  onClick={decreaseFontSize}
                  className={`p-1 rounded-lg transition-all duration-200 hover:bg-white/30 dark:hover:bg-gray-600/30 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}
                  aria-label="Decrease font size"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className={`text-xs font-medium px-2 ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  A
                </span>
                <button
                  onClick={increaseFontSize}
                  className={`p-1 rounded-lg transition-all duration-200 hover:bg-white/30 dark:hover:bg-gray-600/30 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}
                  aria-label="Increase font size"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl backdrop-blur-sm bg-white/60 dark:bg-gray-700/60 border border-white/30 dark:border-gray-600/30 transition-all duration-200 hover:bg-white/40 dark:hover:bg-gray-700/40 ${
                  theme === 'light' ? 'text-amber-600' : 'text-amber-400'
                }`}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              
              {/* Desktop Navigation Links */}
              <div className="flex space-x-1 ml-4">
                {mealPlan.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => scrollToDay(day.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-gray-700/40 border border-transparent hover:border-white/30 dark:hover:border-gray-600/30 ${
                      theme === 'light'
                        ? 'text-gray-700 hover:text-amber-600'
                        : 'text-gray-300 hover:text-amber-400'
                    }`}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Mobile menu button */}
            <div className="md:hidden flex items-center space-x-2">
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  theme === 'light' 
                    ? 'text-amber-600 hover:bg-amber-100' 
                    : 'text-amber-400 hover:bg-gray-700'
                }`}
                aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
              </button>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 rounded-lg transition-colors duration-200 ${
                  theme === 'light'
                    ? 'text-gray-700 hover:bg-amber-100'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className={`md:hidden border-t backdrop-blur-md bg-white/80 dark:bg-gray-800/80 border-white/20 dark:border-gray-700/50`}>
            <div className="px-4 py-3 space-y-3">
              {/* Mobile Font Size Controls */}
              <div className={`flex items-center justify-center space-x-2 p-3 rounded-xl backdrop-blur-sm bg-white/60 dark:bg-gray-700/60 border border-white/30 dark:border-gray-600/30`}>
                <button
                  onClick={decreaseFontSize}
                  className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/30 dark:hover:bg-gray-600/30 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}
                  aria-label="Decrease font size"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <span className={`text-sm font-medium ${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                }`}>
                  Font Size
                </span>
                <button
                  onClick={increaseFontSize}
                  className={`p-2 rounded-lg transition-all duration-200 hover:bg-white/30 dark:hover:bg-gray-600/30 ${
                    theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                  }`}
                  aria-label="Increase font size"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              {/* Mobile Navigation Links */}
              <div className="grid grid-cols-2 gap-2">
                {mealPlan.map((day) => (
                  <button
                    key={day.id}
                    onClick={() => scrollToDay(day.id)}
                    className={`px-3 py-2 text-sm font-medium rounded-xl transition-all duration-200 backdrop-blur-sm hover:bg-white/40 dark:hover:bg-gray-700/40 border border-transparent hover:border-white/30 dark:hover:border-gray-600/30 ${
                      theme === 'light'
                        ? 'text-gray-700 hover:text-amber-600'
                        : 'text-gray-300 hover:text-amber-400'
                    }`}
                  >
                    {day.day}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Header */}
      <header className={`shadow-sm border-b backdrop-blur-md bg-white/70 dark:bg-gray-800/70 border-white/20 dark:border-gray-700/30`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className={`p-3 rounded-xl backdrop-blur-sm bg-amber-100/70 dark:bg-amber-900/50 border border-amber-200/50 dark:border-amber-800/30`}>
              <ChefHat className={`h-8 w-8 ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`} />
            </div>
            <div>
              <h1 className={`text-3xl font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                Jean's 7-Day High-Protein Meal Plan
              </h1>
              <p className={`text-lg ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                Nourishing recipes for active seniors - each with 100g protein daily!
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className={`p-4 rounded-xl backdrop-blur-sm bg-amber-50/70 dark:bg-amber-900/30 border border-amber-100/50 dark:border-amber-800/30`}>
              <div className="flex items-center space-x-2 mb-2">
                <Heart className={`h-5 w-5 ${theme === 'light' ? 'text-red-500' : 'text-red-400'}`} />
                <span className={`font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                  Target Protein
                </span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'light' ? 'text-amber-600' : 'text-amber-400'}`}>
                {nutritionInfo.dailyProtein}
              </p>
            </div>
            
            <div className={`p-4 rounded-xl backdrop-blur-sm bg-green-50/70 dark:bg-green-900/30 border border-green-100/50 dark:border-green-800/30`}>
              <div className="flex items-center space-x-2 mb-2">
                <Activity className={`h-5 w-5 ${theme === 'light' ? 'text-green-500' : 'text-green-400'}`} />
                <span className={`font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                  Daily Calories
                </span>
              </div>
              <p className={`text-2xl font-bold ${theme === 'light' ? 'text-green-600' : 'text-green-400'}`}>
                {nutritionInfo.calories}
              </p>
            </div>
            
            <div className={`p-4 rounded-xl backdrop-blur-sm bg-purple-50/70 dark:bg-purple-900/30 border border-purple-100/50 dark:border-purple-800/30`}>
              <div className="flex items-center space-x-2 mb-2">
                <Utensils className={`h-5 w-5 ${theme === 'light' ? 'text-purple-500' : 'text-purple-400'}`} />
                <span className={`font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-200'}`}>
                  Focus Areas
                </span>
              </div>
              <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-300'}`}>
                {nutritionInfo.focus}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guidelines Section */}
        <div className={`rounded-2xl shadow-lg p-6 mb-8 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/30`}>
          <h2 className={`text-2xl font-bold mb-4 flex items-center ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}>
            <Leaf className={`h-6 w-6 mr-2 ${theme === 'light' ? 'text-green-500' : 'text-green-400'}`} />
            Jean's Kitchen Wisdom for Active Seniors
          </h2>
          <ul className="space-y-2">
            {guidelines.map((guideline, index) => (
              <li key={index} className="flex items-start space-x-2">
                <span className={`mt-1 ${theme === 'light' ? 'text-green-500' : 'text-green-400'}`}>•</span>
                <span className={theme === 'light' ? 'text-gray-700' : 'text-gray-300'}>{guideline}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Meal Plan */}
        <div className="space-y-6">
          {mealPlan.map((dayPlan, index) => (
            <div key={index} id={dayPlan.id} className={`rounded-2xl shadow-lg overflow-hidden scroll-mt-24 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70 border border-white/30 dark:border-gray-700/30`}>
              <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4">
                <h3 className="text-2xl font-bold text-white">{dayPlan.day}</h3>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {Object.entries(dayPlan.meals).map(([mealType, meal]) => {
                    const key = `${dayPlan.id}-${mealType}`;
                    const isExpanded = expandedRecipes[key];
                    
                    return (
                      <div key={mealType} className={`rounded-xl p-4 transition-shadow duration-200 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 hover:shadow-xl ${
                        theme === 'light' 
                          ? 'bg-white/60 hover:bg-white/80' 
                          : 'bg-gray-800/60 hover:bg-gray-800/80'
                      }`}>
                        <div className="flex justify-between items-start mb-2">
                          <h4 className={`font-semibold capitalize ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                            {mealType}
                          </h4>
                          <span className={`text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm ${
                            theme === 'light' 
                              ? 'bg-amber-100/80 text-amber-800' 
                              : 'bg-amber-900/60 text-amber-200'
                          }`}>
                            {meal.protein}g protein
                          </span>
                        </div>
                        <p className={`text-sm mb-3 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                          {meal.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {meal.vegetarian ? (
                              <span className={`inline-flex items-center text-xs ${
                                theme === 'light' ? 'text-green-600' : 'text-green-400'
                              }`}>
                                <Leaf className="h-3 w-3 mr-1" />
                                Vegetarian
                              </span>
                            ) : (
                              <span className={`inline-flex items-center text-xs ${
                                theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                              }`}>
                                <Utensils className="h-3 w-3 mr-1" />
                                Non-vegetarian
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => toggleRecipe(dayPlan.id, mealType)}
                            className={`text-xs font-medium flex items-center transition-colors duration-200 ${
                              theme === 'light' 
                                ? 'text-amber-600 hover:text-amber-700' 
                                : 'text-amber-400 hover:text-amber-300'
                            }`}
                          >
                            <ChefHat className="h-3 w-3 mr-1" />
                            {isExpanded ? 'Hide Recipe' : 'View Recipe'}
                          </button>
                        </div>
                        
                        {isExpanded && (
                          <div className={`mt-4 pt-4 border-t transition-all duration-300 ${
                            theme === 'light' ? 'border-gray-200/50' : 'border-gray-700/50'
                          }`}>
                            <div className={`flex items-center text-sm mb-2 ${
                              theme === 'light' ? 'text-amber-600' : 'text-amber-400'
                            }`}>
                              <Clock className="h-4 w-4 mr-1" />
                              Prep Time: {meal.recipe.prepTime}
                            </div>
                            
                            <div className="mb-3">
                              <h5 className={`font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                Ingredients:
                              </h5>
                              <ul className={`space-y-1 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                {meal.recipe.ingredients.map((ingredient, idx) => (
                                  <li key={idx} className="flex items-start">
                                    <span className={`mr-2 ${theme === 'light' ? 'text-amber-500' : 'text-amber-400'}`}>•</span>
                                    {ingredient}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            
                            <div>
                              <h5 className={`font-semibold mb-2 ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                                Let's Cook!
                              </h5>
                              <ol className={`space-y-2 ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                {meal.recipe.instructions.map((instruction, idx) => (
                                  <li key={idx} className="flex">
                                    <span className={`font-medium mr-2 ${theme === 'light' ? 'text-amber-500' : 'text-amber-400'}`}>
                                      {idx + 1}.
                                    </span>
                                    {instruction}
                                  </li>
                                ))}
                              </ol>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                <div className={`mt-4 pt-4 border-t ${
                  theme === 'light' ? 'border-gray-200/50' : 'border-gray-700/50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>
                      Daily Total:
                    </span>
                    <span className={`font-bold px-3 py-1 rounded-full backdrop-blur-sm ${
                      theme === 'light' ? 'bg-green-100/80 text-green-800' : 'bg-green-900/60 text-green-200'
                    }`}>
                      {Object.values(dayPlan.meals).reduce((sum, meal) => sum + meal.protein, 0)}g protein
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className={`mt-8 rounded-2xl p-6 mb-12 backdrop-blur-sm border ${
          theme === 'light' 
            ? 'bg-yellow-50/70 border-yellow-200/50' 
            : 'bg-yellow-900/30 border-yellow-800/30'
        }`}>
          <h3 className={`text-lg font-semibold mb-2 ${
            theme === 'light' ? 'text-yellow-800' : 'text-yellow-200'
          }`}>
            Jean's Kitchen Note
          </h3>
          <p className={theme === 'light' ? 'text-yellow-700' : 'text-yellow-300'}>
            These recipes are crafted with love and care, just like I would make for my own family! 
            Remember, every body is different, so listen to yours and adjust as needed. 
            Always consult with your healthcare provider before making significant dietary changes, 
            especially if you have underlying health conditions. Happy cooking, dear friend!
          </p>
        </div>
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className={`fixed bottom-6 right-6 p-3 rounded-full shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none z-40 backdrop-blur-sm border border-white/30 dark:border-gray-700/30 ${
            theme === 'light'
              ? 'bg-amber-600/90 hover:bg-amber-600 text-white'
              : 'bg-amber-700/90 hover:bg-amber-700 text-white'
          }`}
          aria-label="Back to top"
        >
          <ChevronUp className="h-6 w-6" />
        </button>
      )}
    </div>
  );
};

export default App;
```

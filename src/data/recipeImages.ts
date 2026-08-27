// Dedicated Generated Food Image Assets for all 28 Unique Recipes (No Duplicates)

// Monday
import yogurtBerriesImg from '../assets/images/greek_yogurt_berries_1787790851606.jpg';
import salmonQuinoaImg from '../assets/images/salmon_quinoa_bowl_1787790832578.jpg';
import lentilSoupImg from '../assets/images/lentil_soup_bread_1787790866424.jpg';
import boiledEggsAppleImg from '../assets/images/boiled_eggs_apple_1787791778733.jpg';

// Tuesday
import spinachScrambledEggsImg from '../assets/images/spinach_scrambled_eggs_1787791854406.jpg';
import grilledChickenBrownRiceImg from '../assets/images/grilled_chicken_brown_rice_1787792502381.jpg';
import cottageCheesePineappleImg from '../assets/images/cottage_cheese_pineapple_1787791714775.jpg';
import proteinShakeAlmondMilkImg from '../assets/images/protein_shake_almond_milk_1787792514847.jpg';

// Wednesday
import overnightOatsBananaNutsImg from '../assets/images/overnight_oats_banana_nuts_1787792528105.jpg';
import turkeyAvocadoSaladImg from '../assets/images/turkey_avocado_salad_1787791868514.jpg';
import bakedChickenSweetPotatoImg from '../assets/images/baked_chicken_sweetpotato_1787791939285.jpg';
import almondsGreenPearImg from '../assets/images/almonds_green_pear_1787791838270.jpg';

// Thursday
import spinachBananaSmoothieImg from '../assets/images/spinach_banana_smoothie_1787791912063.jpg';
import blackBeanBurritoBowlImg from '../assets/images/black_bean_burrito_bowl_1787791731312.jpg';
import bakedTofuRiceImg from '../assets/images/baked_tofu_rice_1787790895005.jpg';
import yogurtWalnutsHoneyImg from '../assets/images/yogurt_walnuts_honey_1787791763648.jpg';

// Friday
import oatmealChiaBerriesImg from '../assets/images/oatmeal_chia_berries_1787791882635.jpg';
import tunaSaladCrackersImg from '../assets/images/tuna_salad_crackers_1787791809481.jpg';
import bakedSalmonAsparagusImg from '../assets/images/baked_salmon_asparagus_1787791646249.jpg';
import eggCarrotsHummusImg from '../assets/images/egg_carrots_hummus_1787791747019.jpg';

// Saturday
import veggieOmeletPeppersImg from '../assets/images/veggie_omelet_peppers_1787791954006.jpg';
import chickenCaesarSaladImg from '../assets/images/chicken_caesar_salad_1787791898195.jpg';
import stuffedBellPeppersImg from '../assets/images/stuffed_bell_peppers_1787790879979.jpg';
import proteinBarOrangeImg from '../assets/images/protein_bar_orange_1787791794155.jpg';

// Sunday
import yogurtParfaitStrawberriesImg from '../assets/images/yogurt_parfait_strawberries_1787791674717.jpg';
import chickenVegSoupImg from '../assets/images/chicken_veg_soup_1787791967567.jpg';
import crispyTofuWildRiceImg from '../assets/images/crispy_tofu_wild_rice_1787791689619.jpg';
import cottageCheesePeachesImg from '../assets/images/cottage_cheese_peaches_1787791703870.jpg';

export interface NutritionData {
  calories: number;
  protein: number; // in grams
  fiber: number; // in grams (vital for digestion and gut health)
  sugar: number; // in grams (natural vs low refined sugars)
  addedSugar: number; // in grams (0g-2g for senior glycemic stability)
  carbs: number; // in grams
  fat: number; // in grams (heart healthy fats)
  sodium: number; // in mg (low sodium target for cardiovascular health)
  potassium?: number; // in mg
  calcium?: number; // in mg (bone density)
  seniorHealthHighlight: string; // Senior-specific nutritional benefit
  glycemicIndex: 'Low' | 'Medium';
}

export interface RecipeMeta {
  calories: number;
  image: string;
  imageAlt: string;
  category: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  nutrition: NutritionData;
}

// 100% Unique, dedicated photo assets & nutritional breakdowns for all 28 recipes (Zero duplicates)
export const recipeMetadataMap: Record<string, { calories: number; image: string; imageAlt: string; nutrition: NutritionData }> = {
  // Monday
  "monday-breakfast": {
    calories: 280,
    image: yogurtBerriesImg,
    imageAlt: "Creamy Greek yogurt with fresh mixed berries and chia seeds",
    nutrition: {
      calories: 280,
      protein: 25,
      fiber: 7,
      sugar: 8,
      addedSugar: 0,
      carbs: 18,
      fat: 6,
      sodium: 95,
      potassium: 380,
      calcium: 280,
      seniorHealthHighlight: "High leucine Greek yogurt boosts muscle preservation; chia & berry soluble fiber supports smooth digestion without blood sugar spikes.",
      glycemicIndex: 'Low'
    }
  },
  "monday-lunch": {
    calories: 490,
    image: salmonQuinoaImg,
    imageAlt: "Grilled salmon fillet with quinoa and steamed broccoli florets",
    nutrition: {
      calories: 490,
      protein: 34,
      fiber: 8,
      sugar: 3,
      addedSugar: 0,
      carbs: 32,
      fat: 16,
      sodium: 210,
      potassium: 780,
      calcium: 120,
      seniorHealthHighlight: "Rich in EPA/DHA Omega-3s for joint lubrication & brain health, paired with high-fiber quinoa for sustained midday energy.",
      glycemicIndex: 'Low'
    }
  },
  "monday-dinner": {
    calories: 420,
    image: lentilSoupImg,
    imageAlt: "Warm brown lentil soup with rustic whole grain toast",
    nutrition: {
      calories: 420,
      protein: 24,
      fiber: 12,
      sugar: 4,
      addedSugar: 0,
      carbs: 48,
      fat: 7,
      sodium: 280,
      potassium: 650,
      calcium: 95,
      seniorHealthHighlight: "Gentle plant proteins with 12g of prebiotic fiber to maintain healthy cholesterol and nighttime digestive comfort.",
      glycemicIndex: 'Low'
    }
  },
  "monday-snacks": {
    calories: 210,
    image: boiledEggsAppleImg,
    imageAlt: "Two peeled hard-boiled eggs halved with crisp red apple wedges",
    nutrition: {
      calories: 210,
      protein: 17,
      fiber: 4.5,
      sugar: 12,
      addedSugar: 0,
      carbs: 16,
      fat: 8,
      sodium: 140,
      potassium: 290,
      calcium: 60,
      seniorHealthHighlight: "Egg choline supports cognitive clarity, while whole apple pectin promotes gentle satiety and vascular flexibility.",
      glycemicIndex: 'Low'
    }
  },

  // Tuesday
  "tuesday-breakfast": {
    calories: 360,
    image: spinachScrambledEggsImg,
    imageAlt: "Fluffy scrambled eggs folded with sautéed spinach on whole grain toast",
    nutrition: {
      calories: 360,
      protein: 26,
      fiber: 6,
      sugar: 2,
      addedSugar: 0,
      carbs: 24,
      fat: 14,
      sodium: 310,
      potassium: 420,
      calcium: 150,
      seniorHealthHighlight: "Lutein from spinach protects aging eyesight; complete egg amino acids stimulate morning muscle protein synthesis.",
      glycemicIndex: 'Low'
    }
  },
  "tuesday-lunch": {
    calories: 460,
    image: grilledChickenBrownRiceImg,
    imageAlt: "Golden grilled chicken breast sliced with brown rice and roasted colorful vegetables",
    nutrition: {
      calories: 460,
      protein: 35,
      fiber: 7,
      sugar: 3,
      addedSugar: 0,
      carbs: 38,
      fat: 11,
      sodium: 250,
      potassium: 750,
      calcium: 90,
      seniorHealthHighlight: "Ultra-clean lean poultry protein paired with complex whole-grain brown rice for sustained afternoon strength.",
      glycemicIndex: 'Low'
    }
  },
  "tuesday-dinner": {
    calories: 320,
    image: cottageCheesePineappleImg,
    imageAlt: "Creamy cottage cheese topped with juicy pineapple chunks and whole grain crackers",
    nutrition: {
      calories: 320,
      protein: 25,
      fiber: 4,
      sugar: 9,
      addedSugar: 0,
      carbs: 28,
      fat: 6,
      sodium: 310,
      potassium: 360,
      calcium: 210,
      seniorHealthHighlight: "Pineapple bromelain enzyme assists protein enzymatic breakdown; light dinner allows deep, undisturbed sleep.",
      glycemicIndex: 'Low'
    }
  },
  "tuesday-snacks": {
    calories: 220,
    image: proteinShakeAlmondMilkImg,
    imageAlt: "Creamy vanilla protein shake with almond milk in a tall clear glass",
    nutrition: {
      calories: 220,
      protein: 24,
      fiber: 3,
      sugar: 4,
      addedSugar: 0,
      carbs: 10,
      fat: 5,
      sodium: 190,
      potassium: 320,
      calcium: 380,
      seniorHealthHighlight: "Quick-absorbing whey/plant peptides replenish muscles post-walk, with calcium-fortified almond milk for bone support.",
      glycemicIndex: 'Low'
    }
  },

  // Wednesday
  "wednesday-breakfast": {
    calories: 340,
    image: overnightOatsBananaNutsImg,
    imageAlt: "Mason jar of creamy overnight oats with sliced banana and crushed walnuts",
    nutrition: {
      calories: 340,
      protein: 24,
      fiber: 8,
      sugar: 10,
      addedSugar: 0,
      carbs: 42,
      fat: 9,
      sodium: 110,
      potassium: 520,
      calcium: 260,
      seniorHealthHighlight: "Soluble oat beta-glucan lowers LDL cholesterol, while walnuts supply plant omega-3 ALA for brain health.",
      glycemicIndex: 'Low'
    }
  },
  "wednesday-lunch": {
    calories: 430,
    image: turkeyAvocadoSaladImg,
    imageAlt: "Sliced roast turkey breast and creamy avocado wrap with crisp mixed greens",
    nutrition: {
      calories: 430,
      protein: 30,
      fiber: 8.5,
      sugar: 2,
      addedSugar: 0,
      carbs: 26,
      fat: 16,
      sodium: 290,
      potassium: 680,
      calcium: 120,
      seniorHealthHighlight: "Lean poultry protein paired with monounsaturated avocado fats helps absorb fat-soluble vitamins (A, D, E, K).",
      glycemicIndex: 'Low'
    }
  },
  "wednesday-dinner": {
    calories: 480,
    image: bakedChickenSweetPotatoImg,
    imageAlt: "Tender baked chicken breast with roasted sweet potato cubes and steamed green beans",
    nutrition: {
      calories: 480,
      protein: 36,
      fiber: 7,
      sugar: 6,
      addedSugar: 0,
      carbs: 34,
      fat: 10,
      sodium: 270,
      potassium: 820,
      calcium: 85,
      seniorHealthHighlight: "High-grade lean protein with sweet potato beta-carotene for immune cell defense and night-time tissue repair.",
      glycemicIndex: 'Low'
    }
  },
  "wednesday-snacks": {
    calories: 200,
    image: almondsGreenPearImg,
    imageAlt: "Raw crunchy almonds served alongside crisp sliced green pear",
    nutrition: {
      calories: 200,
      protein: 14,
      fiber: 6.5,
      sugar: 11,
      addedSugar: 0,
      carbs: 19,
      fat: 10,
      sodium: 20,
      potassium: 340,
      calcium: 95,
      seniorHealthHighlight: "Almond magnesium relaxes muscle fibers and blood vessels, while pear soluble fiber helps stabilize evening blood glucose.",
      glycemicIndex: 'Low'
    }
  },

  // Thursday
  "thursday-breakfast": {
    calories: 340,
    image: spinachBananaSmoothieImg,
    imageAlt: "Fresh green protein smoothie made with spinach, berries, and almond milk",
    nutrition: {
      calories: 340,
      protein: 26,
      fiber: 6.5,
      sugar: 11,
      addedSugar: 0,
      carbs: 30,
      fat: 5,
      sodium: 180,
      potassium: 610,
      calcium: 340,
      seniorHealthHighlight: "Easy-to-drink nutrition for seniors, rich in potassium for healthy blood pressure maintenance.",
      glycemicIndex: 'Low'
    }
  },
  "thursday-lunch": {
    calories: 390,
    image: blackBeanBurritoBowlImg,
    imageAlt: "Vegetarian black bean and feta quinoa burrito bowl with corn and avocado",
    nutrition: {
      calories: 390,
      protein: 25,
      fiber: 10.5,
      sugar: 4,
      addedSugar: 0,
      carbs: 44,
      fat: 9,
      sodium: 340,
      potassium: 680,
      calcium: 220,
      seniorHealthHighlight: "Black bean polyphenols and complex carbs produce short-chain fatty acids (SCFAs) that reduce systemic inflammation.",
      glycemicIndex: 'Low'
    }
  },
  "thursday-dinner": {
    calories: 460,
    image: bakedTofuRiceImg,
    imageAlt: "Pan-seared tofu and mixed vegetable stir-fry with brown rice",
    nutrition: {
      calories: 460,
      protein: 27,
      fiber: 8,
      sugar: 4,
      addedSugar: 1,
      carbs: 42,
      fat: 12,
      sodium: 320,
      potassium: 540,
      calcium: 310,
      seniorHealthHighlight: "High bio-available plant calcium supports bone density; low saturated fat profile keeps blood vessels clear.",
      glycemicIndex: 'Low'
    }
  },
  "thursday-snacks": {
    calories: 220,
    image: yogurtWalnutsHoneyImg,
    imageAlt: "Creamy Greek yogurt topped with toasted walnut halves and golden honey drizzle",
    nutrition: {
      calories: 220,
      protein: 15,
      fiber: 2.5,
      sugar: 9,
      addedSugar: 3,
      carbs: 14,
      fat: 9,
      sodium: 70,
      potassium: 260,
      calcium: 190,
      seniorHealthHighlight: "Plant ALA omega-3 from walnuts paired with gut-calming yogurt cultures to support microvascular circulation.",
      glycemicIndex: 'Low'
    }
  },

  // Friday
  "friday-breakfast": {
    calories: 350,
    image: oatmealChiaBerriesImg,
    imageAlt: "Warm bowl of rolled oatmeal with chia seeds, fresh blueberries, and honey",
    nutrition: {
      calories: 350,
      protein: 23,
      fiber: 9.5,
      sugar: 7,
      addedSugar: 0,
      carbs: 38,
      fat: 7,
      sodium: 120,
      potassium: 440,
      calcium: 290,
      seniorHealthHighlight: "Oat beta-glucan soluble fiber actively binds LDL cholesterol; warm texture is gentle on sensitive senior stomachs.",
      glycemicIndex: 'Low'
    }
  },
  "friday-lunch": {
    calories: 430,
    image: tunaSaladCrackersImg,
    imageAlt: "Fresh tuna salad served with whole grain seeded crackers and mixed greens",
    nutrition: {
      calories: 430,
      protein: 33,
      fiber: 5.5,
      sugar: 3,
      addedSugar: 0,
      carbs: 26,
      fat: 11,
      sodium: 380,
      potassium: 490,
      calcium: 115,
      seniorHealthHighlight: "Light skipjack tuna provides selenium and bioavailable vitamin B12, supporting nerve health and vitality.",
      glycemicIndex: 'Low'
    }
  },
  "friday-dinner": {
    calories: 520,
    image: bakedSalmonAsparagusImg,
    imageAlt: "Oven-baked salmon fillet with roasted green asparagus spears and wild brown rice",
    nutrition: {
      calories: 520,
      protein: 36,
      fiber: 7.5,
      sugar: 2.5,
      addedSugar: 0,
      carbs: 36,
      fat: 18,
      sodium: 220,
      potassium: 890,
      calcium: 90,
      seniorHealthHighlight: "Asparagus contains natural glutathione and prebiotic inulin, pairing with salmon astaxanthin for cellular longevity.",
      glycemicIndex: 'Low'
    }
  },
  "friday-snacks": {
    calories: 180,
    image: eggCarrotsHummusImg,
    imageAlt: "Hard-boiled egg halved with crunchy carrot sticks and chickpea hummus",
    nutrition: {
      calories: 180,
      protein: 16,
      fiber: 3.5,
      sugar: 5,
      addedSugar: 0,
      carbs: 9,
      fat: 7,
      sodium: 130,
      potassium: 310,
      calcium: 55,
      seniorHealthHighlight: "Zero added sugar snack delivering crisp beta-carotene crunch alongside complete egg yolk vitamins D & B2.",
      glycemicIndex: 'Low'
    }
  },

  // Saturday
  "saturday-breakfast": {
    calories: 330,
    image: veggieOmeletPeppersImg,
    imageAlt: "Fluffy egg white omelet folded with diced red bell peppers, spinach, and toast",
    nutrition: {
      calories: 330,
      protein: 25,
      fiber: 4,
      sugar: 3,
      addedSugar: 0,
      carbs: 8,
      fat: 17,
      sodium: 290,
      potassium: 460,
      calcium: 120,
      seniorHealthHighlight: "Mushroom ergothioneine is a unique master antioxidant that protects mitochondrial function in aging cells.",
      glycemicIndex: 'Low'
    }
  },
  "saturday-lunch": {
    calories: 450,
    image: chickenCaesarSaladImg,
    imageAlt: "Grilled chicken Caesar salad with crisp romaine and shaved parmesan",
    nutrition: {
      calories: 450,
      protein: 35,
      fiber: 5,
      sugar: 3,
      addedSugar: 0,
      carbs: 16,
      fat: 15,
      sodium: 340,
      potassium: 620,
      calcium: 170,
      seniorHealthHighlight: "Greek yogurt dressing cuts heavy saturated fats by 70%, keeping cardiovascular load minimal while providing 35g protein.",
      glycemicIndex: 'Low'
    }
  },
  "saturday-dinner": {
    calories: 480,
    image: stuffedBellPeppersImg,
    imageAlt: "Stuffed roasted bell peppers filled with seasoned lean ground turkey and quinoa",
    nutrition: {
      calories: 480,
      protein: 34,
      fiber: 8.5,
      sugar: 5,
      addedSugar: 0,
      carbs: 34,
      fat: 14,
      sodium: 310,
      potassium: 760,
      calcium: 140,
      seniorHealthHighlight: "Bell pepper vitamin C (over 150% RDI) boosts collagen synthesis in skin and tendons, enhancing recovery.",
      glycemicIndex: 'Low'
    }
  },
  "saturday-snacks": {
    calories: 230,
    image: proteinBarOrangeImg,
    imageAlt: "Wholesome protein snack bar served with sweet peeled orange slices",
    nutrition: {
      calories: 230,
      protein: 18,
      fiber: 5,
      sugar: 12,
      addedSugar: 2,
      carbs: 24,
      fat: 6,
      sodium: 110,
      potassium: 330,
      calcium: 80,
      seniorHealthHighlight: "Whole orange citrus flavonoids support endothelial vein health, complemented by high clean whey protein.",
      glycemicIndex: 'Medium'
    }
  },

  // Sunday
  "sunday-breakfast": {
    calories: 310,
    image: yogurtParfaitStrawberriesImg,
    imageAlt: "Layered Greek yogurt parfait with granola clusters and fresh sliced strawberries",
    nutrition: {
      calories: 310,
      protein: 27,
      fiber: 6,
      sugar: 9,
      addedSugar: 1,
      carbs: 26,
      fat: 5.5,
      sodium: 90,
      potassium: 390,
      calcium: 310,
      seniorHealthHighlight: "High calcium & zinc content fosters bone matrix mineralization and immune white-blood-cell activity.",
      glycemicIndex: 'Low'
    }
  },
  "sunday-lunch": {
    calories: 410,
    image: chickenVegSoupImg,
    imageAlt: "Steaming chicken and vegetable soup in clear broth with a warm whole grain dinner roll",
    nutrition: {
      calories: 410,
      protein: 33,
      fiber: 6.5,
      sugar: 3.5,
      addedSugar: 0,
      carbs: 32,
      fat: 9,
      sodium: 360,
      potassium: 710,
      calcium: 95,
      seniorHealthHighlight: "Simmered chicken bone broth provides glycine and electrolytes that hydrate and soothe the gastrointestinal tract.",
      glycemicIndex: 'Low'
    }
  },
  "sunday-dinner": {
    calories: 440,
    image: crispyTofuWildRiceImg,
    imageAlt: "Crispy baked sesame tofu cubes served with wild rice blend and steamed asparagus spears",
    nutrition: {
      calories: 440,
      protein: 26,
      fiber: 8,
      sugar: 3,
      addedSugar: 0,
      carbs: 40,
      fat: 11,
      sodium: 250,
      potassium: 580,
      calcium: 320,
      seniorHealthHighlight: "Isoflavones from fermented non-GMO soy support vascular flexibility and bone mineral retention.",
      glycemicIndex: 'Low'
    }
  },
  "sunday-snacks": {
    calories: 190,
    image: cottageCheesePeachesImg,
    imageAlt: "Creamy cottage cheese bowl topped with ripe sliced summer peaches",
    nutrition: {
      calories: 190,
      protein: 16,
      fiber: 3,
      sugar: 8,
      addedSugar: 0,
      carbs: 12,
      fat: 4.5,
      sodium: 280,
      potassium: 290,
      calcium: 170,
      seniorHealthHighlight: "Light evening snack that delivers gradual amino acid release across the night to prevent muscle catabolism.",
      glycemicIndex: 'Low'
    }
  }
};

/**
 * Returns metadata for a meal key (defaults to Monday breakfast if key not found)
 */
export const getMealMeta = (dayId: string, mealType: string) => {
  const key = `${dayId}-${mealType}`;
  return recipeMetadataMap[key] || recipeMetadataMap["monday-breakfast"];
};

import React, { useState } from 'react';

const DietPlans = () => {
  const [selectedDiet, setSelectedDiet] = useState('vegetarian');
  const [selectedPhase, setSelectedPhase] = useState('menstrual');

  const dietTypes = [
    { id: 'vegetarian', name: 'Vegetarian', icon: '🥬' },
    { id: 'non-vegetarian', name: 'Non-Vegetarian', icon: '🍗' },
    { id: 'vegan', name: 'Vegan', icon: '🌱' }
  ];

  const cyclePhases = [
    { id: 'menstrual', name: 'Menstrual Phase', days: '1-5' },
    { id: 'follicular', name: 'Follicular Phase', days: '1-13' },
    { id: 'ovulation', name: 'Ovulation Phase', days: '14' },
    { id: 'luteal', name: 'Luteal Phase', days: '15-28' }
  ];

  const mealPlans = {
    vegetarian: {
      menstrual: {
        focus: 'Iron-rich foods and anti-inflammatory nutrients',
        meals: {
          breakfast: {
            name: 'Iron-Rich Smoothie Bowl',
            ingredients: ['Spinach', 'Banana', 'Berries', 'Chia seeds', 'Almond butter'],
            benefits: 'High in iron, vitamin C for absorption'
          },
          lunch: {
            name: 'Quinoa Lentil Salad',
            ingredients: ['Quinoa', 'Red lentils', 'Dark leafy greens', 'Pumpkin seeds', 'Olive oil dressing'],
            benefits: 'Complete protein, iron, magnesium'
          },
          dinner: {
            name: 'Turmeric Chickpea Curry',
            ingredients: ['Chickpeas', 'Turmeric', 'Ginger', 'Coconut milk', 'Brown rice'],
            benefits: 'Anti-inflammatory, protein, complex carbs'
          },
          snacks: ['Dark chocolate (70%+)', 'Dates with almonds', 'Green tea']
        }
      },
      follicular: {
        focus: 'Energy-boosting and hormone-supporting foods',
        meals: {
          breakfast: {
            name: 'Overnight Oats with Berries',
            ingredients: ['Steel-cut oats', 'Mixed berries', 'Greek yogurt', 'Flaxseeds', 'Honey'],
            benefits: 'Sustained energy, antioxidants, omega-3s'
          },
          lunch: {
            name: 'Mediterranean Bowl',
            ingredients: ['Hummus', 'Quinoa', 'Cucumber', 'Tomatoes', 'Olives', 'Feta cheese'],
            benefits: 'Healthy fats, protein, fiber'
          },
          dinner: {
            name: 'Stuffed Bell Peppers',
            ingredients: ['Bell peppers', 'Brown rice', 'Black beans', 'Corn', 'Avocado'],
            benefits: 'Vitamin C, fiber, plant protein'
          },
          snacks: ['Apple with almond butter', 'Trail mix', 'Herbal tea']
        }
      },
      ovulation: {
        focus: 'Antioxidant-rich foods for peak fertility',
        meals: {
          breakfast: {
            name: 'Antioxidant Power Bowl',
            ingredients: ['Acai', 'Blueberries', 'Goji berries', 'Granola', 'Coconut flakes'],
            benefits: 'High antioxidants, vitamin E'
          },
          lunch: {
            name: 'Rainbow Veggie Wrap',
            ingredients: ['Whole wheat tortilla', 'Hummus', 'Colorful vegetables', 'Sprouts', 'Avocado'],
            benefits: 'Folate, vitamins, healthy fats'
          },
          dinner: {
            name: 'Roasted Vegetable Pasta',
            ingredients: ['Whole grain pasta', 'Roasted vegetables', 'Pesto', 'Pine nuts', 'Parmesan'],
            benefits: 'Complex carbs, healthy fats, protein'
          },
          snacks: ['Mixed nuts', 'Fresh fruit', 'Green smoothie']
        }
      },
      luteal: {
        focus: 'Mood-stabilizing and craving-control foods',
        meals: {
          breakfast: {
            name: 'Protein Pancakes',
            ingredients: ['Oat flour', 'Protein powder', 'Banana', 'Cinnamon', 'Greek yogurt'],
            benefits: 'Stable blood sugar, protein'
          },
          lunch: {
            name: 'Buddha Bowl',
            ingredients: ['Sweet potato', 'Quinoa', 'Chickpeas', 'Kale', 'Tahini dressing'],
            benefits: 'Complex carbs, magnesium, B vitamins'
          },
          dinner: {
            name: 'Lentil Vegetable Soup',
            ingredients: ['Green lentils', 'Vegetables', 'Vegetable broth', 'Herbs', 'Whole grain bread'],
            benefits: 'Comfort food, fiber, protein'
          },
          snacks: ['Dark chocolate', 'Herbal tea', 'Roasted chickpeas']
        }
      }
    },
    'non-vegetarian': {
      menstrual: {
        focus: 'Iron-rich proteins and anti-inflammatory foods',
        meals: {
          breakfast: {
            name: 'Spinach and Egg Scramble',
            ingredients: ['Eggs', 'Spinach', 'Mushrooms', 'Whole grain toast', 'Avocado'],
            benefits: 'High-quality protein, iron, healthy fats'
          },
          lunch: {
            name: 'Grilled Salmon Salad',
            ingredients: ['Salmon', 'Mixed greens', 'Quinoa', 'Walnuts', 'Olive oil dressing'],
            benefits: 'Omega-3s, protein, anti-inflammatory'
          },
          dinner: {
            name: 'Lean Beef Stir-fry',
            ingredients: ['Lean beef', 'Broccoli', 'Bell peppers', 'Brown rice', 'Ginger'],
            benefits: 'Heme iron, protein, vitamin C'
          },
          snacks: ['Greek yogurt with berries', 'Hard-boiled eggs', 'Bone broth']
        }
      },
      follicular: {
        focus: 'Lean proteins and energy-supporting nutrients',
        meals: {
          breakfast: {
            name: 'Protein Smoothie',
            ingredients: ['Protein powder', 'Berries', 'Spinach', 'Almond milk', 'Chia seeds'],
            benefits: 'Quick protein, antioxidants, omega-3s'
          },
          lunch: {
            name: 'Chicken and Quinoa Bowl',
            ingredients: ['Grilled chicken', 'Quinoa', 'Roasted vegetables', 'Hummus', 'Lemon dressing'],
            benefits: 'Complete protein, complex carbs, fiber'
          },
          dinner: {
            name: 'Baked Cod with Sweet Potato',
            ingredients: ['Cod fillet', 'Sweet potato', 'Asparagus', 'Herbs', 'Olive oil'],
            benefits: 'Lean protein, beta-carotene, fiber'
          },
          snacks: ['Turkey roll-ups', 'Mixed nuts', 'Cottage cheese with fruit']
        }
      },
      ovulation: {
        focus: 'Fertility-supporting proteins and antioxidants',
        meals: {
          breakfast: {
            name: 'Fertility Breakfast Bowl',
            ingredients: ['Eggs', 'Avocado', 'Smoked salmon', 'Whole grain toast', 'Tomatoes'],
            benefits: 'Folate, omega-3s, choline'
          },
          lunch: {
            name: 'Turkey and Veggie Wrap',
            ingredients: ['Turkey breast', 'Whole wheat wrap', 'Vegetables', 'Hummus', 'Sprouts'],
            benefits: 'Lean protein, folate, antioxidants'
          },
          dinner: {
            name: 'Herb-Crusted Chicken',
            ingredients: ['Chicken breast', 'Herb crust', 'Roasted vegetables', 'Quinoa', 'Side salad'],
            benefits: 'High-quality protein, vitamins, minerals'
          },
          snacks: ['Sardines on crackers', 'Greek yogurt', 'Fresh berries']
        }
      },
      luteal: {
        focus: 'Mood-stabilizing proteins and comfort foods',
        meals: {
          breakfast: {
            name: 'Protein-Rich Omelet',
            ingredients: ['Eggs', 'Cheese', 'Vegetables', 'Whole grain toast', 'Fruit'],
            benefits: 'Stable blood sugar, protein, B vitamins'
          },
          lunch: {
            name: 'Chicken Soup',
            ingredients: ['Chicken', 'Vegetables', 'Bone broth', 'Whole grain noodles', 'Herbs'],
            benefits: 'Comfort food, protein, minerals'
          },
          dinner: {
            name: 'Lean Pork with Vegetables',
            ingredients: ['Pork tenderloin', 'Roasted root vegetables', 'Brown rice', 'Green salad'],
            benefits: 'B vitamins, protein, complex carbs'
          },
          snacks: ['Protein bars', 'Cheese and crackers', 'Herbal tea']
        }
      }
    },
    vegan: {
      menstrual: {
        focus: 'Plant-based iron and anti-inflammatory foods',
        meals: {
          breakfast: {
            name: 'Green Power Smoothie',
            ingredients: ['Spinach', 'Banana', 'Plant protein powder', 'Almond milk', 'Hemp seeds'],
            benefits: 'Iron, protein, omega-3s'
          },
          lunch: {
            name: 'Lentil and Quinoa Salad',
            ingredients: ['Red lentils', 'Quinoa', 'Kale', 'Pumpkin seeds', 'Lemon-tahini dressing'],
            benefits: 'Complete protein, iron, magnesium'
          },
          dinner: {
            name: 'Tofu Curry',
            ingredients: ['Firm tofu', 'Coconut milk', 'Turmeric', 'Vegetables', 'Brown rice'],
            benefits: 'Plant protein, anti-inflammatory spices'
          },
          snacks: ['Dark chocolate', 'Dates with tahini', 'Green tea']
        }
      },
      follicular: {
        focus: 'Energy-boosting plant proteins and nutrients',
        meals: {
          breakfast: {
            name: 'Chia Pudding Bowl',
            ingredients: ['Chia seeds', 'Almond milk', 'Berries', 'Granola', 'Maple syrup'],
            benefits: 'Omega-3s, fiber, antioxidants'
          },
          lunch: {
            name: 'Buddha Bowl',
            ingredients: ['Quinoa', 'Chickpeas', 'Roasted vegetables', 'Avocado', 'Tahini sauce'],
            benefits: 'Complete nutrition, healthy fats, fiber'
          },
          dinner: {
            name: 'Stuffed Portobello Mushrooms',
            ingredients: ['Portobello mushrooms', 'Quinoa stuffing', 'Nutritional yeast', 'Herbs'],
            benefits: 'B vitamins, protein, umami flavors'
          },
          snacks: ['Hummus with vegetables', 'Trail mix', 'Coconut water']
        }
      },
      ovulation: {
        focus: 'Antioxidant-rich plant foods for fertility',
        meals: {
          breakfast: {
            name: 'Antioxidant Smoothie Bowl',
            ingredients: ['Mixed berries', 'Spinach', 'Plant protein', 'Coconut milk', 'Goji berries'],
            benefits: 'High antioxidants, plant protein'
          },
          lunch: {
            name: 'Rainbow Salad',
            ingredients: ['Mixed greens', 'Colorful vegetables', 'Seeds', 'Nuts', 'Balsamic dressing'],
            benefits: 'Vitamins, minerals, healthy fats'
          },
          dinner: {
            name: 'Lentil Walnut Bolognese',
            ingredients: ['Lentils', 'Walnuts', 'Tomato sauce', 'Whole grain pasta', 'Nutritional yeast'],
            benefits: 'Plant protein, omega-3s, B vitamins'
          },
          snacks: ['Mixed nuts', 'Fresh fruit', 'Herbal tea']
        }
      },
      luteal: {
        focus: 'Mood-supporting plant foods and comfort meals',
        meals: {
          breakfast: {
            name: 'Oatmeal with Nut Butter',
            ingredients: ['Steel-cut oats', 'Almond butter', 'Banana', 'Cinnamon', 'Plant milk'],
            benefits: 'Stable energy, magnesium, B vitamins'
          },
          lunch: {
            name: 'Hearty Vegetable Soup',
            ingredients: ['Mixed vegetables', 'White beans', 'Vegetable broth', 'Herbs', 'Whole grain bread'],
            benefits: 'Comfort food, fiber, plant protein'
          },
          dinner: {
            name: 'Tempeh Stir-fry',
            ingredients: ['Tempeh', 'Vegetables', 'Brown rice', 'Sesame oil', 'Ginger'],
            benefits: 'Fermented protein, probiotics, anti-inflammatory'
          },
          snacks: ['Dark chocolate', 'Roasted chickpeas', 'Chamomile tea']
        }
      }
    }
  };

  const currentPlan = mealPlans[selectedDiet][selectedPhase];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Cycle-Based Nutrition Plans</h2>
      
      {/* Diet Type Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Select Diet Preference</h3>
        <div className="grid grid-cols-3 gap-3">
          {dietTypes.map((diet) => (
            <button
              key={diet.id}
              onClick={() => setSelectedDiet(diet.id)}
              className={`p-4 rounded-lg border text-center transition-colors ${
                selectedDiet === diet.id
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-300 hover:border-pink-300'
              }`}
            >
              <div className="text-2xl mb-2">{diet.icon}</div>
              <div className="font-medium text-sm">{diet.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Phase Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Select Cycle Phase</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cyclePhases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                selectedPhase === phase.id
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-300 hover:border-pink-300'
              }`}
            >
              <div className="font-medium text-sm">{phase.name}</div>
              <div className="text-xs text-gray-500">Days {phase.days}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Meal Plan */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {cyclePhases.find(p => p.id === selectedPhase).name} - {dietTypes.find(d => d.id === selectedDiet).name}
          </h3>
          <p className="text-gray-600 mt-1">{currentPlan.focus}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {Object.entries(currentPlan.meals).map(([mealType, meal]) => {
            if (mealType === 'snacks') {
              return (
                <div key={mealType} className="bg-white rounded-lg p-4 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 capitalize mb-3">{mealType}</h4>
                  <ul className="space-y-1">
                    {meal.map((snack, index) => (
                      <li key={index} className="text-gray-600 text-sm">• {snack}</li>
                    ))}
                  </ul>
                </div>
              );
            }

            return (
              <div key={mealType} className="bg-white rounded-lg p-4 border border-gray-200">
                <h4 className="font-semibold text-gray-800 capitalize mb-2">{mealType}</h4>
                <h5 className="font-medium text-gray-700 mb-2">{meal.name}</h5>
                <div className="mb-3">
                  <p className="text-xs text-gray-500 mb-1">Ingredients:</p>
                  <div className="flex flex-wrap gap-1">
                    {meal.ingredients.map((ingredient, index) => (
                      <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
                  Benefits: {meal.benefits}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* PCOS-Specific Nutrition Tips */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">🍎 PCOS-Friendly Nutrition Tips</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Choose low glycemic index foods to manage insulin levels</li>
          <li>• Include anti-inflammatory foods like turmeric, ginger, and leafy greens</li>
          <li>• Eat regular meals to maintain stable blood sugar</li>
          <li>• Stay hydrated with water and herbal teas</li>
          <li>• Consider supplements like inositol, vitamin D, and omega-3s (consult your doctor)</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition duration-200">
          Generate Shopping List
        </button>
        <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200">
          Save Meal Plan
        </button>
      </div>
    </div>
  );
};

export default DietPlans;
const Diet = require('../models/Diet');
const Meal = require('../models/Meal');
const { validationResult } = require('express-validator');

// Get all diet plans
const getDietPlans = async (req, res) => {
  try {
    const { category, dietaryRestrictions } = req.query;
    let filter = {};
    
    if (category) {
      filter.category = category;
    }
    
    if (dietaryRestrictions) {
      filter.dietaryRestrictions = { $in: dietaryRestrictions.split(',') };
    }
    
    const dietPlans = await Diet.find(filter);
    res.json(dietPlans);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching diet plans', error: error.message });
  }
};

// Get diet plan by ID
const getDietPlan = async (req, res) => {
  try {
    const dietPlan = await Diet.findById(req.params.id);
    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }
    res.json(dietPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching diet plan', error: error.message });
  }
};

// Create new diet plan (admin only)
const createDietPlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dietPlan = new Diet(req.body);
    await dietPlan.save();
    res.status(201).json(dietPlan);
  } catch (error) {
    res.status(500).json({ message: 'Error creating diet plan', error: error.message });
  }
};

// Log a meal
const logMeal = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const mealData = {
      ...req.body,
      userId: req.user.id
    };

    const meal = new Meal(mealData);
    await meal.save();
    res.status(201).json(meal);
  } catch (error) {
    res.status(500).json({ message: 'Error logging meal', error: error.message });
  }
};

// Get user's meal history
const getMealHistory = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    let filter = { userId: req.user.id };
    
    if (startDate && endDate) {
      filter.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    if (type) {
      filter.type = type;
    }
    
    const meals = await Meal.find(filter).sort({ date: -1 });
    res.json(meals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching meal history', error: error.message });
  }
};

// Get nutrition analytics
const getNutritionAnalytics = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    const userId = req.user.id;
    
    let startDate = new Date();
    if (period === 'week') {
      startDate.setDate(startDate.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(startDate.getMonth() - 1);
    }
    
    const meals = await Meal.find({
      userId,
      date: { $gte: startDate }
    });
    
    // Calculate nutrition totals
    const analytics = meals.reduce((acc, meal) => {
      acc.totalCalories += meal.totalCalories || 0;
      meal.foods.forEach(food => {
        acc.totalProtein += food.nutrition?.protein || 0;
        acc.totalCarbs += food.nutrition?.carbs || 0;
        acc.totalFat += food.nutrition?.fat || 0;
        acc.totalFiber += food.nutrition?.fiber || 0;
      });
      return acc;
    }, {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      totalFiber: 0,
      mealCount: meals.length
    });
    
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching nutrition analytics', error: error.message });
  }
};

module.exports = {
  getDietPlans,
  getDietPlan,
  createDietPlan,
  logMeal,
  getMealHistory,
  getNutritionAnalytics
};
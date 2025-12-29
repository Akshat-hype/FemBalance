const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  ingredients: [{
    type: String,
    required: true
  }],
  instructions: {
    type: String,
    required: true
  },
  nutrition: {
    calories: { type: Number, required: true },
    protein: { type: Number, required: true },
    carbs: { type: Number, required: true },
    fat: { type: Number, required: true },
    fiber: { type: Number, default: 0 }
  }
});

const dietSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    enum: ['pcos-friendly', 'weight-loss', 'maintenance', 'muscle-gain', 'general'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  meals: [mealSchema],
  totalCalories: {
    type: Number,
    required: true
  },
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb']
  }],
  duration: {
    type: String,
    enum: ['1-week', '2-weeks', '1-month', 'ongoing'],
    default: 'ongoing'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  tags: [{
    type: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate total calories from meals
dietSchema.pre('save', function(next) {
  if (this.meals && this.meals.length > 0) {
    this.totalCalories = this.meals.reduce((total, meal) => {
      return total + (meal.nutrition?.calories || 0);
    }, 0);
  }
  next();
});

// Index for efficient querying
dietSchema.index({ category: 1, isActive: 1 });
dietSchema.index({ dietaryRestrictions: 1 });

module.exports = mongoose.model('Diet', dietSchema);
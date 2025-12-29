const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const exerciseController = require('../controllers/exerciseController');
const dietController = require('../controllers/dietController');

// Exercise Routes
router.get('/exercise-plans', exerciseController.getExercisePlans);
router.get('/exercise-plans/:id', exerciseController.getExercisePlan);
router.post('/exercise-plans', auth, [
  body('name').notEmpty().withMessage('Exercise plan name is required'),
  body('category').isIn(['cardio', 'strength', 'flexibility', 'sports', 'mixed']).withMessage('Invalid category'),
  body('difficulty').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Invalid difficulty level')
], exerciseController.createExercisePlan);

// Workout Routes
router.post('/workouts', auth, [
  body('name').notEmpty().withMessage('Workout name is required'),
  body('duration').isNumeric().withMessage('Duration must be a number'),
  body('intensity').isIn(['low', 'medium', 'high', 'very-high']).withMessage('Invalid intensity level'),
  body('type').isIn(['cardio', 'strength', 'flexibility', 'sports', 'mixed']).withMessage('Invalid workout type')
], exerciseController.logWorkout);

router.get('/workouts', auth, exerciseController.getWorkoutHistory);
router.get('/workouts/:id', auth, exerciseController.getWorkout);
router.put('/workouts/:id', auth, exerciseController.updateWorkout);
router.delete('/workouts/:id', auth, exerciseController.deleteWorkout);

// Exercise Analytics Routes
router.get('/exercise-analytics', auth, exerciseController.getExerciseAnalytics);
router.get('/workout-summary', auth, exerciseController.getWorkoutSummary);

// Diet Plan Routes
router.get('/diet-plans', dietController.getDietPlans);
router.get('/diet-plans/:id', dietController.getDietPlan);
router.post('/diet-plans', auth, [
  body('name').notEmpty().withMessage('Diet plan name is required'),
  body('category').isIn(['pcos-friendly', 'weight-loss', 'maintenance', 'muscle-gain', 'general']).withMessage('Invalid category'),
  body('description').notEmpty().withMessage('Description is required')
], dietController.createDietPlan);

// Meal Logging Routes
router.post('/meals', auth, [
  body('type').isIn(['breakfast', 'lunch', 'dinner', 'snack']).withMessage('Invalid meal type'),
  body('foods').isArray({ min: 1 }).withMessage('At least one food item is required'),
  body('foods.*.name').notEmpty().withMessage('Food name is required'),
  body('foods.*.quantity').isNumeric().withMessage('Food quantity must be a number'),
  body('foods.*.calories').isNumeric().withMessage('Calories must be a number')
], dietController.logMeal);

router.get('/meals', auth, dietController.getMealHistory);

// Nutrition Analytics Routes
router.get('/nutrition-analytics', auth, dietController.getNutritionAnalytics);

// Combined Wellness Analytics
router.get('/wellness-summary', auth, async (req, res) => {
  try {
    // This would combine exercise and nutrition data
    // Implementation would depend on specific analytics requirements
    res.json({ message: 'Wellness summary endpoint - to be implemented' });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching wellness summary', error: error.message });
  }
});

module.exports = router;
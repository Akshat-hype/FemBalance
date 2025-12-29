const Exercise = require('../models/Exercise');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Get exercise plans based on cycle phase and fitness level
const getExercisePlans = async (req, res) => {
  try {
    const { cyclePhase, fitnessLevel, pcosOptimized } = req.query;

    const query = {};
    if (cyclePhase) query.cyclePhase = cyclePhase;
    if (fitnessLevel) query.fitnessLevel = fitnessLevel;
    if (pcosOptimized !== undefined) query.pcosOptimized = pcosOptimized === 'true';

    const plans = await Exercise.find(query)
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: plans
    });
  } catch (error) {
    logger.error('Error fetching exercise plans:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get specific exercise plan
const getExercisePlan = async (req, res) => {
  try {
    const { planId } = req.params;

    const plan = await Exercise.findById(planId);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Exercise plan not found'
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    logger.error('Error fetching exercise plan:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Log workout session
const logWorkout = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { 
      exerciseType, 
      duration, 
      intensity, 
      exercises, 
      notes,
      cyclePhase 
    } = req.body;
    
    const userId = req.user.id;

    // Create workout log entry
    const workoutLog = {
      userId,
      date: new Date(),
      exerciseType,
      duration,
      intensity,
      exercises: exercises || [],
      notes,
      cyclePhase,
      caloriesBurned: calculateCaloriesBurned(exerciseType, duration, intensity)
    };

    // For now, we'll store this in a simple format
    // In a real app, you might have a separate WorkoutLog model
    res.status(201).json({
      success: true,
      message: 'Workout logged successfully',
      data: workoutLog
    });
  } catch (error) {
    logger.error('Error logging workout:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get workout recommendations based on user profile
const getWorkoutRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cyclePhase, currentSymptoms } = req.query;

    // Get user's fitness level and preferences (would come from user profile)
    // For now, we'll use default recommendations

    let recommendations = [];

    switch (cyclePhase) {
      case 'menstrual':
        recommendations = [
          {
            type: 'Gentle Yoga',
            duration: '20-30 minutes',
            intensity: 'light',
            benefits: ['Reduces cramps', 'Improves mood', 'Gentle movement'],
            exercises: ['Child\'s pose', 'Cat-cow stretches', 'Gentle twists']
          },
          {
            type: 'Walking',
            duration: '20-30 minutes',
            intensity: 'light',
            benefits: ['Boosts endorphins', 'Reduces bloating', 'Fresh air'],
            exercises: ['Leisurely walk', 'Nature walk', 'Treadmill walk']
          }
        ];
        break;
        
      case 'follicular':
        recommendations = [
          {
            type: 'Strength Training',
            duration: '30-45 minutes',
            intensity: 'moderate',
            benefits: ['Builds muscle', 'Increases energy', 'Improves metabolism'],
            exercises: ['Squats', 'Push-ups', 'Lunges', 'Planks']
          },
          {
            type: 'Cardio',
            duration: '30-40 minutes',
            intensity: 'moderate',
            benefits: ['Cardiovascular health', 'Energy boost', 'Mood enhancement'],
            exercises: ['Jogging', 'Cycling', 'Dance cardio']
          }
        ];
        break;
        
      case 'ovulation':
        recommendations = [
          {
            type: 'HIIT Training',
            duration: '20-30 minutes',
            intensity: 'vigorous',
            benefits: ['Peak performance', 'Maximum calorie burn', 'Strength gains'],
            exercises: ['Burpees', 'Mountain climbers', 'Jump squats', 'Sprint intervals']
          },
          {
            type: 'Group Fitness',
            duration: '45-60 minutes',
            intensity: 'moderate-vigorous',
            benefits: ['Social interaction', 'Motivation', 'Fun workout'],
            exercises: ['Zumba', 'Spin class', 'Boot camp']
          }
        ];
        break;
        
      case 'luteal':
        recommendations = [
          {
            type: 'Moderate Strength Training',
            duration: '30-45 minutes',
            intensity: 'moderate',
            benefits: ['Maintains strength', 'Manages PMS', 'Stress relief'],
            exercises: ['Controlled movements', 'Moderate weights', 'Focus on form']
          },
          {
            type: 'Yoga/Pilates',
            duration: '45-60 minutes',
            intensity: 'light-moderate',
            benefits: ['Stress relief', 'Flexibility', 'Mind-body connection'],
            exercises: ['Vinyasa flow', 'Pilates core work', 'Restorative poses']
          }
        ];
        break;
        
      default:
        recommendations = [
          {
            type: 'Balanced Routine',
            duration: '30-45 minutes',
            intensity: 'moderate',
            benefits: ['Overall fitness', 'Flexibility', 'Strength'],
            exercises: ['Mix of cardio and strength', 'Stretching', 'Core work']
          }
        ];
    }

    res.json({
      success: true,
      data: {
        cyclePhase,
        recommendations,
        pcosOptimized: true,
        generalTips: [
          'Listen to your body and adjust intensity as needed',
          'Stay hydrated throughout your workout',
          'Include both cardio and strength training in your routine',
          'Don\'t forget to warm up and cool down'
        ]
      }
    });
  } catch (error) {
    logger.error('Error getting workout recommendations:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Helper function to calculate calories burned (simplified)
const calculateCaloriesBurned = (exerciseType, duration, intensity) => {
  const baseCaloriesPerMinute = {
    'walking': 4,
    'jogging': 8,
    'running': 12,
    'cycling': 7,
    'swimming': 10,
    'yoga': 3,
    'pilates': 4,
    'strength-training': 6,
    'hiit': 12,
    'dance': 6
  };

  const intensityMultiplier = {
    'light': 0.8,
    'moderate': 1.0,
    'vigorous': 1.3
  };

  const baseCalories = baseCaloriesPerMinute[exerciseType.toLowerCase()] || 5;
  const multiplier = intensityMultiplier[intensity] || 1.0;
  
  return Math.round(baseCalories * duration * multiplier);
};

module.exports = {
  getExercisePlans,
  getExercisePlan,
  logWorkout,
  getWorkoutRecommendations
};
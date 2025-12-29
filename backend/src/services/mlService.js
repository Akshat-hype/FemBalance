const axios = require('axios');
const { ML_SERVICE_URL } = require('../config/environment');

class MLService {
  constructor() {
    this.mlServiceUrl = ML_SERVICE_URL || 'http://localhost:8000';
    this.timeout = 30000; // 30 seconds timeout
  }

  // Predict PCOS risk
  async predictPCOSRisk(userData) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/predict/pcos-risk`,
        {
          age: userData.age,
          bmi: userData.bmi,
          cycleLength: userData.averageCycleLength,
          periodLength: userData.averagePeriodLength,
          symptoms: userData.symptoms || [],
          lifestyle: {
            exerciseFrequency: userData.exerciseFrequency || 0,
            dietQuality: userData.dietQuality || 'moderate',
            stressLevel: userData.stressLevel || 'moderate',
            sleepQuality: userData.sleepQuality || 'good'
          },
          familyHistory: userData.familyHistory || false,
          medicalHistory: userData.medicalHistory || []
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        riskScore: response.data.risk_score,
        riskLevel: response.data.risk_level,
        confidence: response.data.confidence,
        factors: response.data.contributing_factors,
        recommendations: response.data.recommendations,
        modelVersion: response.data.model_version
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`PCOS risk prediction failed: ${error.message}`);
    }
  }

  // Predict next cycle
  async predictNextCycle(cycleHistory) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/predict/next-cycle`,
        {
          cycles: cycleHistory.map(cycle => ({
            startDate: cycle.startDate,
            cycleLength: cycle.cycleLength,
            periodLength: cycle.periodLength,
            symptoms: cycle.symptoms || []
          }))
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        predictedStartDate: new Date(response.data.predicted_start_date),
        predictedCycleLength: response.data.predicted_cycle_length,
        confidence: response.data.confidence,
        fertileWindow: {
          start: new Date(response.data.fertile_window.start),
          end: new Date(response.data.fertile_window.end)
        },
        ovulationDate: new Date(response.data.ovulation_date)
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`Cycle prediction failed: ${error.message}`);
    }
  }

  // Analyze symptoms patterns
  async analyzeSymptomPatterns(symptomsData) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/analyze/symptoms`,
        {
          symptoms: symptomsData.map(symptom => ({
            type: symptom.type,
            severity: symptom.severity,
            date: symptom.date,
            cycleDay: symptom.cycleDay,
            notes: symptom.notes
          }))
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        patterns: response.data.patterns,
        correlations: response.data.correlations,
        trends: response.data.trends,
        insights: response.data.insights,
        recommendations: response.data.recommendations
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`Symptom analysis failed: ${error.message}`);
    }
  }

  // Get personalized recommendations
  async getPersonalizedRecommendations(userProfile) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/recommendations/personalized`,
        {
          userProfile: {
            age: userProfile.age,
            bmi: userProfile.bmi,
            activityLevel: userProfile.activityLevel,
            healthGoals: userProfile.healthGoals,
            medicalConditions: userProfile.medicalConditions || [],
            preferences: userProfile.preferences || {}
          },
          recentData: {
            cycles: userProfile.recentCycles || [],
            symptoms: userProfile.recentSymptoms || [],
            workouts: userProfile.recentWorkouts || [],
            meals: userProfile.recentMeals || []
          }
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        exerciseRecommendations: response.data.exercise_recommendations,
        nutritionRecommendations: response.data.nutrition_recommendations,
        lifestyleRecommendations: response.data.lifestyle_recommendations,
        cycleSpecificTips: response.data.cycle_specific_tips,
        priority: response.data.priority_level
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`Personalized recommendations failed: ${error.message}`);
    }
  }

  // Analyze workout effectiveness
  async analyzeWorkoutEffectiveness(workoutData, healthMetrics) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/analyze/workout-effectiveness`,
        {
          workouts: workoutData.map(workout => ({
            type: workout.type,
            duration: workout.duration,
            intensity: workout.intensity,
            caloriesBurned: workout.totalCaloriesBurned,
            date: workout.date,
            cycleDay: workout.cycleDay
          })),
          healthMetrics: {
            weight: healthMetrics.weight,
            bodyFat: healthMetrics.bodyFat,
            muscleMass: healthMetrics.muscleMass,
            restingHeartRate: healthMetrics.restingHeartRate
          }
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        effectiveness: response.data.effectiveness_score,
        improvements: response.data.suggested_improvements,
        optimalTiming: response.data.optimal_timing,
        cycleBasedRecommendations: response.data.cycle_based_recommendations
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`Workout analysis failed: ${error.message}`);
    }
  }

  // Analyze nutrition patterns
  async analyzeNutritionPatterns(nutritionData) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/analyze/nutrition`,
        {
          meals: nutritionData.map(meal => ({
            type: meal.type,
            totalCalories: meal.totalCalories,
            nutrition: meal.totalNutrition,
            date: meal.date,
            cycleDay: meal.cycleDay
          }))
        },
        {
          timeout: this.timeout,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        nutritionalBalance: response.data.nutritional_balance,
        deficiencies: response.data.potential_deficiencies,
        recommendations: response.data.recommendations,
        cycleBasedNutrition: response.data.cycle_based_nutrition,
        trends: response.data.trends
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`Nutrition analysis failed: ${error.message}`);
    }
  }

  // Health check for ML service
  async healthCheck() {
    try {
      const response = await axios.get(
        `${this.mlServiceUrl}/health`,
        { timeout: 5000 }
      );

      return {
        status: 'healthy',
        version: response.data.version,
        uptime: response.data.uptime,
        models: response.data.available_models
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message
      };
    }
  }

  // Batch prediction for multiple users (admin function)
  async batchPredict(predictions) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/batch/predict`,
        { predictions },
        {
          timeout: 60000, // 1 minute for batch operations
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data.results;
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`Batch prediction failed: ${error.message}`);
    }
  }

  // Update model with new data (admin function)
  async updateModel(modelType, trainingData) {
    try {
      const response = await axios.post(
        `${this.mlServiceUrl}/api/models/${modelType}/update`,
        { trainingData },
        {
          timeout: 300000, // 5 minutes for model updates
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        success: true,
        modelVersion: response.data.new_version,
        accuracy: response.data.accuracy_metrics,
        updateTime: response.data.update_time
      };
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        throw new Error('ML service is not available');
      }
      throw new Error(`Model update failed: ${error.message}`);
    }
  }
}

module.exports = new MLService();
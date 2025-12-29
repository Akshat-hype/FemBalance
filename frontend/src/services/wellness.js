import { apiService } from './api';

export const wellnessService = {
  // Exercise related
  async getExercisePlans(cyclePhase = null) {
    const params = cyclePhase ? `?phase=${cyclePhase}` : '';
    return apiService.get(`/wellness/exercises${params}`);
  },

  async getTodaysWorkout() {
    return apiService.get('/wellness/exercises/today');
  },

  async logWorkout(workoutData) {
    return apiService.post('/wellness/workouts', workoutData);
  },

  async getWorkoutHistory(limit = 30) {
    return apiService.get(`/wellness/workouts?limit=${limit}`);
  },

  async updateWorkout(workoutId, updateData) {
    return apiService.put(`/wellness/workouts/${workoutId}`, updateData);
  },

  async deleteWorkout(workoutId) {
    return apiService.delete(`/wellness/workouts/${workoutId}`);
  },

  // Diet related
  async getDietPlans(preferences = {}) {
    return apiService.post('/wellness/diet-plans', preferences);
  },

  async getTodaysMeals() {
    return apiService.get('/wellness/diet-plans/today');
  },

  async getMealRecommendations(cyclePhase, dietType = 'balanced') {
    return apiService.get(`/wellness/diet-plans/recommendations?phase=${cyclePhase}&type=${dietType}`);
  },

  async logMeal(mealData) {
    return apiService.post('/wellness/meals', mealData);
  },

  async getMealHistory(limit = 30) {
    return apiService.get(`/wellness/meals?limit=${limit}`);
  },

  // Progress tracking
  async getProgressStats(timeRange = '1month') {
    return apiService.get(`/wellness/progress?range=${timeRange}`);
  },

  async updateProgress(progressData) {
    return apiService.post('/wellness/progress', progressData);
  },

  async getWeightHistory() {
    return apiService.get('/wellness/progress/weight');
  },

  async logWeight(weightData) {
    return apiService.post('/wellness/progress/weight', weightData);
  },

  // Wellness insights
  async getWellnessInsights() {
    return apiService.get('/wellness/insights');
  },

  async getPersonalizedTips(userProfile) {
    return apiService.post('/wellness/tips', userProfile);
  }
};
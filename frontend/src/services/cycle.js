import { apiService } from './api';

export const cycleService = {
  async getCycleData() {
    return apiService.get('/cycles');
  },

  async getCycleStats() {
    return apiService.get('/cycles/stats');
  },

  async logPeriod(periodData) {
    return apiService.post('/cycles', periodData);
  },

  async updateCycle(cycleId, updateData) {
    return apiService.put(`/cycles/${cycleId}`, updateData);
  },

  async deleteCycle(cycleId) {
    return apiService.delete(`/cycles/${cycleId}`);
  },

  async getCyclePredictions() {
    return apiService.get('/cycles/predictions');
  },

  async getCycleHistory(limit = 12) {
    return apiService.get(`/cycles?limit=${limit}`);
  },

  async getCycleById(cycleId) {
    return apiService.get(`/cycles/${cycleId}`);
  },

  async markCycleComplete(cycleId, endDate) {
    return apiService.put(`/cycles/${cycleId}`, {
      endDate,
      isComplete: true
    });
  },

  async getCycleAnalytics(timeRange = '6months') {
    return apiService.get(`/cycles/analytics?range=${timeRange}`);
  }
};
import { apiService } from './api';

export const symptomService = {
  async getSymptoms(dateRange = null) {
    const params = dateRange ? `?startDate=${dateRange.start}&endDate=${dateRange.end}` : '';
    return apiService.get(`/symptoms${params}`);
  },

  async logSymptom(symptomData) {
    return apiService.post('/symptoms', symptomData);
  },

  async updateSymptom(symptomId, updateData) {
    return apiService.put(`/symptoms/${symptomId}`, updateData);
  },

  async deleteSymptom(symptomId) {
    return apiService.delete(`/symptoms/${symptomId}`);
  },

  async getSymptomHistory(limit = 30) {
    return apiService.get(`/symptoms/history?limit=${limit}`);
  },

  async getSymptomsByDate(date) {
    return apiService.get(`/symptoms?date=${date}`);
  },

  async getSymptomTrends(timeRange = '3months') {
    return apiService.get(`/symptoms/trends?range=${timeRange}`);
  },

  async bulkLogSymptoms(symptomsArray) {
    return apiService.post('/symptoms/bulk', { symptoms: symptomsArray });
  }
};
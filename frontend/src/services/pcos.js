import { apiService } from './api';

export const pcosService = {
  async getRiskAssessment() {
    return apiService.get('/pcos/risk-assessment');
  },

  async submitRiskAssessment(assessmentData) {
    return apiService.post('/pcos/risk-assessment', assessmentData);
  },

  async getAssessmentHistory() {
    return apiService.get('/pcos/history');
  },

  async getRecommendations(riskLevel = null) {
    const params = riskLevel ? `?riskLevel=${riskLevel}` : '';
    return apiService.get(`/pcos/recommendations${params}`);
  },

  async getDetailedReport(assessmentId) {
    return apiService.get(`/pcos/reports/${assessmentId}`);
  },

  async updateAssessment(assessmentId, updateData) {
    return apiService.put(`/pcos/assessments/${assessmentId}`, updateData);
  },

  async deleteAssessment(assessmentId) {
    return apiService.delete(`/pcos/assessments/${assessmentId}`);
  },

  async getEducationalContent() {
    return apiService.get('/pcos/education');
  },

  async trackSymptomChanges(timeRange = '6months') {
    return apiService.get(`/pcos/symptom-tracking?range=${timeRange}`);
  }
};
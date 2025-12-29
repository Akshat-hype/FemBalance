import { apiService } from './api';

export const authService = {
  async login(credentials) {
    const response = await apiService.post('/auth/login', credentials);
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  async register(userData) {
    const response = await apiService.post('/auth/register', userData);
    if (response.token) {
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
    }
    return response;
  },

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    return apiService.post('/auth/logout');
  },

  async getCurrentUser() {
    return apiService.get('/auth/me');
  },

  async forgotPassword(email) {
    return apiService.post('/auth/forgot-password', { email });
  },

  async resetPassword(token, password) {
    return apiService.post('/auth/reset-password', { token, password });
  },

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  getStoredToken() {
    return localStorage.getItem('authToken');
  },

  isAuthenticated() {
    return !!this.getStoredToken();
  }
};
// API-related constants

export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    ME: '/auth/me'
  },
  
  // Users
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
    DELETE_ACCOUNT: '/users/account'
  },
  
  // Cycles
  CYCLES: {
    LIST: '/cycles',
    CREATE: '/cycles',
    UPDATE: '/cycles/:id',
    DELETE: '/cycles/:id',
    STATS: '/cycles/stats',
    PREDICTIONS: '/cycles/predictions'
  },
  
  // Symptoms
  SYMPTOMS: {
    LIST: '/symptoms',
    CREATE: '/symptoms',
    UPDATE: '/symptoms/:id',
    DELETE: '/symptoms/:id',
    HISTORY: '/symptoms/history'
  },
  
  // PCOS
  PCOS: {
    RISK_ASSESSMENT: '/pcos/risk-assessment',
    HISTORY: '/pcos/history',
    RECOMMENDATIONS: '/pcos/recommendations'
  },
  
  // Wellness
  WELLNESS: {
    EXERCISES: '/wellness/exercises',
    DIET_PLANS: '/wellness/diet-plans',
    WORKOUTS: '/wellness/workouts',
    PROGRESS: '/wellness/progress'
  },
  
  // Blog
  BLOG: {
    POSTS: '/blog/posts',
    POST: '/blog/posts/:id',
    CATEGORIES: '/blog/categories',
    SEARCH: '/blog/search'
  }
};

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};

export const API_ERRORS = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
};

export const REQUEST_TIMEOUT = 30000; // 30 seconds

export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 second
  RETRY_MULTIPLIER: 2
};

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100
};
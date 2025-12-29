// Application constants

export const CYCLE_PHASES = {
  MENSTRUAL: 'menstrual',
  FOLLICULAR: 'follicular',
  OVULATION: 'ovulation',
  LUTEAL: 'luteal'
};

export const FLOW_INTENSITY = {
  LIGHT: 'light',
  NORMAL: 'normal',
  HEAVY: 'heavy'
};

export const SYMPTOM_SEVERITY = {
  NONE: 0,
  MILD: 1,
  MODERATE: 2,
  SEVERE: 3,
  VERY_SEVERE: 4,
  EXTREME: 5
};

export const PCOS_RISK_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const EXERCISE_TYPES = {
  NONE: 'none',
  LIGHT: 'light',
  MODERATE: 'moderate',
  INTENSE: 'intense'
};

export const DIET_TYPES = {
  VEGETARIAN: 'vegetarian',
  NON_VEGETARIAN: 'non_vegetarian',
  VEGAN: 'vegan',
  BALANCED: 'balanced'
};

export const NOTIFICATION_TYPES = {
  PERIOD_REMINDER: 'period_reminder',
  OVULATION_REMINDER: 'ovulation_reminder',
  IRREGULARITY_ALERT: 'irregularity_alert',
  PCOS_INSIGHT: 'pcos_insight',
  WELLNESS_TIP: 'wellness_tip'
};

export const DATE_FORMATS = {
  ISO: 'YYYY-MM-DD',
  US: 'MM/DD/YYYY',
  EU: 'DD/MM/YYYY',
  DISPLAY: 'DD MMM YYYY'
};

export const CYCLE_CONSTANTS = {
  MIN_CYCLE_LENGTH: 15,
  MAX_CYCLE_LENGTH: 45,
  AVERAGE_CYCLE_LENGTH: 28,
  MIN_PERIOD_LENGTH: 1,
  MAX_PERIOD_LENGTH: 10,
  AVERAGE_PERIOD_LENGTH: 5,
  OVULATION_DAY_BEFORE_PERIOD: 14
};

export const BMI_CATEGORIES = {
  UNDERWEIGHT: { min: 0, max: 18.5, label: 'Underweight' },
  NORMAL: { min: 18.5, max: 25, label: 'Normal' },
  OVERWEIGHT: { min: 25, max: 30, label: 'Overweight' },
  OBESE: { min: 30, max: 100, label: 'Obese' }
};

export const COLORS = {
  PRIMARY: {
    50: '#fdf2f8',
    100: '#fce7f3',
    200: '#fbcfe8',
    300: '#f9a8d4',
    400: '#f472b6',
    500: '#ec4899',
    600: '#db2777',
    700: '#be185d',
    800: '#9d174d',
    900: '#831843'
  },
  CYCLE_PHASES: {
    menstrual: '#ef4444',
    follicular: '#3b82f6',
    ovulation: '#10b981',
    luteal: '#f59e0b'
  },
  RISK_LEVELS: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444'
  }
};

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password'
  },
  CYCLES: {
    LIST: '/cycles',
    CREATE: '/cycles',
    STATS: '/cycles/stats',
    PREDICTIONS: '/cycles/predictions'
  },
  SYMPTOMS: {
    LIST: '/symptoms',
    CREATE: '/symptoms',
    HISTORY: '/symptoms/history'
  },
  PCOS: {
    ASSESSMENT: '/pcos/risk-assessment',
    HISTORY: '/pcos/history',
    RECOMMENDATIONS: '/pcos/recommendations'
  },
  WELLNESS: {
    EXERCISES: '/wellness/exercises',
    DIET: '/wellness/diet-plans',
    PROGRESS: '/wellness/progress'
  }
};

export const LOCAL_STORAGE_KEYS = {
  AUTH_TOKEN: 'fembalance_auth_token',
  USER_DATA: 'fembalance_user_data',
  PREFERENCES: 'fembalance_preferences',
  THEME: 'fembalance_theme'
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.'
};
const path = require('path');
const logger = require('../utils/logger');

// Load environment variables
require('dotenv').config();

// Environment configuration
const ENV_CONFIG = {
  // Application
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT) || 3001,
  HOST: process.env.HOST || '0.0.0.0',
  
  // Database
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/fembalance',
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  
  // CORS
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ? 
    process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim()) : 
    ['http://localhost:3000', 'http://localhost:3001'],
  
  // External APIs
  ML_API_URL: process.env.ML_API_URL || 'http://localhost:8000',
  
  // Redis (optional)
  REDIS_URL: process.env.REDIS_URL,
  
  // Email (optional)
  EMAIL_SERVICE: process.env.EMAIL_SERVICE,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@fembalance.com',
  
  // File uploads
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  UPLOAD_DIR: process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads'),
  
  // Security
  BCRYPT_ROUNDS: parseInt(process.env.BCRYPT_ROUNDS) || 12,
  SESSION_SECRET: process.env.SESSION_SECRET || 'your-session-secret-change-in-production',
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  
  // Logging
  LOG_LEVEL: process.env.LOG_LEVEL || 'info',
  LOG_FILE: process.env.LOG_FILE,
  
  // Health checks
  HEALTH_CHECK_INTERVAL: parseInt(process.env.HEALTH_CHECK_INTERVAL) || 30000, // 30 seconds
  
  // Feature flags
  ENABLE_SWAGGER: process.env.ENABLE_SWAGGER === 'true',
  ENABLE_METRICS: process.env.ENABLE_METRICS === 'true',
  ENABLE_RATE_LIMITING: process.env.ENABLE_RATE_LIMITING !== 'false', // Enabled by default
  
  // Third-party integrations
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  
  // Monitoring
  SENTRY_DSN: process.env.SENTRY_DSN,
  
  // Development
  MOCK_ML_API: process.env.MOCK_ML_API === 'true',
  SEED_DATABASE: process.env.SEED_DATABASE === 'true'
};

// Validation rules for different environments
const VALIDATION_RULES = {
  production: {
    required: [
      'JWT_SECRET',
      'MONGODB_URI',
      'FRONTEND_URL'
    ],
    warnings: [
      'EMAIL_SERVICE',
      'EMAIL_USER',
      'EMAIL_PASS',
      'REDIS_URL'
    ]
  },
  development: {
    warnings: [
      'JWT_SECRET'
    ]
  },
  test: {
    required: [
      'MONGODB_URI'
    ]
  }
};

// Validate environment configuration
const validateEnvironment = () => {
  const env = ENV_CONFIG.NODE_ENV;
  const rules = VALIDATION_RULES[env] || {};
  
  // Check required variables
  if (rules.required) {
    const missing = rules.required.filter(key => !process.env[key]);
    if (missing.length > 0) {
      logger.error(`Missing required environment variables for ${env}: ${missing.join(', ')}`);
      process.exit(1);
    }
  }
  
  // Check warning variables
  if (rules.warnings) {
    const missing = rules.warnings.filter(key => !process.env[key]);
    if (missing.length > 0) {
      logger.warn(`Missing recommended environment variables for ${env}: ${missing.join(', ')}`);
    }
  }
  
  // Validate specific configurations
  validateSpecificConfigs();
  
  logger.info(`Environment validation passed for ${env} mode`);
};

// Validate specific configuration values
const validateSpecificConfigs = () => {
  // Validate PORT
  if (ENV_CONFIG.PORT < 1 || ENV_CONFIG.PORT > 65535) {
    logger.error('PORT must be between 1 and 65535');
    process.exit(1);
  }
  
  // Validate JWT_SECRET in production
  if (ENV_CONFIG.NODE_ENV === 'production') {
    if (ENV_CONFIG.JWT_SECRET === 'your-super-secret-jwt-key-change-in-production') {
      logger.error('JWT_SECRET must be changed in production');
      process.exit(1);
    }
    
    if (ENV_CONFIG.JWT_SECRET.length < 32) {
      logger.warn('JWT_SECRET should be at least 32 characters long');
    }
  }
  
  // Validate MONGODB_URI format
  if (!ENV_CONFIG.MONGODB_URI.startsWith('mongodb://') && !ENV_CONFIG.MONGODB_URI.startsWith('mongodb+srv://')) {
    logger.error('MONGODB_URI must be a valid MongoDB connection string');
    process.exit(1);
  }
  
  // Validate BCRYPT_ROUNDS
  if (ENV_CONFIG.BCRYPT_ROUNDS < 10 || ENV_CONFIG.BCRYPT_ROUNDS > 15) {
    logger.warn('BCRYPT_ROUNDS should be between 10 and 15 for optimal security/performance balance');
  }
  
  // Validate MAX_FILE_SIZE
  if (ENV_CONFIG.MAX_FILE_SIZE > 50 * 1024 * 1024) { // 50MB
    logger.warn('MAX_FILE_SIZE is very large, consider reducing for better performance');
  }
};

// Get environment-specific database name
const getDatabaseName = () => {
  const env = ENV_CONFIG.NODE_ENV;
  const baseUri = ENV_CONFIG.MONGODB_URI;
  
  // Extract database name from URI or use environment-specific default
  const match = baseUri.match(/\/([^/?]+)(\?|$)/);
  const baseName = match ? match[1] : 'fembalance';
  
  switch (env) {
    case 'test':
      return `${baseName}_test`;
    case 'development':
      return `${baseName}_dev`;
    default:
      return baseName;
  }
};

// Get CORS configuration
const getCorsConfig = () => {
  return {
    origin: ENV_CONFIG.ALLOWED_ORIGINS,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count']
  };
};

// Check if running in production
const isProduction = () => ENV_CONFIG.NODE_ENV === 'production';

// Check if running in development
const isDevelopment = () => ENV_CONFIG.NODE_ENV === 'development';

// Check if running in test
const isTest = () => ENV_CONFIG.NODE_ENV === 'test';

// Get configuration summary (without sensitive data)
const getConfigSummary = () => {
  const summary = { ...ENV_CONFIG };
  
  // Remove sensitive information
  const sensitiveKeys = [
    'JWT_SECRET',
    'MONGODB_URI',
    'EMAIL_PASS',
    'SESSION_SECRET',
    'GOOGLE_CLIENT_SECRET',
    'SENTRY_DSN'
  ];
  
  sensitiveKeys.forEach(key => {
    if (summary[key]) {
      summary[key] = '[REDACTED]';
    }
  });
  
  return summary;
};

// Initialize environment configuration
const initializeEnvironment = () => {
  validateEnvironment();
  
  // Log configuration summary in development
  if (isDevelopment()) {
    logger.debug('Environment configuration:', getConfigSummary());
  }
  
  logger.info(`Application initialized in ${ENV_CONFIG.NODE_ENV} mode`);
};

module.exports = {
  ENV_CONFIG,
  validateEnvironment,
  getDatabaseName,
  getCorsConfig,
  isProduction,
  isDevelopment,
  isTest,
  getConfigSummary,
  initializeEnvironment
};
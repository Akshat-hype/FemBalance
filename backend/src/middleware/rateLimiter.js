const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('redis');
const logger = require('../utils/logger');

// Create Redis client if available
let redisClient = null;
if (process.env.REDIS_URL) {
  try {
    redisClient = Redis.createClient({
      url: process.env.REDIS_URL
    });
    
    redisClient.on('error', (err) => {
      logger.error('Redis client error:', err);
    });
    
    redisClient.on('connect', () => {
      logger.info('Connected to Redis for rate limiting');
    });
  } catch (error) {
    logger.error('Failed to create Redis client:', error);
  }
}

// General API rate limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }) : undefined,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
  onLimitReached: (req) => {
    logger.warn(`Rate limit reached for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// Strict rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs for auth endpoints
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }) : undefined,
  skipSuccessfulRequests: true, // Don't count successful requests
  onLimitReached: (req) => {
    logger.warn(`Auth rate limit reached for IP: ${req.ip}, Path: ${req.path}`);
  }
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }) : undefined,
  onLimitReached: (req) => {
    logger.warn(`Password reset rate limit reached for IP: ${req.ip}`);
  }
});

// PCOS assessment rate limiter
const pcosAssessmentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 PCOS assessments per hour
  message: {
    success: false,
    message: 'Too many PCOS assessments, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }) : undefined,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user ? `pcos_${req.user.id}` : `pcos_ip_${req.ip}`;
  },
  onLimitReached: (req) => {
    logger.warn(`PCOS assessment rate limit reached for ${req.user ? `user: ${req.user.id}` : `IP: ${req.ip}`}`);
  }
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // Limit each IP to 20 uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }) : undefined,
  onLimitReached: (req) => {
    logger.warn(`Upload rate limit reached for IP: ${req.ip}`);
  }
});

// API key rate limiter (for external integrations)
const apiKeyLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1000, // Higher limit for API key users
  message: {
    success: false,
    message: 'API rate limit exceeded.',
    retryAfter: '1 hour'
  },
  standardHeaders: true,
  legacyHeaders: false,
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.sendCommand(args),
  }) : undefined,
  keyGenerator: (req) => {
    return `api_key_${req.headers['x-api-key'] || req.ip}`;
  },
  skip: (req) => {
    // Only apply to requests with API keys
    return !req.headers['x-api-key'];
  }
});

// Create a custom rate limiter factory
const createCustomLimiter = (options = {}) => {
  const defaultOptions = {
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: {
      success: false,
      message: 'Rate limit exceeded, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    store: redisClient ? new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args),
    }) : undefined
  };

  return rateLimit({ ...defaultOptions, ...options });
};

// Middleware to add rate limit info to response headers
const addRateLimitInfo = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Add rate limit info to JSON responses
    if (res.get('Content-Type') && res.get('Content-Type').includes('application/json')) {
      try {
        const parsedData = typeof data === 'string' ? JSON.parse(data) : data;
        if (parsedData && typeof parsedData === 'object') {
          parsedData.rateLimit = {
            limit: res.get('RateLimit-Limit'),
            remaining: res.get('RateLimit-Remaining'),
            reset: res.get('RateLimit-Reset')
          };
          data = JSON.stringify(parsedData);
        }
      } catch (error) {
        // If parsing fails, continue without adding rate limit info
      }
    }
    
    originalSend.call(this, data);
  };
  
  next();
};

// Cleanup function for graceful shutdown
const cleanup = async () => {
  if (redisClient) {
    try {
      await redisClient.quit();
      logger.info('Redis client disconnected');
    } catch (error) {
      logger.error('Error disconnecting Redis client:', error);
    }
  }
};

module.exports = {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  pcosAssessmentLimiter,
  uploadLimiter,
  apiKeyLimiter,
  createCustomLimiter,
  addRateLimitInfo,
  cleanup
};
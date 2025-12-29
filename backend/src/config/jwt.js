const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// JWT configuration
const JWT_CONFIG = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  issuer: process.env.JWT_ISSUER || 'fembalance-api',
  audience: process.env.JWT_AUDIENCE || 'fembalance-app'
};

// Validate JWT configuration
const validateJWTConfig = () => {
  if (!JWT_CONFIG.secret || JWT_CONFIG.secret === 'your-super-secret-jwt-key-change-in-production') {
    if (process.env.NODE_ENV === 'production') {
      logger.error('JWT_SECRET must be set in production environment');
      process.exit(1);
    } else {
      logger.warn('Using default JWT secret. Change this in production!');
    }
  }

  if (JWT_CONFIG.secret.length < 32) {
    logger.warn('JWT secret should be at least 32 characters long for better security');
  }
};

// Generate access token
const generateAccessToken = (payload) => {
  try {
    const tokenPayload = {
      ...payload,
      type: 'access',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(tokenPayload, JWT_CONFIG.secret, {
      expiresIn: JWT_CONFIG.expiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithm: 'HS256'
    });
  } catch (error) {
    logger.error('Error generating access token:', error);
    throw new Error('Token generation failed');
  }
};

// Generate refresh token
const generateRefreshToken = (payload) => {
  try {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(tokenPayload, JWT_CONFIG.secret, {
      expiresIn: JWT_CONFIG.refreshExpiresIn,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithm: 'HS256'
    });
  } catch (error) {
    logger.error('Error generating refresh token:', error);
    throw new Error('Refresh token generation failed');
  }
};

// Generate token pair (access + refresh)
const generateTokenPair = (payload) => {
  return {
    accessToken: generateAccessToken(payload),
    refreshToken: generateRefreshToken(payload),
    expiresIn: JWT_CONFIG.expiresIn,
    tokenType: 'Bearer'
  };
};

// Verify token
const verifyToken = (token, options = {}) => {
  try {
    const verifyOptions = {
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithms: ['HS256'],
      ...options
    };

    return jwt.verify(token, JWT_CONFIG.secret, verifyOptions);
  } catch (error) {
    logger.debug('Token verification failed:', error.message);
    
    // Provide more specific error messages
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token has expired');
    } else if (error.name === 'JsonWebTokenError') {
      throw new Error('Invalid token');
    } else if (error.name === 'NotBeforeError') {
      throw new Error('Token not active yet');
    } else {
      throw new Error('Token verification failed');
    }
  }
};

// Decode token without verification (for debugging)
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    logger.error('Error decoding token:', error);
    return null;
  }
};

// Check if token is expired
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return true;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    return true;
  }
};

// Get token expiration time
const getTokenExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    return null;
  }
};

// Get time until token expires (in seconds)
const getTimeUntilExpiration = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) {
      return 0;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, decoded.exp - currentTime);
  } catch (error) {
    return 0;
  }
};

// Refresh access token using refresh token
const refreshAccessToken = (refreshToken) => {
  try {
    // Verify refresh token
    const decoded = verifyToken(refreshToken);
    
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    // Generate new access token
    const payload = {
      id: decoded.id,
      email: decoded.email
    };

    return generateAccessToken(payload);
  } catch (error) {
    logger.error('Error refreshing access token:', error);
    throw error;
  }
};

// Extract token from Authorization header
const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

// Generate password reset token
const generatePasswordResetToken = (payload) => {
  try {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      type: 'password_reset',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(tokenPayload, JWT_CONFIG.secret, {
      expiresIn: '1h', // Password reset tokens expire in 1 hour
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithm: 'HS256'
    });
  } catch (error) {
    logger.error('Error generating password reset token:', error);
    throw new Error('Password reset token generation failed');
  }
};

// Generate email verification token
const generateEmailVerificationToken = (payload) => {
  try {
    const tokenPayload = {
      id: payload.id,
      email: payload.email,
      type: 'email_verification',
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(tokenPayload, JWT_CONFIG.secret, {
      expiresIn: '24h', // Email verification tokens expire in 24 hours
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      algorithm: 'HS256'
    });
  } catch (error) {
    logger.error('Error generating email verification token:', error);
    throw new Error('Email verification token generation failed');
  }
};

// Initialize JWT configuration
const initializeJWT = () => {
  validateJWTConfig();
  logger.info('JWT configuration initialized');
};

module.exports = {
  JWT_CONFIG,
  initializeJWT,
  generateAccessToken,
  generateRefreshToken,
  generateTokenPair,
  verifyToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiration,
  getTimeUntilExpiration,
  refreshAccessToken,
  extractTokenFromHeader,
  generatePasswordResetToken,
  generateEmailVerificationToken
};
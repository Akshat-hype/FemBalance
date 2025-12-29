const { body, param, query, validationResult } = require('express-validator');

// Common validation rules
const validationRules = {
  // User validation
  email: body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  
  password: body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  name: body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Name can only contain letters and spaces'),

  // Date validation
  date: (field) => body(field)
    .isISO8601()
    .toDate()
    .withMessage(`${field} must be a valid date`),

  // Numeric validation
  positiveNumber: (field) => body(field)
    .isFloat({ min: 0 })
    .withMessage(`${field} must be a positive number`),

  // Cycle validation
  cycleLength: body('cycleLength')
    .optional()
    .isInt({ min: 21, max: 35 })
    .withMessage('Cycle length must be between 21 and 35 days'),

  periodLength: body('periodLength')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Period length must be between 1 and 10 days'),

  // Symptom validation
  symptomType: body('type')
    .isIn(['cramps', 'bloating', 'mood_swings', 'headache', 'fatigue', 'acne', 'breast_tenderness', 'back_pain', 'nausea', 'other'])
    .withMessage('Invalid symptom type'),

  severity: body('severity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Severity must be between 1 and 10'),

  // Exercise validation
  exerciseType: body('type')
    .isIn(['cardio', 'strength', 'flexibility', 'sports', 'mixed'])
    .withMessage('Invalid exercise type'),

  intensity: body('intensity')
    .isIn(['low', 'medium', 'high', 'very-high'])
    .withMessage('Invalid intensity level'),

  duration: body('duration')
    .isInt({ min: 1, max: 300 })
    .withMessage('Duration must be between 1 and 300 minutes'),

  // Diet validation
  mealType: body('type')
    .isIn(['breakfast', 'lunch', 'dinner', 'snack'])
    .withMessage('Invalid meal type'),

  calories: body('calories')
    .isFloat({ min: 0, max: 5000 })
    .withMessage('Calories must be between 0 and 5000'),

  // MongoDB ObjectId validation
  mongoId: (field) => param(field)
    .isMongoId()
    .withMessage(`Invalid ${field} format`),

  // Query parameter validation
  limit: query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  page: query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  // File validation
  imageFile: (field) => body(field)
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('Image file is required');
      }
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error('Only JPEG, PNG, and GIF images are allowed');
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (req.file.size > maxSize) {
        throw new Error('Image size must be less than 5MB');
      }
      
      return true;
    })
};

// Validation rule sets for different endpoints
const validationSets = {
  // Auth validations
  register: [
    validationRules.name,
    validationRules.email,
    validationRules.password
  ],

  login: [
    validationRules.email,
    body('password').notEmpty().withMessage('Password is required')
  ],

  changePassword: [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    validationRules.password.withMessage('New password must be at least 8 characters long and contain at least one lowercase letter, one uppercase letter, and one number')
  ],

  // Cycle validations
  createCycle: [
    validationRules.date('startDate'),
    validationRules.cycleLength,
    validationRules.periodLength
  ],

  updateCycle: [
    validationRules.mongoId('id'),
    validationRules.date('startDate').optional(),
    validationRules.cycleLength,
    validationRules.periodLength
  ],

  // Symptom validations
  logSymptom: [
    validationRules.symptomType,
    validationRules.severity,
    validationRules.date('date').optional(),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
  ],

  updateSymptom: [
    validationRules.mongoId('id'),
    validationRules.symptomType.optional(),
    validationRules.severity.optional(),
    body('notes').optional().isLength({ max: 500 }).withMessage('Notes must be less than 500 characters')
  ],

  // Exercise validations
  logWorkout: [
    body('name').trim().notEmpty().withMessage('Workout name is required'),
    validationRules.exerciseType,
    validationRules.intensity,
    validationRules.duration,
    body('startTime').isISO8601().toDate().withMessage('Start time must be a valid date'),
    body('endTime').optional().isISO8601().toDate().withMessage('End time must be a valid date'),
    body('caloriesBurned').optional().isFloat({ min: 0 }).withMessage('Calories burned must be a positive number')
  ],

  // Diet validations
  logMeal: [
    validationRules.mealType,
    body('foods').isArray({ min: 1 }).withMessage('At least one food item is required'),
    body('foods.*.name').notEmpty().withMessage('Food name is required'),
    body('foods.*.quantity').isFloat({ min: 0 }).withMessage('Food quantity must be a positive number'),
    body('foods.*.calories').isFloat({ min: 0 }).withMessage('Food calories must be a positive number')
  ],

  // General validations
  pagination: [
    validationRules.limit,
    validationRules.page
  ],

  dateRange: [
    query('startDate').optional().isISO8601().toDate().withMessage('Start date must be a valid date'),
    query('endDate').optional().isISO8601().toDate().withMessage('End date must be a valid date')
  ]
};

// Custom validators
const customValidators = {
  // Check if end date is after start date
  dateRange: (startDate, endDate) => {
    if (startDate && endDate && new Date(endDate) <= new Date(startDate)) {
      throw new Error('End date must be after start date');
    }
    return true;
  },

  // Check if user owns the resource
  resourceOwnership: async (resourceId, userId, Model) => {
    const resource = await Model.findById(resourceId);
    if (!resource) {
      throw new Error('Resource not found');
    }
    if (resource.userId.toString() !== userId.toString()) {
      throw new Error('Access denied');
    }
    return true;
  },

  // Validate cycle day
  cycleDay: (cycleDay) => {
    if (cycleDay < 1 || cycleDay > 50) {
      throw new Error('Cycle day must be between 1 and 50');
    }
    return true;
  },

  // Validate BMI calculation
  bmi: (height, weight) => {
    if (!height || !weight) return true; // Optional fields
    
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    
    if (bmi < 10 || bmi > 50) {
      throw new Error('BMI calculation seems incorrect. Please check height and weight values');
    }
    return true;
  }
};

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  next();
};

// Sanitization helpers
const sanitizers = {
  // Remove HTML tags and trim whitespace
  cleanText: (text) => {
    if (typeof text !== 'string') return text;
    return text.replace(/<[^>]*>/g, '').trim();
  },

  // Normalize email
  normalizeEmail: (email) => {
    if (typeof email !== 'string') return email;
    return email.toLowerCase().trim();
  },

  // Clean phone number
  cleanPhoneNumber: (phone) => {
    if (typeof phone !== 'string') return phone;
    return phone.replace(/[^\d+]/g, '');
  },

  // Sanitize search query
  sanitizeSearchQuery: (query) => {
    if (typeof query !== 'string') return query;
    return query.replace(/[<>]/g, '').trim().substring(0, 100);
  }
};

module.exports = {
  validationRules,
  validationSets,
  customValidators,
  handleValidationErrors,
  sanitizers
};
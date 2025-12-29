const express = require('express');
const { body, query } = require('express-validator');
const symptomController = require('../controllers/symptomController');
const { validateRequest } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const logSymptomValidation = [
  body('date')
    .isISO8601()
    .withMessage('Please provide a valid date'),
  body('symptoms')
    .optional()
    .isObject()
    .withMessage('Symptoms must be an object'),
  body('symptoms.cramps')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Cramps severity must be between 0-5'),
  body('symptoms.bloating')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Bloating severity must be between 0-5'),
  body('symptoms.moodSwings')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Mood swings severity must be between 0-5'),
  body('symptoms.fatigue')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Fatigue severity must be between 0-5'),
  body('symptoms.acne')
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage('Acne severity must be between 0-5'),
  body('lifestyle')
    .optional()
    .isObject()
    .withMessage('Lifestyle must be an object'),
  body('lifestyle.sleepHours')
    .optional()
    .isFloat({ min: 0, max: 24 })
    .withMessage('Sleep hours must be between 0-24'),
  body('lifestyle.stressLevel')
    .optional()
    .isInt({ min: 0, max: 10 })
    .withMessage('Stress level must be between 0-10'),
  body('lifestyle.exerciseMinutes')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Exercise minutes must be a positive number'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateSymptomValidation = [
  body('symptoms')
    .optional()
    .isObject()
    .withMessage('Symptoms must be an object'),
  body('lifestyle')
    .optional()
    .isObject()
    .withMessage('Lifestyle must be an object'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const getSymptomsValidation = [
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO date'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
];

const getHistoryValidation = [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365')
];

const bulkLogValidation = [
  body('symptoms')
    .isArray({ min: 1 })
    .withMessage('Symptoms array is required and must not be empty'),
  body('symptoms.*.date')
    .isISO8601()
    .withMessage('Each symptom log must have a valid date'),
  body('symptoms.*.symptoms')
    .optional()
    .isObject()
    .withMessage('Symptoms must be an object'),
  body('symptoms.*.lifestyle')
    .optional()
    .isObject()
    .withMessage('Lifestyle must be an object')
];

// Routes
router.get('/', getSymptomsValidation, validateRequest, symptomController.getSymptoms);
router.post('/', logSymptomValidation, validateRequest, symptomController.logSymptom);
router.put('/:id', updateSymptomValidation, validateRequest, symptomController.updateSymptom);
router.delete('/:id', symptomController.deleteSymptom);

// History and analytics
router.get('/history', getHistoryValidation, validateRequest, symptomController.getSymptomHistory);
router.get('/stats', getHistoryValidation, validateRequest, symptomController.getSymptomStats);

// Bulk operations
router.post('/bulk', bulkLogValidation, validateRequest, symptomController.bulkLogSymptoms);

module.exports = router;
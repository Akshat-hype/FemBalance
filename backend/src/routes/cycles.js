const express = require('express');
const { body, query } = require('express-validator');
const cycleController = require('../controllers/cycleController');
const { validateRequest } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const createCycleValidation = [
  body('startDate')
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('flow')
    .optional()
    .isIn(['light', 'normal', 'heavy'])
    .withMessage('Flow must be light, normal, or heavy'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const updateCycleValidation = [
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid start date'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid end date'),
  body('flow')
    .optional()
    .isIn(['light', 'normal', 'heavy'])
    .withMessage('Flow must be light, normal, or heavy'),
  body('notes')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Notes cannot exceed 500 characters')
];

const getCyclesValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer')
];

// Routes
router.get('/', getCyclesValidation, validateRequest, cycleController.getCycles);
router.post('/', createCycleValidation, validateRequest, cycleController.createCycle);
router.put('/:id', updateCycleValidation, validateRequest, cycleController.updateCycle);
router.delete('/:id', cycleController.deleteCycle);

// Statistics and predictions
router.get('/stats', cycleController.getStats);
router.get('/predictions', cycleController.getPredictions);

module.exports = router;
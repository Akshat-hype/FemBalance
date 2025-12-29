const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');
const { validateRequest } = require('../middleware/validation');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('First name cannot be empty'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Last name cannot be empty'),
  body('height')
    .optional()
    .isFloat({ min: 100, max: 250 })
    .withMessage('Height must be between 100-250 cm'),
  body('weight')
    .optional()
    .isFloat({ min: 30, max: 300 })
    .withMessage('Weight must be between 30-300 kg'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date of birth')
];

const updatePreferencesValidation = [
  body('units')
    .optional()
    .isIn(['metric', 'imperial'])
    .withMessage('Units must be either metric or imperial'),
  body('notifications.periodReminders')
    .optional()
    .isBoolean()
    .withMessage('Period reminders must be a boolean'),
  body('notifications.ovulationReminders')
    .optional()
    .isBoolean()
    .withMessage('Ovulation reminders must be a boolean'),
  body('notifications.irregularityAlerts')
    .optional()
    .isBoolean()
    .withMessage('Irregularity alerts must be a boolean'),
  body('privacy.dataSharing')
    .optional()
    .isBoolean()
    .withMessage('Data sharing must be a boolean'),
  body('privacy.analytics')
    .optional()
    .isBoolean()
    .withMessage('Analytics must be a boolean')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

const deleteAccountValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required to delete account')
];

// Routes
router.get('/profile', userController.getProfile);
router.put('/profile', updateProfileValidation, validateRequest, userController.updateProfile);

router.get('/preferences', userController.getPreferences);
router.put('/preferences', updatePreferencesValidation, validateRequest, userController.updatePreferences);

router.put('/change-password', changePasswordValidation, validateRequest, userController.changePassword);

router.get('/stats', userController.getStats);

router.delete('/account', deleteAccountValidation, validateRequest, userController.deleteAccount);

module.exports = router;
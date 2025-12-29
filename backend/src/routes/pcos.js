const express = require('express');
const { body } = require('express-validator');
const auth = require('../middleware/auth');
const {
  submitAssessment,
  getAssessments,
  getAssessmentById,
  getLatestAssessment,
  deleteAssessment,
  getRiskStatistics
} = require('../controllers/pcosController');

const router = express.Router();

// Validation middleware for assessment submission
const validateAssessment = [
  body('responses')
    .isObject()
    .withMessage('Responses must be an object'),
  body('riskScore')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Risk score must be between 0 and 100'),
  body('riskLevel')
    .isIn(['Low', 'Medium', 'High'])
    .withMessage('Risk level must be Low, Medium, or High')
];

// @route   POST /api/pcos/assessment
// @desc    Submit PCOS risk assessment
// @access  Private
router.post('/assessment', auth, validateAssessment, submitAssessment);

// @route   GET /api/pcos/assessments
// @desc    Get user's PCOS risk assessments
// @access  Private
router.get('/assessments', auth, getAssessments);

// @route   GET /api/pcos/assessment/latest
// @desc    Get user's latest PCOS risk assessment
// @access  Private
router.get('/assessment/latest', auth, getLatestAssessment);

// @route   GET /api/pcos/assessment/:assessmentId
// @desc    Get specific PCOS risk assessment
// @access  Private
router.get('/assessment/:assessmentId', auth, getAssessmentById);

// @route   DELETE /api/pcos/assessment/:assessmentId
// @desc    Delete PCOS risk assessment
// @access  Private
router.delete('/assessment/:assessmentId', auth, deleteAssessment);

// @route   GET /api/pcos/statistics
// @desc    Get PCOS risk statistics for user
// @access  Private
router.get('/statistics', auth, getRiskStatistics);

module.exports = router;
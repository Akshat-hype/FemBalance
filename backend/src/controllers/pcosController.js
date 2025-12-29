const PCOSRisk = require('../models/PCOSRisk');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

// Submit PCOS risk assessment
const submitAssessment = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { responses, riskScore, riskLevel } = req.body;
    const userId = req.user.id;

    // Create new assessment
    const assessment = new PCOSRisk({
      userId,
      responses,
      riskScore,
      riskLevel,
      assessmentDate: new Date()
    });

    await assessment.save();

    logger.info(`PCOS assessment submitted for user ${userId}`);

    res.status(201).json({
      success: true,
      message: 'Assessment submitted successfully',
      data: {
        assessmentId: assessment._id,
        riskLevel: assessment.riskLevel,
        riskScore: assessment.riskScore,
        assessmentDate: assessment.assessmentDate
      }
    });
  } catch (error) {
    logger.error('Error submitting PCOS assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user's PCOS risk assessments
const getAssessments = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit = 10, page = 1 } = req.query;

    const assessments = await PCOSRisk.find({ userId })
      .sort({ assessmentDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-responses'); // Exclude detailed responses for list view

    const total = await PCOSRisk.countDocuments({ userId });

    res.json({
      success: true,
      data: {
        assessments,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    logger.error('Error fetching PCOS assessments:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get specific assessment details
const getAssessmentById = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user.id;

    const assessment = await PCOSRisk.findOne({
      _id: assessmentId,
      userId
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    logger.error('Error fetching PCOS assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get latest assessment
const getLatestAssessment = async (req, res) => {
  try {
    const userId = req.user.id;

    const assessment = await PCOSRisk.findOne({ userId })
      .sort({ assessmentDate: -1 });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'No assessments found'
      });
    }

    res.json({
      success: true,
      data: assessment
    });
  } catch (error) {
    logger.error('Error fetching latest PCOS assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete assessment
const deleteAssessment = async (req, res) => {
  try {
    const { assessmentId } = req.params;
    const userId = req.user.id;

    const assessment = await PCOSRisk.findOneAndDelete({
      _id: assessmentId,
      userId
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found'
      });
    }

    logger.info(`PCOS assessment ${assessmentId} deleted for user ${userId}`);

    res.json({
      success: true,
      message: 'Assessment deleted successfully'
    });
  } catch (error) {
    logger.error('Error deleting PCOS assessment:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get risk statistics
const getRiskStatistics = async (req, res) => {
  try {
    const userId = req.user.id;

    const assessments = await PCOSRisk.find({ userId })
      .sort({ assessmentDate: -1 })
      .limit(12); // Last 12 assessments

    if (assessments.length === 0) {
      return res.json({
        success: true,
        data: {
          totalAssessments: 0,
          riskTrend: null,
          averageRisk: null
        }
      });
    }

    const riskLevels = assessments.map(a => a.riskLevel);
    const riskScores = assessments.map(a => a.riskScore);

    // Calculate trend (comparing latest with previous)
    let riskTrend = 'stable';
    if (assessments.length > 1) {
      const latest = assessments[0].riskScore;
      const previous = assessments[1].riskScore;
      if (latest > previous) riskTrend = 'increasing';
      else if (latest < previous) riskTrend = 'decreasing';
    }

    const averageRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;

    res.json({
      success: true,
      data: {
        totalAssessments: assessments.length,
        riskTrend,
        averageRisk: Math.round(averageRisk * 100) / 100,
        latestRisk: assessments[0].riskLevel,
        assessmentHistory: assessments.map(a => ({
          date: a.assessmentDate,
          riskLevel: a.riskLevel,
          riskScore: a.riskScore
        }))
      }
    });
  } catch (error) {
    logger.error('Error fetching PCOS risk statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  submitAssessment,
  getAssessments,
  getAssessmentById,
  getLatestAssessment,
  deleteAssessment,
  getRiskStatistics
};
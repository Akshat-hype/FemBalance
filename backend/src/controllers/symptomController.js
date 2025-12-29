const Symptom = require('../models/Symptom');
const logger = require('../utils/logger');

const symptomController = {
  // Get user's symptoms
  async getSymptoms(req, res, next) {
    try {
      const { startDate, endDate, limit = 30, page = 1 } = req.query;
      const skip = (page - 1) * limit;

      let query = { userId: req.userId };

      // Add date range filter if provided
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      const symptoms = await Symptom.find(query)
        .sort({ date: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Symptom.countDocuments(query);

      res.json({
        symptoms,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: symptoms.length,
          totalRecords: total
        }
      });
    } catch (error) {
      logger.error('Get symptoms error:', error);
      next(error);
    }
  },

  // Create or update symptom log for a specific date
  async logSymptom(req, res, next) {
    try {
      const { date, symptoms, lifestyle, notes } = req.body;
      const logDate = new Date(date);

      // Check if symptom log already exists for this date
      let symptomLog = await Symptom.findOne({
        userId: req.userId,
        date: {
          $gte: new Date(logDate.setHours(0, 0, 0, 0)),
          $lt: new Date(logDate.setHours(23, 59, 59, 999))
        }
      });

      if (symptomLog) {
        // Update existing log
        symptomLog.symptoms = { ...symptomLog.symptoms, ...symptoms };
        symptomLog.lifestyle = { ...symptomLog.lifestyle, ...lifestyle };
        if (notes !== undefined) symptomLog.notes = notes;
        
        await symptomLog.save();
        
        logger.info(`Symptom log updated for user: ${req.userId}, date: ${date}`);
        res.json({
          message: 'Symptom log updated successfully',
          symptom: symptomLog
        });
      } else {
        // Create new log
        symptomLog = new Symptom({
          userId: req.userId,
          date: new Date(date),
          symptoms: symptoms || {},
          lifestyle: lifestyle || {},
          notes
        });

        await symptomLog.save();
        
        logger.info(`New symptom log created for user: ${req.userId}, date: ${date}`);
        res.status(201).json({
          message: 'Symptom log created successfully',
          symptom: symptomLog
        });
      }
    } catch (error) {
      logger.error('Log symptom error:', error);
      next(error);
    }
  },

  // Update symptom log
  async updateSymptom(req, res, next) {
    try {
      const { id } = req.params;
      const { symptoms, lifestyle, notes } = req.body;

      const symptomLog = await Symptom.findOne({ _id: id, userId: req.userId });
      if (!symptomLog) {
        return res.status(404).json({ message: 'Symptom log not found' });
      }

      // Update fields
      if (symptoms) symptomLog.symptoms = { ...symptomLog.symptoms, ...symptoms };
      if (lifestyle) symptomLog.lifestyle = { ...symptomLog.lifestyle, ...lifestyle };
      if (notes !== undefined) symptomLog.notes = notes;

      await symptomLog.save();

      logger.info(`Symptom log updated for user: ${req.userId}`);
      res.json({
        message: 'Symptom log updated successfully',
        symptom: symptomLog
      });
    } catch (error) {
      logger.error('Update symptom error:', error);
      next(error);
    }
  },

  // Delete symptom log
  async deleteSymptom(req, res, next) {
    try {
      const { id } = req.params;

      const symptomLog = await Symptom.findOneAndDelete({ _id: id, userId: req.userId });
      if (!symptomLog) {
        return res.status(404).json({ message: 'Symptom log not found' });
      }

      logger.info(`Symptom log deleted for user: ${req.userId}`);
      res.json({ message: 'Symptom log deleted successfully' });
    } catch (error) {
      logger.error('Delete symptom error:', error);
      next(error);
    }
  },

  // Get symptom history with trends
  async getSymptomHistory(req, res, next) {
    try {
      const { days = 30 } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const symptoms = await Symptom.getSymptomsByDateRange(
        req.userId,
        startDate,
        endDate
      );

      // Calculate trends for key symptoms
      const trendData = {};
      const keySymptoms = ['cramps', 'bloating', 'moodSwings', 'fatigue', 'acne'];

      for (const symptom of keySymptoms) {
        trendData[symptom] = await Symptom.getSymptomTrends(
          req.userId,
          symptom,
          parseInt(days)
        );
      }

      res.json({
        symptoms,
        trends: trendData,
        period: {
          startDate,
          endDate,
          days: parseInt(days)
        }
      });
    } catch (error) {
      logger.error('Get symptom history error:', error);
      next(error);
    }
  },

  // Get symptom statistics
  async getSymptomStats(req, res, next) {
    try {
      const { days = 90 } = req.query;
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(days));

      const symptoms = await Symptom.find({
        userId: req.userId,
        date: { $gte: startDate, $lte: endDate }
      });

      if (symptoms.length === 0) {
        return res.json({
          totalLogs: 0,
          averageSeverity: null,
          mostCommonSymptoms: [],
          pcosRiskFactors: 0
        });
      }

      // Calculate statistics
      const totalLogs = symptoms.length;
      
      // Calculate average severity scores
      const severityScores = symptoms.map(s => s.calculateSeverityScore());
      const avgPhysical = severityScores.reduce((sum, s) => sum + s.physical, 0) / totalLogs;
      const avgEmotional = severityScores.reduce((sum, s) => sum + s.emotional, 0) / totalLogs;
      const avgOverall = severityScores.reduce((sum, s) => sum + s.overall, 0) / totalLogs;

      // Find most common symptoms
      const symptomCounts = {};
      const physicalSymptoms = ['cramps', 'bloating', 'breastTenderness', 'headache', 'backache', 'acne', 'fatigue'];
      const emotionalSymptoms = ['moodSwings', 'irritability', 'anxiety', 'depression'];

      [...physicalSymptoms, ...emotionalSymptoms].forEach(symptom => {
        symptomCounts[symptom] = symptoms.filter(s => s.symptoms[symptom] > 0).length;
      });

      const mostCommonSymptoms = Object.entries(symptomCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([symptom, count]) => ({
          symptom,
          count,
          percentage: Math.round((count / totalLogs) * 100)
        }));

      // Count PCOS risk factors
      const pcosRiskFactors = symptoms.filter(s => s.hasPCOSSymptoms()).length;

      res.json({
        totalLogs,
        averageSeverity: {
          physical: Math.round(avgPhysical),
          emotional: Math.round(avgEmotional),
          overall: Math.round(avgOverall)
        },
        mostCommonSymptoms,
        pcosRiskFactors,
        pcosRiskPercentage: Math.round((pcosRiskFactors / totalLogs) * 100)
      });
    } catch (error) {
      logger.error('Get symptom stats error:', error);
      next(error);
    }
  },

  // Bulk log symptoms
  async bulkLogSymptoms(req, res, next) {
    try {
      const { symptoms: symptomLogs } = req.body;

      if (!Array.isArray(symptomLogs) || symptomLogs.length === 0) {
        return res.status(400).json({ message: 'Symptoms array is required' });
      }

      const results = [];
      const errors = [];

      for (const [index, logData] of symptomLogs.entries()) {
        try {
          const { date, symptoms, lifestyle, notes } = logData;
          
          // Check if log already exists
          const existingLog = await Symptom.findOne({
            userId: req.userId,
            date: {
              $gte: new Date(new Date(date).setHours(0, 0, 0, 0)),
              $lt: new Date(new Date(date).setHours(23, 59, 59, 999))
            }
          });

          let symptomLog;
          if (existingLog) {
            // Update existing
            existingLog.symptoms = { ...existingLog.symptoms, ...symptoms };
            existingLog.lifestyle = { ...existingLog.lifestyle, ...lifestyle };
            if (notes !== undefined) existingLog.notes = notes;
            symptomLog = await existingLog.save();
          } else {
            // Create new
            symptomLog = new Symptom({
              userId: req.userId,
              date: new Date(date),
              symptoms: symptoms || {},
              lifestyle: lifestyle || {},
              notes
            });
            symptomLog = await symptomLog.save();
          }

          results.push(symptomLog);
        } catch (error) {
          errors.push({
            index,
            error: error.message,
            data: logData
          });
        }
      }

      logger.info(`Bulk symptom log completed for user: ${req.userId}. Success: ${results.length}, Errors: ${errors.length}`);

      res.json({
        message: 'Bulk symptom logging completed',
        success: results.length,
        errors: errors.length,
        results,
        errorDetails: errors
      });
    } catch (error) {
      logger.error('Bulk log symptoms error:', error);
      next(error);
    }
  }
};

module.exports = symptomController;
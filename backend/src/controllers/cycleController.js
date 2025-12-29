const Cycle = require('../models/Cycle');
const logger = require('../utils/logger');

const cycleController = {
  // Get user's cycles
  async getCycles(req, res, next) {
    try {
      const { limit = 12, page = 1 } = req.query;
      const skip = (page - 1) * limit;

      const cycles = await Cycle.find({ userId: req.userId })
        .sort({ startDate: -1 })
        .limit(parseInt(limit))
        .skip(skip);

      const total = await Cycle.countDocuments({ userId: req.userId });

      res.json({
        cycles,
        pagination: {
          current: parseInt(page),
          total: Math.ceil(total / limit),
          count: cycles.length,
          totalRecords: total
        }
      });
    } catch (error) {
      logger.error('Get cycles error:', error);
      next(error);
    }
  },

  // Create new cycle
  async createCycle(req, res, next) {
    try {
      const { startDate, endDate, flow, notes } = req.body;

      // Check if there's already a cycle for this start date
      const existingCycle = await Cycle.findOne({
        userId: req.userId,
        startDate: new Date(startDate)
      });

      if (existingCycle) {
        return res.status(400).json({ message: 'Cycle already exists for this date' });
      }

      const cycle = new Cycle({
        userId: req.userId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        flow,
        notes,
        isComplete: !!endDate
      });

      // Calculate cycle length if this is a complete cycle
      if (endDate) {
        const prevCycle = await Cycle.findOne({
          userId: req.userId,
          startDate: { $lt: new Date(startDate) }
        }).sort({ startDate: -1 });

        if (prevCycle) {
          const diffTime = new Date(startDate) - new Date(prevCycle.startDate);
          cycle.cycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        }
      }

      // Check for irregularity
      cycle.isIrregular = await cycle.checkIrregularity();

      await cycle.save();

      logger.info(`New cycle created for user: ${req.userId}`);
      res.status(201).json({
        message: 'Cycle created successfully',
        cycle
      });
    } catch (error) {
      logger.error('Create cycle error:', error);
      next(error);
    }
  },

  // Update cycle
  async updateCycle(req, res, next) {
    try {
      const { id } = req.params;
      const { startDate, endDate, flow, notes } = req.body;

      const cycle = await Cycle.findOne({ _id: id, userId: req.userId });
      if (!cycle) {
        return res.status(404).json({ message: 'Cycle not found' });
      }

      // Update fields
      if (startDate) cycle.startDate = new Date(startDate);
      if (endDate !== undefined) {
        cycle.endDate = endDate ? new Date(endDate) : null;
        cycle.isComplete = !!endDate;
      }
      if (flow) cycle.flow = flow;
      if (notes !== undefined) cycle.notes = notes;

      // Recalculate irregularity
      cycle.isIrregular = await cycle.checkIrregularity();

      await cycle.save();

      logger.info(`Cycle updated for user: ${req.userId}`);
      res.json({
        message: 'Cycle updated successfully',
        cycle
      });
    } catch (error) {
      logger.error('Update cycle error:', error);
      next(error);
    }
  },

  // Delete cycle
  async deleteCycle(req, res, next) {
    try {
      const { id } = req.params;

      const cycle = await Cycle.findOneAndDelete({ _id: id, userId: req.userId });
      if (!cycle) {
        return res.status(404).json({ message: 'Cycle not found' });
      }

      logger.info(`Cycle deleted for user: ${req.userId}`);
      res.json({ message: 'Cycle deleted successfully' });
    } catch (error) {
      logger.error('Delete cycle error:', error);
      next(error);
    }
  },

  // Get cycle statistics
  async getStats(req, res, next) {
    try {
      const cycles = await Cycle.find({ userId: req.userId, isComplete: true })
        .sort({ startDate: -1 })
        .limit(12);

      if (cycles.length === 0) {
        return res.json({
          averageCycleLength: null,
          averagePeriodLength: null,
          regularityScore: null,
          totalCycles: 0
        });
      }

      // Calculate statistics
      const cycleLengths = cycles.filter(c => c.cycleLength).map(c => c.cycleLength);
      const periodLengths = cycles.filter(c => c.periodLength).map(c => c.periodLength);
      
      const averageCycleLength = cycleLengths.length > 0 
        ? Math.round(cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length)
        : null;

      const averagePeriodLength = periodLengths.length > 0
        ? Math.round(periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length)
        : null;

      // Calculate regularity score (percentage of regular cycles)
      const regularCycles = cycles.filter(c => !c.isIrregular).length;
      const regularityScore = cycles.length > 0 
        ? Math.round((regularCycles / cycles.length) * 100)
        : null;

      const totalCycles = await Cycle.countDocuments({ userId: req.userId });

      res.json({
        averageCycleLength,
        averagePeriodLength,
        regularityScore,
        totalCycles,
        recentCycles: cycles.length
      });
    } catch (error) {
      logger.error('Get cycle stats error:', error);
      next(error);
    }
  },

  // Get cycle predictions
  async getPredictions(req, res, next) {
    try {
      const avgCycleLength = await Cycle.getAverageCycleLength(req.userId);
      
      if (!avgCycleLength) {
        return res.json({
          nextPeriodDate: null,
          nextOvulationDate: null,
          fertilityWindow: null,
          message: 'Not enough data for predictions'
        });
      }

      const lastCycle = await Cycle.findOne({ userId: req.userId })
        .sort({ startDate: -1 });

      if (!lastCycle) {
        return res.json({
          nextPeriodDate: null,
          nextOvulationDate: null,
          fertilityWindow: null,
          message: 'No cycle data found'
        });
      }

      // Calculate predictions
      const nextPeriodDate = new Date(lastCycle.startDate);
      nextPeriodDate.setDate(nextPeriodDate.getDate() + avgCycleLength);

      const nextOvulationDate = new Date(nextPeriodDate);
      nextOvulationDate.setDate(nextOvulationDate.getDate() - 14);

      const fertilityStart = new Date(nextOvulationDate);
      fertilityStart.setDate(fertilityStart.getDate() - 5);

      const fertilityEnd = new Date(nextOvulationDate);
      fertilityEnd.setDate(fertilityEnd.getDate() + 1);

      res.json({
        nextPeriodDate,
        nextOvulationDate,
        fertilityWindow: {
          start: fertilityStart,
          end: fertilityEnd
        },
        confidence: calculatePredictionConfidence(avgCycleLength, lastCycle)
      });
    } catch (error) {
      logger.error('Get predictions error:', error);
      next(error);
    }
  }
};

// Helper function to calculate prediction confidence
const calculatePredictionConfidence = (avgCycleLength, lastCycle) => {
  // Simple confidence calculation based on cycle regularity
  // In a real implementation, this would be more sophisticated
  if (!lastCycle.isIrregular && avgCycleLength >= 21 && avgCycleLength <= 35) {
    return 0.85; // High confidence for regular cycles
  } else if (!lastCycle.isIrregular) {
    return 0.70; // Medium confidence for somewhat regular cycles
  } else {
    return 0.50; // Low confidence for irregular cycles
  }
};

module.exports = cycleController;
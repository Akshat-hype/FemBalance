const Cycle = require('../models/Cycle');
const { calculateCyclePhase, predictNextPeriod, calculateFertileWindow } = require('../utils/dateHelpers');

class CycleService {
  // Create new cycle entry
  async createCycle(userId, cycleData) {
    try {
      const cycle = new Cycle({
        userId,
        ...cycleData
      });

      await cycle.save();
      return cycle;
    } catch (error) {
      throw new Error(`Failed to create cycle entry: ${error.message}`);
    }
  }

  // Get user's cycle history
  async getCycleHistory(userId, options = {}) {
    try {
      const { startDate, endDate, limit = 50 } = options;
      
      let query = { userId };
      
      if (startDate || endDate) {
        query.startDate = {};
        if (startDate) query.startDate.$gte = new Date(startDate);
        if (endDate) query.startDate.$lte = new Date(endDate);
      }

      const cycles = await Cycle.find(query)
        .sort({ startDate: -1 })
        .limit(limit);

      return cycles;
    } catch (error) {
      throw new Error(`Failed to get cycle history: ${error.message}`);
    }
  }

  // Get current cycle information
  async getCurrentCycle(userId) {
    try {
      const latestCycle = await Cycle.findOne({ userId })
        .sort({ startDate: -1 });

      if (!latestCycle) {
        return null;
      }

      const today = new Date();
      const cycleDay = Math.floor((today - latestCycle.startDate) / (1000 * 60 * 60 * 24)) + 1;
      
      // If cycle day is beyond typical cycle length, this might be a new cycle
      if (cycleDay > 35) {
        return null;
      }

      const phase = calculateCyclePhase(cycleDay, latestCycle.cycleLength || 28);
      
      return {
        ...latestCycle.toObject(),
        currentDay: cycleDay,
        currentPhase: phase
      };
    } catch (error) {
      throw new Error(`Failed to get current cycle: ${error.message}`);
    }
  }

  // Update cycle entry
  async updateCycle(userId, cycleId, updateData) {
    try {
      const cycle = await Cycle.findOneAndUpdate(
        { _id: cycleId, userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!cycle) {
        throw new Error('Cycle not found');
      }

      return cycle;
    } catch (error) {
      throw new Error(`Failed to update cycle: ${error.message}`);
    }
  }

  // Delete cycle entry
  async deleteCycle(userId, cycleId) {
    try {
      const cycle = await Cycle.findOneAndDelete({ _id: cycleId, userId });
      
      if (!cycle) {
        throw new Error('Cycle not found');
      }

      return { message: 'Cycle deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete cycle: ${error.message}`);
    }
  }

  // Get cycle analytics
  async getCycleAnalytics(userId) {
    try {
      const cycles = await Cycle.find({ userId })
        .sort({ startDate: -1 })
        .limit(12); // Last 12 cycles

      if (cycles.length === 0) {
        return {
          averageCycleLength: null,
          averagePeriodLength: null,
          cycleRegularity: null,
          totalCycles: 0
        };
      }

      // Calculate averages
      const cycleLengths = cycles.map(c => c.cycleLength).filter(Boolean);
      const periodLengths = cycles.map(c => c.periodLength).filter(Boolean);

      const averageCycleLength = cycleLengths.length > 0 
        ? Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length)
        : null;

      const averagePeriodLength = periodLengths.length > 0
        ? Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length)
        : null;

      // Calculate cycle regularity (standard deviation)
      let cycleRegularity = null;
      if (cycleLengths.length > 1) {
        const variance = cycleLengths.reduce((acc, length) => {
          return acc + Math.pow(length - averageCycleLength, 2);
        }, 0) / cycleLengths.length;
        
        const standardDeviation = Math.sqrt(variance);
        cycleRegularity = standardDeviation <= 7 ? 'regular' : 'irregular';
      }

      return {
        averageCycleLength,
        averagePeriodLength,
        cycleRegularity,
        totalCycles: cycles.length,
        recentCycles: cycles.slice(0, 6)
      };
    } catch (error) {
      throw new Error(`Failed to get cycle analytics: ${error.message}`);
    }
  }

  // Predict next period
  async predictNextPeriod(userId) {
    try {
      const cycles = await Cycle.find({ userId })
        .sort({ startDate: -1 })
        .limit(6);

      if (cycles.length === 0) {
        return null;
      }

      const prediction = predictNextPeriod(cycles);
      return prediction;
    } catch (error) {
      throw new Error(`Failed to predict next period: ${error.message}`);
    }
  }

  // Get fertile window
  async getFertileWindow(userId) {
    try {
      const currentCycle = await this.getCurrentCycle(userId);
      
      if (!currentCycle) {
        return null;
      }

      const fertileWindow = calculateFertileWindow(
        currentCycle.startDate,
        currentCycle.cycleLength || 28
      );

      return fertileWindow;
    } catch (error) {
      throw new Error(`Failed to calculate fertile window: ${error.message}`);
    }
  }

  // Log period start
  async logPeriodStart(userId, date = new Date()) {
    try {
      // Check if there's already a cycle for this date
      const existingCycle = await Cycle.findOne({
        userId,
        startDate: {
          $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
        }
      });

      if (existingCycle) {
        return existingCycle;
      }

      // Create new cycle
      const cycle = new Cycle({
        userId,
        startDate: date,
        periodStarted: true
      });

      await cycle.save();
      return cycle;
    } catch (error) {
      throw new Error(`Failed to log period start: ${error.message}`);
    }
  }

  // Log period end
  async logPeriodEnd(userId, date = new Date()) {
    try {
      // Find the most recent cycle
      const cycle = await Cycle.findOne({ userId })
        .sort({ startDate: -1 });

      if (!cycle) {
        throw new Error('No active cycle found');
      }

      // Calculate period length
      const periodLength = Math.floor((date - cycle.startDate) / (1000 * 60 * 60 * 24)) + 1;

      cycle.endDate = date;
      cycle.periodLength = periodLength;
      cycle.periodEnded = true;

      await cycle.save();
      return cycle;
    } catch (error) {
      throw new Error(`Failed to log period end: ${error.message}`);
    }
  }
}

module.exports = new CycleService();
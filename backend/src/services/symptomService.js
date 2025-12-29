const Symptom = require('../models/Symptom');

class SymptomService {
  // Log new symptom
  async logSymptom(userId, symptomData) {
    try {
      const symptom = new Symptom({
        userId,
        ...symptomData
      });

      await symptom.save();
      return symptom;
    } catch (error) {
      throw new Error(`Failed to log symptom: ${error.message}`);
    }
  }

  // Get user's symptom history
  async getSymptomHistory(userId, options = {}) {
    try {
      const { startDate, endDate, type, limit = 100 } = options;
      
      let query = { userId };
      
      if (startDate || endDate) {
        query.date = {};
        if (startDate) query.date.$gte = new Date(startDate);
        if (endDate) query.date.$lte = new Date(endDate);
      }

      if (type) {
        query.type = type;
      }

      const symptoms = await Symptom.find(query)
        .sort({ date: -1 })
        .limit(limit);

      return symptoms;
    } catch (error) {
      throw new Error(`Failed to get symptom history: ${error.message}`);
    }
  }

  // Update symptom entry
  async updateSymptom(userId, symptomId, updateData) {
    try {
      const symptom = await Symptom.findOneAndUpdate(
        { _id: symptomId, userId },
        updateData,
        { new: true, runValidators: true }
      );

      if (!symptom) {
        throw new Error('Symptom not found');
      }

      return symptom;
    } catch (error) {
      throw new Error(`Failed to update symptom: ${error.message}`);
    }
  }

  // Delete symptom entry
  async deleteSymptom(userId, symptomId) {
    try {
      const symptom = await Symptom.findOneAndDelete({ _id: symptomId, userId });
      
      if (!symptom) {
        throw new Error('Symptom not found');
      }

      return { message: 'Symptom deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete symptom: ${error.message}`);
    }
  }

  // Get symptoms by date
  async getSymptomsByDate(userId, date) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const symptoms = await Symptom.find({
        userId,
        date: {
          $gte: startOfDay,
          $lte: endOfDay
        }
      }).sort({ date: -1 });

      return symptoms;
    } catch (error) {
      throw new Error(`Failed to get symptoms by date: ${error.message}`);
    }
  }

  // Get symptom analytics
  async getSymptomAnalytics(userId, options = {}) {
    try {
      const { period = 'month' } = options;
      
      let startDate = new Date();
      if (period === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (period === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (period === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }

      const symptoms = await Symptom.find({
        userId,
        date: { $gte: startDate }
      });

      // Group symptoms by type
      const symptomsByType = symptoms.reduce((acc, symptom) => {
        if (!acc[symptom.type]) {
          acc[symptom.type] = [];
        }
        acc[symptom.type].push(symptom);
        return acc;
      }, {});

      // Calculate frequency and severity averages
      const analytics = Object.keys(symptomsByType).map(type => {
        const typeSymptoms = symptomsByType[type];
        const severities = typeSymptoms.map(s => s.severity).filter(Boolean);
        
        return {
          type,
          frequency: typeSymptoms.length,
          averageSeverity: severities.length > 0 
            ? Math.round(severities.reduce((a, b) => a + b, 0) / severities.length * 10) / 10
            : null,
          mostRecentDate: typeSymptoms[0]?.date,
          trend: this.calculateTrend(typeSymptoms)
        };
      });

      return {
        totalSymptoms: symptoms.length,
        uniqueTypes: Object.keys(symptomsByType).length,
        period,
        analytics: analytics.sort((a, b) => b.frequency - a.frequency)
      };
    } catch (error) {
      throw new Error(`Failed to get symptom analytics: ${error.message}`);
    }
  }

  // Calculate symptom trend
  calculateTrend(symptoms) {
    if (symptoms.length < 2) return 'insufficient_data';

    // Sort by date
    const sortedSymptoms = symptoms.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Compare first half with second half
    const midpoint = Math.floor(sortedSymptoms.length / 2);
    const firstHalf = sortedSymptoms.slice(0, midpoint);
    const secondHalf = sortedSymptoms.slice(midpoint);

    if (firstHalf.length === 0 || secondHalf.length === 0) {
      return 'stable';
    }

    const firstHalfAvg = firstHalf.reduce((sum, s) => sum + (s.severity || 0), 0) / firstHalf.length;
    const secondHalfAvg = secondHalf.reduce((sum, s) => sum + (s.severity || 0), 0) / secondHalf.length;

    const difference = secondHalfAvg - firstHalfAvg;

    if (Math.abs(difference) < 0.5) return 'stable';
    return difference > 0 ? 'increasing' : 'decreasing';
  }

  // Get common symptoms
  async getCommonSymptoms(userId) {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const symptoms = await Symptom.find({
        userId,
        date: { $gte: thirtyDaysAgo }
      });

      const symptomCounts = symptoms.reduce((acc, symptom) => {
        acc[symptom.type] = (acc[symptom.type] || 0) + 1;
        return acc;
      }, {});

      const commonSymptoms = Object.entries(symptomCounts)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      return commonSymptoms;
    } catch (error) {
      throw new Error(`Failed to get common symptoms: ${error.message}`);
    }
  }

  // Get symptoms correlation with cycle
  async getSymptomsCorrelationWithCycle(userId) {
    try {
      const Cycle = require('../models/Cycle');
      
      // Get recent cycles and symptoms
      const cycles = await Cycle.find({ userId }).sort({ startDate: -1 }).limit(6);
      const symptoms = await Symptom.find({ userId }).sort({ date: -1 }).limit(200);

      if (cycles.length === 0 || symptoms.length === 0) {
        return { correlation: 'insufficient_data' };
      }

      // Map symptoms to cycle days
      const symptomsWithCycleDay = symptoms.map(symptom => {
        const relevantCycle = cycles.find(cycle => {
          const cycleEnd = new Date(cycle.startDate);
          cycleEnd.setDate(cycleEnd.getDate() + (cycle.cycleLength || 28));
          return symptom.date >= cycle.startDate && symptom.date <= cycleEnd;
        });

        if (relevantCycle) {
          const cycleDay = Math.floor((symptom.date - relevantCycle.startDate) / (1000 * 60 * 60 * 24)) + 1;
          return { ...symptom.toObject(), cycleDay };
        }
        return null;
      }).filter(Boolean);

      // Group by cycle phases
      const phaseSymptoms = {
        menstrual: [], // Days 1-5
        follicular: [], // Days 6-13
        ovulation: [], // Days 14-16
        luteal: [] // Days 17-28
      };

      symptomsWithCycleDay.forEach(symptom => {
        if (symptom.cycleDay <= 5) {
          phaseSymptoms.menstrual.push(symptom);
        } else if (symptom.cycleDay <= 13) {
          phaseSymptoms.follicular.push(symptom);
        } else if (symptom.cycleDay <= 16) {
          phaseSymptoms.ovulation.push(symptom);
        } else {
          phaseSymptoms.luteal.push(symptom);
        }
      });

      return {
        correlation: 'available',
        phaseSymptoms,
        totalMappedSymptoms: symptomsWithCycleDay.length
      };
    } catch (error) {
      throw new Error(`Failed to get symptoms correlation: ${error.message}`);
    }
  }
}

module.exports = new SymptomService();
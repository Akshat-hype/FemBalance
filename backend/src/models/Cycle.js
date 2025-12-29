const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  cycleLength: {
    type: Number,
    min: 15,
    max: 45
  },
  periodLength: {
    type: Number,
    min: 1,
    max: 10
  },
  flow: {
    type: String,
    enum: ['light', 'normal', 'heavy'],
    default: 'normal'
  },
  ovulationDate: {
    type: Date
  },
  isComplete: {
    type: Boolean,
    default: false
  },
  isIrregular: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    maxlength: 500
  },
  predictions: {
    nextPeriodDate: Date,
    nextOvulationDate: Date,
    fertilityWindow: {
      start: Date,
      end: Date
    }
  }
}, {
  timestamps: true
});

// Indexes for performance
cycleSchema.index({ userId: 1, startDate: -1 });
cycleSchema.index({ userId: 1, isComplete: 1 });

// Calculate cycle length when cycle is completed
cycleSchema.pre('save', function(next) {
  if (this.endDate && this.startDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    this.periodLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

// Static method to get user's cycle history
cycleSchema.statics.getUserCycles = function(userId, limit = 12) {
  return this.find({ userId })
    .sort({ startDate: -1 })
    .limit(limit)
    .exec();
};

// Static method to get average cycle length
cycleSchema.statics.getAverageCycleLength = async function(userId) {
  const cycles = await this.find({ 
    userId, 
    isComplete: true,
    cycleLength: { $exists: true }
  }).select('cycleLength');
  
  if (cycles.length === 0) return null;
  
  const total = cycles.reduce((sum, cycle) => sum + cycle.cycleLength, 0);
  return Math.round(total / cycles.length);
};

// Method to detect irregularity
cycleSchema.methods.checkIrregularity = async function() {
  const recentCycles = await this.constructor.find({
    userId: this.userId,
    isComplete: true,
    _id: { $ne: this._id }
  }).sort({ startDate: -1 }).limit(6);

  if (recentCycles.length < 3) return false;

  const cycleLengths = recentCycles.map(cycle => cycle.cycleLength);
  const avgLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
  
  // Consider irregular if current cycle varies by more than 7 days from average
  return Math.abs(this.cycleLength - avgLength) > 7;
};

module.exports = mongoose.model('Cycle', cycleSchema);
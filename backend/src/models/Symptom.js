const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  symptoms: {
    // Physical symptoms
    cramps: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    bloating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    breastTenderness: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    headache: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    backache: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    acne: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    fatigue: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    
    // Emotional symptoms
    moodSwings: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    irritability: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    anxiety: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    depression: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    
    // PCOS-related symptoms
    excessiveHairGrowth: {
      type: Boolean,
      default: false
    },
    hairLoss: {
      type: Boolean,
      default: false
    },
    weightGain: {
      type: Boolean,
      default: false
    },
    darkSkinPatches: {
      type: Boolean,
      default: false
    }
  },
  lifestyle: {
    sleepHours: {
      type: Number,
      min: 0,
      max: 24
    },
    sleepQuality: {
      type: Number,
      min: 1,
      max: 5
    },
    stressLevel: {
      type: Number,
      min: 0,
      max: 10
    },
    exerciseMinutes: {
      type: Number,
      min: 0,
      default: 0
    },
    exerciseType: {
      type: String,
      enum: ['none', 'light', 'moderate', 'intense'],
      default: 'none'
    },
    waterIntake: {
      type: Number, // in glasses
      min: 0,
      default: 0
    }
  },
  notes: {
    type: String,
    maxlength: 500
  },
  cycleDay: {
    type: Number,
    min: 1
  }
}, {
  timestamps: true
});

// Indexes for performance
symptomSchema.index({ userId: 1, date: -1 });
symptomSchema.index({ userId: 1, 'symptoms.cramps': 1 });
symptomSchema.index({ userId: 1, 'symptoms.moodSwings': 1 });

// Ensure one symptom log per user per day
symptomSchema.index({ userId: 1, date: 1 }, { unique: true });

// Static method to get symptoms for date range
symptomSchema.statics.getSymptomsByDateRange = function(userId, startDate, endDate) {
  return this.find({
    userId,
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ date: -1 });
};

// Static method to get symptom trends
symptomSchema.statics.getSymptomTrends = async function(userId, symptomType, days = 30) {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const symptoms = await this.find({
    userId,
    date: { $gte: startDate, $lte: endDate }
  }).select(`date symptoms.${symptomType}`).sort({ date: 1 });

  return symptoms.map(symptom => ({
    date: symptom.date,
    value: symptom.symptoms[symptomType] || 0
  }));
};

// Method to calculate symptom severity score
symptomSchema.methods.calculateSeverityScore = function() {
  const physicalSymptoms = [
    'cramps', 'bloating', 'breastTenderness', 'headache', 'backache', 'acne', 'fatigue'
  ];
  
  const emotionalSymptoms = [
    'moodSwings', 'irritability', 'anxiety', 'depression'
  ];

  const physicalScore = physicalSymptoms.reduce((sum, symptom) => {
    return sum + (this.symptoms[symptom] || 0);
  }, 0);

  const emotionalScore = emotionalSymptoms.reduce((sum, symptom) => {
    return sum + (this.symptoms[symptom] || 0);
  }, 0);

  const maxPhysicalScore = physicalSymptoms.length * 5;
  const maxEmotionalScore = emotionalSymptoms.length * 5;

  return {
    physical: Math.round((physicalScore / maxPhysicalScore) * 100),
    emotional: Math.round((emotionalScore / maxEmotionalScore) * 100),
    overall: Math.round(((physicalScore + emotionalScore) / (maxPhysicalScore + maxEmotionalScore)) * 100)
  };
};

// Method to check for PCOS-related symptoms
symptomSchema.methods.hasPCOSSymptoms = function() {
  const pcosSymptoms = [
    'excessiveHairGrowth',
    'hairLoss', 
    'weightGain',
    'darkSkinPatches'
  ];

  return pcosSymptoms.some(symptom => this.symptoms[symptom] === true) ||
         this.symptoms.acne >= 3 ||
         this.symptoms.fatigue >= 4;
};

// Pre-save middleware to set cycle day if possible
symptomSchema.pre('save', async function(next) {
  if (!this.cycleDay) {
    // Try to calculate cycle day based on last period
    const Cycle = mongoose.model('Cycle');
    const lastCycle = await Cycle.findOne({
      userId: this.userId,
      startDate: { $lte: this.date }
    }).sort({ startDate: -1 });

    if (lastCycle) {
      const diffTime = this.date - lastCycle.startDate;
      this.cycleDay = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  }
  next();
});

module.exports = mongoose.model('Symptom', symptomSchema);
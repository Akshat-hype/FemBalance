const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: [
      'cardio',
      'strength-training',
      'yoga',
      'pilates',
      'hiit',
      'walking',
      'running',
      'cycling',
      'swimming',
      'dance',
      'sports',
      'flexibility'
    ]
  },
  cyclePhase: {
    type: String,
    required: true,
    enum: ['menstrual', 'follicular', 'ovulation', 'luteal', 'all'],
    index: true
  },
  fitnessLevel: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    index: true
  },
  duration: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  intensity: {
    type: String,
    required: true,
    enum: ['light', 'moderate', 'vigorous']
  },
  description: {
    type: String,
    required: true,
    maxlength: 1000
  },
  instructions: [{
    step: {
      type: Number,
      required: true
    },
    instruction: {
      type: String,
      required: true
    }
  }],
  exercises: [{
    name: {
      type: String,
      required: true
    },
    sets: Number,
    reps: String, // Can be "10-12" or "30 seconds"
    duration: String, // For time-based exercises
    restTime: String,
    modifications: [String]
  }],
  benefits: [{
    type: String,
    required: true
  }],
  precautions: [String],
  equipment: [{
    name: String,
    required: {
      type: Boolean,
      default: false
    },
    alternatives: [String]
  }],
  pcosOptimized: {
    type: Boolean,
    default: false,
    index: true
  },
  pcosSpecificBenefits: [String],
  caloriesBurnedEstimate: {
    min: Number,
    max: Number
  },
  targetMuscleGroups: [{
    type: String,
    enum: [
      'full-body',
      'upper-body',
      'lower-body',
      'core',
      'arms',
      'legs',
      'glutes',
      'back',
      'chest',
      'shoulders',
      'cardio'
    ]
  }],
  tags: [String],
  videoUrl: String,
  imageUrl: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approved: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
exerciseSchema.index({ cyclePhase: 1, fitnessLevel: 1 });
exerciseSchema.index({ type: 1, pcosOptimized: 1 });
exerciseSchema.index({ approved: 1, cyclePhase: 1 });

// Virtual for duration range display
exerciseSchema.virtual('durationDisplay').get(function() {
  if (this.duration.min === this.duration.max) {
    return `${this.duration.min} minutes`;
  }
  return `${this.duration.min}-${this.duration.max} minutes`;
});

// Virtual for estimated calories display
exerciseSchema.virtual('caloriesDisplay').get(function() {
  if (!this.caloriesBurnedEstimate) return null;
  
  if (this.caloriesBurnedEstimate.min === this.caloriesBurnedEstimate.max) {
    return `~${this.caloriesBurnedEstimate.min} calories`;
  }
  return `${this.caloriesBurnedEstimate.min}-${this.caloriesBurnedEstimate.max} calories`;
});

// Method to get difficulty level display
exerciseSchema.methods.getDifficultyDisplay = function() {
  const difficultyMap = {
    'beginner': 'Beginner Friendly',
    'intermediate': 'Intermediate Level',
    'advanced': 'Advanced Level'
  };
  return difficultyMap[this.fitnessLevel] || this.fitnessLevel;
};

// Method to get cycle phase display
exerciseSchema.methods.getCyclePhaseDisplay = function() {
  const phaseMap = {
    'menstrual': 'Menstrual Phase (Days 1-5)',
    'follicular': 'Follicular Phase (Days 1-13)',
    'ovulation': 'Ovulation Phase (Day 14)',
    'luteal': 'Luteal Phase (Days 15-28)',
    'all': 'All Cycle Phases'
  };
  return phaseMap[this.cyclePhase] || this.cyclePhase;
};

// Static method to get exercises by cycle phase and fitness level
exerciseSchema.statics.getByPhaseAndLevel = function(cyclePhase, fitnessLevel) {
  return this.find({
    $or: [
      { cyclePhase: cyclePhase },
      { cyclePhase: 'all' }
    ],
    fitnessLevel: fitnessLevel,
    approved: true
  }).sort({ createdAt: -1 });
};

// Static method to get PCOS-optimized exercises
exerciseSchema.statics.getPCOSOptimized = function(cyclePhase = null, fitnessLevel = null) {
  const query = { pcosOptimized: true, approved: true };
  
  if (cyclePhase) {
    query.$or = [
      { cyclePhase: cyclePhase },
      { cyclePhase: 'all' }
    ];
  }
  
  if (fitnessLevel) {
    query.fitnessLevel = fitnessLevel;
  }
  
  return this.find(query).sort({ createdAt: -1 });
};

// Pre-save middleware to calculate estimated calories if not provided
exerciseSchema.pre('save', function(next) {
  if (!this.caloriesBurnedEstimate && this.duration && this.intensity) {
    const baseCaloriesPerMinute = {
      'cardio': 8,
      'strength-training': 6,
      'yoga': 3,
      'pilates': 4,
      'hiit': 12,
      'walking': 4,
      'running': 12,
      'cycling': 7,
      'swimming': 10,
      'dance': 6,
      'sports': 8,
      'flexibility': 2
    };

    const intensityMultiplier = {
      'light': 0.8,
      'moderate': 1.0,
      'vigorous': 1.3
    };

    const baseCalories = baseCaloriesPerMinute[this.type] || 5;
    const multiplier = intensityMultiplier[this.intensity] || 1.0;
    
    this.caloriesBurnedEstimate = {
      min: Math.round(baseCalories * this.duration.min * multiplier),
      max: Math.round(baseCalories * this.duration.max * multiplier)
    };
  }
  
  next();
});

module.exports = mongoose.model('Exercise', exerciseSchema);
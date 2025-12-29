const mongoose = require('mongoose');

const pcosRiskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  responses: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    required: true
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  riskLevel: {
    type: String,
    required: true,
    enum: ['Low', 'Medium', 'High'],
    index: true
  },
  assessmentDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  recommendations: [{
    category: {
      type: String,
      enum: ['lifestyle', 'diet', 'exercise', 'medical', 'monitoring']
    },
    recommendation: String,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  }],
  followUpDate: {
    type: Date
  },
  notes: {
    type: String,
    maxlength: 1000
  }
}, {
  timestamps: true
});

// Index for efficient querying
pcosRiskSchema.index({ userId: 1, assessmentDate: -1 });

// Virtual for risk percentage
pcosRiskSchema.virtual('riskPercentage').get(function() {
  return Math.round(this.riskScore);
});

// Method to get risk color for UI
pcosRiskSchema.methods.getRiskColor = function() {
  switch (this.riskLevel) {
    case 'Low':
      return '#10B981'; // green
    case 'Medium':
      return '#F59E0B'; // yellow
    case 'High':
      return '#EF4444'; // red
    default:
      return '#6B7280'; // gray
  }
};

// Method to generate recommendations based on risk level
pcosRiskSchema.methods.generateRecommendations = function() {
  const recommendations = [];
  
  switch (this.riskLevel) {
    case 'Low':
      recommendations.push(
        {
          category: 'lifestyle',
          recommendation: 'Continue maintaining a healthy lifestyle with regular exercise and balanced nutrition',
          priority: 'low'
        },
        {
          category: 'monitoring',
          recommendation: 'Monitor menstrual cycles and track any changes in symptoms',
          priority: 'low'
        }
      );
      break;
      
    case 'Medium':
      recommendations.push(
        {
          category: 'medical',
          recommendation: 'Consider consulting with a healthcare provider to discuss your symptoms',
          priority: 'medium'
        },
        {
          category: 'lifestyle',
          recommendation: 'Focus on stress management and maintain regular sleep schedule',
          priority: 'medium'
        },
        {
          category: 'diet',
          recommendation: 'Consider a low glycemic index diet to help manage insulin levels',
          priority: 'medium'
        }
      );
      break;
      
    case 'High':
      recommendations.push(
        {
          category: 'medical',
          recommendation: 'Strongly recommend consulting with a healthcare provider or gynecologist for proper evaluation',
          priority: 'high'
        },
        {
          category: 'diet',
          recommendation: 'Work with a registered dietitian to develop a PCOS-friendly meal plan',
          priority: 'high'
        },
        {
          category: 'exercise',
          recommendation: 'Incorporate regular physical activity, including both cardio and strength training',
          priority: 'high'
        },
        {
          category: 'monitoring',
          recommendation: 'Track symptoms, menstrual patterns, and lifestyle factors closely',
          priority: 'high'
        }
      );
      break;
  }
  
  return recommendations;
};

// Static method to get risk distribution
pcosRiskSchema.statics.getRiskDistribution = async function() {
  const distribution = await this.aggregate([
    {
      $group: {
        _id: '$riskLevel',
        count: { $sum: 1 }
      }
    }
  ]);
  
  return distribution.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});
};

// Pre-save middleware to generate recommendations
pcosRiskSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('riskLevel')) {
    this.recommendations = this.generateRecommendations();
    
    // Set follow-up date based on risk level
    const followUpDays = {
      'Low': 180,    // 6 months
      'Medium': 90,  // 3 months
      'High': 30     // 1 month
    };
    
    this.followUpDate = new Date(Date.now() + followUpDays[this.riskLevel] * 24 * 60 * 60 * 1000);
  }
  next();
});

module.exports = mongoose.model('PCOSRisk', pcosRiskSchema);
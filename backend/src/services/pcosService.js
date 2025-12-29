const PCOSRisk = require('../models/PCOSRisk');
const logger = require('../utils/logger');
const axios = require('axios');

class PCOSService {
  constructor() {
    this.mlApiUrl = process.env.ML_API_URL || 'http://localhost:8000';
  }

  /**
   * Calculate PCOS risk score using ML model
   * @param {Object} responses - User responses to assessment questions
   * @returns {Object} Risk assessment result
   */
  async calculateRiskScore(responses) {
    try {
      // Prepare data for ML model
      const features = this.prepareFeatures(responses);
      
      // Call ML API for prediction
      const prediction = await this.callMLAPI(features);
      
      // Process prediction result
      const riskAssessment = this.processMLPrediction(prediction, responses);
      
      return riskAssessment;
    } catch (error) {
      logger.error('Error calculating PCOS risk score:', error);
      
      // Fallback to rule-based assessment if ML API fails
      return this.fallbackRiskAssessment(responses);
    }
  }

  /**
   * Prepare features for ML model from user responses
   * @param {Object} responses - Raw user responses
   * @returns {Object} Formatted features for ML model
   */
  prepareFeatures(responses) {
    const features = {
      // Menstrual cycle features
      irregular_periods: responses.irregular_periods === 'Yes' ? 1 : 0,
      missed_periods: responses.missed_periods === 'Yes' ? 1 : 0,
      cycle_length: this.extractCycleLength(responses),
      
      // Physical symptoms (convert scale responses to numeric)
      excess_hair: this.convertScaleToNumeric(responses.excess_hair),
      acne: this.convertScaleToNumeric(responses.acne),
      weight_gain: responses.weight_gain === 'Yes' ? 1 : 0,
      hair_loss: responses.hair_loss === 'Yes' ? 1 : 0,
      skin_darkening: responses.skin_darkening === 'Yes' ? 1 : 0,
      
      // Family history
      family_history_pcos: responses.family_history === 'Yes' ? 1 : 0,
      family_history_diabetes: responses.family_history === 'Yes' ? 1 : 0, // Simplified
      
      // Mood and lifestyle
      mood_swings: this.convertScaleToNumeric(responses.mood_changes),
      fatigue: this.convertScaleToNumeric(responses.fatigue),
      
      // Default values for features not in assessment
      bmi: 25, // Would come from user profile
      age: 28, // Would come from user profile
      exercise_frequency: 2,
      stress_level: 3,
      sleep_quality: 2,
      insulin_resistance: 0,
      difficulty_losing_weight: responses.weight_gain === 'Yes' ? 1 : 0,
      anxiety_depression: this.convertScaleToNumeric(responses.mood_changes)
    };

    return features;
  }

  /**
   * Call ML API for PCOS risk prediction
   * @param {Object} features - Prepared features
   * @returns {Object} ML prediction result
   */
  async callMLAPI(features) {
    try {
      const response = await axios.post(`${this.mlApiUrl}/api/v1/predict/pcos`, {
        features: features
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      logger.error('ML API call failed:', error.message);
      throw error;
    }
  }

  /**
   * Process ML prediction result
   * @param {Object} prediction - ML model prediction
   * @param {Object} originalResponses - Original user responses
   * @returns {Object} Processed risk assessment
   */
  processMLPrediction(prediction, originalResponses) {
    const { risk_level, risk_score, confidence } = prediction;

    return {
      riskLevel: risk_level,
      riskScore: Math.round(risk_score * 100), // Convert to percentage
      confidence: confidence,
      recommendations: this.generateRecommendations(risk_level, originalResponses),
      insights: this.generateInsights(risk_level, originalResponses)
    };
  }

  /**
   * Fallback rule-based risk assessment when ML API is unavailable
   * @param {Object} responses - User responses
   * @returns {Object} Rule-based risk assessment
   */
  fallbackRiskAssessment(responses) {
    logger.info('Using fallback rule-based PCOS risk assessment');

    let riskScore = 0;
    let maxScore = 0;

    // Menstrual irregularities (high weight)
    if (responses.irregular_periods === 'Yes') {
      riskScore += 15;
    }
    maxScore += 15;

    if (responses.missed_periods === 'Yes') {
      riskScore += 12;
    }
    maxScore += 12;

    // Physical symptoms
    const excessHairScore = this.convertScaleToNumeric(responses.excess_hair) * 2;
    riskScore += excessHairScore;
    maxScore += 6; // Max scale 3 * 2

    const acneScore = this.convertScaleToNumeric(responses.acne) * 1.5;
    riskScore += acneScore;
    maxScore += 4.5; // Max scale 3 * 1.5

    if (responses.weight_gain === 'Yes') {
      riskScore += 10;
    }
    maxScore += 10;

    if (responses.hair_loss === 'Yes') {
      riskScore += 8;
    }
    maxScore += 8;

    if (responses.skin_darkening === 'Yes') {
      riskScore += 7;
    }
    maxScore += 7;

    // Family history
    if (responses.family_history === 'Yes') {
      riskScore += 8;
    }
    maxScore += 8;

    // Mood symptoms
    const moodScore = this.convertScaleToNumeric(responses.mood_changes) * 1.5;
    riskScore += moodScore;
    maxScore += 4.5;

    const fatigueScore = this.convertScaleToNumeric(responses.fatigue) * 1.5;
    riskScore += fatigueScore;
    maxScore += 4.5;

    // Calculate percentage and determine risk level
    const riskPercentage = (riskScore / maxScore) * 100;
    let riskLevel = 'Low';
    
    if (riskPercentage >= 70) {
      riskLevel = 'High';
    } else if (riskPercentage >= 40) {
      riskLevel = 'Medium';
    }

    return {
      riskLevel: riskLevel,
      riskScore: Math.round(riskPercentage),
      confidence: 0.75, // Lower confidence for rule-based
      recommendations: this.generateRecommendations(riskLevel, responses),
      insights: this.generateInsights(riskLevel, responses),
      method: 'rule-based'
    };
  }

  /**
   * Generate personalized recommendations based on risk level and responses
   * @param {string} riskLevel - Calculated risk level
   * @param {Object} responses - User responses
   * @returns {Array} Array of recommendation objects
   */
  generateRecommendations(riskLevel, responses) {
    const recommendations = [];

    // Base recommendations for all risk levels
    recommendations.push({
      category: 'monitoring',
      title: 'Track Your Cycle',
      description: 'Continue monitoring your menstrual cycle and symptoms using FEMbalance',
      priority: 'medium'
    });

    // Risk-specific recommendations
    switch (riskLevel) {
      case 'Low':
        recommendations.push(
          {
            category: 'lifestyle',
            title: 'Maintain Healthy Habits',
            description: 'Continue your current healthy lifestyle with regular exercise and balanced nutrition',
            priority: 'low'
          },
          {
            category: 'monitoring',
            title: 'Annual Check-ups',
            description: 'Schedule regular check-ups with your healthcare provider',
            priority: 'low'
          }
        );
        break;

      case 'Medium':
        recommendations.push(
          {
            category: 'medical',
            title: 'Consult Healthcare Provider',
            description: 'Consider discussing your symptoms with a healthcare provider',
            priority: 'medium'
          },
          {
            category: 'lifestyle',
            title: 'Stress Management',
            description: 'Focus on stress reduction techniques like meditation or yoga',
            priority: 'medium'
          },
          {
            category: 'diet',
            title: 'Balanced Nutrition',
            description: 'Consider a low glycemic index diet to help manage insulin levels',
            priority: 'medium'
          }
        );
        break;

      case 'High':
        recommendations.push(
          {
            category: 'medical',
            title: 'See a Specialist',
            description: 'Strongly recommend consulting with a gynecologist or endocrinologist',
            priority: 'high'
          },
          {
            category: 'diet',
            title: 'Nutritional Support',
            description: 'Work with a registered dietitian to develop a PCOS-friendly meal plan',
            priority: 'high'
          },
          {
            category: 'exercise',
            title: 'Regular Physical Activity',
            description: 'Incorporate both cardio and strength training into your routine',
            priority: 'high'
          }
        );
        break;
    }

    // Symptom-specific recommendations
    if (responses.excess_hair && this.convertScaleToNumeric(responses.excess_hair) > 1) {
      recommendations.push({
        category: 'medical',
        title: 'Discuss Hirsutism',
        description: 'Talk to your doctor about treatment options for excess hair growth',
        priority: 'medium'
      });
    }

    if (responses.acne && this.convertScaleToNumeric(responses.acne) > 1) {
      recommendations.push({
        category: 'lifestyle',
        title: 'Skin Care Routine',
        description: 'Develop a consistent skincare routine and consider seeing a dermatologist',
        priority: 'low'
      });
    }

    return recommendations;
  }

  /**
   * Generate insights based on assessment results
   * @param {string} riskLevel - Calculated risk level
   * @param {Object} responses - User responses
   * @returns {Array} Array of insight objects
   */
  generateInsights(riskLevel, responses) {
    const insights = [];

    // Risk level insight
    insights.push({
      type: 'risk_level',
      title: `Your PCOS Risk Level: ${riskLevel}`,
      description: this.getRiskLevelDescription(riskLevel)
    });

    // Symptom patterns
    const symptomCount = this.countPositiveSymptoms(responses);
    if (symptomCount > 0) {
      insights.push({
        type: 'symptoms',
        title: 'Symptom Pattern',
        description: `You reported ${symptomCount} symptoms commonly associated with PCOS. This information helps assess your risk level.`
      });
    }

    // Lifestyle factors
    if (responses.mood_changes && this.convertScaleToNumeric(responses.mood_changes) > 2) {
      insights.push({
        type: 'lifestyle',
        title: 'Mood and Hormones',
        description: 'Mood changes can be related to hormonal fluctuations. Consider stress management techniques.'
      });
    }

    return insights;
  }

  /**
   * Helper methods
   */
  convertScaleToNumeric(scaleValue) {
    const scaleMap = {
      'None': 0,
      'Mild': 1,
      'Moderate': 2,
      'Severe': 3,
      'Never': 0,
      'Rarely': 1,
      'Sometimes': 2,
      'Often': 3
    };
    return scaleMap[scaleValue] || 0;
  }

  extractCycleLength(responses) {
    // This would typically come from cycle tracking data
    // For now, return average if irregular periods reported
    return responses.irregular_periods === 'Yes' ? 35 : 28;
  }

  getRiskLevelDescription(riskLevel) {
    const descriptions = {
      'Low': 'Your responses suggest a lower likelihood of PCOS. Continue monitoring your health and maintain regular check-ups.',
      'Medium': 'Your responses indicate some symptoms that could be associated with PCOS. Consider discussing these with a healthcare provider.',
      'High': 'Your responses suggest several symptoms commonly associated with PCOS. We strongly recommend consulting with a healthcare provider for proper evaluation.'
    };
    return descriptions[riskLevel] || '';
  }

  countPositiveSymptoms(responses) {
    let count = 0;
    
    if (responses.irregular_periods === 'Yes') count++;
    if (responses.missed_periods === 'Yes') count++;
    if (this.convertScaleToNumeric(responses.excess_hair) > 0) count++;
    if (this.convertScaleToNumeric(responses.acne) > 0) count++;
    if (responses.weight_gain === 'Yes') count++;
    if (responses.hair_loss === 'Yes') count++;
    if (responses.skin_darkening === 'Yes') count++;
    if (responses.family_history === 'Yes') count++;
    if (this.convertScaleToNumeric(responses.mood_changes) > 1) count++;
    if (this.convertScaleToNumeric(responses.fatigue) > 1) count++;
    
    return count;
  }

  /**
   * Get risk statistics for a user
   * @param {string} userId - User ID
   * @returns {Object} Risk statistics
   */
  async getUserRiskStatistics(userId) {
    try {
      const assessments = await PCOSRisk.find({ userId })
        .sort({ assessmentDate: -1 })
        .limit(12);

      if (assessments.length === 0) {
        return {
          totalAssessments: 0,
          latestRisk: null,
          riskTrend: null,
          averageRisk: null
        };
      }

      const riskScores = assessments.map(a => a.riskScore);
      const averageRisk = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;

      // Calculate trend
      let riskTrend = 'stable';
      if (assessments.length > 1) {
        const latest = assessments[0].riskScore;
        const previous = assessments[1].riskScore;
        const difference = latest - previous;
        
        if (difference > 5) riskTrend = 'increasing';
        else if (difference < -5) riskTrend = 'decreasing';
      }

      return {
        totalAssessments: assessments.length,
        latestRisk: assessments[0].riskLevel,
        riskTrend,
        averageRisk: Math.round(averageRisk),
        assessmentHistory: assessments.map(a => ({
          date: a.assessmentDate,
          riskLevel: a.riskLevel,
          riskScore: a.riskScore
        }))
      };
    } catch (error) {
      logger.error('Error getting user risk statistics:', error);
      throw error;
    }
  }
}

module.exports = new PCOSService();
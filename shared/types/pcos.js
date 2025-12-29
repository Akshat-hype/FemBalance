// PCOS-related type definitions

export const PCOSRiskLevels = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
};

export const PCOSSymptoms = {
  IRREGULAR_PERIODS: 'irregularPeriods',
  EXCESSIVE_HAIR_GROWTH: 'excessiveHairGrowth',
  HAIR_LOSS: 'hairLoss',
  ACNE: 'acne',
  WEIGHT_GAIN: 'weightGain',
  DARK_SKIN_PATCHES: 'darkSkinPatches',
  MOOD_CHANGES: 'moodChanges',
  FATIGUE: 'fatigue'
};

export const PCOSRiskFactors = {
  FAMILY_HISTORY: 'familyHistory',
  OBESITY: 'obesity',
  INSULIN_RESISTANCE: 'insulinResistance',
  METABOLIC_SYNDROME: 'metabolicSyndrome'
};

// Risk level configurations
export const RiskLevelConfig = {
  [PCOSRiskLevels.LOW]: {
    threshold: 0.3,
    color: 'green',
    bgColor: 'bg-green-100',
    textColor: 'text-green-800',
    borderColor: 'border-green-200',
    icon: '✅',
    label: 'Low Risk',
    description: 'Your symptoms suggest a low risk for PCOS'
  },
  [PCOSRiskLevels.MEDIUM]: {
    threshold: 0.7,
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-800',
    borderColor: 'border-yellow-200',
    icon: '⚠️',
    label: 'Medium Risk',
    description: 'Some symptoms suggest you may be at risk for PCOS'
  },
  [PCOSRiskLevels.HIGH]: {
    threshold: 1.0,
    color: 'red',
    bgColor: 'bg-red-100',
    textColor: 'text-red-800',
    borderColor: 'border-red-200',
    icon: '🚨',
    label: 'High Risk',
    description: 'Multiple symptoms suggest a higher risk for PCOS'
  }
};

// Validation functions
export const validateRiskScore = (score) => {
  return typeof score === 'number' && score >= 0 && score <= 1;
};

export const validateRiskLevel = (level) => {
  return Object.values(PCOSRiskLevels).includes(level);
};

// Helper functions
export const getRiskLevelFromScore = (score) => {
  if (score < 0.3) return PCOSRiskLevels.LOW;
  if (score < 0.7) return PCOSRiskLevels.MEDIUM;
  return PCOSRiskLevels.HIGH;
};

export const getRiskLevelConfig = (level) => {
  return RiskLevelConfig[level] || RiskLevelConfig[PCOSRiskLevels.LOW];
};

export const getRiskScorePercentage = (score) => {
  return Math.round(score * 100);
};

export const formatRiskScore = (score) => {
  return `${getRiskScorePercentage(score)}%`;
};

// PCOS symptom analysis
export const analyzePCOSSymptoms = (symptoms, cycles = []) => {
  const riskFactors = [];
  let riskScore = 0;

  // Analyze cycle irregularity
  if (cycles.length >= 3) {
    const cycleLengths = cycles.map(c => c.cycleLength).filter(Boolean);
    if (cycleLengths.length >= 3) {
      const avgLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
      const hasIrregular = cycleLengths.some(length => Math.abs(length - avgLength) > 7);
      const hasLongCycles = cycleLengths.some(length => length > 35);
      
      if (hasIrregular || hasLongCycles) {
        riskFactors.push('Irregular menstrual cycles');
        riskScore += 0.3;
      }
    }
  }

  // Analyze symptoms
  if (symptoms.excessiveHairGrowth) {
    riskFactors.push('Excessive hair growth (hirsutism)');
    riskScore += 0.25;
  }

  if (symptoms.hairLoss) {
    riskFactors.push('Male-pattern hair loss');
    riskScore += 0.2;
  }

  if (symptoms.acne >= 3) {
    riskFactors.push('Severe acne');
    riskScore += 0.15;
  }

  if (symptoms.weightGain) {
    riskFactors.push('Unexplained weight gain');
    riskScore += 0.15;
  }

  if (symptoms.darkSkinPatches) {
    riskFactors.push('Dark skin patches (acanthosis nigricans)');
    riskScore += 0.2;
  }

  if (symptoms.moodChanges >= 3) {
    riskFactors.push('Significant mood changes');
    riskScore += 0.1;
  }

  if (symptoms.fatigue >= 4) {
    riskFactors.push('Chronic fatigue');
    riskScore += 0.1;
  }

  // Cap the risk score at 1.0
  riskScore = Math.min(riskScore, 1.0);
  
  const riskLevel = getRiskLevelFromScore(riskScore);

  return {
    riskScore,
    riskLevel,
    riskFactors,
    totalFactors: riskFactors.length
  };
};

// Generate PCOS recommendations
export const generatePCOSRecommendations = (riskLevel, riskFactors, lifestyle = {}) => {
  const recommendations = [];

  // Risk-level specific recommendations
  if (riskLevel === PCOSRiskLevels.HIGH) {
    recommendations.push('Consider consulting with a healthcare provider for PCOS evaluation');
    recommendations.push('Ask about hormonal testing and ultrasound examination');
  } else if (riskLevel === PCOSRiskLevels.MEDIUM) {
    recommendations.push('Monitor your symptoms and consider medical consultation');
    recommendations.push('Keep detailed records of your cycles and symptoms');
  }

  // Lifestyle recommendations
  if (lifestyle.bmi && lifestyle.bmi > 25) {
    recommendations.push('Focus on gradual, sustainable weight loss');
    recommendations.push('Consider consulting with a nutritionist');
  }

  if (lifestyle.exerciseFrequency < 3) {
    recommendations.push('Increase physical activity to at least 3-4 times per week');
    recommendations.push('Include both cardio and strength training exercises');
  }

  if (lifestyle.stressLevel > 7) {
    recommendations.push('Practice stress management techniques like meditation or yoga');
    recommendations.push('Consider counseling or therapy for stress management');
  }

  // Symptom-specific recommendations
  if (riskFactors.includes('Severe acne')) {
    recommendations.push('Consider dermatological consultation for acne management');
  }

  if (riskFactors.includes('Excessive hair growth (hirsutism)')) {
    recommendations.push('Discuss hair removal options and hormonal treatments with your doctor');
  }

  if (riskFactors.includes('Irregular menstrual cycles')) {
    recommendations.push('Track your cycles consistently to identify patterns');
  }

  // General recommendations
  if (recommendations.length === 0) {
    recommendations.push('Continue maintaining healthy lifestyle habits');
    recommendations.push('Keep monitoring your symptoms and cycles');
  }

  recommendations.push('Remember: This assessment is for educational purposes only and should not replace professional medical advice');

  return recommendations;
};

// PCOS education content
export const PCOSEducationContent = {
  whatIsPCOS: {
    title: 'What is PCOS?',
    content: 'Polycystic Ovary Syndrome (PCOS) is a hormonal disorder affecting women of reproductive age. It involves irregular periods, excess androgen levels, and polycystic ovaries.'
  },
  commonSymptoms: {
    title: 'Common Symptoms',
    content: 'PCOS symptoms include irregular periods, excessive hair growth, acne, weight gain, hair loss, and difficulty getting pregnant.'
  },
  diagnosis: {
    title: 'How is PCOS Diagnosed?',
    content: 'PCOS is diagnosed using the Rotterdam criteria, which requires 2 of 3: irregular periods, excess androgens, or polycystic ovaries on ultrasound.'
  },
  treatment: {
    title: 'Treatment Options',
    content: 'Treatment focuses on managing symptoms through lifestyle changes, medications for irregular periods, and treatments for excess hair growth and acne.'
  },
  lifestyle: {
    title: 'Lifestyle Management',
    content: 'Regular exercise, healthy diet, weight management, and stress reduction can significantly improve PCOS symptoms.'
  }
};

// Risk assessment questions
export const PCOSAssessmentQuestions = [
  {
    id: 'menstrualHistory',
    question: 'How would you describe your menstrual cycles?',
    type: 'radio',
    options: [
      { value: 'regular', label: 'Regular (21-35 days)', score: 0 },
      { value: 'irregular', label: 'Irregular (varies by >7 days)', score: 0.3 },
      { value: 'infrequent', label: 'Infrequent (>35 days apart)', score: 0.4 },
      { value: 'absent', label: 'Absent for 3+ months', score: 0.5 }
    ]
  },
  {
    id: 'hairGrowth',
    question: 'Do you experience excessive hair growth on face, chest, or back?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No excessive hair growth', score: 0 },
      { value: 'mild', label: 'Mild hair growth', score: 0.1 },
      { value: 'moderate', label: 'Moderate hair growth', score: 0.2 },
      { value: 'severe', label: 'Severe hair growth', score: 0.3 }
    ]
  },
  {
    id: 'acne',
    question: 'How would you rate your acne?',
    type: 'radio',
    options: [
      { value: 'none', label: 'No acne', score: 0 },
      { value: 'mild', label: 'Mild acne', score: 0.05 },
      { value: 'moderate', label: 'Moderate acne', score: 0.1 },
      { value: 'severe', label: 'Severe acne', score: 0.15 }
    ]
  },
  {
    id: 'weightGain',
    question: 'Have you experienced unexplained weight gain?',
    type: 'radio',
    options: [
      { value: 'no', label: 'No weight gain', score: 0 },
      { value: 'mild', label: 'Mild weight gain', score: 0.1 },
      { value: 'significant', label: 'Significant weight gain', score: 0.2 }
    ]
  },
  {
    id: 'hairLoss',
    question: 'Do you experience male-pattern hair loss?',
    type: 'radio',
    options: [
      { value: 'no', label: 'No hair loss', score: 0 },
      { value: 'mild', label: 'Mild thinning', score: 0.1 },
      { value: 'moderate', label: 'Moderate hair loss', score: 0.15 },
      { value: 'severe', label: 'Severe hair loss', score: 0.2 }
    ]
  }
];
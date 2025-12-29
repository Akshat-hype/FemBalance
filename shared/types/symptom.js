// Symptom-related type definitions

export const SymptomSeverity = {
  NONE: 0,
  MILD: 1,
  MODERATE: 2,
  SEVERE: 3,
  VERY_SEVERE: 4,
  EXTREME: 5
};

export const PhysicalSymptoms = {
  CRAMPS: 'cramps',
  BLOATING: 'bloating',
  BREAST_TENDERNESS: 'breastTenderness',
  HEADACHE: 'headache',
  BACKACHE: 'backache',
  ACNE: 'acne',
  FATIGUE: 'fatigue'
};

export const EmotionalSymptoms = {
  MOOD_SWINGS: 'moodSwings',
  IRRITABILITY: 'irritability',
  ANXIETY: 'anxiety',
  DEPRESSION: 'depression'
};

export const PCOSSymptoms = {
  EXCESSIVE_HAIR_GROWTH: 'excessiveHairGrowth',
  HAIR_LOSS: 'hairLoss',
  WEIGHT_GAIN: 'weightGain',
  DARK_SKIN_PATCHES: 'darkSkinPatches'
};

export const ExerciseTypes = {
  NONE: 'none',
  LIGHT: 'light',
  MODERATE: 'moderate',
  INTENSE: 'intense'
};

export const SleepQuality = {
  VERY_POOR: 1,
  POOR: 2,
  FAIR: 3,
  GOOD: 4,
  EXCELLENT: 5
};

// Validation functions
export const validateSymptomSeverity = (severity) => {
  return Number.isInteger(severity) && severity >= 0 && severity <= 5;
};

export const validateSleepHours = (hours) => {
  return typeof hours === 'number' && hours >= 0 && hours <= 24;
};

export const validateStressLevel = (level) => {
  return Number.isInteger(level) && level >= 0 && level <= 10;
};

export const validateExerciseMinutes = (minutes) => {
  return Number.isInteger(minutes) && minutes >= 0;
};

export const validateWaterIntake = (glasses) => {
  return Number.isInteger(glasses) && glasses >= 0;
};

// Helper functions
export const getSymptomSeverityLabel = (severity) => {
  const labels = {
    0: 'None',
    1: 'Mild',
    2: 'Moderate',
    3: 'Severe',
    4: 'Very Severe',
    5: 'Extreme'
  };
  return labels[severity] || 'Unknown';
};

export const getSymptomSeverityColor = (severity) => {
  const colors = {
    0: 'text-gray-500',
    1: 'text-green-500',
    2: 'text-yellow-500',
    3: 'text-orange-500',
    4: 'text-red-500',
    5: 'text-red-700'
  };
  return colors[severity] || 'text-gray-500';
};

export const getSleepQualityLabel = (quality) => {
  const labels = {
    1: 'Very Poor',
    2: 'Poor',
    3: 'Fair',
    4: 'Good',
    5: 'Excellent'
  };
  return labels[quality] || 'Unknown';
};

export const getStressLevelLabel = (level) => {
  if (level <= 2) return 'Low';
  if (level <= 4) return 'Mild';
  if (level <= 6) return 'Moderate';
  if (level <= 8) return 'High';
  return 'Very High';
};

export const getExerciseTypeLabel = (type) => {
  const labels = {
    none: 'No Exercise',
    light: 'Light Exercise',
    moderate: 'Moderate Exercise',
    intense: 'Intense Exercise'
  };
  return labels[type] || 'Unknown';
};

// Symptom analysis functions
export const calculateSymptomScore = (symptoms) => {
  const physicalSymptoms = Object.values(PhysicalSymptoms);
  const emotionalSymptoms = Object.values(EmotionalSymptoms);
  
  const physicalScore = physicalSymptoms.reduce((sum, symptom) => {
    return sum + (symptoms[symptom] || 0);
  }, 0);
  
  const emotionalScore = emotionalSymptoms.reduce((sum, symptom) => {
    return sum + (symptoms[symptom] || 0);
  }, 0);
  
  const maxPhysicalScore = physicalSymptoms.length * 5;
  const maxEmotionalScore = emotionalSymptoms.length * 5;
  
  return {
    physical: Math.round((physicalScore / maxPhysicalScore) * 100),
    emotional: Math.round((emotionalScore / maxEmotionalScore) * 100),
    overall: Math.round(((physicalScore + emotionalScore) / (maxPhysicalScore + maxEmotionalScore)) * 100)
  };
};

export const hasPCOSSymptoms = (symptoms) => {
  const pcosSymptoms = Object.values(PCOSSymptoms);
  
  return pcosSymptoms.some(symptom => symptoms[symptom] === true) ||
         symptoms.acne >= 3 ||
         symptoms.fatigue >= 4;
};

export const getMostSevereSymptoms = (symptoms, limit = 5) => {
  const allSymptoms = { ...PhysicalSymptoms, ...EmotionalSymptoms };
  
  return Object.entries(allSymptoms)
    .map(([key, symptom]) => ({
      symptom,
      severity: symptoms[symptom] || 0,
      label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    }))
    .filter(item => item.severity > 0)
    .sort((a, b) => b.severity - a.severity)
    .slice(0, limit);
};

export const getSymptomTrend = (symptomHistory, symptomName) => {
  if (!symptomHistory || symptomHistory.length < 2) {
    return { trend: 'insufficient_data', change: 0 };
  }
  
  const recentValues = symptomHistory
    .slice(0, 7) // Last 7 entries
    .map(entry => entry.symptoms[symptomName] || 0);
  
  const olderValues = symptomHistory
    .slice(7, 14) // Previous 7 entries
    .map(entry => entry.symptoms[symptomName] || 0);
  
  if (olderValues.length === 0) {
    return { trend: 'insufficient_data', change: 0 };
  }
  
  const recentAvg = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
  const olderAvg = olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length;
  
  const change = recentAvg - olderAvg;
  
  let trend;
  if (Math.abs(change) < 0.5) {
    trend = 'stable';
  } else if (change > 0) {
    trend = 'increasing';
  } else {
    trend = 'decreasing';
  }
  
  return { trend, change: Math.round(change * 10) / 10 };
};
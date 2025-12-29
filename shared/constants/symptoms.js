// Symptom-related constants

export const SYMPTOM_CATEGORIES = {
  PHYSICAL: {
    name: 'physical',
    label: 'Physical Symptoms',
    color: '#3b82f6',
    icon: '🏃‍♀️'
  },
  EMOTIONAL: {
    name: 'emotional',
    label: 'Emotional Symptoms',
    color: '#8b5cf6',
    icon: '💭'
  },
  PCOS_RELATED: {
    name: 'pcos',
    label: 'PCOS-Related',
    color: '#f59e0b',
    icon: '⚠️'
  },
  LIFESTYLE: {
    name: 'lifestyle',
    label: 'Lifestyle Factors',
    color: '#10b981',
    icon: '🌱'
  }
};

export const PHYSICAL_SYMPTOMS = {
  CRAMPS: {
    key: 'cramps',
    label: 'Menstrual Cramps',
    description: 'Pain in lower abdomen or back',
    category: 'physical',
    severity: true,
    icon: '🤕',
    tips: ['Use heat therapy', 'Try gentle exercise', 'Consider pain relief']
  },
  BLOATING: {
    key: 'bloating',
    label: 'Bloating',
    description: 'Feeling of fullness or swelling',
    category: 'physical',
    severity: true,
    icon: '🎈',
    tips: ['Reduce salt intake', 'Stay hydrated', 'Avoid carbonated drinks']
  },
  BREAST_TENDERNESS: {
    key: 'breastTenderness',
    label: 'Breast Tenderness',
    description: 'Soreness or sensitivity in breasts',
    category: 'physical',
    severity: true,
    icon: '💔',
    tips: ['Wear supportive bra', 'Apply cold compress', 'Limit caffeine']
  },
  HEADACHE: {
    key: 'headache',
    label: 'Headache',
    description: 'Head pain or pressure',
    category: 'physical',
    severity: true,
    icon: '🤯',
    tips: ['Stay hydrated', 'Get adequate sleep', 'Manage stress']
  },
  BACKACHE: {
    key: 'backache',
    label: 'Back Pain',
    description: 'Lower back pain or discomfort',
    category: 'physical',
    severity: true,
    icon: '🦴',
    tips: ['Use heat therapy', 'Gentle stretching', 'Maintain good posture']
  },
  ACNE: {
    key: 'acne',
    label: 'Acne',
    description: 'Skin breakouts or blemishes',
    category: 'physical',
    severity: true,
    icon: '🔴',
    tips: ['Gentle skincare routine', 'Avoid touching face', 'Consider hormonal factors']
  },
  FATIGUE: {
    key: 'fatigue',
    label: 'Fatigue',
    description: 'Feeling tired or low energy',
    category: 'physical',
    severity: true,
    icon: '😴',
    tips: ['Prioritize sleep', 'Eat iron-rich foods', 'Light exercise']
  }
};

export const EMOTIONAL_SYMPTOMS = {
  MOOD_SWINGS: {
    key: 'moodSwings',
    label: 'Mood Swings',
    description: 'Rapid changes in mood',
    category: 'emotional',
    severity: true,
    icon: '🎭',
    tips: ['Practice mindfulness', 'Regular exercise', 'Talk to someone']
  },
  IRRITABILITY: {
    key: 'irritability',
    label: 'Irritability',
    description: 'Feeling easily annoyed or frustrated',
    category: 'emotional',
    severity: true,
    icon: '😤',
    tips: ['Take breaks', 'Deep breathing', 'Identify triggers']
  },
  ANXIETY: {
    key: 'anxiety',
    label: 'Anxiety',
    description: 'Feeling worried or nervous',
    category: 'emotional',
    severity: true,
    icon: '😰',
    tips: ['Relaxation techniques', 'Regular routine', 'Limit caffeine']
  },
  DEPRESSION: {
    key: 'depression',
    label: 'Depression',
    description: 'Feeling sad or hopeless',
    category: 'emotional',
    severity: true,
    icon: '😢',
    tips: ['Seek support', 'Stay active', 'Professional help if needed']
  }
};

export const PCOS_SYMPTOMS = {
  EXCESSIVE_HAIR_GROWTH: {
    key: 'excessiveHairGrowth',
    label: 'Excessive Hair Growth',
    description: 'Unwanted hair on face, chest, or back',
    category: 'pcos',
    severity: false,
    boolean: true,
    icon: '🧔‍♀️',
    tips: ['Consult healthcare provider', 'Hair removal options', 'Hormonal evaluation']
  },
  HAIR_LOSS: {
    key: 'hairLoss',
    label: 'Hair Loss',
    description: 'Male-pattern hair thinning or loss',
    category: 'pcos',
    severity: false,
    boolean: true,
    icon: '👩‍🦲',
    tips: ['Gentle hair care', 'Nutritional support', 'Medical consultation']
  },
  WEIGHT_GAIN: {
    key: 'weightGain',
    label: 'Weight Gain',
    description: 'Unexplained weight increase',
    category: 'pcos',
    severity: false,
    boolean: true,
    icon: '⚖️',
    tips: ['Balanced diet', 'Regular exercise', 'Monitor portion sizes']
  },
  DARK_SKIN_PATCHES: {
    key: 'darkSkinPatches',
    label: 'Dark Skin Patches',
    description: 'Dark, velvety patches on skin',
    category: 'pcos',
    severity: false,
    boolean: true,
    icon: '🔳',
    tips: ['Maintain healthy weight', 'Gentle exfoliation', 'Medical evaluation']
  }
};

export const LIFESTYLE_FACTORS = {
  SLEEP_HOURS: {
    key: 'sleepHours',
    label: 'Sleep Hours',
    description: 'Hours of sleep per night',
    category: 'lifestyle',
    type: 'number',
    min: 0,
    max: 24,
    unit: 'hours',
    icon: '😴',
    optimal: { min: 7, max: 9 }
  },
  SLEEP_QUALITY: {
    key: 'sleepQuality',
    label: 'Sleep Quality',
    description: 'How well you slept',
    category: 'lifestyle',
    type: 'rating',
    min: 1,
    max: 5,
    icon: '🌙',
    labels: ['Very Poor', 'Poor', 'Fair', 'Good', 'Excellent']
  },
  STRESS_LEVEL: {
    key: 'stressLevel',
    label: 'Stress Level',
    description: 'Overall stress level',
    category: 'lifestyle',
    type: 'rating',
    min: 0,
    max: 10,
    icon: '😓',
    labels: ['No Stress', 'Low', 'Mild', 'Moderate', 'High', 'Very High']
  },
  EXERCISE_MINUTES: {
    key: 'exerciseMinutes',
    label: 'Exercise Minutes',
    description: 'Minutes of exercise today',
    category: 'lifestyle',
    type: 'number',
    min: 0,
    max: 480,
    unit: 'minutes',
    icon: '🏃‍♀️',
    optimal: { min: 30, max: 60 }
  },
  EXERCISE_TYPE: {
    key: 'exerciseType',
    label: 'Exercise Type',
    description: 'Type of exercise performed',
    category: 'lifestyle',
    type: 'select',
    icon: '💪',
    options: [
      { value: 'none', label: 'No Exercise' },
      { value: 'light', label: 'Light (Walking, Yoga)' },
      { value: 'moderate', label: 'Moderate (Jogging, Cycling)' },
      { value: 'intense', label: 'Intense (Running, HIIT)' }
    ]
  },
  WATER_INTAKE: {
    key: 'waterIntake',
    label: 'Water Intake',
    description: 'Glasses of water consumed',
    category: 'lifestyle',
    type: 'number',
    min: 0,
    max: 20,
    unit: 'glasses',
    icon: '💧',
    optimal: { min: 8, max: 12 }
  }
};

export const SEVERITY_LEVELS = {
  0: {
    label: 'None',
    color: '#6b7280',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-600',
    description: 'No symptoms'
  },
  1: {
    label: 'Mild',
    color: '#10b981',
    bgColor: 'bg-green-100',
    textColor: 'text-green-600',
    description: 'Barely noticeable'
  },
  2: {
    label: 'Moderate',
    color: '#f59e0b',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-600',
    description: 'Noticeable but manageable'
  },
  3: {
    label: 'Severe',
    color: '#f97316',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-600',
    description: 'Interferes with daily activities'
  },
  4: {
    label: 'Very Severe',
    color: '#ef4444',
    bgColor: 'bg-red-100',
    textColor: 'text-red-600',
    description: 'Significantly impacts daily life'
  },
  5: {
    label: 'Extreme',
    color: '#dc2626',
    bgColor: 'bg-red-200',
    textColor: 'text-red-700',
    description: 'Debilitating'
  }
};

export const SYMPTOM_TRACKING_TIPS = {
  CONSISTENCY: {
    title: 'Track Consistently',
    description: 'Log symptoms daily for the most accurate patterns',
    icon: '📅'
  },
  TIMING: {
    title: 'Same Time Daily',
    description: 'Try to log symptoms at the same time each day',
    icon: '⏰'
  },
  HONESTY: {
    title: 'Be Honest',
    description: 'Rate symptoms honestly, even if they seem minor',
    icon: '💯'
  },
  CONTEXT: {
    title: 'Add Context',
    description: 'Note what might have influenced your symptoms',
    icon: '📝'
  },
  PATTERNS: {
    title: 'Look for Patterns',
    description: 'Review your data regularly to identify trends',
    icon: '🔍'
  }
};

export const SYMPTOM_INSIGHTS = {
  IMPROVING: {
    title: 'Symptoms Improving',
    message: 'Your symptoms are getting better!',
    type: 'positive',
    icon: '📈'
  },
  STABLE: {
    title: 'Symptoms Stable',
    message: 'Your symptoms are consistent.',
    type: 'neutral',
    icon: '➡️'
  },
  WORSENING: {
    title: 'Symptoms Worsening',
    message: 'Your symptoms may be getting worse.',
    type: 'warning',
    icon: '📉'
  },
  CYCLICAL: {
    title: 'Cyclical Pattern',
    message: 'Your symptoms follow your menstrual cycle.',
    type: 'info',
    icon: '🔄'
  },
  HIGH_SEVERITY: {
    title: 'High Severity',
    message: 'Consider consulting with a healthcare provider.',
    type: 'warning',
    icon: '⚠️'
  }
};

// Helper functions
export const getAllSymptoms = () => {
  return {
    ...PHYSICAL_SYMPTOMS,
    ...EMOTIONAL_SYMPTOMS,
    ...PCOS_SYMPTOMS
  };
};

export const getSymptomsByCategory = (category) => {
  const allSymptoms = getAllSymptoms();
  return Object.values(allSymptoms).filter(symptom => symptom.category === category);
};

export const getSeverityLevel = (severity) => {
  return SEVERITY_LEVELS[severity] || SEVERITY_LEVELS[0];
};

export const getSymptomRecommendations = (symptoms) => {
  const recommendations = [];
  const allSymptoms = getAllSymptoms();
  
  Object.entries(symptoms).forEach(([key, value]) => {
    const symptom = allSymptoms[key];
    if (symptom && value > 0 && symptom.tips) {
      recommendations.push({
        symptom: symptom.label,
        tips: symptom.tips
      });
    }
  });
  
  return recommendations;
};
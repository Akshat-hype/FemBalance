// Cycle-related constants

export const CYCLE_CONSTANTS = {
  MIN_CYCLE_LENGTH: 15,
  MAX_CYCLE_LENGTH: 45,
  AVERAGE_CYCLE_LENGTH: 28,
  MIN_PERIOD_LENGTH: 1,
  MAX_PERIOD_LENGTH: 10,
  AVERAGE_PERIOD_LENGTH: 5,
  OVULATION_DAY_BEFORE_PERIOD: 14,
  FERTILITY_WINDOW_DAYS: 6, // 5 days before + 1 day after ovulation
  IRREGULAR_THRESHOLD: 7 // Days variation to consider irregular
};

export const CYCLE_PHASES = {
  MENSTRUAL: {
    name: 'menstrual',
    label: 'Menstrual',
    description: 'Period days',
    color: '#ef4444',
    duration: '1-7 days',
    characteristics: ['Menstrual bleeding', 'Cramping', 'Lower energy']
  },
  FOLLICULAR: {
    name: 'follicular',
    label: 'Follicular',
    description: 'Post-period, pre-ovulation',
    color: '#3b82f6',
    duration: '7-14 days',
    characteristics: ['Rising energy', 'Clearer skin', 'Improved mood']
  },
  OVULATION: {
    name: 'ovulation',
    label: 'Ovulation',
    description: 'Most fertile days',
    color: '#10b981',
    duration: '1-3 days',
    characteristics: ['Peak fertility', 'Higher energy', 'Increased libido']
  },
  LUTEAL: {
    name: 'luteal',
    label: 'Luteal',
    description: 'Post-ovulation, pre-period',
    color: '#f59e0b',
    duration: '10-16 days',
    characteristics: ['PMS symptoms', 'Mood changes', 'Bloating']
  }
};

export const FLOW_INTENSITY = {
  LIGHT: {
    value: 'light',
    label: 'Light',
    description: 'Spotting or light bleeding',
    color: '#fecaca',
    icon: '🩸',
    characteristics: ['Panty liners sufficient', 'Light pink to brown color']
  },
  NORMAL: {
    value: 'normal',
    label: 'Normal',
    description: 'Regular flow',
    color: '#ef4444',
    icon: '🔴',
    characteristics: ['Regular pads/tampons needed', 'Bright red color']
  },
  HEAVY: {
    value: 'heavy',
    label: 'Heavy',
    description: 'Heavy bleeding',
    color: '#991b1b',
    icon: '🩸',
    characteristics: ['Frequent pad/tampon changes', 'May contain clots']
  }
};

export const CYCLE_REGULARITY = {
  REGULAR: {
    value: 'regular',
    label: 'Regular',
    description: 'Cycles vary by less than 7 days',
    color: '#10b981',
    threshold: 7
  },
  IRREGULAR: {
    value: 'irregular',
    label: 'Irregular',
    description: 'Cycles vary by 7-20 days',
    color: '#f59e0b',
    threshold: 20
  },
  VERY_IRREGULAR: {
    value: 'very_irregular',
    label: 'Very Irregular',
    description: 'Cycles vary by more than 20 days',
    color: '#ef4444',
    threshold: Infinity
  }
};

// Cycle length categories
export const CYCLE_LENGTH_CATEGORIES = {
  SHORT: {
    range: [15, 20],
    label: 'Short Cycles',
    description: 'Cycles shorter than 21 days',
    color: '#3b82f6',
    recommendation: 'Consider tracking symptoms and consulting healthcare provider'
  },
  NORMAL: {
    range: [21, 35],
    label: 'Normal Cycles',
    description: 'Typical cycle length range',
    color: '#10b981',
    recommendation: 'Continue regular tracking'
  },
  LONG: {
    range: [36, 45],
    label: 'Long Cycles',
    description: 'Cycles longer than 35 days',
    color: '#f59e0b',
    recommendation: 'Monitor for PCOS symptoms and consider medical consultation'
  }
};

// Period length categories
export const PERIOD_LENGTH_CATEGORIES = {
  SHORT: {
    range: [1, 3],
    label: 'Short Periods',
    description: '1-3 days of bleeding',
    color: '#3b82f6'
  },
  NORMAL: {
    range: [4, 7],
    label: 'Normal Periods',
    description: '4-7 days of bleeding',
    color: '#10b981'
  },
  LONG: {
    range: [8, 10],
    label: 'Long Periods',
    description: '8+ days of bleeding',
    color: '#f59e0b'
  }
};

// Cycle tracking milestones
export const TRACKING_MILESTONES = {
  FIRST_CYCLE: {
    cycles: 1,
    title: 'First Cycle Logged!',
    description: 'Great start! Keep tracking to see patterns.',
    badge: '🎉'
  },
  CONSISTENT_TRACKER: {
    cycles: 3,
    title: 'Consistent Tracker',
    description: 'You\'ve logged 3 cycles. Patterns are emerging!',
    badge: '📊'
  },
  PATTERN_EXPERT: {
    cycles: 6,
    title: 'Pattern Expert',
    description: '6 cycles tracked! You know your body well.',
    badge: '🔍'
  },
  CYCLE_MASTER: {
    cycles: 12,
    title: 'Cycle Master',
    description: 'A full year of tracking! Amazing dedication.',
    badge: '👑'
  }
};

// Prediction confidence levels
export const PREDICTION_CONFIDENCE = {
  LOW: {
    threshold: 0.5,
    label: 'Low Confidence',
    description: 'Predictions may be less accurate',
    color: '#ef4444',
    recommendation: 'Track more cycles for better predictions'
  },
  MEDIUM: {
    threshold: 0.7,
    label: 'Medium Confidence',
    description: 'Reasonably accurate predictions',
    color: '#f59e0b',
    recommendation: 'Continue consistent tracking'
  },
  HIGH: {
    threshold: 0.9,
    label: 'High Confidence',
    description: 'Very accurate predictions',
    color: '#10b981',
    recommendation: 'Great tracking! Predictions are reliable'
  }
};

// Cycle insights
export const CYCLE_INSIGHTS = {
  REGULAR_CYCLES: {
    title: 'Regular Cycles',
    message: 'Your cycles are very consistent!',
    type: 'positive'
  },
  IMPROVING_REGULARITY: {
    title: 'Improving Regularity',
    message: 'Your cycles are becoming more regular.',
    type: 'positive'
  },
  IRREGULAR_PATTERN: {
    title: 'Irregular Pattern',
    message: 'Your cycles show some variation.',
    type: 'neutral'
  },
  CONCERNING_IRREGULARITY: {
    title: 'Concerning Irregularity',
    message: 'Consider consulting with a healthcare provider.',
    type: 'warning'
  },
  LONG_CYCLES: {
    title: 'Long Cycles',
    message: 'Your cycles are longer than average.',
    type: 'neutral'
  },
  SHORT_CYCLES: {
    title: 'Short Cycles',
    message: 'Your cycles are shorter than average.',
    type: 'neutral'
  }
};

// Helper functions for cycle calculations
export const getCyclePhaseFromDay = (cycleDay, cycleLength = 28) => {
  if (cycleDay <= 5) return CYCLE_PHASES.MENSTRUAL;
  if (cycleDay <= cycleLength / 2 - 3) return CYCLE_PHASES.FOLLICULAR;
  if (cycleDay <= cycleLength / 2 + 3) return CYCLE_PHASES.OVULATION;
  return CYCLE_PHASES.LUTEAL;
};

export const getCycleLengthCategory = (length) => {
  if (length <= 20) return CYCLE_LENGTH_CATEGORIES.SHORT;
  if (length <= 35) return CYCLE_LENGTH_CATEGORIES.NORMAL;
  return CYCLE_LENGTH_CATEGORIES.LONG;
};

export const getPeriodLengthCategory = (length) => {
  if (length <= 3) return PERIOD_LENGTH_CATEGORIES.SHORT;
  if (length <= 7) return PERIOD_LENGTH_CATEGORIES.NORMAL;
  return PERIOD_LENGTH_CATEGORIES.LONG;
};

export const getCycleRegularity = (cycleLengths) => {
  if (cycleLengths.length < 3) return null;
  
  const avgLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
  const maxVariation = Math.max(...cycleLengths.map(length => Math.abs(length - avgLength)));
  
  if (maxVariation <= CYCLE_REGULARITY.REGULAR.threshold) {
    return CYCLE_REGULARITY.REGULAR;
  } else if (maxVariation <= CYCLE_REGULARITY.IRREGULAR.threshold) {
    return CYCLE_REGULARITY.IRREGULAR;
  } else {
    return CYCLE_REGULARITY.VERY_IRREGULAR;
  }
};

export const getPredictionConfidence = (cycles) => {
  if (cycles.length < 3) return PREDICTION_CONFIDENCE.LOW;
  
  const cycleLengths = cycles.map(c => c.cycleLength).filter(Boolean);
  const regularity = getCycleRegularity(cycleLengths);
  
  if (regularity === CYCLE_REGULARITY.REGULAR && cycles.length >= 6) {
    return PREDICTION_CONFIDENCE.HIGH;
  } else if (regularity !== CYCLE_REGULARITY.VERY_IRREGULAR && cycles.length >= 3) {
    return PREDICTION_CONFIDENCE.MEDIUM;
  } else {
    return PREDICTION_CONFIDENCE.LOW;
  }
};
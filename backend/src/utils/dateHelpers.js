// Date utility functions for cycle tracking and predictions

/**
 * Calculate the current cycle phase based on cycle day
 * @param {number} cycleDay - Current day of the cycle (1-based)
 * @param {number} cycleLength - Total cycle length (default 28)
 * @returns {string} - Phase name (menstrual, follicular, ovulation, luteal)
 */
const calculateCyclePhase = (cycleDay, cycleLength = 28) => {
  if (cycleDay <= 0 || cycleDay > cycleLength) {
    return 'unknown';
  }

  if (cycleDay <= 5) {
    return 'menstrual';
  } else if (cycleDay <= Math.floor(cycleLength / 2) - 2) {
    return 'follicular';
  } else if (cycleDay <= Math.floor(cycleLength / 2) + 2) {
    return 'ovulation';
  } else {
    return 'luteal';
  }
};

/**
 * Calculate fertile window based on cycle start date and length
 * @param {Date} cycleStartDate - Start date of the cycle
 * @param {number} cycleLength - Total cycle length (default 28)
 * @returns {Object} - Fertile window with start and end dates
 */
const calculateFertileWindow = (cycleStartDate, cycleLength = 28) => {
  const ovulationDay = Math.floor(cycleLength / 2);
  const fertileStart = new Date(cycleStartDate);
  const fertileEnd = new Date(cycleStartDate);

  // Fertile window: 5 days before ovulation to 1 day after
  fertileStart.setDate(fertileStart.getDate() + ovulationDay - 6);
  fertileEnd.setDate(fertileEnd.getDate() + ovulationDay + 1);

  return {
    start: fertileStart,
    end: fertileEnd,
    ovulationDate: new Date(cycleStartDate.getTime() + (ovulationDay - 1) * 24 * 60 * 60 * 1000)
  };
};

/**
 * Predict next period based on cycle history
 * @param {Array} cycles - Array of cycle objects with startDate and cycleLength
 * @returns {Object} - Prediction with date, confidence, and cycle length
 */
const predictNextPeriod = (cycles) => {
  if (!cycles || cycles.length === 0) {
    return null;
  }

  // Sort cycles by start date (most recent first)
  const sortedCycles = cycles.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  
  if (sortedCycles.length === 1) {
    // Only one cycle, use default 28-day cycle
    const nextDate = new Date(sortedCycles[0].startDate);
    nextDate.setDate(nextDate.getDate() + (sortedCycles[0].cycleLength || 28));
    
    return {
      predictedDate: nextDate,
      confidence: 'low',
      predictedCycleLength: sortedCycles[0].cycleLength || 28,
      method: 'single_cycle'
    };
  }

  // Calculate average cycle length
  const cycleLengths = sortedCycles
    .map(cycle => cycle.cycleLength)
    .filter(length => length && length > 0);

  if (cycleLengths.length === 0) {
    // No cycle lengths available, use 28-day default
    const nextDate = new Date(sortedCycles[0].startDate);
    nextDate.setDate(nextDate.getDate() + 28);
    
    return {
      predictedDate: nextDate,
      confidence: 'low',
      predictedCycleLength: 28,
      method: 'default'
    };
  }

  const averageCycleLength = Math.round(
    cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
  );

  // Calculate standard deviation for confidence
  const variance = cycleLengths.reduce((acc, length) => {
    return acc + Math.pow(length - averageCycleLength, 2);
  }, 0) / cycleLengths.length;
  
  const standardDeviation = Math.sqrt(variance);

  // Determine confidence based on regularity
  let confidence;
  if (standardDeviation <= 2) {
    confidence = 'high';
  } else if (standardDeviation <= 5) {
    confidence = 'medium';
  } else {
    confidence = 'low';
  }

  // Predict next period date
  const lastCycleStart = new Date(sortedCycles[0].startDate);
  const nextDate = new Date(lastCycleStart);
  nextDate.setDate(nextDate.getDate() + averageCycleLength);

  return {
    predictedDate: nextDate,
    confidence,
    predictedCycleLength: averageCycleLength,
    standardDeviation: Math.round(standardDeviation * 10) / 10,
    method: 'average',
    basedOnCycles: cycleLengths.length
  };
};

/**
 * Calculate days until next period
 * @param {Date} predictedDate - Predicted period start date
 * @returns {number} - Days until next period (negative if overdue)
 */
const daysUntilNextPeriod = (predictedDate) => {
  const today = new Date();
  const timeDiff = predictedDate.getTime() - today.getTime();
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
};

/**
 * Check if a date is within the fertile window
 * @param {Date} date - Date to check
 * @param {Date} cycleStartDate - Start date of the cycle
 * @param {number} cycleLength - Total cycle length
 * @returns {boolean} - True if date is in fertile window
 */
const isInFertileWindow = (date, cycleStartDate, cycleLength = 28) => {
  const fertileWindow = calculateFertileWindow(cycleStartDate, cycleLength);
  return date >= fertileWindow.start && date <= fertileWindow.end;
};

/**
 * Calculate cycle day from start date
 * @param {Date} cycleStartDate - Start date of the cycle
 * @param {Date} currentDate - Current date (default: today)
 * @returns {number} - Cycle day (1-based)
 */
const calculateCycleDay = (cycleStartDate, currentDate = new Date()) => {
  const timeDiff = currentDate.getTime() - cycleStartDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
  return daysDiff + 1;
};

/**
 * Get date range for a specific period
 * @param {string} period - Period type ('week', 'month', 'year')
 * @param {Date} referenceDate - Reference date (default: today)
 * @returns {Object} - Start and end dates
 */
const getDateRange = (period, referenceDate = new Date()) => {
  const startDate = new Date(referenceDate);
  const endDate = new Date(referenceDate);

  switch (period) {
    case 'week':
      startDate.setDate(startDate.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(startDate.getMonth() - 1);
      break;
    case 'year':
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;
    case 'quarter':
      startDate.setMonth(startDate.getMonth() - 3);
      break;
    default:
      startDate.setDate(startDate.getDate() - 30); // Default to 30 days
  }

  return { startDate, endDate };
};

/**
 * Format date for display
 * @param {Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'iso')
 * @returns {string} - Formatted date string
 */
const formatDate = (date, format = 'short') => {
  if (!date || !(date instanceof Date)) {
    return '';
  }

  switch (format) {
    case 'short':
      return date.toLocaleDateString();
    case 'long':
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    case 'iso':
      return date.toISOString().split('T')[0];
    case 'relative':
      return getRelativeTimeString(date);
    default:
      return date.toLocaleDateString();
  }
};

/**
 * Get relative time string (e.g., "2 days ago", "in 3 days")
 * @param {Date} date - Date to compare
 * @param {Date} referenceDate - Reference date (default: today)
 * @returns {string} - Relative time string
 */
const getRelativeTimeString = (date, referenceDate = new Date()) => {
  const timeDiff = date.getTime() - referenceDate.getTime();
  const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

  if (daysDiff === 0) {
    return 'Today';
  } else if (daysDiff === 1) {
    return 'Tomorrow';
  } else if (daysDiff === -1) {
    return 'Yesterday';
  } else if (daysDiff > 0) {
    return `In ${daysDiff} day${daysDiff > 1 ? 's' : ''}`;
  } else {
    return `${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''} ago`;
  }
};

/**
 * Check if two dates are on the same day
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {boolean} - True if same day
 */
const isSameDay = (date1, date2) => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

/**
 * Get start and end of day for a given date
 * @param {Date} date - Input date
 * @returns {Object} - Start and end of day
 */
const getStartAndEndOfDay = (date) => {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);
  
  return { startOfDay, endOfDay };
};

/**
 * Validate date input
 * @param {any} dateInput - Date input to validate
 * @returns {Date|null} - Valid date or null
 */
const validateDate = (dateInput) => {
  if (!dateInput) return null;
  
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return null;
  
  // Check if date is reasonable (not too far in past or future)
  const now = new Date();
  const minDate = new Date(now.getFullYear() - 10, 0, 1);
  const maxDate = new Date(now.getFullYear() + 2, 11, 31);
  
  if (date < minDate || date > maxDate) return null;
  
  return date;
};

module.exports = {
  calculateCyclePhase,
  calculateFertileWindow,
  predictNextPeriod,
  daysUntilNextPeriod,
  isInFertileWindow,
  calculateCycleDay,
  getDateRange,
  formatDate,
  getRelativeTimeString,
  isSameDay,
  getStartAndEndOfDay,
  validateDate
};
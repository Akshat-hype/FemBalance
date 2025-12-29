// Cycle-related type definitions

export const FlowIntensity = {
  LIGHT: 'light',
  NORMAL: 'normal',
  HEAVY: 'heavy'
};

export const CyclePhase = {
  MENSTRUAL: 'menstrual',
  FOLLICULAR: 'follicular',
  OVULATION: 'ovulation',
  LUTEAL: 'luteal'
};

export const CycleRegularity = {
  REGULAR: 'regular',
  IRREGULAR: 'irregular',
  VERY_IRREGULAR: 'very_irregular'
};

// Cycle validation functions
export const validateCycleLength = (length) => {
  return length >= 15 && length <= 45;
};

export const validatePeriodLength = (length) => {
  return length >= 1 && length <= 10;
};

export const validateDateRange = (startDate, endDate) => {
  if (!endDate) return true; // End date is optional
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  return end > start;
};

export const calculateCycleLength = (startDate, nextStartDate) => {
  const start = new Date(startDate);
  const nextStart = new Date(nextStartDate);
  
  const diffTime = Math.abs(nextStart - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const calculatePeriodLength = (startDate, endDate) => {
  if (!endDate) return null;
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const predictNextPeriod = (cycles) => {
  if (cycles.length === 0) return null;
  
  // Calculate average cycle length from recent cycles
  const recentCycles = cycles.slice(0, 6); // Last 6 cycles
  const cycleLengths = recentCycles
    .filter(cycle => cycle.cycleLength)
    .map(cycle => cycle.cycleLength);
  
  if (cycleLengths.length === 0) return null;
  
  const avgCycleLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
  
  // Get last period start date
  const lastCycle = cycles[0];
  const lastPeriodStart = new Date(lastCycle.startDate);
  
  // Predict next period
  const nextPeriodDate = new Date(lastPeriodStart);
  nextPeriodDate.setDate(nextPeriodDate.getDate() + Math.round(avgCycleLength));
  
  return nextPeriodDate;
};

export const predictOvulation = (nextPeriodDate, avgCycleLength = 28) => {
  if (!nextPeriodDate) return null;
  
  const ovulationDate = new Date(nextPeriodDate);
  ovulationDate.setDate(ovulationDate.getDate() - 14); // Typically 14 days before period
  
  return ovulationDate;
};

export const calculateFertilityWindow = (ovulationDate) => {
  if (!ovulationDate) return null;
  
  const startDate = new Date(ovulationDate);
  startDate.setDate(startDate.getDate() - 5); // 5 days before ovulation
  
  const endDate = new Date(ovulationDate);
  endDate.setDate(endDate.getDate() + 1); // 1 day after ovulation
  
  return {
    start: startDate,
    end: endDate
  };
};
// Cycle calculation utilities

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

export const getCurrentCycleDay = (cycles, currentDate = new Date()) => {
  if (cycles.length === 0) return null;
  
  const lastCycle = cycles[0];
  const cycleStart = new Date(lastCycle.startDate);
  const current = new Date(currentDate);
  
  const diffTime = current - cycleStart;
  const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return daysDiff > 0 ? daysDiff : null;
};

export const getCyclePhase = (cycleDay, avgCycleLength = 28) => {
  if (!cycleDay) return 'unknown';
  
  if (cycleDay <= 5) {
    return 'menstrual';
  } else if (cycleDay <= avgCycleLength / 2 - 3) {
    return 'follicular';
  } else if (cycleDay <= avgCycleLength / 2 + 3) {
    return 'ovulation';
  } else {
    return 'luteal';
  }
};

export const isIrregularCycle = (cycles) => {
  if (cycles.length < 3) return false;
  
  const cycleLengths = cycles
    .filter(cycle => cycle.cycleLength)
    .map(cycle => cycle.cycleLength)
    .slice(0, 6); // Last 6 cycles
  
  if (cycleLengths.length < 3) return false;
  
  const avgLength = cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length;
  
  // Check if any cycle varies by more than 7 days from average
  return cycleLengths.some(length => Math.abs(length - avgLength) > 7);
};
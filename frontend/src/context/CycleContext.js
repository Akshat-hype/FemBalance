import React, { createContext, useState, useEffect, useContext } from 'react';
import { cycleService } from '../services/cycle';
import { AuthContext } from './AuthContext';

export const CycleContext = createContext();

export const CycleProvider = ({ children }) => {
  const [cycles, setCycles] = useState([]);
  const [currentCycle, setCurrentCycle] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { isAuthenticated } = useContext(AuthContext);

  // Fetch cycles data
  const fetchCycles = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const data = await cycleService.getCycleHistory();
      setCycles(data.cycles || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch cycle statistics
  const fetchStats = async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await cycleService.getCycleStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch cycle stats:', err);
    }
  };

  // Fetch cycle predictions
  const fetchPredictions = async () => {
    if (!isAuthenticated) return;
    
    try {
      const data = await cycleService.getCyclePredictions();
      setPredictions(data);
    } catch (err) {
      console.error('Failed to fetch predictions:', err);
    }
  };

  // Log new period
  const logPeriod = async (periodData) => {
    setLoading(true);
    try {
      const result = await cycleService.logPeriod(periodData);
      await fetchCycles(); // Refresh cycles
      await fetchStats(); // Refresh stats
      await fetchPredictions(); // Refresh predictions
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update existing cycle
  const updateCycle = async (cycleId, updateData) => {
    setLoading(true);
    try {
      const result = await cycleService.updateCycle(cycleId, updateData);
      await fetchCycles(); // Refresh cycles
      await fetchStats(); // Refresh stats
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete cycle
  const deleteCycle = async (cycleId) => {
    setLoading(true);
    try {
      await cycleService.deleteCycle(cycleId);
      await fetchCycles(); // Refresh cycles
      await fetchStats(); // Refresh stats
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Get current cycle day
  const getCurrentCycleDay = () => {
    if (cycles.length === 0) return null;
    
    const lastCycle = cycles[0];
    const cycleStart = new Date(lastCycle.startDate);
    const today = new Date();
    
    const diffTime = today - cycleStart;
    const daysDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return daysDiff > 0 ? daysDiff : null;
  };

  // Get cycle phase
  const getCurrentPhase = () => {
    const cycleDay = getCurrentCycleDay();
    const avgCycleLength = stats?.averageCycleLength || 28;
    
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

  // Initialize data when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchCycles();
      fetchStats();
      fetchPredictions();
    } else {
      // Clear data when user logs out
      setCycles([]);
      setCurrentCycle(null);
      setPredictions(null);
      setStats(null);
      setError(null);
    }
  }, [isAuthenticated]);

  // Update current cycle when cycles change
  useEffect(() => {
    if (cycles.length > 0) {
      setCurrentCycle(cycles[0]); // Most recent cycle
    } else {
      setCurrentCycle(null);
    }
  }, [cycles]);

  const value = {
    // Data
    cycles,
    currentCycle,
    predictions,
    stats,
    loading,
    error,
    
    // Actions
    logPeriod,
    updateCycle,
    deleteCycle,
    fetchCycles,
    fetchStats,
    fetchPredictions,
    
    // Computed values
    getCurrentCycleDay,
    getCurrentPhase,
    
    // Utilities
    refetch: () => {
      fetchCycles();
      fetchStats();
      fetchPredictions();
    }
  };

  return (
    <CycleContext.Provider value={value}>
      {children}
    </CycleContext.Provider>
  );
};
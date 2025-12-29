import { useState, useEffect } from 'react';
import { cycleService } from '../services/cycle';

export const useCycle = () => {
  const [cycleData, setCycleData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCycleData = async () => {
    setLoading(true);
    try {
      const data = await cycleService.getCycleData();
      setCycleData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logPeriod = async (periodData) => {
    setLoading(true);
    try {
      const result = await cycleService.logPeriod(periodData);
      await fetchCycleData(); // Refresh data
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCycleData();
  }, []);

  return {
    cycleData,
    loading,
    error,
    logPeriod,
    refetch: fetchCycleData
  };
};
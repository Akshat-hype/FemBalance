import { useState, useEffect } from 'react';
import { symptomService } from '../services/symptoms';

export const useSymptoms = () => {
  const [symptoms, setSymptoms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSymptoms = async (dateRange = null) => {
    setLoading(true);
    try {
      const data = await symptomService.getSymptoms(dateRange);
      setSymptoms(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logSymptom = async (symptomData) => {
    setLoading(true);
    try {
      const result = await symptomService.logSymptom(symptomData);
      await fetchSymptoms(); // Refresh data
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSymptom = async (symptomId, updateData) => {
    setLoading(true);
    try {
      const result = await symptomService.updateSymptom(symptomId, updateData);
      await fetchSymptoms(); // Refresh data
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSymptom = async (symptomId) => {
    setLoading(true);
    try {
      await symptomService.deleteSymptom(symptomId);
      await fetchSymptoms(); // Refresh data
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSymptoms();
  }, []);

  return {
    symptoms,
    loading,
    error,
    logSymptom,
    updateSymptom,
    deleteSymptom,
    refetch: fetchSymptoms
  };
};
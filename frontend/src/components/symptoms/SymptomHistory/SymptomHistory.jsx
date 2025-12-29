import React, { useState, useEffect } from 'react';

const SymptomHistory = () => {
  const [history, setHistory] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');

  useEffect(() => {
    // Fetch symptom history
    fetchSymptomHistory();
  }, [selectedPeriod]);

  const fetchSymptomHistory = async () => {
    // Mock data - replace with actual API call
    const mockData = [
      {
        date: '2024-01-15',
        symptoms: {
          cramps: 3,
          bloating: 2,
          moodSwings: 4,
          fatigue: 3
        }
      },
      {
        date: '2024-01-14',
        symptoms: {
          cramps: 4,
          bloating: 3,
          moodSwings: 2,
          fatigue: 4
        }
      }
    ];
    setHistory(mockData);
  };

  const getSymptomColor = (intensity) => {
    if (intensity === 0) return 'bg-gray-200';
    if (intensity <= 2) return 'bg-green-300';
    if (intensity <= 3) return 'bg-yellow-300';
    if (intensity <= 4) return 'bg-orange-300';
    return 'bg-red-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Symptom History</h2>
        <select
          value={selectedPeriod}
          onChange={(e) => setSelectedPeriod(e.target.value)}
          className="p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
        >
          <option value="last7days">Last 7 Days</option>
          <option value="last30days">Last 30 Days</option>
          <option value="last3months">Last 3 Months</option>
        </select>
      </div>

      <div className="space-y-4">
        {history.map((entry, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-gray-700">
                {new Date(entry.date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(entry.symptoms).map(([symptom, intensity]) => (
                <div key={symptom} className="flex items-center space-x-2">
                  <div
                    className={`w-4 h-4 rounded-full ${getSymptomColor(intensity)}`}
                    title={`Intensity: ${intensity}/5`}
                  ></div>
                  <span className="text-sm text-gray-600 capitalize">
                    {symptom.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                  <span className="text-xs text-gray-500">({intensity}/5)</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {history.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No symptom data available for the selected period.</p>
          <p className="text-sm text-gray-400 mt-2">Start logging your symptoms to see your history here.</p>
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Intensity Scale</h4>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-gray-200"></div>
            <span>None (0)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-300"></div>
            <span>Mild (1-2)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-yellow-300"></div>
            <span>Moderate (3)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-orange-300"></div>
            <span>Severe (4)</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-300"></div>
            <span>Very Severe (5)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SymptomHistory;
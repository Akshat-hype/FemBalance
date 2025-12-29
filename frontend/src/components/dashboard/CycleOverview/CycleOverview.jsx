import React from 'react';

const CycleOverview = ({ cycleData }) => {
  const {
    currentDay = 1,
    cycleLength = 28,
    nextPeriodDate = null,
    currentPhase = 'follicular'
  } = cycleData || {};

  const phaseColors = {
    menstrual: 'bg-red-100 text-red-800',
    follicular: 'bg-blue-100 text-blue-800',
    ovulation: 'bg-green-100 text-green-800',
    luteal: 'bg-yellow-100 text-yellow-800'
  };

  const formatDate = (date) => {
    if (!date) return 'Not available';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Cycle Overview</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center">
          <div className="text-3xl font-bold text-primary-600">{currentDay}</div>
          <div className="text-sm text-gray-600">Current Day</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-900">{cycleLength}</div>
          <div className="text-sm text-gray-600">Avg Cycle Length</div>
        </div>
      </div>

      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-600">Current Phase</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${phaseColors[currentPhase]}`}>
            {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
          </span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentDay / cycleLength) * 100}%` }}
          />
        </div>
      </div>

      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Next Period</span>
          <span className="text-sm font-medium text-gray-900">
            {formatDate(nextPeriodDate)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default CycleOverview;
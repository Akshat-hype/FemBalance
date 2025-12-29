import React, { useState } from 'react';

const CycleTracker = ({ cycles = [] }) => {
  const [selectedCycle, setSelectedCycle] = useState(null);

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateCycleLength = (cycle) => {
    if (!cycle.endDate) return 'Ongoing';
    const start = new Date(cycle.startDate);
    const end = new Date(cycle.endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + ' days';
  };

  const getFlowColor = (flow) => {
    switch (flow) {
      case 'light':
        return 'bg-pink-100 text-pink-800';
      case 'normal':
        return 'bg-red-100 text-red-800';
      case 'heavy':
        return 'bg-red-200 text-red-900';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Cycle History</h2>
        <button className="btn-primary">
          Log New Period
        </button>
      </div>

      {cycles.length === 0 ? (
        <div className="card text-center py-12">
          <div className="text-6xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No cycles recorded yet</h3>
          <p className="text-gray-600 mb-6">Start tracking your menstrual cycle to get personalized insights</p>
          <button className="btn-primary">
            Log Your First Period
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {cycles.map((cycle, index) => (
            <div 
              key={cycle.id || index}
              className="card hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedCycle(cycle)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {formatDate(cycle.startDate)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {cycle.endDate ? `Ended ${formatDate(cycle.endDate)}` : 'Ongoing'}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getFlowColor(cycle.flow)}`}>
                        {cycle.flow || 'Normal'} Flow
                      </span>
                      
                      {cycle.isIrregular && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Irregular
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2 text-sm text-gray-600">
                    Length: {calculateCycleLength(cycle)}
                  </div>
                </div>
                
                <div className="text-gray-400">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              
              {cycle.notes && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{cycle.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Cycle Details Modal */}
      {selectedCycle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Cycle Details</h3>
              <button 
                onClick={() => setSelectedCycle(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Period Dates</label>
                <p className="text-gray-900">
                  {formatDate(selectedCycle.startDate)} - {selectedCycle.endDate ? formatDate(selectedCycle.endDate) : 'Ongoing'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Flow Intensity</label>
                <p className="text-gray-900 capitalize">{selectedCycle.flow || 'Normal'}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-gray-700">Cycle Length</label>
                <p className="text-gray-900">{calculateCycleLength(selectedCycle)}</p>
              </div>
              
              {selectedCycle.notes && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Notes</label>
                  <p className="text-gray-900">{selectedCycle.notes}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button className="btn-primary flex-1">Edit</button>
              <button className="btn-secondary flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CycleTracker;
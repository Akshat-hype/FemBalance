import React, { useState } from 'react';
import CycleTracker from '../../components/cycle/CycleTracker';
import CalendarView from '../../components/cycle/CalendarView';
import CycleChart from '../../components/cycle/CycleChart';
import PeriodLogger from '../../components/cycle/PeriodLogger';
import { useCycle } from '../../hooks/useCycle';

const CycleTracking = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showLogger, setShowLogger] = useState(false);
  const { cycleData, loading, logPeriod } = useCycle();

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'calendar', name: 'Calendar', icon: '📅' },
    { id: 'chart', name: 'Trends', icon: '📈' },
    { id: 'history', name: 'History', icon: '📋' }
  ];

  const handleLogPeriod = async (periodData) => {
    try {
      await logPeriod(periodData);
      setShowLogger(false);
      // Show success message
    } catch (error) {
      console.error('Failed to log period:', error);
      // Show error message
    }
  };

  const handleDateSelect = (date) => {
    // Handle calendar date selection
    console.log('Selected date:', date);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your cycle data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cycle Tracking</h1>
            <p className="text-gray-600 mt-2">Monitor your menstrual cycle and patterns</p>
          </div>
          <button
            onClick={() => setShowLogger(true)}
            className="btn-primary"
          >
            Log Period
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors
                    ${activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <CycleChart cycles={cycleData?.cycles || []} />
              </div>
              <div className="space-y-6">
                <CalendarView 
                  cycles={cycleData?.cycles || []} 
                  onDateSelect={handleDateSelect}
                />
              </div>
            </div>
          )}

          {activeTab === 'calendar' && (
            <CalendarView 
              cycles={cycleData?.cycles || []} 
              onDateSelect={handleDateSelect}
            />
          )}

          {activeTab === 'chart' && (
            <CycleChart cycles={cycleData?.cycles || []} />
          )}

          {activeTab === 'history' && (
            <CycleTracker cycles={cycleData?.cycles || []} />
          )}
        </div>

        {/* Quick Stats */}
        {cycleData?.stats && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card text-center">
              <div className="text-2xl font-bold text-primary-600">
                {cycleData.stats.averageCycleLength || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Avg Cycle Length</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-red-600">
                {cycleData.stats.averagePeriodLength || 'N/A'}
              </div>
              <div className="text-sm text-gray-600">Avg Period Length</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-green-600">
                {cycleData.stats.regularityScore || 'N/A'}%
              </div>
              <div className="text-sm text-gray-600">Regularity</div>
            </div>
            <div className="card text-center">
              <div className="text-2xl font-bold text-blue-600">
                {cycleData.stats.totalCycles || 0}
              </div>
              <div className="text-sm text-gray-600">Total Cycles</div>
            </div>
          </div>
        )}

        {/* Period Logger Modal */}
        {showLogger && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-md w-full max-h-screen overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">Log Period</h2>
                  <button
                    onClick={() => setShowLogger(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <PeriodLogger 
                  onSubmit={handleLogPeriod}
                  isLoading={loading}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CycleTracking;
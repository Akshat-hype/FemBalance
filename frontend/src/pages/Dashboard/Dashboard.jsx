import React from 'react';
import CycleOverview from '../../components/dashboard/CycleOverview';
import PCOSRiskCard from '../../components/dashboard/PCOSRiskCard';
import QuickActions from '../../components/dashboard/QuickActions';

const Dashboard = () => {
  // Mock data - replace with actual data from API
  const cycleData = {
    currentDay: 15,
    cycleLength: 28,
    nextPeriodDate: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000),
    currentPhase: 'ovulation'
  };

  const riskData = {
    riskLevel: 'low',
    riskScore: 0.25,
    lastAssessment: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here's your health overview.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <CycleOverview cycleData={cycleData} />
            
            {/* Recent Activity */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Period logged</p>
                    <p className="text-xs text-gray-600">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Symptoms tracked</p>
                    <p className="text-xs text-gray-600">3 days ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Workout completed</p>
                    <p className="text-xs text-gray-600">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <PCOSRiskCard riskData={riskData} />
            <QuickActions />
            
            {/* Health Tips */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Tip</h3>
              <div className="p-4 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-800">
                  💡 Stay hydrated during your cycle! Drinking plenty of water can help reduce bloating and improve energy levels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
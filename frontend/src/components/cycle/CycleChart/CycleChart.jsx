import React from 'react';

const CycleChart = ({ cycles = [] }) => {
  const maxCycles = 12;
  const displayCycles = cycles.slice(0, maxCycles);

  const getChartData = () => {
    return displayCycles.map((cycle, index) => ({
      id: cycle.id || index,
      cycleLength: cycle.cycleLength || 28,
      periodLength: cycle.periodLength || 5,
      startDate: new Date(cycle.startDate),
      isIrregular: cycle.isIrregular || false
    }));
  };

  const chartData = getChartData();
  const maxCycleLength = Math.max(...chartData.map(c => c.cycleLength), 35);

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (chartData.length === 0) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No cycle data available</h3>
        <p className="text-gray-600">Start tracking your cycles to see patterns and trends</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Cycle Length Trends</h3>
        <div className="text-sm text-gray-600">
          Last {chartData.length} cycles
        </div>
      </div>

      {/* Chart */}
      <div className="space-y-4">
        {chartData.map((cycle, index) => (
          <div key={cycle.id} className="flex items-center space-x-4">
            {/* Date */}
            <div className="w-16 text-sm text-gray-600 text-right">
              {formatDate(cycle.startDate)}
            </div>

            {/* Bar Chart */}
            <div className="flex-1 relative">
              <div className="flex items-center h-8">
                {/* Cycle Length Bar */}
                <div
                  className={`h-6 rounded-l-md ${
                    cycle.isIrregular ? 'bg-orange-400' : 'bg-blue-400'
                  } transition-all duration-300`}
                  style={{
                    width: `${(cycle.cycleLength / maxCycleLength) * 100}%`
                  }}
                />
                
                {/* Period Length Overlay */}
                <div
                  className="h-6 bg-red-500 rounded-l-md absolute left-0"
                  style={{
                    width: `${(cycle.periodLength / maxCycleLength) * 100}%`
                  }}
                />
              </div>

              {/* Cycle Length Label */}
              <div
                className="absolute top-0 text-xs font-medium text-white flex items-center justify-center h-6"
                style={{
                  width: `${(cycle.cycleLength / maxCycleLength) * 100}%`,
                  minWidth: '30px'
                }}
              >
                {cycle.cycleLength}d
              </div>
            </div>

            {/* Status Indicator */}
            <div className="w-20 text-right">
              {cycle.isIrregular && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  Irregular
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Scale */}
      <div className="mt-6 flex justify-between text-xs text-gray-500">
        <span>0 days</span>
        <span>{Math.round(maxCycleLength / 2)} days</span>
        <span>{maxCycleLength} days</span>
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded mr-2"></div>
          <span>Period Length</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-400 rounded mr-2"></div>
          <span>Regular Cycle</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-orange-400 rounded mr-2"></div>
          <span>Irregular Cycle</span>
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(chartData.reduce((sum, c) => sum + c.cycleLength, 0) / chartData.length)}
            </div>
            <div className="text-sm text-gray-600">Avg Cycle</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(chartData.reduce((sum, c) => sum + c.periodLength, 0) / chartData.length)}
            </div>
            <div className="text-sm text-gray-600">Avg Period</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round((chartData.filter(c => !c.isIrregular).length / chartData.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Regular</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CycleChart;
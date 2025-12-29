import React from 'react';

const PCOSRiskCard = ({ riskData }) => {
  const {
    riskLevel = 'low',
    riskScore = 0.2,
    lastAssessment = null
  } = riskData || {};

  const getRiskColor = (level) => {
    switch (level) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level) => {
    switch (level) {
      case 'low':
        return '✅';
      case 'medium':
        return '⚠️';
      case 'high':
        return '🚨';
      default:
        return '❓';
    }
  };

  const formatDate = (date) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">PCOS Risk Assessment</h3>
        <span className="text-2xl">{getRiskIcon(riskLevel)}</span>
      </div>

      <div className={`border rounded-lg p-4 mb-4 ${getRiskColor(riskLevel)}`}>
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold capitalize">{riskLevel} Risk</div>
            <div className="text-sm opacity-75">
              Score: {Math.round(riskScore * 100)}%
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs opacity-75">Last Assessment</div>
            <div className="text-sm font-medium">{formatDate(lastAssessment)}</div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <button className="btn-primary w-full text-sm">
          Take New Assessment
        </button>
        <button className="btn-secondary w-full text-sm">
          View Detailed Report
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-800">
          <strong>Disclaimer:</strong> This assessment is for educational purposes only and should not replace professional medical advice.
        </p>
      </div>
    </div>
  );
};

export default PCOSRiskCard;
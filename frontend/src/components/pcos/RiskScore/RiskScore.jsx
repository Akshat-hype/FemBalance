import React from 'react';

const RiskScore = ({ riskData, onRetakeAssessment }) => {
  const getRiskColor = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'high':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskRecommendations = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return [
          'Continue maintaining a healthy lifestyle',
          'Regular exercise and balanced diet',
          'Monitor your menstrual cycle regularly',
          'Annual check-ups with your healthcare provider'
        ];
      case 'medium':
        return [
          'Consider consulting with a healthcare provider',
          'Focus on stress management and regular sleep',
          'Maintain a balanced diet with low glycemic index foods',
          'Regular physical activity (at least 150 minutes per week)',
          'Monitor symptoms and track menstrual cycles'
        ];
      case 'high':
        return [
          'Strongly recommend consulting with a healthcare provider or gynecologist',
          'Consider getting blood tests for hormones and insulin levels',
          'Implement lifestyle changes: diet, exercise, stress management',
          'Track symptoms and menstrual patterns closely',
          'Consider working with a registered dietitian'
        ];
      default:
        return [];
    }
  };

  const getNextSteps = (level) => {
    switch (level.toLowerCase()) {
      case 'low':
        return 'Keep up the good work! Continue using FEMbalance to track your health.';
      case 'medium':
        return 'Consider scheduling a consultation with a healthcare provider to discuss your symptoms.';
      case 'high':
        return 'We recommend consulting with a healthcare provider as soon as possible for proper evaluation.';
      default:
        return '';
    }
  };

  if (!riskData) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <p className="text-gray-500">No risk assessment data available.</p>
        <button
          onClick={onRetakeAssessment}
          className="mt-4 bg-pink-600 text-white px-6 py-2 rounded-md hover:bg-pink-700"
        >
          Take Assessment
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your PCOS Risk Assessment</h2>
        <p className="text-gray-600">Based on your responses to our questionnaire</p>
      </div>

      {/* Risk Score Display */}
      <div className="text-center mb-8">
        <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-bold ${getRiskColor(riskData.level)}`}>
          {riskData.level.toUpperCase()} RISK
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold text-gray-800">
            {Math.round(riskData.percentage)}%
          </div>
          <div className="text-sm text-gray-500">
            Risk Score: {riskData.score} / {riskData.maxScore}
          </div>
        </div>
      </div>

      {/* Risk Level Explanation */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold text-gray-700 mb-2">What this means:</h3>
        <p className="text-gray-600 text-sm">
          {riskData.level === 'Low' && 
            'Your responses suggest a lower likelihood of PCOS. However, continue monitoring your health and maintain regular check-ups.'
          }
          {riskData.level === 'Medium' && 
            'Your responses indicate some symptoms that could be associated with PCOS. Consider discussing these with a healthcare provider.'
          }
          {riskData.level === 'High' && 
            'Your responses suggest several symptoms commonly associated with PCOS. We strongly recommend consulting with a healthcare provider for proper evaluation.'
          }
        </p>
      </div>

      {/* Recommendations */}
      <div className="mb-6">
        <h3 className="font-semibold text-gray-700 mb-3">Recommendations:</h3>
        <ul className="space-y-2">
          {getRiskRecommendations(riskData.level).map((recommendation, index) => (
            <li key={index} className="flex items-start">
              <span className="text-pink-600 mr-2">•</span>
              <span className="text-gray-600 text-sm">{recommendation}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Next Steps */}
      <div className="mb-6 p-4 border-l-4 border-pink-500 bg-pink-50">
        <h3 className="font-semibold text-gray-700 mb-2">Next Steps:</h3>
        <p className="text-gray-600 text-sm">{getNextSteps(riskData.level)}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRetakeAssessment}
          className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200"
        >
          Retake Assessment
        </button>
        <button
          className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition duration-200"
          onClick={() => {
            // Navigate to wellness recommendations
            console.log('Navigate to wellness recommendations');
          }}
        >
          View Wellness Plan
        </button>
      </div>

      {/* Assessment Date */}
      <div className="mt-6 text-center text-xs text-gray-400">
        Assessment completed on {new Date().toLocaleDateString()}
      </div>

      {/* Important Disclaimer */}
      <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
        <h4 className="font-semibold text-red-800 mb-2">⚠️ Important Medical Disclaimer</h4>
        <p className="text-sm text-red-700">
          This assessment is for educational and informational purposes only. It is not intended to replace 
          professional medical advice, diagnosis, or treatment. PCOS can only be properly diagnosed by a 
          qualified healthcare provider through clinical examination and appropriate tests. If you have 
          concerns about your health, please consult with a healthcare professional.
        </p>
      </div>
    </div>
  );
};

export default RiskScore;
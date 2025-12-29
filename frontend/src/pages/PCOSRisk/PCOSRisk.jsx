import React, { useState } from 'react';
import RiskAssessment from '../../components/pcos/RiskAssessment';
import RiskScore from '../../components/pcos/RiskScore';
import PCOSEducation from '../../components/pcos/PCOSEducation';

const PCOSRisk = () => {
  const [activeTab, setActiveTab] = useState('assessment');
  const [riskData, setRiskData] = useState(null);

  const tabs = [
    { id: 'assessment', name: 'Risk Assessment', icon: '📋' },
    { id: 'results', name: 'My Results', icon: '📊' },
    { id: 'education', name: 'Learn About PCOS', icon: '📚' }
  ];

  const handleAssessmentComplete = (result) => {
    setRiskData(result);
    setActiveTab('results');
  };

  const handleRetakeAssessment = () => {
    setRiskData(null);
    setActiveTab('assessment');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'assessment':
        return <RiskAssessment onAssessmentComplete={handleAssessmentComplete} />;
      case 'results':
        return <RiskScore riskData={riskData} onRetakeAssessment={handleRetakeAssessment} />;
      case 'education':
        return <PCOSEducation />;
      default:
        return <RiskAssessment onAssessmentComplete={handleAssessmentComplete} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">PCOS Risk Assessment</h1>
          <p className="mt-2 text-gray-600">
            Understand your PCOS risk through our comprehensive assessment and educational resources.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-pink-500 text-pink-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.name}
                  {tab.id === 'results' && riskData && (
                    <span className="ml-2 bg-pink-100 text-pink-600 text-xs px-2 py-1 rounded-full">
                      {riskData.level}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {renderContent()}
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Important Medical Disclaimer
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  This assessment is for educational purposes only and is not a substitute for professional medical advice. 
                  PCOS can only be properly diagnosed by a qualified healthcare provider through clinical examination, 
                  medical history, and appropriate laboratory tests. If you have concerns about PCOS or any health condition, 
                  please consult with your healthcare provider.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        {riskData && (
          <div className="mt-8 grid md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl mb-2">🏥</div>
              <h3 className="font-semibold text-gray-800 mb-2">Find a Doctor</h3>
              <p className="text-gray-600 text-sm mb-4">
                Connect with healthcare providers who specialize in PCOS
              </p>
              <button className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 text-sm">
                Search Providers
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl mb-2">💪</div>
              <h3 className="font-semibold text-gray-800 mb-2">Wellness Plan</h3>
              <p className="text-gray-600 text-sm mb-4">
                Get personalized exercise and nutrition recommendations
              </p>
              <button className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 text-sm">
                View Plan
              </button>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-2xl mb-2">👥</div>
              <h3 className="font-semibold text-gray-800 mb-2">Support Community</h3>
              <p className="text-gray-600 text-sm mb-4">
                Connect with others who understand your journey
              </p>
              <button className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700 text-sm">
                Join Community
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PCOSRisk;
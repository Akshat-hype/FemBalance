import React, { useState } from 'react';
import SymptomLogger from '../../components/symptoms/SymptomLogger';
import SymptomHistory from '../../components/symptoms/SymptomHistory';
import LifestyleForm from '../../components/symptoms/LifestyleForm';

const Symptoms = () => {
  const [activeTab, setActiveTab] = useState('logger');

  const tabs = [
    { id: 'logger', name: 'Log Symptoms', icon: '📝' },
    { id: 'lifestyle', name: 'Lifestyle', icon: '🌱' },
    { id: 'history', name: 'History', icon: '📊' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'logger':
        return <SymptomLogger />;
      case 'lifestyle':
        return <LifestyleForm />;
      case 'history':
        return <SymptomHistory />;
      default:
        return <SymptomLogger />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Symptoms & Lifestyle Tracking</h1>
          <p className="mt-2 text-gray-600">
            Track your symptoms and lifestyle factors to better understand your menstrual health patterns.
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
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="mb-8">
          {renderContent()}
        </div>

        {/* Tips Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">💡 Tracking Tips</h3>
          <div className="grid md:grid-cols-2 gap-4 text-blue-700 text-sm">
            <div>
              <h4 className="font-medium mb-2">For Better Insights:</h4>
              <ul className="space-y-1">
                <li>• Log symptoms daily for accurate patterns</li>
                <li>• Be honest about intensity levels</li>
                <li>• Note any triggers or unusual events</li>
                <li>• Track consistently for at least 3 cycles</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Lifestyle Factors:</h4>
              <ul className="space-y-1">
                <li>• Sleep quality affects hormone balance</li>
                <li>• Stress can impact cycle regularity</li>
                <li>• Exercise helps with PMS symptoms</li>
                <li>• Diet influences inflammation levels</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Symptoms;
import React, { useState } from 'react';

const SymptomLogger = () => {
  const [symptoms, setSymptoms] = useState({
    physical: {
      cramps: 0,
      bloating: 0,
      headache: 0,
      breastTenderness: 0,
      acne: 0,
      fatigue: 0
    },
    emotional: {
      moodSwings: 0,
      irritability: 0,
      anxiety: 0,
      depression: 0
    },
    flow: {
      heaviness: 'medium',
      color: 'red',
      clots: false
    }
  });

  const handleSymptomChange = (category, symptom, value) => {
    setSymptoms(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [symptom]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Submit symptoms logic
    console.log('Symptoms logged:', symptoms);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Log Today's Symptoms</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Physical Symptoms */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Physical Symptoms</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(symptoms.physical).map(([symptom, value]) => (
              <div key={symptom} className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-2 capitalize">
                  {symptom.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={value}
                  onChange={(e) => handleSymptomChange('physical', symptom, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>None</span>
                  <span>Severe</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emotional Symptoms */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Emotional Symptoms</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(symptoms.emotional).map(([symptom, value]) => (
              <div key={symptom} className="flex flex-col">
                <label className="text-sm font-medium text-gray-600 mb-2 capitalize">
                  {symptom.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={value}
                  onChange={(e) => handleSymptomChange('emotional', symptom, parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>None</span>
                  <span>Severe</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Flow Characteristics */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Flow Characteristics</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Flow Heaviness</label>
              <select
                value={symptoms.flow.heaviness}
                onChange={(e) => handleSymptomChange('flow', 'heaviness', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="medium">Medium</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Color</label>
              <select
                value={symptoms.flow.color}
                onChange={(e) => handleSymptomChange('flow', 'color', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="bright-red">Bright Red</option>
                <option value="red">Red</option>
                <option value="dark-red">Dark Red</option>
                <option value="brown">Brown</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600 mb-2 block">Clots</label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="clots"
                    checked={!symptoms.flow.clots}
                    onChange={() => handleSymptomChange('flow', 'clots', false)}
                    className="mr-2"
                  />
                  No
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="clots"
                    checked={symptoms.flow.clots}
                    onChange={() => handleSymptomChange('flow', 'clots', true)}
                    className="mr-2"
                  />
                  Yes
                </label>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-3 px-4 rounded-md hover:bg-pink-700 transition duration-200 font-medium"
        >
          Log Symptoms
        </button>
      </form>
    </div>
  );
};

export default SymptomLogger;
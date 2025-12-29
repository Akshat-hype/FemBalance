import React, { useState } from 'react';

const LifestyleForm = () => {
  const [lifestyle, setLifestyle] = useState({
    sleep: {
      hours: 7,
      quality: 'good'
    },
    stress: {
      level: 2,
      sources: []
    },
    exercise: {
      type: '',
      duration: 0,
      intensity: 'moderate'
    },
    diet: {
      meals: 3,
      water: 6,
      caffeine: 1,
      alcohol: 0
    },
    mood: {
      overall: 'neutral',
      energy: 3
    }
  });

  const stressSources = [
    'work', 'relationships', 'health', 'finances', 'family', 'studies', 'other'
  ];

  const exerciseTypes = [
    'walking', 'running', 'cycling', 'swimming', 'yoga', 'strength-training', 
    'dancing', 'sports', 'other'
  ];

  const handleInputChange = (category, field, value) => {
    setLifestyle(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handleStressSourceToggle = (source) => {
    setLifestyle(prev => ({
      ...prev,
      stress: {
        ...prev.stress,
        sources: prev.stress.sources.includes(source)
          ? prev.stress.sources.filter(s => s !== source)
          : [...prev.stress.sources, source]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Lifestyle data:', lifestyle);
    // Submit to API
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Daily Lifestyle Log</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sleep */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Sleep</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Hours of Sleep
              </label>
              <input
                type="number"
                min="0"
                max="12"
                step="0.5"
                value={lifestyle.sleep.hours}
                onChange={(e) => handleInputChange('sleep', 'hours', parseFloat(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Sleep Quality
              </label>
              <select
                value={lifestyle.sleep.quality}
                onChange={(e) => handleInputChange('sleep', 'quality', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              >
                <option value="poor">Poor</option>
                <option value="fair">Fair</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stress */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Stress</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Stress Level (0-5)
            </label>
            <input
              type="range"
              min="0"
              max="5"
              value={lifestyle.stress.level}
              onChange={(e) => handleInputChange('stress', 'level', parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>No Stress</span>
              <span>Very High</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Stress Sources (select all that apply)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {stressSources.map(source => (
                <label key={source} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={lifestyle.stress.sources.includes(source)}
                    onChange={() => handleStressSourceToggle(source)}
                    className="mr-2"
                  />
                  <span className="text-sm capitalize">{source}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Exercise */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Exercise</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Exercise Type
              </label>
              <select
                value={lifestyle.exercise.type}
                onChange={(e) => handleInputChange('exercise', 'type', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              >
                <option value="">No Exercise</option>
                {exerciseTypes.map(type => (
                  <option key={type} value={type} className="capitalize">
                    {type.replace('-', ' ')}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Duration (minutes)
              </label>
              <input
                type="number"
                min="0"
                max="300"
                value={lifestyle.exercise.duration}
                onChange={(e) => handleInputChange('exercise', 'duration', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Intensity
              </label>
              <select
                value={lifestyle.exercise.intensity}
                onChange={(e) => handleInputChange('exercise', 'intensity', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              >
                <option value="light">Light</option>
                <option value="moderate">Moderate</option>
                <option value="vigorous">Vigorous</option>
              </select>
            </div>
          </div>
        </div>

        {/* Diet */}
        <div className="border-b border-gray-200 pb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Diet & Hydration</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Number of Meals
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={lifestyle.diet.meals}
                onChange={(e) => handleInputChange('diet', 'meals', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Glasses of Water
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={lifestyle.diet.water}
                onChange={(e) => handleInputChange('diet', 'water', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Caffeine Servings
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={lifestyle.diet.caffeine}
                onChange={(e) => handleInputChange('diet', 'caffeine', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Alcohol Servings
              </label>
              <input
                type="number"
                min="0"
                max="10"
                value={lifestyle.diet.alcohol}
                onChange={(e) => handleInputChange('diet', 'alcohol', parseInt(e.target.value))}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              />
            </div>
          </div>
        </div>

        {/* Mood & Energy */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Mood & Energy</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Overall Mood
              </label>
              <select
                value={lifestyle.mood.overall}
                onChange={(e) => handleInputChange('mood', 'overall', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              >
                <option value="very-low">Very Low</option>
                <option value="low">Low</option>
                <option value="neutral">Neutral</option>
                <option value="good">Good</option>
                <option value="excellent">Excellent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Energy Level (1-5)
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={lifestyle.mood.energy}
                onChange={(e) => handleInputChange('mood', 'energy', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Very Low</span>
                <span>Very High</span>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-pink-600 text-white py-3 px-4 rounded-md hover:bg-pink-700 transition duration-200 font-medium"
        >
          Save Lifestyle Data
        </button>
      </form>
    </div>
  );
};

export default LifestyleForm;
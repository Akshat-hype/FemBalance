import React, { useState } from 'react';

const ExercisePlans = () => {
  const [selectedPhase, setSelectedPhase] = useState('menstrual');
  const [selectedLevel, setSelectedLevel] = useState('beginner');

  const cyclePhases = [
    { id: 'menstrual', name: 'Menstrual Phase', days: '1-5' },
    { id: 'follicular', name: 'Follicular Phase', days: '1-13' },
    { id: 'ovulation', name: 'Ovulation Phase', days: '14' },
    { id: 'luteal', name: 'Luteal Phase', days: '15-28' }
  ];

  const fitnessLevels = [
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' }
  ];

  const exercisePlans = {
    menstrual: {
      beginner: {
        focus: 'Gentle movement and pain relief',
        exercises: [
          {
            name: 'Gentle Yoga Flow',
            duration: '15-20 minutes',
            description: 'Child\'s pose, cat-cow stretches, gentle twists',
            benefits: 'Reduces cramps, improves flexibility'
          },
          {
            name: 'Walking',
            duration: '20-30 minutes',
            description: 'Light pace, outdoor or treadmill',
            benefits: 'Boosts mood, reduces bloating'
          },
          {
            name: 'Breathing Exercises',
            duration: '10 minutes',
            description: 'Deep breathing, meditation',
            benefits: 'Reduces stress, manages pain'
          }
        ]
      },
      intermediate: {
        focus: 'Low-intensity movement with flexibility',
        exercises: [
          {
            name: 'Restorative Yoga',
            duration: '30-45 minutes',
            description: 'Supported poses, deep stretches',
            benefits: 'Reduces inflammation, improves circulation'
          },
          {
            name: 'Light Swimming',
            duration: '30 minutes',
            description: 'Easy laps, water walking',
            benefits: 'Full-body gentle exercise, reduces cramps'
          },
          {
            name: 'Pilates (Modified)',
            duration: '20-30 minutes',
            description: 'Core work, gentle movements',
            benefits: 'Strengthens core, improves posture'
          }
        ]
      },
      advanced: {
        focus: 'Maintain movement with reduced intensity',
        exercises: [
          {
            name: 'Vinyasa Yoga',
            duration: '45-60 minutes',
            description: 'Flowing sequences, moderate intensity',
            benefits: 'Maintains flexibility, reduces stress'
          },
          {
            name: 'Light Strength Training',
            duration: '30-40 minutes',
            description: 'Bodyweight exercises, light weights',
            benefits: 'Maintains muscle tone, boosts energy'
          },
          {
            name: 'Cycling (Easy)',
            duration: '30-45 minutes',
            description: 'Moderate pace, flat terrain',
            benefits: 'Cardiovascular health, mood boost'
          }
        ]
      }
    },
    follicular: {
      beginner: {
        focus: 'Building energy and strength',
        exercises: [
          {
            name: 'Bodyweight Circuit',
            duration: '20-25 minutes',
            description: 'Squats, push-ups, lunges (modified)',
            benefits: 'Builds strength, increases energy'
          },
          {
            name: 'Brisk Walking',
            duration: '30-40 minutes',
            description: 'Moderate pace, inclines',
            benefits: 'Improves cardiovascular health'
          },
          {
            name: 'Basic Yoga',
            duration: '30 minutes',
            description: 'Sun salutations, standing poses',
            benefits: 'Flexibility, mind-body connection'
          }
        ]
      },
      intermediate: {
        focus: 'Progressive strength and cardio',
        exercises: [
          {
            name: 'Strength Training',
            duration: '40-45 minutes',
            description: 'Compound movements, moderate weights',
            benefits: 'Builds muscle, improves metabolism'
          },
          {
            name: 'Dance Cardio',
            duration: '30-45 minutes',
            description: 'High-energy dance routines',
            benefits: 'Fun cardio, mood enhancement'
          },
          {
            name: 'Power Yoga',
            duration: '45-60 minutes',
            description: 'Dynamic flows, challenging poses',
            benefits: 'Strength, flexibility, focus'
          }
        ]
      },
      advanced: {
        focus: 'High-intensity training',
        exercises: [
          {
            name: 'HIIT Training',
            duration: '25-30 minutes',
            description: 'High-intensity intervals',
            benefits: 'Maximum calorie burn, fitness gains'
          },
          {
            name: 'Heavy Lifting',
            duration: '45-60 minutes',
            description: 'Progressive overload, compound lifts',
            benefits: 'Strength gains, bone density'
          },
          {
            name: 'Advanced Yoga',
            duration: '60-75 minutes',
            description: 'Challenging poses, inversions',
            benefits: 'Advanced flexibility, mental focus'
          }
        ]
      }
    },
    ovulation: {
      beginner: {
        focus: 'Peak energy utilization',
        exercises: [
          {
            name: 'Circuit Training',
            duration: '25-30 minutes',
            description: 'Mixed cardio and strength',
            benefits: 'Full-body workout, energy boost'
          },
          {
            name: 'Jogging',
            duration: '20-30 minutes',
            description: 'Steady pace, comfortable distance',
            benefits: 'Cardiovascular fitness, endurance'
          },
          {
            name: 'Group Fitness Class',
            duration: '45-60 minutes',
            description: 'Zumba, aerobics, or similar',
            benefits: 'Social exercise, motivation'
          }
        ]
      },
      intermediate: {
        focus: 'Maximum performance training',
        exercises: [
          {
            name: 'CrossFit Style WOD',
            duration: '30-45 minutes',
            description: 'Varied functional movements',
            benefits: 'Peak fitness, strength endurance'
          },
          {
            name: 'Running',
            duration: '30-45 minutes',
            description: 'Moderate to fast pace',
            benefits: 'Cardiovascular peak performance'
          },
          {
            name: 'Advanced Pilates',
            duration: '45-60 minutes',
            description: 'Challenging core work, equipment',
            benefits: 'Core strength, body control'
          }
        ]
      },
      advanced: {
        focus: 'Peak performance and challenges',
        exercises: [
          {
            name: 'Olympic Lifting',
            duration: '60-75 minutes',
            description: 'Technical lifts, heavy weights',
            benefits: 'Peak strength, power development'
          },
          {
            name: 'Sprint Training',
            duration: '30-40 minutes',
            description: 'High-intensity sprints, intervals',
            benefits: 'Speed, anaerobic capacity'
          },
          {
            name: 'Advanced Martial Arts',
            duration: '60-90 minutes',
            description: 'Complex techniques, sparring',
            benefits: 'Coordination, mental focus'
          }
        ]
      }
    },
    luteal: {
      beginner: {
        focus: 'Steady-state and stress relief',
        exercises: [
          {
            name: 'Steady Walking',
            duration: '30-40 minutes',
            description: 'Consistent pace, nature walks',
            benefits: 'Mood stability, gentle exercise'
          },
          {
            name: 'Yin Yoga',
            duration: '45-60 minutes',
            description: 'Long-held poses, deep stretches',
            benefits: 'Stress relief, flexibility'
          },
          {
            name: 'Light Swimming',
            duration: '30 minutes',
            description: 'Easy laps, water exercises',
            benefits: 'Low-impact cardio, relaxation'
          }
        ]
      },
      intermediate: {
        focus: 'Moderate intensity with recovery',
        exercises: [
          {
            name: 'Moderate Strength Training',
            duration: '40-50 minutes',
            description: 'Controlled movements, moderate weights',
            benefits: 'Maintains strength, manages PMS'
          },
          {
            name: 'Cycling',
            duration: '40-60 minutes',
            description: 'Steady pace, scenic routes',
            benefits: 'Cardiovascular health, mood boost'
          },
          {
            name: 'Barre Class',
            duration: '45-60 minutes',
            description: 'Isometric holds, ballet-inspired',
            benefits: 'Toning, posture improvement'
          }
        ]
      },
      advanced: {
        focus: 'Controlled intensity with recovery focus',
        exercises: [
          {
            name: 'Strength Training (Deload)',
            duration: '45-60 minutes',
            description: 'Reduced intensity, focus on form',
            benefits: 'Recovery, technique refinement'
          },
          {
            name: 'Long Distance Running',
            duration: '45-75 minutes',
            description: 'Steady pace, endurance focus',
            benefits: 'Endurance, mental clarity'
          },
          {
            name: 'Hot Yoga',
            duration: '60-90 minutes',
            description: 'Heated room, detoxifying poses',
            benefits: 'Flexibility, stress relief, detox'
          }
        ]
      }
    }
  };

  const currentPlan = exercisePlans[selectedPhase][selectedLevel];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Cycle-Based Exercise Plans</h2>
      
      {/* Phase Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Select Cycle Phase</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {cyclePhases.map((phase) => (
            <button
              key={phase.id}
              onClick={() => setSelectedPhase(phase.id)}
              className={`p-3 rounded-lg border text-center transition-colors ${
                selectedPhase === phase.id
                  ? 'border-pink-500 bg-pink-50 text-pink-700'
                  : 'border-gray-300 hover:border-pink-300'
              }`}
            >
              <div className="font-medium text-sm">{phase.name}</div>
              <div className="text-xs text-gray-500">Days {phase.days}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Fitness Level Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Select Fitness Level</h3>
        <div className="flex space-x-3">
          {fitnessLevels.map((level) => (
            <button
              key={level.id}
              onClick={() => setSelectedLevel(level.id)}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedLevel === level.id
                  ? 'bg-pink-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {level.name}
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Plan */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-800">
            {cyclePhases.find(p => p.id === selectedPhase).name} - {fitnessLevels.find(l => l.id === selectedLevel).name}
          </h3>
          <p className="text-gray-600 mt-1">{currentPlan.focus}</p>
        </div>

        <div className="space-y-4">
          {currentPlan.exercises.map((exercise, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800">{exercise.name}</h4>
                <span className="text-sm text-pink-600 font-medium">{exercise.duration}</span>
              </div>
              <p className="text-gray-600 text-sm mb-2">{exercise.description}</p>
              <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded inline-block">
                Benefits: {exercise.benefits}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* PCOS-Specific Recommendations */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">💡 PCOS-Friendly Exercise Tips</h3>
        <ul className="text-blue-700 text-sm space-y-1">
          <li>• Combine strength training with cardio for optimal insulin sensitivity</li>
          <li>• Include stress-reducing activities like yoga or meditation</li>
          <li>• Listen to your body and adjust intensity based on symptoms</li>
          <li>• Consistency is more important than intensity</li>
          <li>• Consider working with a fitness professional familiar with PCOS</li>
        </ul>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex space-x-3">
        <button className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 transition duration-200">
          Start Today's Workout
        </button>
        <button className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300 transition duration-200">
          Save to My Plans
        </button>
      </div>
    </div>
  );
};

export default ExercisePlans;
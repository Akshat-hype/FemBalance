import React, { useState } from 'react';

const WorkoutTracker = () => {
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [workoutHistory, setWorkoutHistory] = useState([
    {
      id: 1,
      date: '2024-01-15',
      type: 'Strength Training',
      duration: 45,
      exercises: ['Squats', 'Push-ups', 'Lunges'],
      intensity: 'Moderate',
      cyclePhase: 'Follicular'
    },
    {
      id: 2,
      date: '2024-01-14',
      type: 'Yoga',
      duration: 30,
      exercises: ['Sun Salutations', 'Warrior Poses', 'Relaxation'],
      intensity: 'Light',
      cyclePhase: 'Menstrual'
    }
  ]);

  const [currentWorkout, setCurrentWorkout] = useState({
    type: '',
    exercises: [],
    startTime: null,
    duration: 0,
    intensity: 'moderate',
    notes: ''
  });

  const workoutTypes = [
    'Strength Training', 'Cardio', 'Yoga', 'Pilates', 'HIIT', 
    'Walking', 'Running', 'Swimming', 'Cycling', 'Dance'
  ];

  const intensityLevels = [
    { value: 'light', label: 'Light', color: 'bg-green-100 text-green-800' },
    { value: 'moderate', label: 'Moderate', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'vigorous', label: 'Vigorous', color: 'bg-red-100 text-red-800' }
  ];

  const startWorkout = () => {
    setActiveWorkout({
      ...currentWorkout,
      startTime: new Date(),
      exercises: []
    });
  };

  const endWorkout = () => {
    if (activeWorkout) {
      const endTime = new Date();
      const duration = Math.round((endTime - activeWorkout.startTime) / (1000 * 60));
      
      const completedWorkout = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        type: activeWorkout.type,
        duration: duration,
        exercises: activeWorkout.exercises,
        intensity: activeWorkout.intensity,
        notes: activeWorkout.notes,
        cyclePhase: 'Current' // This would be determined by cycle tracking
      };

      setWorkoutHistory([completedWorkout, ...workoutHistory]);
      setActiveWorkout(null);
      setCurrentWorkout({
        type: '',
        exercises: [],
        startTime: null,
        duration: 0,
        intensity: 'moderate',
        notes: ''
      });
    }
  };

  const addExercise = (exercise) => {
    if (activeWorkout) {
      setActiveWorkout({
        ...activeWorkout,
        exercises: [...activeWorkout.exercises, exercise]
      });
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const getIntensityColor = (intensity) => {
    const level = intensityLevels.find(l => l.value === intensity);
    return level ? level.color : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Workout Tracker</h2>

      {/* Active Workout Section */}
      {!activeWorkout ? (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-4">Start New Workout</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Workout Type
              </label>
              <select
                value={currentWorkout.type}
                onChange={(e) => setCurrentWorkout({...currentWorkout, type: e.target.value})}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select workout type</option>
                {workoutTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Expected Intensity
              </label>
              <div className="flex space-x-3">
                {intensityLevels.map(level => (
                  <button
                    key={level.value}
                    onClick={() => setCurrentWorkout({...currentWorkout, intensity: level.value})}
                    className={`px-3 py-2 rounded-md text-sm font-medium ${
                      currentWorkout.intensity === level.value
                        ? level.color
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {level.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={startWorkout}
              disabled={!currentWorkout.type}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                currentWorkout.type
                  ? 'bg-pink-600 text-white hover:bg-pink-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Start Workout
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-pink-800">
              Active Workout: {activeWorkout.type}
            </h3>
            <div className="text-sm text-pink-600">
              Started: {activeWorkout.startTime.toLocaleTimeString()}
            </div>
          </div>

          <div className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">Exercises Completed:</h4>
            {activeWorkout.exercises.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {activeWorkout.exercises.map((exercise, index) => (
                  <span key={index} className="bg-white px-3 py-1 rounded-full text-sm text-gray-700">
                    {exercise}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No exercises logged yet</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Add Exercise
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter exercise name"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    addExercise(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  if (input.value.trim()) {
                    addExercise(input.value.trim());
                    input.value = '';
                  }
                }}
                className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700"
              >
                Add
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={activeWorkout.notes}
              onChange={(e) => setActiveWorkout({...activeWorkout, notes: e.target.value})}
              placeholder="How did you feel? Any observations?"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-pink-500"
              rows="3"
            />
          </div>

          <button
            onClick={endWorkout}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium"
          >
            End Workout
          </button>
        </div>
      )}

      {/* Workout History */}
      <div>
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Workouts</h3>
        
        {workoutHistory.length > 0 ? (
          <div className="space-y-3">
            {workoutHistory.map((workout) => (
              <div key={workout.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-gray-800">{workout.type}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(workout.date).toLocaleDateString()} • {formatDuration(workout.duration)}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getIntensityColor(workout.intensity)}`}>
                      {workout.intensity}
                    </span>
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {workout.cyclePhase}
                    </span>
                  </div>
                </div>
                
                {workout.exercises.length > 0 && (
                  <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Exercises:</p>
                    <div className="flex flex-wrap gap-1">
                      {workout.exercises.map((exercise, index) => (
                        <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {exercise}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {workout.notes && (
                  <p className="text-sm text-gray-600 italic">"{workout.notes}"</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">No workout history yet.</p>
            <p className="text-sm text-gray-400 mt-2">Start your first workout to see it here!</p>
          </div>
        )}
      </div>

      {/* Weekly Summary */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">This Week's Summary</h3>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-700">
              {workoutHistory.filter(w => {
                const workoutDate = new Date(w.date);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return workoutDate >= weekAgo;
              }).length}
            </div>
            <div className="text-xs text-blue-600">Workouts</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-700">
              {workoutHistory
                .filter(w => {
                  const workoutDate = new Date(w.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return workoutDate >= weekAgo;
                })
                .reduce((total, w) => total + w.duration, 0)}
            </div>
            <div className="text-xs text-blue-600">Minutes</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-700">
              {Math.round(workoutHistory
                .filter(w => {
                  const workoutDate = new Date(w.date);
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return workoutDate >= weekAgo;
                })
                .reduce((total, w) => total + w.duration, 0) / 7)}
            </div>
            <div className="text-xs text-blue-600">Avg/Day</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutTracker;
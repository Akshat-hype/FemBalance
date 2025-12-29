import React, { useState } from 'react';

const PeriodLogger = ({ onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    flow: 'normal',
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.endDate && formData.startDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }

      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      if (daysDiff > 10) {
        newErrors.endDate = 'Period cannot be longer than 10 days';
      }
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const submitData = {
      ...formData,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
    };

    onSubmit(submitData);
  };

  const handleQuickLog = (type) => {
    const today = new Date().toISOString().split('T')[0];
    
    if (type === 'start') {
      setFormData(prev => ({
        ...prev,
        startDate: today,
        endDate: ''
      }));
    } else if (type === 'end') {
      setFormData(prev => ({
        ...prev,
        endDate: today
      }));
    }
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Log Period</h3>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => handleQuickLog('start')}
            className="btn-secondary text-sm"
          >
            Started Today
          </button>
          <button
            type="button"
            onClick={() => handleQuickLog('end')}
            className="btn-secondary text-sm"
          >
            Ended Today
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Start Date */}
        <div>
          <label htmlFor="startDate" className="form-label">
            Start Date *
          </label>
          <input
            type="date"
            id="startDate"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            className={`form-input ${errors.startDate ? 'border-red-500' : ''}`}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.startDate && (
            <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
          )}
        </div>

        {/* End Date */}
        <div>
          <label htmlFor="endDate" className="form-label">
            End Date (optional)
          </label>
          <input
            type="date"
            id="endDate"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            className={`form-input ${errors.endDate ? 'border-red-500' : ''}`}
            min={formData.startDate}
            max={new Date().toISOString().split('T')[0]}
          />
          {errors.endDate && (
            <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
          )}
          <p className="mt-1 text-sm text-gray-600">
            Leave empty if your period is ongoing
          </p>
        </div>

        {/* Flow Intensity */}
        <div>
          <label className="form-label">Flow Intensity</label>
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { value: 'light', label: 'Light', icon: '🩸', color: 'bg-pink-100 text-pink-800' },
              { value: 'normal', label: 'Normal', icon: '🔴', color: 'bg-red-100 text-red-800' },
              { value: 'heavy', label: 'Heavy', icon: '🩸', color: 'bg-red-200 text-red-900' }
            ].map((option) => (
              <label
                key={option.value}
                className={`
                  flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all
                  ${formData.flow === option.value 
                    ? 'border-primary-500 bg-primary-50' 
                    : 'border-gray-200 hover:border-gray-300'
                  }
                `}
              >
                <input
                  type="radio"
                  name="flow"
                  value={option.value}
                  checked={formData.flow === option.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="text-2xl mb-2">{option.icon}</span>
                <span className="text-sm font-medium">{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="form-label">
            Notes (optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            value={formData.notes}
            onChange={handleChange}
            className={`form-input ${errors.notes ? 'border-red-500' : ''}`}
            placeholder="Any additional notes about your period..."
            maxLength={500}
          />
          {errors.notes && (
            <p className="mt-1 text-sm text-red-600">{errors.notes}</p>
          )}
          <div className="mt-1 text-sm text-gray-600 text-right">
            {formData.notes.length}/500 characters
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary flex-1"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              'Log Period'
            )}
          </button>
          
          <button
            type="button"
            onClick={() => {
              setFormData({
                startDate: '',
                endDate: '',
                flow: 'normal',
                notes: ''
              });
              setErrors({});
            }}
            className="btn-secondary"
          >
            Clear
          </button>
        </div>
      </form>

      {/* Tips */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-900 mb-2">💡 Tips for accurate tracking:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Log your period as soon as it starts</li>
          <li>• Update the end date when your period finishes</li>
          <li>• Note any unusual symptoms or changes</li>
          <li>• Consistent tracking helps predict future cycles</li>
        </ul>
      </div>
    </div>
  );
};

export default PeriodLogger;
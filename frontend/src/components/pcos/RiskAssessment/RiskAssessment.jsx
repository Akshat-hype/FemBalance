import React, { useState } from 'react';

const RiskAssessment = ({ onAssessmentComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [responses, setResponses] = useState({});

  const questions = [
    {
      id: 'irregular_periods',
      question: 'Do you have irregular menstrual cycles (cycles shorter than 21 days or longer than 35 days)?',
      type: 'boolean',
      options: ['Yes', 'No']
    },
    {
      id: 'missed_periods',
      question: 'Have you missed periods for 3 or more months in a row?',
      type: 'boolean',
      options: ['Yes', 'No']
    },
    {
      id: 'excess_hair',
      question: 'Do you have excess hair growth on face, chest, back, or abdomen?',
      type: 'scale',
      options: ['None', 'Mild', 'Moderate', 'Severe']
    },
    {
      id: 'acne',
      question: 'Do you experience persistent acne, especially on face, chest, or back?',
      type: 'scale',
      options: ['None', 'Mild', 'Moderate', 'Severe']
    },
    {
      id: 'weight_gain',
      question: 'Have you experienced unexplained weight gain or difficulty losing weight?',
      type: 'boolean',
      options: ['Yes', 'No']
    },
    {
      id: 'hair_loss',
      question: 'Do you experience male-pattern hair loss or thinning hair?',
      type: 'boolean',
      options: ['Yes', 'No']
    },
    {
      id: 'skin_darkening',
      question: 'Do you have dark patches of skin (especially neck, armpits, groin)?',
      type: 'boolean',
      options: ['Yes', 'No']
    },
    {
      id: 'family_history',
      question: 'Do you have a family history of PCOS, diabetes, or insulin resistance?',
      type: 'boolean',
      options: ['Yes', 'No']
    },
    {
      id: 'mood_changes',
      question: 'Do you experience frequent mood swings, anxiety, or depression?',
      type: 'scale',
      options: ['Never', 'Rarely', 'Sometimes', 'Often']
    },
    {
      id: 'fatigue',
      question: 'Do you experience chronic fatigue or low energy levels?',
      type: 'scale',
      options: ['Never', 'Rarely', 'Sometimes', 'Often']
    }
  ];

  const handleResponse = (questionId, answer) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const nextStep = () => {
    if (currentStep < questions.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Complete assessment
      calculateRisk();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculateRisk = () => {
    let riskScore = 0;
    let maxScore = 0;

    // Calculate risk based on responses
    Object.entries(responses).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      
      if (question.type === 'boolean') {
        maxScore += 3;
        if (answer === 'Yes') {
          riskScore += 3;
        }
      } else if (question.type === 'scale') {
        maxScore += 3;
        const scaleValue = question.options.indexOf(answer);
        riskScore += scaleValue;
      }
    });

    const riskPercentage = (riskScore / maxScore) * 100;
    let riskLevel = 'Low';
    
    if (riskPercentage >= 70) {
      riskLevel = 'High';
    } else if (riskPercentage >= 40) {
      riskLevel = 'Medium';
    }

    const result = {
      score: riskScore,
      maxScore,
      percentage: riskPercentage,
      level: riskLevel,
      responses
    };

    onAssessmentComplete(result);
  };

  const currentQuestion = questions[currentStep];
  const progress = ((currentStep + 1) / questions.length) * 100;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-800">PCOS Risk Assessment</h2>
          <span className="text-sm text-gray-500">
            {currentStep + 1} of {questions.length}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-pink-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">
          {currentQuestion.question}
        </h3>
        
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <label
              key={index}
              className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                responses[currentQuestion.id] === option
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-300 hover:border-pink-300'
              }`}
            >
              <input
                type="radio"
                name={currentQuestion.id}
                value={option}
                checked={responses[currentQuestion.id] === option}
                onChange={(e) => handleResponse(currentQuestion.id, e.target.value)}
                className="mr-3 text-pink-600"
              />
              <span className="text-gray-700">{option}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 0}
          className={`px-6 py-2 rounded-md font-medium ${
            currentStep === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
          }`}
        >
          Previous
        </button>
        
        <button
          onClick={nextStep}
          disabled={!responses[currentQuestion.id]}
          className={`px-6 py-2 rounded-md font-medium ${
            !responses[currentQuestion.id]
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : currentStep === questions.length - 1
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-pink-600 text-white hover:bg-pink-700'
          }`}
        >
          {currentStep === questions.length - 1 ? 'Complete Assessment' : 'Next'}
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> This assessment is for educational purposes only and is not a medical diagnosis. 
          Please consult with a healthcare professional for proper evaluation and diagnosis of PCOS.
        </p>
      </div>
    </div>
  );
};

export default RiskAssessment;
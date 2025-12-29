import React, { useState } from 'react';

const PCOSEducation = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'symptoms', label: 'Symptoms' },
    { id: 'causes', label: 'Causes' },
    { id: 'management', label: 'Management' },
    { id: 'lifestyle', label: 'Lifestyle' }
  ];

  const content = {
    overview: {
      title: 'What is PCOS?',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Polycystic Ovary Syndrome (PCOS) is a hormonal disorder that affects women of reproductive age. 
            It's one of the most common endocrine disorders, affecting 5-10% of women worldwide.
          </p>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Key Facts:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Affects 1 in 10 women of childbearing age</li>
              <li>• Often diagnosed in teens or early twenties</li>
              <li>• Can be managed with proper treatment and lifestyle changes</li>
              <li>• May affect fertility but many women with PCOS can still conceive</li>
            </ul>
          </div>
          <p className="text-gray-700">
            PCOS is characterized by irregular menstrual periods, excess androgen levels, and polycystic ovaries. 
            The exact cause is unknown, but it's believed to involve a combination of genetic and environmental factors.
          </p>
        </div>
      )
    },
    symptoms: {
      title: 'Common PCOS Symptoms',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            PCOS symptoms can vary widely between individuals. Some women have mild symptoms, while others are more severely affected.
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-pink-50 p-4 rounded-lg">
              <h4 className="font-semibold text-pink-800 mb-3">Menstrual Symptoms</h4>
              <ul className="text-pink-700 text-sm space-y-1">
                <li>• Irregular periods</li>
                <li>• Missed periods</li>
                <li>• Heavy bleeding</li>
                <li>• Painful periods</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-3">Physical Symptoms</h4>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• Excess hair growth (hirsutism)</li>
                <li>• Acne</li>
                <li>• Weight gain</li>
                <li>• Hair loss/thinning</li>
                <li>• Dark skin patches</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-3">Metabolic Symptoms</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Insulin resistance</li>
                <li>• Difficulty losing weight</li>
                <li>• Increased appetite</li>
                <li>• Fatigue</li>
              </ul>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h4 className="font-semibold text-yellow-800 mb-3">Emotional Symptoms</h4>
              <ul className="text-yellow-700 text-sm space-y-1">
                <li>• Mood swings</li>
                <li>• Depression</li>
                <li>• Anxiety</li>
                <li>• Low self-esteem</li>
              </ul>
            </div>
          </div>
        </div>
      )
    },
    causes: {
      title: 'What Causes PCOS?',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            The exact cause of PCOS is not fully understood, but several factors are believed to contribute to its development:
          </p>
          
          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 pl-4">
              <h4 className="font-semibold text-gray-800">Insulin Resistance</h4>
              <p className="text-gray-600 text-sm mt-1">
                Many women with PCOS have insulin resistance, which can lead to higher insulin levels and increased androgen production.
              </p>
            </div>
            
            <div className="border-l-4 border-green-500 pl-4">
              <h4 className="font-semibold text-gray-800">Hormonal Imbalance</h4>
              <p className="text-gray-600 text-sm mt-1">
                Elevated levels of androgens (male hormones) can prevent ovaries from releasing eggs normally.
              </p>
            </div>
            
            <div className="border-l-4 border-purple-500 pl-4">
              <h4 className="font-semibold text-gray-800">Genetics</h4>
              <p className="text-gray-600 text-sm mt-1">
                PCOS often runs in families, suggesting a genetic component to the condition.
              </p>
            </div>
            
            <div className="border-l-4 border-orange-500 pl-4">
              <h4 className="font-semibold text-gray-800">Inflammation</h4>
              <p className="text-gray-600 text-sm mt-1">
                Low-grade inflammation may stimulate polycystic ovaries to produce androgens.
              </p>
            </div>
          </div>
        </div>
      )
    },
    management: {
      title: 'PCOS Management & Treatment',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            While there's no cure for PCOS, it can be effectively managed through various treatment approaches:
          </p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">Medical Treatments</h4>
              <ul className="text-blue-700 text-sm space-y-1">
                <li>• Birth control pills to regulate periods</li>
                <li>• Metformin for insulin resistance</li>
                <li>• Anti-androgen medications</li>
                <li>• Fertility treatments if trying to conceive</li>
              </ul>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <h4 className="font-semibold text-green-800 mb-2">Lifestyle Interventions</h4>
              <ul className="text-green-700 text-sm space-y-1">
                <li>• Weight management through diet and exercise</li>
                <li>• Regular physical activity</li>
                <li>• Stress management techniques</li>
                <li>• Adequate sleep</li>
              </ul>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-800 mb-2">Symptom-Specific Treatments</h4>
              <ul className="text-purple-700 text-sm space-y-1">
                <li>• Hair removal treatments for hirsutism</li>
                <li>• Acne treatments</li>
                <li>• Hair loss treatments</li>
                <li>• Skin care for dark patches</li>
              </ul>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-yellow-800 text-sm">
              <strong>Important:</strong> Always consult with a healthcare provider to develop a personalized treatment plan 
              that's right for your specific situation and symptoms.
            </p>
          </div>
        </div>
      )
    },
    lifestyle: {
      title: 'Lifestyle Tips for PCOS',
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">
            Lifestyle changes can significantly improve PCOS symptoms and overall health:
          </p>
          
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">🥗 Nutrition Tips</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Choose low glycemic index foods</li>
                  <li>• Include lean proteins</li>
                  <li>• Eat plenty of vegetables and fruits</li>
                  <li>• Limit processed foods and sugar</li>
                  <li>• Consider anti-inflammatory foods</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">🏃‍♀️ Exercise Guidelines</h4>
                <ul className="text-blue-700 text-sm space-y-1">
                  <li>• Aim for 150 minutes moderate activity/week</li>
                  <li>• Include both cardio and strength training</li>
                  <li>• Try yoga for stress reduction</li>
                  <li>• Start slowly and build up gradually</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">😴 Sleep & Stress</h4>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• Aim for 7-9 hours of quality sleep</li>
                  <li>• Practice stress management techniques</li>
                  <li>• Try meditation or mindfulness</li>
                  <li>• Maintain a regular sleep schedule</li>
                </ul>
              </div>
              
              <div className="bg-pink-50 p-4 rounded-lg">
                <h4 className="font-semibold text-pink-800 mb-2">📱 Self-Care</h4>
                <ul className="text-pink-700 text-sm space-y-1">
                  <li>• Track your symptoms and cycles</li>
                  <li>• Join support groups</li>
                  <li>• Practice self-compassion</li>
                  <li>• Stay informed about PCOS</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-800 mb-2">💡 Remember</h4>
            <p className="text-gray-600 text-sm">
              Small, consistent changes often lead to the best long-term results. Work with your healthcare team 
              to develop a sustainable lifestyle plan that works for you.
            </p>
          </div>
        </div>
      )
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {content[activeTab].title}
        </h2>
        {content[activeTab].content}
      </div>

      {/* Resources Section */}
      <div className="border-t border-gray-200 p-6 bg-gray-50">
        <h3 className="font-semibold text-gray-800 mb-3">Additional Resources</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Professional Organizations</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• PCOS Foundation</li>
              <li>• American College of Obstetricians and Gynecologists</li>
              <li>• Endocrine Society</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Support Communities</h4>
            <ul className="text-gray-600 space-y-1">
              <li>• PCOS support groups</li>
              <li>• Online communities and forums</li>
              <li>• Local healthcare providers</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PCOSEducation;
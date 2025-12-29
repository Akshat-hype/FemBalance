import React from 'react';

const BlogCategories = ({ onCategorySelect, selectedCategory }) => {
  const categories = [
    {
      id: 'menstrual-health',
      name: 'Menstrual Health',
      description: 'Understanding your cycle, periods, and reproductive health',
      icon: '🩸',
      color: 'bg-red-100 text-red-700 border-red-200',
      count: 12
    },
    {
      id: 'pcos',
      name: 'PCOS Awareness',
      description: 'Information about PCOS symptoms, management, and support',
      icon: '🔬',
      color: 'bg-purple-100 text-purple-700 border-purple-200',
      count: 8
    },
    {
      id: 'nutrition',
      name: 'Nutrition',
      description: 'Healthy eating for hormonal balance and overall wellness',
      icon: '🥗',
      color: 'bg-green-100 text-green-700 border-green-200',
      count: 15
    },
    {
      id: 'exercise',
      name: 'Exercise & Fitness',
      description: 'Cycle-synced workouts and fitness tips for women',
      icon: '💪',
      color: 'bg-blue-100 text-blue-700 border-blue-200',
      count: 10
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle',
      description: 'Sleep, stress management, and daily wellness habits',
      icon: '🧘‍♀️',
      color: 'bg-indigo-100 text-indigo-700 border-indigo-200',
      count: 9
    },
    {
      id: 'mental-health',
      name: 'Mental Health',
      description: 'Emotional wellness and mental health during your cycle',
      icon: '🧠',
      color: 'bg-pink-100 text-pink-700 border-pink-200',
      count: 7
    }
  ];

  const featuredTopics = [
    {
      title: 'Understanding PCOS',
      description: 'Complete guide to PCOS symptoms and management',
      articles: 5,
      category: 'pcos'
    },
    {
      title: 'Cycle Syncing',
      description: 'Align your lifestyle with your menstrual cycle',
      articles: 8,
      category: 'lifestyle'
    },
    {
      title: 'Hormonal Nutrition',
      description: 'Foods that support hormonal balance',
      articles: 6,
      category: 'nutrition'
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Explore Topics</h2>
        <p className="text-gray-600">
          Discover articles organized by health and wellness categories
        </p>
      </div>

      {/* Featured Topics */}
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Featured Topics</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {featuredTopics.map((topic, index) => (
            <div
              key={index}
              onClick={() => onCategorySelect && onCategorySelect(topic.category)}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <h4 className="font-semibold text-gray-800 mb-2">{topic.title}</h4>
              <p className="text-gray-600 text-sm mb-3">{topic.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-pink-600 font-medium">
                  {topic.articles} articles
                </span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* All Categories */}
      <div className="p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">All Categories</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => onCategorySelect && onCategorySelect(category.id)}
              className={`border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer ${
                selectedCategory === category.id
                  ? category.color
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h4 className="font-semibold text-gray-800">{category.name}</h4>
                    <span className="text-sm text-gray-500">{category.count} articles</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-gray-600 text-sm">{category.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Popular Tags */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Popular Tags</h3>
        <div className="flex flex-wrap gap-2">
          {[
            'cycle-tracking', 'pcos', 'hormones', 'nutrition', 'exercise',
            'mental-health', 'pms', 'fertility', 'wellness', 'lifestyle',
            'insulin-resistance', 'natural-remedies', 'stress-management'
          ].map((tag) => (
            <button
              key={tag}
              className="bg-white border border-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm hover:bg-gray-100 transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="p-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg p-6 text-white text-center">
          <h3 className="font-semibold mb-2">Never Miss an Update</h3>
          <p className="text-pink-100 text-sm mb-4">
            Get weekly health tips and the latest articles delivered to your inbox
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 p-2 rounded-l-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-white"
            />
            <button className="bg-white text-pink-600 px-4 py-2 rounded-r-md hover:bg-gray-100 font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogCategories;
import React from 'react';

const QuickActions = () => {
  const actions = [
    {
      title: 'Log Period',
      description: 'Record your period start/end',
      icon: '🩸',
      href: '/cycle/log-period',
      color: 'bg-red-50 hover:bg-red-100 text-red-700'
    },
    {
      title: 'Track Symptoms',
      description: 'Log daily symptoms',
      icon: '📝',
      href: '/symptoms/log',
      color: 'bg-blue-50 hover:bg-blue-100 text-blue-700'
    },
    {
      title: 'View Exercise',
      description: 'Today\'s workout plan',
      icon: '💪',
      href: '/exercise/today',
      color: 'bg-green-50 hover:bg-green-100 text-green-700'
    },
    {
      title: 'Diet Plan',
      description: 'Meal recommendations',
      icon: '🥗',
      href: '/diet/today',
      color: 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700'
    }
  ];

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
      
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action, index) => (
          <a
            key={index}
            href={action.href}
            className={`p-4 rounded-lg border transition-colors ${action.color}`}
          >
            <div className="text-center">
              <div className="text-2xl mb-2">{action.icon}</div>
              <div className="font-medium text-sm mb-1">{action.title}</div>
              <div className="text-xs opacity-75">{action.description}</div>
            </div>
          </a>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <a 
          href="/dashboard/all-actions" 
          className="text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          View all actions →
        </a>
      </div>
    </div>
  );
};

export default QuickActions;
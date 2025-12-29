import React from 'react';

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Cycle Tracking', href: '/cycle', icon: '📅' },
    { name: 'Symptoms', href: '/symptoms', icon: '💊' },
    { name: 'PCOS Risk', href: '/pcos', icon: '🔍' },
    { name: 'Exercise', href: '/exercise', icon: '💪' },
    { name: 'Diet', href: '/diet', icon: '🥗' },
    { name: 'Blog', href: '/blog', icon: '📖' },
    { name: 'Profile', href: '/profile', icon: '👤' },
    { name: 'Settings', href: '/settings', icon: '⚙️' }
  ];

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 z-50
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:static md:shadow-none
      `}>
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-primary-600">FEMbalance</h2>
        </div>
        
        <nav className="mt-4">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="flex items-center px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors"
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
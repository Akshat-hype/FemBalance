import React from 'react';

const Header = () => {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-primary-600">FEMbalance</h1>
          </div>
          <nav className="hidden md:flex space-x-8">
            <a href="/dashboard" className="text-gray-700 hover:text-primary-600">Dashboard</a>
            <a href="/cycle" className="text-gray-700 hover:text-primary-600">Cycle</a>
            <a href="/wellness" className="text-gray-700 hover:text-primary-600">Wellness</a>
            <a href="/blog" className="text-gray-700 hover:text-primary-600">Blog</a>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
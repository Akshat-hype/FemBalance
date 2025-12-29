import React, { useState } from 'react';

const CalendarView = ({ cycles = [], onDateSelect }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getCycleForDate = (date) => {
    return cycles.find(cycle => {
      const startDate = new Date(cycle.startDate);
      const endDate = cycle.endDate ? new Date(cycle.endDate) : null;
      
      if (endDate) {
        return date >= startDate && date <= endDate;
      } else {
        // Check if it's within a reasonable period length (assume 7 days max)
        const maxEndDate = new Date(startDate);
        maxEndDate.setDate(maxEndDate.getDate() + 7);
        return date >= startDate && date <= maxEndDate;
      }
    });
  };

  const getCycleDayType = (date) => {
    const cycle = getCycleForDate(date);
    if (!cycle) return null;

    const startDate = new Date(cycle.startDate);
    const daysDiff = Math.floor((date - startDate) / (1000 * 60 * 60 * 24));

    if (daysDiff >= 0 && daysDiff <= 5) return 'period';
    if (daysDiff >= 12 && daysDiff <= 16) return 'ovulation';
    return 'cycle';
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayType = getCycleDayType(date);
      const isToday = new Date().toDateString() === date.toDateString();

      let dayClass = 'h-10 w-10 flex items-center justify-center rounded-full cursor-pointer hover:bg-gray-100 transition-colors';
      
      if (isToday) {
        dayClass += ' ring-2 ring-primary-500';
      }

      if (dayType === 'period') {
        dayClass += ' bg-red-200 text-red-800 hover:bg-red-300';
      } else if (dayType === 'ovulation') {
        dayClass += ' bg-green-200 text-green-800 hover:bg-green-300';
      } else if (dayType === 'cycle') {
        dayClass += ' bg-blue-100 text-blue-800 hover:bg-blue-200';
      }

      days.push(
        <div
          key={day}
          className={dayClass}
          onClick={() => onDateSelect && onDateSelect(date)}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="card">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateMonth(-1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={() => navigateMonth(1)}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="h-10 flex items-center justify-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-200 rounded-full mr-2"></div>
          <span>Period</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-200 rounded-full mr-2"></div>
          <span>Ovulation</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-100 rounded-full mr-2"></div>
          <span>Cycle Days</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
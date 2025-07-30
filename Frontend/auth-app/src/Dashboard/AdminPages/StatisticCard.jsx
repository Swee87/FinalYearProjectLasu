import React from 'react';

export const StatsCard = ({ title, value, trend, icon, change, tooltip, onClick }) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition-all relative overflow-visible ${
        onClick ? 'cursor-pointer hover:border-indigo-200' : ''
      }`}
      style={{ zIndex: 1 }}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className="relative group">
          <div className="p-2 bg-gray-100 rounded-lg cursor-help">
            {icon}
          </div>
          <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
               style={{ zIndex: 9999 }}>
            {tooltip}
            <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
          </div>
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span
          className={`text-sm font-medium ${
            trend.startsWith('+') ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {trend}
        </span>
        <span className="text-xs text-gray-500 ml-2">{change}</span>
      </div>
    </div>
  );
};

import React from 'react';

export const FullPageLoadingSpinner = () => {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-90 flex flex-col items-center justify-center z-50">
      {/* Main Spinner */}
      <div className="relative w-24 h-24">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
        
        {/* Animated Spinner */}
        <div className="absolute inset-0 rounded-full border-8 border-t-indigo-500 border-r-indigo-500 animate-spin"></div>
        
        {/* Inner Dot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-indigo-500 rounded-full"></div>
      </div>
      
      {/* Loading Text */}
      <p className="mt-6 text-lg font-medium text-gray-600 animate-pulse">
        Loading your experience...
      </p>
      
      {/* Optional Subtle Animation */}
      <div className="mt-8 flex space-x-2">
        {[...Array(3)].map((_, i) => (
          <div 
            key={i}
            className="w-3 h-3 bg-indigo-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          ></div>
        ))}
      </div>
    </div>
  );
};


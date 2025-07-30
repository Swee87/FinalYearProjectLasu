import React from 'react';

export const ShareCapitalPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Share Capital Management</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Member Share Capital</h2>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Manage Shares
          </button>
        </div>
        <div className="text-gray-600">
          <p>Total Share Capital: <span className="font-semibold text-gray-800">₦355,325,435.00</span></p>
          <p className="mt-2">Track and manage member contributions to cooperative share capital.</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export const SavingsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Savings Management</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Savings Overview</h2>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
            New Savings Plan
          </button>
        </div>
        <div className="text-gray-600">
          <p>Total Savings Balance: <span className="font-semibold text-gray-800">₦4,096,382,079.38</span></p>
          <p className="mt-2">Savings management and tracking features will be available here.</p>
        </div>
      </div>
    </div>
  );
};
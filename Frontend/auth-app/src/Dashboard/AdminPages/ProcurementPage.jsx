import React from 'react';

export const ProcurementPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Procurement Management</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Group Procurement</h2>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            New Procurement
          </button>
        </div>
        <div className="text-gray-600">
          <p>Total Procurement Balance: <span className="font-semibold text-gray-800">₦330,490,965.44</span></p>
          <p className="mt-2">Manage group procurement activities and fund allocation.</p>
        </div>
      </div>
    </div>
  );
};
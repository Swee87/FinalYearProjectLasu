import React from 'react';

export const MembersPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Members Management</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Active Members</h2>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
            Add New Member
          </button>
        </div>
        <div className="text-gray-600">
          <p>Total Active Members: <span className="font-semibold text-gray-800">19,768</span></p>
          <p className="mt-2">Member management functionality will be implemented here.</p>
        </div>
      </div>
    </div>
  );
};
import React from 'react';

export const SettingsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">System Settings</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Configuration</h2>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Save Changes
          </button>
        </div>
        <div className="text-gray-600">
          <p>System configuration and user preferences.</p>
          <p className="mt-2">Settings for notifications, security, integrations, and more will be here.</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';

export const WalletsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Wallet Management</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Digital Wallets</h2>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Manage Wallets
          </button>
        </div>
        <div className="text-gray-600">
          <p>Total Wallet Balance: <span className="font-semibold text-gray-800">₦1,015,876,121.00</span></p>
          <p className="mt-2">Digital wallet management and transaction tracking.</p>
        </div>
      </div>
    </div>
  );
};

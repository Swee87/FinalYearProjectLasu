import React from 'react';

export const LoansPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Loan Management</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Loan Portfolio</h2>
          <button className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors">
            Process New Loan
          </button>
        </div>
        <div className="text-gray-600">
          <p>Total Outstanding Loans: <span className="font-semibold text-gray-800">₦2,889,251,583.98</span></p>
          <p className="mt-2">Loan processing, tracking, and repayment management tools will be here.</p>
        </div>
      </div>
    </div>
  );
};
import React from 'react';
import { LoanTracker } from '../LoanTracker';
import { TrackedLoansPage } from '../TrackedLoansPage';


export const ReportsPage = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reports & Analytics</h1>
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-700">Financial Reports</h2>
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
            Generate Report
          </button>
        </div>
        <div className="text-gray-600">
          <p>Comprehensive financial reports and analytics dashboard.</p>
          <p className="mt-2">Charts, graphs, and detailed financial analysis will be displayed here.</p>
        </div>
      </div>
      <TrackedLoansPage />
    </div>
  );
};

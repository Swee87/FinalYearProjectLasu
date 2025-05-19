import React from 'react'
import { LoanRequest } from './LoanRequest'
export function Loan() {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-50 p-6 mt-0">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Loan Summary</h2>
  
        {/* Responsive Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl mx-auto">
          {/* Single Card */}
          {[
            { label: "Pending", count: 200 },
            { label: "Approved", count: 190 },
            { label: "Processing", count: 300 },
            { label: "Disbursed", count: 200 },
            { label: "Cancelled", count: 300 },
            { label: "Active", count: 490 },
          ].map((item, index) => (
            <div
              key={index}
              className="bg-white shadow rounded-lg p-4 text-center border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="text-xl font-bold text-blue-600 mb-1">{item.count}</div>
              <div className="text-sm font-medium text-gray-700">{item.label}</div>
            </div>
          ))}
        </div>
         {<LoanRequest />}
      </div>
    );
  }

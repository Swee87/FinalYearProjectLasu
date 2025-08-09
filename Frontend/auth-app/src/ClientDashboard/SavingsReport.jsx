// reports/SavingsReport.jsx
import { useQuery } from '@tanstack/react-query';
import { getUserReport } from '../services/UsersReport';
import { useState } from 'react';

export function SavingsReport() {
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const { data, isLoading, error } = useQuery({
    queryKey: ['userReport'], // No userId needed
    queryFn: getUserReport,   // Called without arguments
  });

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-10 h-10 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin"></div>
      </div>
    );

  if (error)
    return (
      <div className="p-4 text-red-700 bg-red-50 border border-red-200 rounded-lg text-center">
        Failed to load savings data. {error.message}
      </div>
    );

  const { userReport, cooperativeMembers, savingsTracks } = data;
  const member = cooperativeMembers[0];
  const payments = savingsTracks[0]?.payments || [];
  const totalPages = Math.ceil(payments.length / ITEMS_PER_PAGE);
  const paginatedPayments = payments.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Savings Report</h1>
        <p className="text-gray-600 mt-1">
          {userReport.user.FirstName} {userReport.user.LastName}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary Card */}
        <div className="md:col-span-1 bg-gradient-to-br from-blue-600 to-blue-800 text-white p-6 rounded-2xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Account Summary</h2>
          <div className="space-y-3">
            <div>
              <p className="text-blue-100 text-sm">Account Number</p>
              <p className="font-bold">{member?.accountNumber || 'N/A'}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Savings Type</p>
              <p className="font-medium">{member?.SavingsType || 'Regular'}</p>
            </div>
            <div>
              <p className="text-blue-100 text-sm">Monthly Contribution</p>
              <p className="font-bold">₦{member?.monthlySavings?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-xl shadow text-center border">
            <p className="text-gray-500 text-sm">Total Saved</p>
            <p className="text-2xl font-extrabold text-green-600 mt-1">
              ₦{userReport.totalSaved.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow text-center border">
            <p className="text-gray-500 text-sm">Withdrawable Balance</p>
            <p className="text-2xl font-extrabold text-blue-600 mt-1">
              ₦{userReport.withdrawableBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Payment History</h2>
        {payments.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No payments recorded yet.</p>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200 text-left text-gray-700">
                    <th className="py-3 font-medium">Month</th>
                    <th className="py-3 font-medium">Year</th>
                    <th className="py-3 font-medium">Amount</th>
                    <th className="py-3 font-medium">Date Paid</th>
                    <th className="py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPayments.map((payment, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="py-3 font-medium">{payment.month}</td>
                      <td>{payment.year}</td>
                      <td className="font-bold">₦{payment.amountPaid.toLocaleString()}</td>
                      <td className="text-gray-600 text-sm">
                        {new Date(payment.datePaid).toLocaleDateString()}
                      </td>
                      <td>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            payment.paidPerMonth
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {payment.paidPerMonth ? 'Paid' : 'Missed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-6">
                <div className="flex space-x-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-lg font-medium transition ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
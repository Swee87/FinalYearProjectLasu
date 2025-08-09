// reports/LoanReport.jsx
import { useQuery } from '@tanstack/react-query';
import { getUserReport } from '../services/UsersReport';

export function LoanReport() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['userReport'],
    queryFn: getUserReport,
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
        Failed to load loan data. {error.message}
      </div>
    );

  const { loans, userReport } = data;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6 font-sans">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Loan Report</h1>
        <p className="text-gray-600 mt-1">
          {userReport.user.FirstName} {userReport.user.LastName}
        </p>
      </div>

      {loans.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 mx-auto text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 18V6m0 12v-3m0 3v-3m0 3v-3"
            />
          </svg>
          <h3 className="text-xl font-medium text-gray-700 mt-4">No Active Loans</h3>
          <p className="text-gray-500 mt-2">You haven't taken any loans yet.</p>
        </div>
      ) : (
        loans.map((loan) => (
          <div key={loan._id} className="space-y-6">
            {/* Loan Card */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 text-white">
                <h2 className="text-2xl font-bold">Loan Details</h2>
                <p className="text-green-100 text-sm mt-1">ID: {loan._id.slice(-8)}</p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm">Loan Amount</p>
                    <p className="text-2xl font-bold text-gray-800">{loan.loanAmount}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Repayment Period</p>
                    <p className="font-semibold">{loan.repayment} months</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Monthly Repayment</p>
                    <p className="font-bold text-lg">{loan.repaymentAmount}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-gray-500 text-sm">Monthly Savings (Collateral)</p>
                    <p className="font-semibold">₦{loan.monthlySavings.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Status</p>
                    <span className="px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Disbursed On</p>
                    <p className="text-gray-700 text-sm">
                      {new Date(loan.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-sm text-blue-800">
              <strong>Note:</strong> Repayment begins the month following disbursement. 
              Consistent payments improve future loan eligibility.
            </div>
          </div>
        ))
      )}
    </div>
  );
}
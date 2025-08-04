import React ,{useState, useEffect} from 'react';
import toast from "react-hot-toast";
import { useQuery, useMutation } from '@tanstack/react-query';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { getVerifiedMembers } from "../services/AdminRoutes/ApproveMember"
import { checkLoanEligibility } from '../services/LoanEligible';
import { getTotalSavingsWithdrawable } from "../services/SavingsTrackApi";
import { getAllUserLoans } from '../services/UserLoans';
import { formatCurrency, convertCurrencyString, formatReadableDate } from '../helper';
import { fetchSavingsTrack } from '../services/SavingsTrackApi';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';



// Recent Transactions Data


export const ClientDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  console.log(user)
  const [loanData, setLoanData] = useState([])

 const { data: Verifiedmember, isLoading, error } = useQuery({
  queryKey: ["verifiedMember"],
  queryFn: getVerifiedMembers,
  refetchOnWindowFocus: false,
  retry: 1,
  onError: (error) => {
    console.error("Error fetching verified member:", error);
  },
});

 const { data:getSavingsWithdrawal , isGetting,  } = useQuery({
  queryKey: ["getSavingsWithdrawal"],
  queryFn: getTotalSavingsWithdrawable,
 refetchOnWindowFocus: false,
  retry: 1,
  onError: (error) => {
    console.error("Error fetching verified member:", error);
  },
});

console.log(getSavingsWithdrawal)


 const { data:getUserLoan ,isGettingUser  } = useQuery({
  queryKey: ["getUserLoan"],
  queryFn:getAllUserLoans,
  refetchOnWindowFocus: false,
  retry: 1,
  onError: (error) => {
    console.error("Error fetching verified member:", error);
  },
});


console.log(getUserLoan)

 const { data:fetchSavings ,isFetchingSavingsTrack  } = useQuery({
  queryKey: ["fetchSavings"],
  queryFn:fetchSavingsTrack,
  refetchOnWindowFocus: false,
  retry: 1,
  onError: (error) => {
    console.error("Error fetching verified member:", error);
  },
});
console.log(fetchSavings)


const {data: loanEligibility, isLoading: loanLoading, error: loanError} = useQuery({
  queryKey: ["loanEligibility"],
  queryFn: checkLoanEligibility,
  refetchOnWindowFocus: false,
  retry: 1,
  onError: (error) => {
    console.error("Error fetching loan eligibility:", error);
  },
});
console.log(loanEligibility)
// createdAt
const transactions = [
  { id: 1, type: 'Savings', amount: formatCurrency(getSavingsWithdrawal?.data?.totalSaved ?? 0), date: formatReadableDate(getSavingsWithdrawal?.data?.createdAt) ?? 'No savings' },
  { id: 2, type: 'Loan Received', amount: formatCurrency(convertCurrencyString(getUserLoan?.loans[0]?.loanAmount ?? 0)), date:formatReadableDate(getUserLoan?.loans[0]?.createdAt )?? 'No Loan created' },
  { id: 3, type: 'Procurement', amount: formatCurrency(convertCurrencyString(getUserLoan?.loans[0]?.procurement ?? 0)), date: '2025-03-25' },
];


// Sample Data for Chart
const chartData = fetchSavings?.data?.payments?.map((payment) => ({
  name: payment.month ?? 'Nil',
  savings: formatCurrency(payment.amountPaid ?? 0),
  loans: formatCurrency(
    convertCurrencyString(getUserLoan?.loans?.[0]?.loanAmount ?? 0)
  )
})) ?? [];

  // Determine if user needs to verify

  const isVerified =  Verifiedmember?.isVerified
  console.log(isVerified)
 const eligibleForLoan = isVerified && (loanEligibility?.eligibility === false )
  const check = true || eligibleForLoan
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Profile - Fixed at Top */}
      <header className="bg-white shadow-sm fixed top-15 left-0 right-0 z-10">
       
      </header>

      {/* Main Content with Top Padding to Avoid Header Overlap */}
      <main className="max-w-6xl mx-auto px-6  pb-8 space-y-8">
       <div className="max-w-6xl mx-auto px-6  flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">User Dashboard 🤌🤌</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome back, {(user?.name ?? user) || 'John doe'}!</span>
            <div className="relative group">
              <img
                src={user?.picture || 'https://randomuser.me/api/portraits/men/32.jpg'}
                // src='https://randomuser.me/api/portraits/men/32.jpg'
                alt="Profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-blue-500 cursor-pointer"
              />
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200 z-10">
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</a>
                <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</a>
              </div>
            </div>
          </div>
        </div>
        {/* 🔔 Stagnant Notification */}
        {!isVerified && (
          <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md shadow-sm animate-pulse">
            <p className="font-medium">Verify Membership</p>
            <p>Please complete your staff verification to apply for loans.</p>
            <Link
              to="/verifyMembership"
              className="mt-2 inline-block text-indigo-600 hover:text-indigo-800 underline text-sm font-semibold"
            >
              → Verify Your Staff Membership
            </Link>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard
  title="Savings"
  value={formatCurrency(getSavingsWithdrawal?.data?.totalSaved ?? 0)}
  color="green"
/>

          <StatCard title="Procurement" value={formatCurrency(convertCurrencyString(getUserLoan?.loans[0]?.procurement ?? 0))} color="blue" />
          <StatCard title="Loan Amount" value={formatCurrency(convertCurrencyString(getUserLoan?.loans[0]?.loanAmount ?? 0))} color="red" />
          <StatCard title={` for ${getUserLoan?.loans[0]?.repayment ?? 0} months you pay monthly`} value={formatCurrency(convertCurrencyString(getUserLoan?.loans[0]?.repaymentAmount ?? 0))}  color="yellow" />
        </div>

        {/* Chart Section */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Savings vs Loans Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="savings" stroke="#10B981" name="Savings" strokeWidth={2} />
                <Line type="monotone" dataKey="loans" stroke="#3B82F6" name="Loans" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Recent Transactions */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{tx.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Apply Loan Button */}
        <section className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Apply for a New Loan</h2>
          <p className="text-gray-600 mb-6">
            Ready to apply for a loan? Click the button below to start the process.
          </p>
          <button
            className={`px-6 py-3 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition duration-200 ${
              eligibleForLoan ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              if (eligibleForLoan) {
                toast.error("Please verify your staff status first");
                return;
              }
              navigate('/loanform');
            }}
            disabled={eligibleForLoan}
          >
            Apply for Loan
          </button>
        </section>
      </main>
    </div>
  );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    green: 'text-green-600',
    blue: 'text-blue-600',
    red: 'text-red-600',
    yellow: 'text-yellow-600'
  };

  return (
    <div className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow duration-300">
      <h2 className="text-gray-500 text-sm uppercase font-semibold">{title}</h2>
      <p className={`mt-2 text-3xl font-bold ${colorClasses[color]}`}>{value}</p>
    </div>
  );
};
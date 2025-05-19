import React from 'react';
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
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

// Sample Data for Chart
const chartData = [
  { name: 'Jan', savings: 20000, loans: 50000 },
  { name: 'Feb', savings: 30000, loans: 60000 },
  { name: 'Mar', savings: 45000, loans: 70000 },
  { name: 'Apr', savings: 50000, loans: 80000 },
  { name: 'May', savings: 60000, loans: 90000 },
  { name: 'Jun', savings: 70000, loans: 100000 },
];

// Recent Transactions Data
const transactions = [
  { id: 1, type: 'Savings', amount: '₦10,000', date: '2025-04-01' },
  { id: 2, type: 'Loan Received', amount: '₦50,000', date: '2025-03-28' },
  { id: 3, type: 'Procurement', amount: '₦15,000', date: '2025-03-25' },
  { id: 4, type: 'Loan Repayment', amount: '₦5,000', date: '2025-03-20' },
  { id: 5, type: 'Savings', amount: '₦8,000', date: '2025-03-18' },
];

export const ClientDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  // Determine if user needs to verify
  const isVerified = user?.isVerified || false;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header with Profile - Fixed at Top */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-semibold text-gray-800">Gbewa Cooperative Dashboard 🤌🤌🤌</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome back, John Doe!</span>
            <div className="relative group">
              <img
                src="https://i.pravatar.cc/150?img=5 "
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
      </header>

      {/* Main Content with Top Padding to Avoid Header Overlap */}
      <main className="max-w-6xl mx-auto px-6 pt-24 pb-8 space-y-8">
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
          <StatCard title="Savings" value="₦50,000" color="green" />
          <StatCard title="Procurement" value="₦120,000" color="blue" />
          <StatCard title="Loan Amount" value="₦300,000" color="red" />
          <StatCard title="Repaying" value="₦75,000" color="yellow" />
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
              !isVerified ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            onClick={() => {
              if (!isVerified) {
                toast.error("Please verify your staff status first");
                return;
              }
              navigate('/loanform');
            }}
            disabled={!isVerified}
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
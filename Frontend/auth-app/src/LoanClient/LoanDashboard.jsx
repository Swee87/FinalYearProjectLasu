
import React, { useState } from "react";
import { FaMoneyBill, FaHistory } from "react-icons/fa";
import welcomeLoan from '../assets/images/welcomeLoan.jpeg'
import { LoanModal } from "./LoanModal";
import { Link } from "react-router-dom";


export function LoanDashboard() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-bold text-blue-700 flex items-center gap-2">
            <FaMoneyBill />
            <span>Loan Dashboard</span>
          </h1>

          <Link
            to="/loanhistory"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-all"
          >
            <FaHistory />
            <span className="font-medium">Loan History</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Stats Cards */}
          <div className="space-y-6">
            <StatCard
              title="Total Amount of Loan"
              subtitle="Authorized as of April, 2025"
              value="N0.00"
              bgColor="bg-blue-600"
              textColor="text-white"
            />
            <StatCard
              title="Total Amount Repaid"
              subtitle="as of April, 2025"
              value="N0.00"
              bgColor="bg-white"
              textColor="text-blue-700"
              shadow="shadow-md"
            />
            <StatCard
              title="Balance Left"
              subtitle="as of April, 2025"
              value="N0.00"
              bgColor="bg-blue-600"
              textColor="text-white"
            />
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:flex justify-center">
            <img
              src={welcomeLoan}
              alt="Welcome to Loan Dashboard"
              className="rounded-2xl shadow-xl w-full h-auto object-cover max-w-lg"
            />
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <button
            onClick={() => setModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 
            text-white font-semibold rounded-2xl shadow-lg transform transition-all duration-300 
            hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Request for Loan
          </button>
        </div>
      </main>

      {/* Modal */}
      {modalOpen && <LoanModal onClose={() => setModalOpen(false)} />}
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, subtitle, value, bgColor, textColor, shadow }) {
  return (
    <div
      className={`${bgColor} ${textColor} ${shadow || ""} p-6 rounded-2xl transition-transform duration-300 hover:shadow-lg`}
    >
      <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
      <p className="text-sm md:text-base opacity-90 mt-1">{subtitle}</p>
      <p className="text-2xl md:text-3xl font-bold mt-3">{value}</p>
    </div>
  );
}
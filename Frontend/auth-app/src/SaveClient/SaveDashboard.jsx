import React, { useState } from "react";
import SavingsWelcome from "../assets/images/SavingsDashboard.jpeg";
import { FaHandHoldingDollar } from "react-icons/fa6";
import { FaHistory } from "react-icons/fa";
import { Link } from "react-router-dom";
import SavingsModal from "./SavingsModal";

export function SaveDashboard() {
  const [formOpen, setFormOpen] = useState(false);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Header content */}
      <header className="bg-white sticky top-0 shadow-sm z-10 py-6 px-4">
        <div className="container flex mx-auto justify-between items-center">
          <h1 className="flex items-center gap-2 text-blue-600 text-2xl font-bold">
            <FaHandHoldingDollar />
            <span>Savings Dashboard</span>
          </h1>
          <Link
            to="/loanhistory"
            className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-800 transition-all"
          >
            <FaHistory />
            <span className="font-medium">Transaction History</span>
          </Link>
        </div>
      </header>
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <StatCard
              title="Savings Balance"
              subtitle="as of May, 2025"
              value="N0.00"
              bgColor="bg-blue-600"
              textColor="text-white"
            />
            <StatCard
              title="Available Balance"
              subtitle="as of May, 2025"
              value="N0.00"
              bgColor="bg-white"
              textColor="text-blue-600"
            />
          </div>
          {/* Right-side content */}
          <div className="sr-only lg:not-sr-only justify-center">
            <img
              src={SavingsWelcome}
              alt="Welcome to Savings Page"
              className="rounded-2xl shadow-xl w-full h-auto"
            />
          </div>
        </div>
        {/* Save Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => setFormOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 
            text-white font-semibold rounded-2xl shadow-lg transform transition-all duration-300 
            hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            Save Now
          </button>
        </div>
      </main>

      {/* Modal */}
      {formOpen && <SavingsModal onClose={() => setFormOpen(false)} />}
    </div>
  );
}

// Reusable Stat Card Component
function StatCard({ title, subtitle, value, bgColor, textColor, shadow }) {
  return (
    <div
      className={`${bgColor} ${textColor} ${
        shadow || ""
      } p-6 rounded-2xl transition-transform duration-300 hover:shadow-lg`}
    >
      <h2 className="text-2xl md:text-3xl font-bold">{title}</h2>
      <p className="text-sm md:text-base opacity-90 mt-1">{subtitle}</p>
      <p className="text-2xl md:text-3xl font-bold mt-3">{value}</p>
    </div>
  );
}

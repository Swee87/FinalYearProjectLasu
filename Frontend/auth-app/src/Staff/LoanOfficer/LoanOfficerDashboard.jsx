import React from "react";
import { Banknote, UserCheck, Send, LogOut, Sun, Moon } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../hooks/useDarkmode";
import { LoanOfficerApproval} from './officerApproval'

export function LoanOfficerDashboard() {
  const user = useSelector((state) => state.auth.user);
  const navigate = useNavigate();
  const [isDark, setIsDark] = useDarkMode();

  const stats = [
    {
      title: "Pending Loans",
      value: 12,
      icon: <Banknote className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />,
    },
    {
      title: "Approved Loans",
      value: 27,
      icon: <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />,
    },
    {
      title: "Disbursed",
      value: 18,
      icon: <Send className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />,
    },
  ];

  const recentLoans = [
    { id: "LN1234", name: "Jane Doe", amount: "₦250,000", status: "Pending" },
    { id: "LN2345", name: "Mark Obi", amount: "₦400,000", status: "Approved" },
    { id: "LN8765", name: "Ada Okoro", amount: "₦150,000", status: "Disbursed" },
  ];

  const handleLogout = () => {
    navigate("/loan-login");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white flex transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-indigo-700 dark:bg-indigo-800 text-white flex flex-col">
        <div className="p-6 flex items-center justify-between">
          <span className="text-xl font-bold">Loan Officer</span>
          <button
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700"
            title="Toggle dark mode"
          >
            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-3">
          <button className="w-full text-left px-3 py-2 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition">Dashboard</button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition">Loan Requests</button>
          <button className="w-full text-left px-3 py-2 rounded hover:bg-indigo-600 dark:hover:bg-indigo-700 transition">Disbursements</button>
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 px-6 py-3 flex items-center justify-center text-white bg-red-600 hover:bg-red-700 rounded-xl transition"
        >
          <LogOut className="mr-2" />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex flex-col items-center  bg-gray-50 p-6 mt-0">
            <LoanOfficerApproval/>
      </main>
    </div>
  );
}

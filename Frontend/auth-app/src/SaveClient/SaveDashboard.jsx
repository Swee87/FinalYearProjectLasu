import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { fetchSavingsTrack } from "../services/SavingsTrackApi";
import { getTotalSavingsWithdrawable } from "../services/SavingsTrackApi";
import { getVerifiedMembers } from "../services/AdminRoutes/ApproveMember";
import { FaWallet, FaPiggyBank, FaMoneyBillWave } from "react-icons/fa";

export const SaveDashboard = () => {
  const navigate = useNavigate();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ["savingsTrack"],
    queryFn: fetchSavingsTrack,
    refetchOnWindowFocus: true,
  });

  const {
    data: membersData,
    isLoading: isMembersLoading,
  } = useQuery({
    queryKey: ["verifiedMembers"],
    queryFn: getVerifiedMembers,
    refetchOnWindowFocus: true,
  });
console.log("Members Data:", membersData);
const SavingType = membersData?.
SavingsType === 'card' || "default"; // Default to 'default' if not set
console.log("Saving Type:", SavingType);

  const {
    data: totalSavingsData,
    isLoading: isTotalSavingsLoading,
  } = useQuery({
    queryKey: ["totalSavingsWithdrawable"],
    queryFn: getTotalSavingsWithdrawable,
    refetchOnWindowFocus: true,
  });

  console.log("Total Savings Data:", totalSavingsData);

  const [allMonths, setAllMonths] = useState([]);
  const [nextUnpaidMonth, setNextUnpaidMonth] = useState(null);

  useEffect(() => {
    if (!data || !membersData) return;

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonthIndex = now.getMonth();
    const payments = data?.data?.payments || [];

    const verifiedDate = new Date(membersData?.verifiedAt);
    const verifiedMonthIndex = verifiedDate.getMonth();
    const verifiedYear = verifiedDate.getFullYear();

    const months = [];
    let canPayNext = true;

    for (let i = 0; i < 12; i++) {
      const month = monthNames[i];

      if (currentYear === verifiedYear && i < verifiedMonthIndex) continue;

      const payment = payments.find(
        p => p.month === month && p.year === currentYear
      );

      const monthObj = {
        month,
        year: currentYear,
        isPaid: !!payment,
        amountPaid: payment?.amountPaid || 0,
        isNextPayable: false,
      };
     
      if (!payment && canPayNext && i === currentMonthIndex) {
        monthObj.isNextPayable = true;
        setNextUnpaidMonth(monthObj);
        canPayNext = false;
      }

      months.push(monthObj);
    }

    setAllMonths(months);
  }, [data, membersData]);

  const handlePayMonth = (month, year) => {
    navigate("/payStackPayment", {
      state: { targetMonth: month, year },
    });
  };

  const summary = [
    {
      title: "Total Savings",
      amount: totalSavingsData?.data?.totalSaved
        ? `₦${totalSavingsData.data.totalSaved.toLocaleString()}` : "₦0",
      icon: <FaWallet className="text-indigo-800 text-xl" />,
    },
    {
      title: "Monthly Contribution",
      amount: `₦${membersData?.monthlySavings}`|| '₦20,000',
      icon: <FaPiggyBank className="text-indigo-800 text-xl" />,
    },
    {
      title: "Withdrawable Balance",
      amount: totalSavingsData?.data?.withdrawableBalance
        ? `₦${totalSavingsData.data.withdrawableBalance.toLocaleString()}` : "₦0",
      icon: <FaMoneyBillWave className="text-indigo-800 text-xl" />,
    },
  ];

  return (
    <div className="min-h-screen bg-white px-4 sm:px-8 py-10">
      <h1 className="text-3xl font-bold text-indigo-800 mb-10">Savings Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
        {summary.map((item, index) => (
          <div
            key={index}
            className="bg-white text-indigo-800 rounded-xl p-6 shadow border border-indigo-100 flex items-center justify-between"
          >
            <div className="flex flex-col">
              <span className="text-sm font-light text-gray-600">{item.title}</span>
              <span className="text-xl font-bold">{item.amount}</span>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">{item.icon}</div>
          </div>
        ))}
      </div>

      {/* Error Box */}
      {isError && (
        <div className="bg-red-100 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-medium mb-2">Failed to load savings data.</p>
          <p className="text-sm">
            {error?.message || "Something went wrong. Please check your connection."}
          </p>
          <button
            onClick={refetch}
            className="mt-3 inline-block bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
          >
            Retry
          </button>
        </div>
      )}

      {/* Deposit Section */}
      {SavingType && SavingType !== "default" ? (
  <>
    <div className="bg-yellow-100 border border-yellow-200 text-yellow-800 rounded-xl p-6 mb-10">
      <h2 className="text-lg font-semibold mb-4">Deposit Information</h2>
      <p className="text-sm mb-2">Please ensure you have the correct payment details before making a deposit.</p>
    </div>
    <div className="bg-white rounded-xl p-6 shadow border border-indigo-100 mb-10">
      <h2 className="text-lg font-semibold text-indigo-800 mb-4">Make a Deposit</h2>
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading months...</p>
      ) : allMonths.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {allMonths.map((month, idx) => (
            <div
              key={idx}
              className={`rounded-xl px-4 py-5 text-center transition duration-300 border shadow-sm font-medium text-sm md:text-base 
                ${month.isPaid
                  ? "bg-green-100 text-green-800 border-green-200"
                  : month.isNextPayable
                  ? "bg-indigo-100 text-indigo-800 border-indigo-300 hover:bg-indigo-200 cursor-pointer"
                  : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"}`}
              onClick={() => month.isNextPayable && handlePayMonth(month.month, month.year)}
            >
              <div className="font-semibold">{month.month} {month.year}</div>
              <div className="mt-1 text-xs">
                {month.isPaid ? `₦${month.amountPaid.toLocaleString()}` : month.isNextPayable ? "Pay Now" : ""}
              </div>
              <div className="text-xs">
                {month.isPaid ? "✓ Paid" : ""}
              </div>
            </div>
          ))}
        </div>
      ) : (
       <div className="bg-white border border-yellow-100 rounded-xl mb-2.5 shadow p-6 flex items-start gap-4 text-yellow-900">
  <div className="text-yellow-500 text-xl mt-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  </div>
  <div>
    <h2 className="text-lg font-semibold mb-1">Notice</h2>
    <p className="text-sm leading-relaxed">
      Your savings is by <span className="font-medium text-yellow-800">salary deduction</span>. You do not need to make a manual deposit.
    </p>
  </div>
</div>

      )}
    </div>
  </>
) : (
  <div className="bg-white border border-yellow-100 rounded-xl mb-2.5 shadow p-6 flex items-start gap-4 text-yellow-900">
  <div className="text-yellow-500 text-xl mt-1">
    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" />
    </svg>
  </div>
  <div>
    <h2 className="text-lg font-semibold mb-1">Notice</h2>
    <p className="text-sm leading-relaxed">
      Your savings is by <span className="font-medium text-yellow-800">salary deduction</span>. You do not need to make a manual deposit.
    </p>
  </div>
</div>

)}


      {/* History Section */}
      <div className="bg-white rounded-xl shadow border border-indigo-100">
        <h2 className="text-lg font-semibold text-indigo-800 px-6 pt-6">Savings History</h2>
        <div className="overflow-x-auto mt-4">
          <table className="min-w-full text-sm">
            <thead className="bg-indigo-100 text-indigo-800">
              <tr>
                <th className="text-left px-6 py-4">Month</th>
                <th className="text-left px-6 py-4">Amount</th>
                <th className="text-left px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-800">
              {data?.data?.payments?.map((entry, index) => (
                <tr key={index} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4">{entry.month} {entry.year}</td>
                  <td className="px-6 py-4">₦{entry.amountPaid.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                      {entry.paidPerMonth ? "Successful" : "Pending"}
                    </span>
                  </td>
                </tr>
              ))}
              {(!data?.data?.payments || data.data.payments.length === 0) && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-gray-400 text-center">
                    No payment history yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

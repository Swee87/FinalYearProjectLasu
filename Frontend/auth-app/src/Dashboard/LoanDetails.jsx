import React from "react";
import { useState } from "react";

export const LoanDetails= () => {
  // Sample data
  const user = {
    firstName: "Balogun Mr. Lateef Olawale",
    lastName: "",
    email: "stolateefolawale@gmail.com",
    contact: "08027702900",
    memberType: "Lasu-staff",
    memberId: "LASU/2023/0001",
    // oracleNo: "50336",
  };

  const loanInfo = {
    purpose: "Business",
    loanAmount: "₦650,000.00",
    repaymentAmount: "₦33,333.00",
    repaymentDuration: "18 months",
    startDate: "Thursday, November 30, 2023",
    endDate: "NIL",
  };

  const adminComments = [
    {
      fullName: "Animashun Kafilat Folake",
      role: "Loan Officer",
      comment: "NIL",
      status: "Approved",
      entryDate: "2023-09-05",
    },
    {
      fullName: "Sherifat Folawiyo",
      role: "General Manager",
      comment: "NIL",
      status: "Approved",
      entryDate: "2023-10-08",
    },
    {
      fullName: "Balogun Azeezat Opeyemi",
      role: "Exco Auditor",
      comment: "NIL",
      status: "Approved",
      entryDate: "2023-10-18",
    },
    {
      fullName: "Yakubu Bamidole",
      role: "President",
      comment: "NIL",
      status: "Approved",
      entryDate: "2023-10-19",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-blue-800">Loan Form Details</h1>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Back
        </button>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <nav className="flex space-x-2">
          <a
            href="#"
            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-t-lg"
          >
            Details
          </a>
          <a
            href="#"
            className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-t-lg"
          >
            Payment Slip
          </a>
          <a
            href="#"
            className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-t-lg"
          >
            Confirmation Letter
          </a>
        </nav>
      </div>

      {/* Approval Status */}
      <div className="bg-green-300 text-white px-4 py-2 rounded-lg mb-4">
        <span className="mr-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 inline-block mr-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12l2 2 4-4m0 0l2-2m-2 2l-2.066 2.066A10 10 0 113 12 10 10 0 0112 3zm0 2a8 8 0 100 16 8 8 0 000-16zM2 12a10 10 0 1120 0 10 10 0 01-20 0z"
            />
          </svg>
        </span>
        Approved
      </div>

      {/* User Information */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Personal Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First Name:
            </label>
            <input
              id="firstName"
              type="text"
              value={user.firstName}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last Name:
            </label>
            <input
              id="lastName"
              type="text"
              value={user.lastName || "N/A"}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email:
            </label>
            <input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
              Contact:
            </label>
            <input
              id="contact"
              type="text"
              value={user.contact}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="memberType" className="block text-sm font-medium text-gray-700">
              Member Type:
            </label>
            <input
              id="memberType"
              type="text"
              value={user.memberType}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="oracleNo" className="block text-sm font-medium text-gray-700">
            memberId:
            </label>
            <input
              id="oracleNo"
              type="text"
              value={user.memberId}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Loan Information */}
      <div className="bg-white shadow-md rounded-lg p-4 mb-4">
        <h2 className="text-lg font-semibold mb-2">Loan Information</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="loanPurpose" className="block text-sm font-medium text-gray-700">
              Loan Purpose:
            </label>
            <input
              id="loanPurpose"
              type="text"
              value={loanInfo.purpose}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="loanAmount" className="block text-sm font-medium text-gray-700">
              Loan Amount:
            </label>
            <input
              id="loanAmount"
              type="text"
              value={loanInfo.loanAmount}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="repaymentAmount" className="block text-sm font-medium text-gray-700">
              Repayment Amount:
            </label>
            <input
              id="repaymentAmount"
              type="text"
              value={loanInfo.repaymentAmount}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="repaymentDuration" className="block text-sm font-medium text-gray-700">
              Repayment Duration:
            </label>
            <input
              id="repaymentDuration"
              type="text"
              value={loanInfo.repaymentDuration}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date:
            </label>
            <input
              id="startDate"
              type="text"
              value={loanInfo.startDate}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date:
            </label>
            <input
              id="endDate"
              type="text"
              value={loanInfo.endDate}
              disabled
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Admin Comments */}
      <div className="bg-white shadow-md rounded-lg p-4">
        <h2 className="text-lg font-semibold mb-2">Admin Comments</h2>
        <table className="w-full text-left">
          <thead>
            <tr>
              <th className="px-4 py-2">Full Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Comment</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Entry Date</th>
            </tr>
          </thead>
          <tbody>
            {adminComments.map((comment, index) => (
              <tr key={index}>
                <td className="border-b border-gray-200 px-4 py-2">{comment.fullName}</td>
                <td className="border-b border-gray-200 px-4 py-2">{comment.role}</td>
                <td className="border-b border-gray-200 px-4 py-2">{comment.comment}</td>
                <td className="border-b border-gray-200 px-4 py-2">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${comment.status === 'Approved' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {comment.status}
                  </span>
                </td>
                <td className="border-b border-gray-200 px-4 py-2">{comment.entryDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


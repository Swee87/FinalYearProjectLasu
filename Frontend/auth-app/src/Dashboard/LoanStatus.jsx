import React from "react";

export const StatusBadge = ({ status }) => {
  // Normalize the status (case-insensitive)
  const normalizedStatus = status?.toLowerCase();

  // Define status config
  const statusConfig = {
  pending: {
    bgColor: "bg-yellow-500",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Loan Pending",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  approved: {
    bgColor: "bg-green-500",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Loan Approved",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  processing: {
    bgColor: "bg-blue-500",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Loan Processing",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
  },
  disbursed: {
    bgColor: "bg-purple-500",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Loan Disbursed",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
  },
  ongoing: {
    bgColor: "bg-orange-500",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Loan Ongoing",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  completed: {
    bgColor: "bg-emerald-600",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Loan Completed",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  active: {
    bgColor: "bg-teal-500",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Loan Active",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
      </svg>
    ),
  },
  cancelled: {
    bgColor: "bg-red-600",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Loan Cancelled",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  rejected: {
    bgColor: "bg-red-500",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Loan Rejected",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
  default: {
    bgColor: "bg-gray-500",
    textColor: "text-white",
    iconColor: "text-white",
    label: "Unknown",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

  const selectedStatus = statusConfig[normalizedStatus] || statusConfig.default;

  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${selectedStatus.bgColor} ${selectedStatus.textColor}`}
    >
      <span className={`${selectedStatus.iconColor}`}>{selectedStatus.icon}</span>
      {selectedStatus.label}
    </div>
  );
};


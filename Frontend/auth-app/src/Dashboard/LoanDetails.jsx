import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getAllappliedLoan } from "../services/AdminRoutes/ApproveLoan";
import { convertCurrencyString, formatCurrency } from "../helper";
import { StatusBadge } from "./LoanStatus";
import { ErrorPage } from "../components/Error";
import ReactPaginate from "react-paginate";

export const LoanDetails = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState("all"); // 'all', 'paid', 'unpaid'
  const loansPerPage = 1;

  // Fetch all applied loans
  const { data: LoanApplied, isLoading, error, refetch } = useQuery({
    queryKey: ["applied-loans"],
    queryFn: getAllappliedLoan,
    refetchOnWindowFocus: false,
    retry: 1,
    onError: (error) => {
      toast.error(`Loading failed: ${error.message}`);
    },
  });

  // Handle page change
  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // Filter loans based on active tab
  const filteredLoans = LoanApplied?.filter(loan => {
    if (activeTab === "paid") return loan.loanPaid === "paid";
    if (activeTab === "unpaid") return loan.loanPaid !== "paid";
    return true; // 'all' tab
  }) || [];

  // Calculate pagination values
  const pageCount = Math.ceil(filteredLoans.length / loansPerPage);
  const currentLoan = filteredLoans[currentPage];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return <ErrorPage title="Failed to Load Loan Data" message={error.message} onRetry={refetch} showHomeButton />;
  }

  if (!LoanApplied || LoanApplied.length === 0) {
    return (
      <div className="text-center py-10 text-gray-600">
        No applied loans available.
      </div>
    );
  }

  // Admin Comments
  const adminComments = [
    // ... same as before
  ];

  // Render when no loans match filter
  if (filteredLoans.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Tab Navigation */}
          <div className="flex mb-6 border-b border-gray-200">
            <TabButton 
              active={activeTab === "all"} 
              onClick={() => setActiveTab("all")}
            >
              All Loans ({LoanApplied.length})
            </TabButton>
            <TabButton 
              active={activeTab === "paid"} 
              onClick={() => setActiveTab("paid")}
            >
              Paid Loans ({LoanApplied.filter(l => l.loanPaid === "paid").length})
            </TabButton>
            <TabButton 
              active={activeTab === "unpaid"} 
              onClick={() => setActiveTab("unpaid")}
            >
              Unpaid Loans ({LoanApplied.filter(l => l.loanPaid !== "paid").length})
            </TabButton>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              No {activeTab === "all" ? "" : activeTab} loans found
            </h3>
            <p className="text-gray-600 mb-6">
              There are currently no {activeTab === "all" ? "" : activeTab} loan applications.
            </p>
            <button 
              onClick={() => setActiveTab("all")}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition duration-200"
            >
              View All Loans
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    status = "N/A",
    loanId = "N/A",
    loanAmount = 0,
    monthlySavings = 0,
    repayment = "N/A",
    about = "N/A",
    createdAt = "N/A",
    updatedAt = "N/A",
    repaymentAmount = 0,
    loanPaid = "N/A",
     approvedBy ,
    member = {},
  } = currentLoan;

  const {
    firstName = "N/A",
    lastName = "N/A",
    email = "N/A",
    memberId = "N/A",
    phoneNumber = "N/A",
    bankName = "N/A",
    accountNumber = "N/A",
    staffType = "N/A",
  } = member;

  return (
    <div className="bg-gray-50 min-h-screen p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex mb-6 border-b border-gray-200">
          <TabButton 
            active={activeTab === "all"} 
            onClick={() => {
              setActiveTab("all");
              setCurrentPage(0);
            }}
          >
            All Loans ({LoanApplied.length})
          </TabButton>
          <TabButton 
            active={activeTab === "paid"} 
            onClick={() => {
              setActiveTab("paid");
              setCurrentPage(0);
            }}
          >
            Paid Loans ({LoanApplied.filter(l => l.loanPaid === "paid").length})
          </TabButton>
          <TabButton 
            active={activeTab === "unpaid"} 
            onClick={() => {
              setActiveTab("unpaid");
              setCurrentPage(0);
            }}
          >
            Unpaid Loans ({LoanApplied.filter(l => l.loanPaid !== "paid").length})
          </TabButton>
        </div>
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-blue-800">
              {activeTab === "paid" ? "Paid" : activeTab === "unpaid" ? "Unpaid" : "All"} Loan Applications
            </h1>
            <p className="text-gray-600 mt-1">
              Application ID: <span className="font-mono">{loanId}</span>
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="bg-white px-4 py-2 rounded-lg shadow-sm flex-1">
              <p className="text-xs text-gray-500">Showing</p>
              <p className="font-semibold">{currentPage + 1} of {filteredLoans.length}</p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200 flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-6 border-l-4 border-blue-500">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {firstName} {lastName}
              </h2>
              <p className="text-gray-600 text-sm">{email}</p>
            </div>
            
            <div className="flex flex-col items-end">
              <div className="flex gap-2">
                <StatusBadge status={status} />
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  loanPaid === "paid" 
                    ? "bg-green-100 text-green-800" 
                    : "bg-yellow-100 text-yellow-800"
                }`}>
                  {loanPaid === "paid" ? "PAID" : "UNPAID"}
                </span>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Last updated: {new Date(updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-md p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Personal Information</h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full">
                {staffType}
              </span>
            </div>
            
            <div className="space-y-4">
              <InfoRow label="Full Name" value={`${firstName} ${lastName}`} />
              <InfoRow label="Member ID" value={memberId} />
              <InfoRow label="Email" value={email} />
              <InfoRow label="Contact" value={phoneNumber} />
              <InfoRow label="Bank Details" value={`${bankName} - ${accountNumber}`} />
            </div>
          </div>

          {/* Loan Information */}
          <div className="bg-white rounded-xl shadow-md p-5">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Loan Information</h2>
            
            <div className="space-y-4">
              <InfoRow label="Loan Purpose" value={about} fullWidth />
              
              <div className="grid grid-cols-2 gap-4">
                <InfoCard 
                  label="Loan Amount" 
                  value={formatCurrency(convertCurrencyString(loanAmount))}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  }
                />
                <InfoCard 
                  label="Monthly Repayment" 
                  value={formatCurrency(convertCurrencyString(repaymentAmount))}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <InfoCard 
                  label="Monthly Savings" 
                  value={formatCurrency(monthlySavings)}
                  icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  }
                />
                <InfoCard 
                  label="Loan Status" 
                  value={loanPaid === "paid" ? "Paid" : "Unpaid"}
                  icon={
                    loanPaid === "paid" ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    )
                  }
                />
              </div>
              
              <div className="pt-4 border-t border-gray-100">
                <InfoRow label="Repayment Duration" value={`${repayment} months`} />
                <InfoRow label="Application Date" value={new Date(createdAt).toLocaleDateString()} />
              </div>
            </div>
          </div>
        </div>

        {/* Admin Comments */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Approval Process</h2>
            <span className="bg-gray-100 text-gray-800 text-xs px-2.5 py-1 rounded-full">
              {LoanApplied.length} reviews
            </span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Officer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Comment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
  <tr key={currentLoan.loanId}>
    <td className="px-4 py-3 whitespace-nowrap">
      <div className="flex items-center">
        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-8 h-8 mr-3" />
        <div>
          <div className="font-medium text-gray-900">
            {currentLoan.approvedBy?.firstName ?? '—'} {currentLoan.approvedBy?.lastName ?? ''}
          </div>
        </div>
      </div>
    </td>

    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
      {currentLoan.loanRole
        ? currentLoan.loanRole === 'loan_officer'
          ? 'Loan Officer'
          : currentLoan.loanRole
        : '—'}
    </td>

    <td className="px-4 py-3 text-sm text-gray-500 max-w-xs">
      {currentLoan.comment ?? '—'}
    </td>

    <td className="px-4 py-3 whitespace-nowrap">
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
          currentLoan.status === 'Approved'
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}
      >
        {currentLoan.status}
      </span>
    </td>

    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
      {currentLoan.approvedAt ?? '—'}
    </td>
  </tr>
</tbody>
            </table>
          </div>
        </div>

        {/* Document Section */}
        <div className="bg-white rounded-xl shadow-md p-5 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Supporting Documents</h2>
          <div className="flex flex-wrap gap-4">
            <DocumentCard 
              title="Payslip" 
              type="PDF" 
              date={new Date(createdAt).toLocaleDateString()}
            />
            <DocumentCard 
              title="Bank Statement" 
              type="PDF" 
              date={new Date(createdAt).toLocaleDateString()}
            />
            <DocumentCard 
              title="ID Verification" 
              type="Image" 
              date={new Date(createdAt).toLocaleDateString()}
            />
          </div>
        </div>

        {/* Action Buttons */}
      

        {/* Pagination */}
        {filteredLoans.length > 1 && (
          <div className="flex flex-col sm:flex-row justify-between items-center py-5 border-t border-gray-200">
            <p className="text-sm text-gray-700 mb-4 sm:mb-0">
              Showing application {currentPage + 1} of {filteredLoans.length}
            </p>
            
            <ReactPaginate
              previousLabel={
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Previous
                </div>
              }
              nextLabel={
                <div className="flex items-center">
                  Next
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              }
              breakLabel="..."
              pageCount={pageCount}
              onPageChange={handlePageClick}
              forcePage={currentPage}
              containerClassName="flex items-center space-x-1"
              pageClassName="hidden sm:block"
              pageLinkClassName="px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
              activeLinkClassName="bg-blue-100 text-blue-700 hover:bg-blue-200"
              previousClassName="mr-2"
              nextClassName="ml-2"
              previousLinkClassName="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
              nextLinkClassName="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300"
              disabledClassName="opacity-50 cursor-not-allowed"
              disabledLinkClassName="cursor-not-allowed"
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Tab Button Component
const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 font-medium text-sm transition-colors duration-200 ${
      active
        ? "text-blue-600 border-b-2 border-blue-500 bg-blue-50"
        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
    }`}
  >
    {children}
  </button>
);

// Helper Components (same as before)
const InfoRow = ({ label, value, fullWidth = false }) => (
  <div className={`${fullWidth ? '' : 'grid grid-cols-3 gap-4'}`}>
    <dt className="text-sm font-medium text-gray-500">{label}</dt>
    <dd className={`text-gray-900 ${fullWidth ? 'mt-1' : 'col-span-2'}`}>
      {value || "N/A"}
    </dd>
  </div>
);

const InfoCard = ({ label, value, icon }) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-gray-500">{label}</span>
      {icon}
    </div>
    <div className="mt-2 text-xl font-semibold">{value}</div>
  </div>
);

const DocumentCard = ({ title, type, date }) => (
  <div className="border border-gray-200 rounded-lg p-4 w-full sm:w-64 hover:bg-gray-50 transition duration-200">
    <div className="flex items-start">
      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-12 h-12 flex items-center justify-center mr-3">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <h3 className="font-medium text-gray-900">{title}</h3>
        <div className="flex items-center text-sm text-gray-500 mt-1">
          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded mr-2">
            {type}
          </span>
          <span>{date}</span>
        </div>
      </div>
    </div>
    <button className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center">
      View Document
      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
      </svg>
    </button>
  </div>
);
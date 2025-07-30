import React, { useState, useEffect } from 'react';
import { useQuery } from "@tanstack/react-query";
import { fetchTrackedLoans } from '../services/TrackedLoan';
import { getAdminLedger } from '../services/AdminRoutes/AdminLedger';
import { LoanTracker } from './LoanTracker';
import { AdminLedgerPage } from './Adminledger';
import { formatCurrency, convertCurrencyString } from '../helper';

export const TrackedLoansPage = () => {
  const [activeTab, setActiveTab] = useState('tracked'); // 'tracked' or 'ledger'
  const [currentPage, setCurrentPage] = useState(1);

  // Fetching the ledger data
  const { data: ledger, isLoading: isLedgerLoading } = useQuery({
    queryKey: ['adminLedger'],
    queryFn: getAdminLedger,
    refetchInterval: 300000,
  });

  // Fetching the loans data
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['trackedLoans'],
    queryFn: fetchTrackedLoans,
    refetchInterval: 300000, 
    refetchOnWindowFocus: true,
  });

  const [trackedLoans, setTrackedLoans] = useState([]);
  const allLedger = ledger?.data || [];

  console.log("Tracked Loans Data:", trackedLoans);
  console.log("All Ledger Data:", allLedger);

  // Set trackedLoans when data is fetched
  useEffect(() => {
    if (data?.data) {
      setTrackedLoans(data.data);
      setCurrentPage(1);
    }
  }, [data]);

  // Only show ONE loan per page
  const currentLoan = trackedLoans[currentPage - 1];
  const totalPages = trackedLoans.length;

  // Handle page change
  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (isLoading || isLedgerLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-opacity-50"></div>
          <p className="mt-4 text-gray-600">Loading loan data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div className="ml-4">
              <h3 className="text-xl font-medium text-red-800">Error Loading Loan Data</h3>
              <div className="mt-2 text-red-700">
                <p>{error.message}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate loan metrics
  const calculateLoanMetrics = (loan) => {
    if (!loan) return {
      loanAmount: 0,
      totalPaid: 0,
      remaining: 0,
      formattedLoanAmount: '₦0',
      formattedTotalPaid: '₦0',
      formattedRemaining: '₦0'
    };
    console.log(loan);
    const allPaid = loan.payments.filter((item)=>item.paidPerMonth === true)
    const notPaid = loan.payments.filter((item)=>item.paidPerMonth === false)
    const paymentMade = allPaid.reduce((acc, item) => acc + convertCurrencyString(item.amountPaid), 0);
    const notPaidAmount = notPaid.reduce((acc, item) => acc + convertCurrencyString(item.amountPaid), 0);
    console.log(paymentMade);

    console.log(allPaid);
    const loanAmount = loan.loanAmount || 0;
    const totalPaid = formatCurrency(paymentMade) || 0;
    const allremaining = convertCurrencyString(loanAmount) - convertCurrencyString(paymentMade);
    console.log(allremaining);
    const remaining = formatCurrency(allremaining) || 0;

    return {
      loanAmount,
      totalPaid,
      remaining,
    };
  };

  const metrics = calculateLoanMetrics(currentLoan);
  console.log(metrics.loanAmount, metrics.totalPaid, metrics.remaining);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Loan Management Dashboard</h1>
          <p className="mt-1 text-gray-600">Track and manage all loan repayments in one place</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition duration-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
            </svg>
            New Loan Application
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-8 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('tracked')}
          className={`px-6 py-4 font-medium text-base ${
            activeTab === 'tracked'
              ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
            </svg>
            Active Loans ({trackedLoans.length})
          </div>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`px-6 py-4 font-medium text-base ${
            activeTab === 'ledger'
              ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Loan Ledger ({allLedger.length})
          </div>
        </button>
      </div>

      {/* Tracked Loans Tab */}
      {activeTab === 'tracked' && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {trackedLoans.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Active Loans</h3>
              <p className="text-gray-600 max-w-md mx-auto mb-6">
                There are currently no loans requiring tracking. All loans are either paid or not yet approved.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition duration-200">
                View Loan Applications
              </button>
            </div>
          ) : (
            <>
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <div className="grid grid-cols-12 gap-4">
                  <div className="col-span-5 font-medium text-gray-700">Borrower</div>
                  <div className="col-span-2 font-medium text-gray-700 text-right">Loan Amount</div>
                  <div className="col-span-2 font-medium text-gray-700 text-right">Paid</div>
                  <div className="col-span-2 font-medium text-gray-700 text-right">Remaining</div>
                  <div className="col-span-1 font-medium text-gray-700 text-right">Status</div>
                </div>
              </div>
              
              {/* Render only the current loan */}
              <div key={currentLoan.loanId} className="border-b border-gray-200 last:border-b-0 hover:bg-gray-50 transition-colors">
                <div className="px-6 py-4">
                  <div className="grid grid-cols-12 gap-4 items-center">
                    <div className="col-span-5">
                      <div className="flex items-center">
                        <div className="bg-gray-200 border-2 border-dashed rounded-xl w-10 h-10 flex-shrink-0"></div>
                        <div className="ml-4">
                          <h2 className="font-semibold text-gray-900">
                            {currentLoan.member?.firstName || 'N/A'} {currentLoan.member?.lastName || 'N/A'}
                          </h2>
                          <p className="text-sm text-gray-600 truncate max-w-xs">
                            {currentLoan.member?.email || 'No email'}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-right font-medium">
                      {metrics.loanAmount}
                    </div>
                    <div className="col-span-2 text-right text-green-600 font-medium">
                      {metrics.totalPaid}
                    </div>
                    <div className="col-span-2 text-right text-red-600 font-medium">
                      {metrics.remaining}
                    </div>
                    <div className="col-span-1 text-right">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        currentLoan.loanPaid === 'paid' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {currentLoan.loanPaid === 'paid' ? 'Paid' : 'Active'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="px-6 pb-4">
                  <LoanTracker loan={currentLoan} />
                </div>
              </div>
            </>
          )}

          {/* Pagination Controls */}
          {trackedLoans.length > 1 && (
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div className="flex flex-col md:flex-row justify-between items-center">
                <p className="text-sm text-gray-600 mb-2 md:mb-0">
                  Showing loan {currentPage} of {trackedLoans.length}
                </p>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    Page <span className="font-medium mx-1">{currentPage}</span> of <span className="font-medium mx-1">{trackedLoans.length}</span>
                  </div>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === trackedLoans.length}
                    className="px-3 py-1.5 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ledger Tab */}
      {activeTab === 'ledger' && <AdminLedgerPage ledgers={allLedger} />}
    </div>
  );
};
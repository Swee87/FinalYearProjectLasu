import React, { useRef, useState, useMemo } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import ReactPaginate from "react-paginate";

function convertCurrencyString(currencyStr) {
    // Check if currencyStr is valid and convert to string
    if (currencyStr == null || currencyStr === undefined) {
        return 0;
    }
    const str = String(currencyStr);
    const cleanedStr = str.replace(/[^0-9.-]+/g, '');
    const value = parseFloat(cleanedStr);
    return isNaN(value) ? 0 : value;
} 

export const AdminLedgerPage = ({ ledgers }) => {
  const componentsRef = useRef([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatingIndex, setGeneratingIndex] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'paid', 'unpaid'
  
  // Classify ledgers based on payment status
  const { filteredLedgers, paidLedgers, unpaidLedgers } = useMemo(() => {
    const paid = [];
    const unpaid = [];
    
    ledgers.forEach(ledger => {
      if (!ledger.payments || !ledger.loan) {
        unpaid.push(ledger);
        return;
      }
      
      const totalPaid = ledger.payments.reduce((sum, pay) => {
        return sum + convertCurrencyString(pay.amountPaid || 0);
      }, 0);
      
      const loanAmount = convertCurrencyString(ledger.loan.loanAmount || 0);
      const isFullyPaid = totalPaid >= loanAmount;
      
      if (isFullyPaid) {
        paid.push(ledger);
      } else {
        unpaid.push(ledger);
      }
    });
    
    return {
      paidLedgers: paid,
      unpaidLedgers: unpaid,
      filteredLedgers: 
        activeTab === 'paid' ? paid : 
        activeTab === 'unpaid' ? unpaid : 
        ledgers
    };
  }, [ledgers, activeTab]);

  // Only show ONE ledger per page
  const pageCount = filteredLedgers.length;
  const currentLedger = filteredLedgers[currentPage];
  const currentLedgerIndex = currentPage;

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  // ... existing PDF generation functions ...

  // Reset to first page when changing tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(0);
  };

  if (!ledgers || ledgers.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-6">Multi-User Loan Ledger</h1>
        <p className="text-center text-gray-600">No ledgers available.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">Multi-User Loan Ledger</h1>

      {/* Tab Navigation */}
      <div className="flex mb-6 border-b border-gray-200">
        <button
          onClick={() => handleTabChange('all')}
          className={`px-4 py-3 font-medium text-sm ${
            activeTab === 'all'
              ? 'text-blue-600 border-b-2 border-blue-500 bg-blue-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          All Ledgers ({ledgers.length})
        </button>
        <button
          onClick={() => handleTabChange('paid')}
          className={`px-4 py-3 font-medium text-sm ${
            activeTab === 'paid'
              ? 'text-green-600 border-b-2 border-green-500 bg-green-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Fully Paid ({paidLedgers.length})
        </button>
        <button
          onClick={() => handleTabChange('unpaid')}
          className={`px-4 py-3 font-medium text-sm ${
            activeTab === 'unpaid'
              ? 'text-yellow-600 border-b-2 border-yellow-500 bg-yellow-50'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
          }`}
        >
          Unpaid ({unpaidLedgers.length})
        </button>
      </div>

      {/* Empty State */}
      {filteredLedgers.length === 0 && (
        <div className="bg-white rounded-xl shadow-md p-8 text-center mb-10">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            No {activeTab === 'all' ? '' : activeTab} ledgers found
          </h3>
          <p className="text-gray-600 mb-6">
            There are currently no {activeTab === 'all' ? '' : activeTab} loan ledgers.
          </p>
          <button 
            onClick={() => setActiveTab('all')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-6 rounded-lg transition duration-200"
          >
            View All Ledgers
          </button>
        </div>
      )}

      {/* Page indicator */}
      {filteredLedgers.length > 0 && (
        <div className="flex justify-between items-center mb-6">
          <p className="text-sm text-gray-600">
            Showing ledger {currentPage + 1} of {filteredLedgers.length}
          </p>
          {pageCount > 1 && (
            <p className="text-sm text-gray-600">
              Use the navigation below to view other ledgers
            </p>
          )}
        </div>
      )}

      {/* Display current ledger with ALL its content */}
      {currentLedger && (
        <div
          ref={(el) => (componentsRef.current[0] = el)}
          className="bg-white rounded-xl shadow-md p-6 mb-10 border"
          style={{ minHeight: '200px' }}
        >
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-xl font-semibold">
                {currentLedger.userDetails?.FirstName} {currentLedger.userDetails?.LastName}
              </h2>
              <p className="text-gray-600">{currentLedger.userDetails?.email}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePDFDownload(currentLedgerIndex)}
                disabled={isGenerating}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  isGenerating && generatingIndex === currentLedgerIndex
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isGenerating && generatingIndex === currentLedgerIndex ? 'Generating...' : 'Download PDF'}
              </button>
              <button
                onClick={() => handleSimplePDFDownload(currentLedgerIndex)}
                disabled={isGenerating}
                className={`px-4 py-2 rounded font-medium transition-colors ${
                  isGenerating && generatingIndex === currentLedgerIndex
                    ? 'bg-gray-400 cursor-not-allowed text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                Simple PDF
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <p><strong>Loan Amount:</strong> ₦{currentLedger.loan?.loanAmount?.toLocaleString() || 'N/A'}</p>
              <p><strong>Repayment Amount Monthly:</strong> ₦{currentLedger.loan?.repaymentAmount?.toLocaleString() || 'N/A'}</p>
              <p><strong>APPID:</strong> {currentLedger.loan?.member?.appId || 'N/A'}</p>
              <p><strong>MEMBERID:</strong> {currentLedger.loan?.member?.memberId || 'N/A'}</p>
              <p><strong>Staff Type:</strong> {currentLedger.loan?.member?.staffType || 'N/A'}</p>
              <p><strong>Loan Purpose:</strong> {currentLedger.loan?.about || 'N/A'}</p>
              <p><strong>Monthly Savings:</strong> ₦{currentLedger.loan?.monthlySavings?.toLocaleString() || 'N/A'}</p>
            </div>
            <div>
              <p><strong>Total Repayment Months:</strong> {currentLedger.loan?.repayment || 'N/A'}</p>
              <p><strong>Created:</strong> {currentLedger.createdAt ? new Date(currentLedger.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Last Updated:</strong> {currentLedger.updatedAt ? new Date(currentLedger.updatedAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 border-collapse">
              <thead className="bg-gray-100 text-gray-800 uppercase">
                <tr>
                  <th className="py-3 px-4 border border-gray-300">#</th>
                  <th className="py-3 px-4 border border-gray-300">Month</th>
                  <th className="py-3 px-4 border border-gray-300">Year</th>
                  <th className="py-3 px-4 border border-gray-300">Amount Paid</th>
                  <th className="py-3 px-4 border border-gray-300">Date Paid</th>
                  <th className="py-3 px-4 border border-gray-300">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentLedger.payments?.map((pay, idx) => {
                  const isPaid = !!pay.datePaid;
                  return (
                    <tr key={idx} className={isPaid ? 'bg-green-50' : 'bg-yellow-50'}>
                      <td className="py-2 px-4 border border-gray-300">{pay.counter}</td>
                      <td className="py-2 px-4 border border-gray-300">{pay.month}</td>
                      <td className="py-2 px-4 border border-gray-300">{pay.year}</td>
                      <td className="py-2 px-4 border border-gray-300 font-medium">
                        ₦{(pay.amountPaid || 0).toLocaleString()}
                      </td>
                      <td className="py-2 px-4 border border-gray-300">
                        {pay.datePaid ? new Date(pay.datePaid).toLocaleDateString() : 'Pending'}
                      </td>
                      <td className="py-2 px-4 border border-gray-300">
                        {isPaid ? (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                            Paid
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                            Unpaid
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }) || []}
              </tbody>
            </table>
          </div>

          {/* Summary Section */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Paid</p>
              <p className="text-lg font-semibold text-green-600">
                ₦
                {(() => {
                  if (!currentLedger.payments) return '0';
                  const total = currentLedger.payments.reduce((sum, pay) => 
                    sum + convertCurrencyString(pay.amountPaid || 0), 0);
                  return total.toLocaleString();
                })()}
              </p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">Remaining Balance</p>
              <p className="text-lg font-semibold text-red-600">
                ₦
                {(() => {
                  if (!currentLedger.loan || !currentLedger.payments) return 'N/A';
                  const loanAmount = convertCurrencyString(currentLedger.loan.loanAmount || 0);
                  const totalPaid = currentLedger.payments.reduce((sum, pay) => 
                    sum + convertCurrencyString(pay.amountPaid || 0), 0);
                  const remaining = Math.max(0, loanAmount - totalPaid);
                  return remaining.toLocaleString();
                })()}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">Payment Status</p>
              <p className="text-lg font-semibold">
                {(() => {
                  if (!currentLedger.loan || !currentLedger.payments) {
                    return <span className="text-gray-600">N/A</span>;
                  }
                  
                  const loanAmount = convertCurrencyString(currentLedger.loan.loanAmount || 0);
                  const totalPaid = currentLedger.payments.reduce((sum, pay) => 
                    sum + convertCurrencyString(pay.amountPaid || 0), 0);
                  
                  if (totalPaid >= loanAmount) {
                    return (
                      <span className="text-green-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Fully Paid
                      </span>
                    );
                  } else {
                    return (
                      <span className="text-yellow-600 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                        Unpaid
                      </span>
                    );
                  }
                })()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pagination for ledgers */}
      {pageCount > 1 && (
        <div className="mt-6 flex justify-center">
          <ReactPaginate
            previousLabel={"← Previous Ledger"}
            nextLabel={"Next Ledger →"}
            pageCount={pageCount}
            onPageChange={handlePageClick}
            forcePage={currentPage}
            containerClassName={"flex flex-wrap justify-center gap-2 text-sm"}
            pageClassName={"px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"}
            activeClassName={"bg-blue-600 text-white"}
            previousClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
            nextClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
            disabledClassName={"opacity-50 pointer-events-none"}
            marginPagesDisplayed={2}
            pageRangeDisplayed={3}
          />
        </div>
      )}
    </div>
  );
};
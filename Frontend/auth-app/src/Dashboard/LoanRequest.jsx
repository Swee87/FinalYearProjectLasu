
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import toast from "react-hot-toast";
import { CSVLink } from "react-csv";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Tooltip } from 'react-tooltip';
import{useNavigate} from 'react-router-dom';
import { getAllappliedLoan, LoanActions } from '../services/AdminRoutes/ApproveLoan';
import{LoanDetails} from './LoanDetails'
import { LoanHistory } from './LoanHistory';

// Helper function to safely parse currency values
function parseCurrency(value) {
  if (value == null) return 0;
  if (typeof value === 'number') return value;
  
  // Remove non-numeric characters except decimal point
  const numericString = value.toString().replace(/[^\d.]/g, '');
  const parsed = parseFloat(numericString);
  return isNaN(parsed) ? 0 : parsed;
}

function formatDateWithSuffix(dateStr) {
  const date = new Date(dateStr);
  if (isNaN(date)) return 'Due Date not set';

  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();

  const getOrdinal = (n) => {
    if (n > 3 && n < 21) return 'th';
    switch (n % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const ordinal = getOrdinal(day);
  return `${day}${ordinal}, ${month}, ${year}`;
}

// Workflow stages in order
const WORKFLOW = ["pending", "approved", "processing", "disbursed", "ongoing", "completed", "cancelled"];

// Ultra-optimized row component with React.memo
const LoanRow = React.memo(({ loan, isSelected, onCheckboxChange, onQuickMove }) => {
  const { firstName = "N/A", lastName = "N/A", bankName = "N/A", accountNumber = "N/A", phoneNumber = "N/A", memberId, appId } = loan.member || {};
  const handleCheckboxClick = useCallback((e) => {
    e.stopPropagation();
    onCheckboxChange(loan.loanId);
  }, [loan.loanId, onCheckboxChange]);
  const navigate = useNavigate()

  const handleQuickMove = useCallback((e) => {
    e.stopPropagation();
    onQuickMove(loan.loanId);
  }, [loan.loanId, onQuickMove]);

  return (
    <tr className="hover:bg-gray-50 transition-colors duration-100">
      <td className="px-6 py-4 whitespace-nowrap flex items-center">
        <div className="flex items-center space-x-2 mx-3">
          <input
            type="checkbox"
            className="h-4 w-4 accent-blue-600"
            checked={isSelected}
            onChange={handleCheckboxClick}
          />
          <button
            onClick={handleQuickMove}
            className="text-xs bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors duration-100"
            title="Quick move to next stage"
          >
            →
          </button>
        </div>
        {memberId}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{appId}</td>
      <td className="px-6 py-4 whitespace-nowrap">{firstName}</td>
      <td className="px-6 py-4 whitespace-nowrap">{lastName}</td>
      <td className="px-6 py-4 whitespace-nowrap">₦{parseCurrency(loan?.loanAmount).toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap">₦{parseCurrency(loan?.monthlySavings).toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap">{bankName}</td>
      <td className="px-6 py-4 whitespace-nowrap">{accountNumber}</td>
      <td className="px-6 py-4 whitespace-nowrap">{`${firstName} ${lastName}`}</td>
      <td className="px-6 py-4 whitespace-nowrap">{phoneNumber}</td>
      <td className="px-6 py-4 whitespace-nowrap">{new Date(loan.createdAt).toLocaleDateString()}</td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          data-tooltip-id="details-tooltip"
          data-tooltip-content="This is the full loan request details."
          className="flex items-center cursor-pointer text-blue-600 underline"
          onClick={() => navigate('/loanDetails')}
        >
          Details
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">{loan.loanRepaymentDuration}months</td>
      <td className="px-6 py-4 whitespace-nowrap">₦{parseCurrency(loan.repaymentAmount).toLocaleString()}</td>
      <td className="px-6 py-4 whitespace-nowrap">{loan.approvedAt ? formatDateWithSuffix(loan.approvedAt) : 'Approved Date not set'}</td>
      <td className="px-6 py-4 whitespace-nowrap">{loan.dueAt ? formatDateWithSuffix(loan.dueAt) : 'Due Date not set'}</td>
    </tr>
  );
});

export function LoanRequest() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [optimisticUpdates, setOptimisticUpdates] = useState(new Map()); // Track optimistic updates
  const itemsPerPage = 10;
  const csvRef = useRef(null);
  
  const { data: fetchedData, isLoading, error } = useQuery({
    queryKey: ["LoanRequest"],
    queryFn: getAllappliedLoan,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 2 * 60 * 1000, // 2 minutes - reduced for faster updates
    cacheTime: 5 * 60 * 1000, // 5 minutes
    onError: (err) => {
      toast.error(`Loading failed: ${err.message}`);
    },
  });

  // Apply optimistic updates to fetched data
  const loanData = useMemo(() => {
    if (!fetchedData || !Array.isArray(fetchedData)) return [];
    
    return fetchedData.map(loan => {
      const optimisticUpdate = optimisticUpdates.get(loan.loanId);
      if (optimisticUpdate) {
        return { ...loan, ...optimisticUpdate };
      }
      return loan;
    });
  }, [fetchedData, optimisticUpdates]);
  
  // Memoized next status calculation
  const nextStatus = useMemo(() => {
    const currentIndex = WORKFLOW.indexOf(activeTab);
    return currentIndex >= 0 && currentIndex < WORKFLOW.length - 1
      ? WORKFLOW[currentIndex + 1]
      : null;
  }, [activeTab]);
  
  // Ultra-fast optimistic checkbox handler
  const handleCheckboxChange = useCallback((loanId) => {
    setSelectedRows(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(loanId)) {
        newSelected.delete(loanId);
      } else {
        newSelected.add(loanId);
      }
      return newSelected;
    });
  }, []);

  // Ultra-fast select all handler
  const handleSelectAll = useCallback((checked, currentData) => {
    if (checked) {
      const allIds = currentData.map(d => d.loanId);
      setSelectedRows(new Set(allIds));
    } else {
      setSelectedRows(new Set());
    }
  }, []);

  // Ultra-fast tab change handler
  const handleTabChange = useCallback((status) => {
    setActiveTab(status);
    setCurrentPage(1);
    setSelectedRows(new Set());
  }, []);

  // Optimized mutation with background sync
  const { mutate: updateLoanStatus } = useMutation({
    mutationFn: ({ loanIds, newStatus }) => LoanActions(loanIds, newStatus),
    onSuccess: (response, variables) => {
      // Background sync successful - clear optimistic updates for these loans
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        variables.loanIds.forEach(loanId => {
          newMap.delete(loanId);
        });
        return newMap;
      });
      
      // Update query cache with fresh data
      queryClient.invalidateQueries({ queryKey: ["LoanRequest"] });
    },
    onError: (error, variables) => {
      // Revert optimistic updates on error
      setOptimisticUpdates(prev => {
        const newMap = new Map(prev);
        variables.loanIds.forEach(loanId => {
          newMap.delete(loanId);
        });
        return newMap;
      });
      
      toast.error(`Failed to update: ${error.message}`);
    },
  });

  // LIGHTNING-FAST move operation with instant UI feedback
  const handleMoveToNextTab = useCallback((loanIds = null) => {
    if (!nextStatus) return;
    
    const idsToMove = loanIds ? [loanIds] : Array.from(selectedRows);
    if (idsToMove.length === 0) return;

    const currentTimestamp = new Date().toISOString();
    
    // INSTANT optimistic updates - UI responds immediately
    const newOptimisticUpdates = new Map(optimisticUpdates);
    
    idsToMove.forEach(loanId => {
      const loan = loanData.find(l => l.loanId === loanId);
      if (loan) {
        const optimisticLoan = { status: nextStatus };
        
        // Update timestamps based on status
        if (nextStatus === "approved") {
          optimisticLoan.approvedAt = currentTimestamp;
        } else if (nextStatus === "disbursed") {
          optimisticLoan.disbursedAt = currentTimestamp;
          const dueDate = new Date(currentTimestamp);
          dueDate.setMonth(dueDate.getMonth() + (loan.loanRepaymentDuration || 0));
          optimisticLoan.dueAt = dueDate.toISOString();
        } else if (nextStatus === "ongoing") {
          optimisticLoan.ongoingAt = currentTimestamp;
        }
        
        newOptimisticUpdates.set(loanId, optimisticLoan);
      }
    });
    
    // Batch all state updates for maximum speed
    setOptimisticUpdates(newOptimisticUpdates);
    setActiveTab(nextStatus);
    setSelectedRows(new Set());
    setShowModal(false);
    setCurrentPage(1);
    
    // Instant success feedback
    toast.success(`${idsToMove.length} loan(s) moved to "${nextStatus}" instantly!`, {
      duration: 2000,
      style: {
        background: '#10B981',
        color: 'white',
      },
    });

    // Background server sync (non-blocking)
    updateLoanStatus({ loanIds: idsToMove, newStatus: nextStatus });
  }, [nextStatus, selectedRows, loanData, optimisticUpdates, updateLoanStatus]);

  // Quick move handler for individual rows
  const handleQuickMove = useCallback((loanId) => {
    handleMoveToNextTab(loanId);
  }, [handleMoveToNextTab]);

  // Optimized sort handler
  const handleSort = useCallback((columnKey) => {
    setSortColumn(prev => {
      if (prev === columnKey) {
        setSortOrder(order => order === "asc" ? "desc" : "asc");
        return prev;
      } else {
        setSortOrder("asc");
        return columnKey; 
      }
    });
  }, []);

  // Ultra-optimized filtering and sorting with virtualization hints
  const { filteredData, sortedData, paginatedData, totalPages, tabCounts } = useMemo(() => {
    // Pre-calculate tab counts with optimistic updates
    const counts = {};
    WORKFLOW.forEach(status => {
      counts[status] = loanData.filter(loan => loan.status === status).length;
    });

    // Optimized filtering with early returns
    const filtered = loanData.filter((loan) => {
      if (loan.status !== activeTab) return false;
      if (!searchQuery) return true;

      const searchLower = searchQuery.toLowerCase();
      const { member = {}, loanAmount = "N/A", monthlySavings = "N/A", repaymentAmount = "N/A" } = loan;
      const { firstName = "", lastName = "", bankName = "", phoneNumber = "", memberId, appId } = member;

      // Use includes for faster string matching
      return (
        firstName.toLowerCase().includes(searchLower) ||
        lastName.toLowerCase().includes(searchLower) ||
        bankName.toLowerCase().includes(searchLower) ||
        phoneNumber.includes(searchQuery) ||
        memberId?.toString().includes(searchQuery) ||
        appId?.toString().includes(searchQuery) ||
        loanAmount?.toString().includes(searchQuery)
      );
    });

    // Optimized sorting
    const sorted = sortColumn ? [...filtered].sort((a, b) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];
      
      // Handle member properties
      if (!valA && a.member) valA = a.member[sortColumn];
      if (!valB && b.member) valB = b.member[sortColumn];
      
      valA = valA || "";
      valB = valB || "";
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        return sortOrder === "asc" ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }) : filtered;

    // Efficient pagination
    const totalPgs = Math.ceil(sorted.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginated = sorted.slice(startIndex, startIndex + itemsPerPage);

    return {
      filteredData: filtered,
      sortedData: sorted,
      paginatedData: paginated,
      totalPages: totalPgs,
      tabCounts: counts
    };
  }, [loanData, activeTab, searchQuery, sortColumn, sortOrder, currentPage, itemsPerPage]);

  // Optimized CSV data generation
  const csvData = useMemo(() => {
    return paginatedData.map((loan) => {
      const { firstName = "N/A", lastName = "N/A" } = loan.member || {};
      return {
        memberId: loan.member?.memberId || "N/A",
        appId: loan.member?.appId || "N/A",
        loanId: loan.loanId,
        phoneNumber: loan.member?.phoneNumber || "N/A",
        firstName,
        lastName,
        amount: `₦${parseCurrency(loan?.loanAmount).toLocaleString()}`,
        monthlySavings: `₦${parseCurrency(loan?.monthlySavings).toLocaleString()}`,
        bankName: loan.member?.bankName || "N/A",
        accountNumber: loan.member?.accountNumber || "N/A",
        accountName: `${firstName} ${lastName}`,
        date: loan.createdAt,
      };
    });
  }, [paginatedData]);

  // Keyboard shortcuts for power users
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'Enter':
            if (selectedRows.size > 0) {
              e.preventDefault();
              handleMoveToNextTab();
            }
            break;
          case 'a':
            e.preventDefault();
            handleSelectAll(true, paginatedData);
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedRows, paginatedData, handleMoveToNextTab, handleSelectAll]);

  return (
    <div className="container mx-auto p-6">
      {/* Loading indicator */}
      {isLoading && (
        <div className="fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Loading...</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">LOAN REQUESTS</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 transition-colors duration-200">
            All Loans
          </button>
          <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100 transition-colors duration-200">
            Loan Fees
          </button>
          <button 
            onClick={() => csvRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Export Table
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search through list (Ctrl+F)"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Performance Stats */}
      <div className="mb-4 text-sm text-gray-600 flex items-center space-x-4">
        <span>Showing {paginatedData.length} of {filteredData.length} loans</span>
        {optimisticUpdates.size > 0 && (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
            {optimisticUpdates.size} pending sync(s)
          </span>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-6 overflow-x-auto">
          {WORKFLOW.map((status) => {
            const count = tabCounts[status] || 0;
            return (
              <button
                key={status}
                onClick={() => handleTabChange(status)}
                className={`px-4 py-2 font-medium transition-all duration-200 capitalize relative whitespace-nowrap ${
                  activeTab === status
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
                }`}
              >
                {status}
                {count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
                    activeTab === status 
                      ? "bg-blue-600 text-white" 
                      : "bg-gray-300 text-gray-700"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Quick Actions Bar */}
      <div className="mb-4 flex justify-between items-center bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600">
            {selectedRows.size > 0 ? `${selectedRows.size} selected` : 'No items selected'}
          </span>
          {selectedRows.size > 0 && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleMoveToNextTab()}
                disabled={!nextStatus}
                className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 ${
                  !nextStatus
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white hover:scale-105"
                }`}
              >
                ⚡ Move to {nextStatus} (Ctrl+Enter)
              </button>
              <button
                onClick={() => setSelectedRows(new Set())}
                className="px-3 py-1 bg-gray-300 hover:bg-gray-400 text-gray-700 rounded text-sm transition-colors duration-200"
              >
                Clear
              </button>
            </div>
          )}
        </div>
        <div className="text-xs text-gray-500">
          💡 Tip: Use arrow buttons for instant moves, Ctrl+A to select all
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-blue-600"
                    checked={selectedRows.size === paginatedData.length && paginatedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked, paginatedData)}
                  />
                  <span>Member ID</span>
                </div>
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("loanId")}>
                App ID {sortColumn === "loanId" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("firstName")}>
                First Name {sortColumn === "firstName" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("lastName")}>
                Last Name {sortColumn === "lastName" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("loanAmount")}>
                Amount {sortColumn === "loanAmount" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("monthlySavings")}>
                Monthly Savings {sortColumn === "monthlySavings" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("bankName")}>
                Bank Name {sortColumn === "bankName" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("accountNumber")}>
                Account Number {sortColumn === "accountNumber" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Account Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("phoneNumber")}>
                Phone Number {sortColumn === "phoneNumber" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort("createdAt")}>
                Date {sortColumn === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Repayment Duration
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Repayment Amount
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Approved At
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {paginatedData.map((loan) => (
              <LoanRow
                key={loan.loanId}
                loan={loan}
                isSelected={selectedRows.has(loan.loanId)}
                onCheckboxChange={handleCheckboxChange}
                onQuickMove={handleQuickMove}
              />
            ))}
          
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} • {filteredData.length} total loans
        </div>
        <div className="flex space-x-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors duration-200"
          >
            Previous
          </button>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 hover:bg-gray-300 transition-colors duration-200"
          >
            Next
          </button>
        </div>
      </div>

      {/* Tooltip */}
      <Tooltip id="details-tooltip" />

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-2xl transform transition-all duration-300">
            <h2 className="text-xl font-semibold mb-4">Confirm Move</h2>
            <p className="mb-4">
              Are you sure you want to move{" "}
              <strong className="text-blue-600">{selectedRows.size}</strong> selected request(s) to{" "}
              <strong className="text-green-600">{nextStatus?.charAt(0).toUpperCase() + nextStatus?.slice(1)}</strong>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => handleMoveToNextTab()}
                disabled={!nextStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors duration-200"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden CSV Link */}
      <CSVLink
        data={csvData}
        filename={`loan_requests_${activeTab}_${new Date().toISOString().split('T')[0]}.csv`}
        className="hidden"
        ref={csvRef}
      />

      {/* Bulk Actions Footer */}
      <div className="mt-6 flex justify-between items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            Bulk Actions:
          </div>
          <button
            onClick={() => {
              if (selectedRows.size > 0 && nextStatus) {
                setShowModal(true);
              }
            }}
            disabled={selectedRows.size === 0 || !nextStatus}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              selectedRows.size === 0 || !nextStatus
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white hover:scale-105"
            }`}
          >
            Move to{" "}
            {nextStatus
              ? nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)
              : "—"}
            {selectedRows.size > 0 && (
              <span className="ml-2 bg-blue-800 text-white px-2 py-1 rounded-full text-xs">
                {selectedRows.size}
              </span>
            )}
          </button>
          
          <button
            onClick={() => handleMoveToNextTab()}
            disabled={selectedRows.size === 0 || !nextStatus}
            className={`px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium ${
              selectedRows.size === 0 || !nextStatus
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white hover:scale-105"
            }`}
            title="Instant move without confirmation"
          >
            ⚡ Quick Move
            {selectedRows.size > 0 && (
              <span className="ml-2 bg-green-800 text-white px-2 py-1 rounded-full text-xs">
                {selectedRows.size}
              </span>
            )}
          </button>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={() => csvRef.current?.click()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
          >
            📊 Export CSV
          </button>
          
          <button
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ["LoanRequest"] });
              toast.success("Data refreshed!");
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Performance Metrics (Development Mode) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
          <div className="grid grid-cols-4 gap-4">
            <div>Total Loans: {loanData.length}</div>
            <div>Filtered: {filteredData.length}</div>
            <div>Selected: {selectedRows.size}</div>
            <div>Optimistic Updates: {optimisticUpdates.size}</div>
          </div>
        </div>
      )}
    </div>
  );
}
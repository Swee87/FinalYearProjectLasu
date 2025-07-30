import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LoanRequest } from './LoanRequest';
import { getAllappliedLoan, getTrackedLoans } from '../services/AdminRoutes/ApproveLoan';
import { Notification } from '../services/Notification.js'
import { ErrorPage } from '../components/Error';


const ACTIVE_STATUSES = new Set(["approved", "processing", "disbursed", "ongoing", "pending"]);
const CARD_LABELS = ["Pending", "Approved", "Processing", "Disbursed", "Ongoing", "Completed", "Active", "Cancelled"];

export function Loan() {
  const [hasError, setHasError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isManualRetry, setIsManualRetry] = useState(false);
  const[notify, setNotify] = useState([])

  // Compute query enabled flag
  const isQueryEnabled = useMemo(() => {
    return !hasError || isManualRetry;
  }, [hasError, isManualRetry]);

  const {
    data: loans = [],
    isLoading,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['LoanRequest'],
    queryFn: getAllappliedLoan,
    enabled: isQueryEnabled,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,

    onError: (err) => {
      console.error('Loan fetch error:', err.message);
      setHasError(true);
      setRetryCount((prev) => prev + 1);
    },

    onSuccess: () => {
      if (hasError) {
        setHasError(false);
        setRetryCount(0);
        setIsManualRetry(false);
      }
    },

    refetchOnMount: false,
  });

  const arrayLoans = Array.isArray(loans.data) ? loans.data : [];
console.log("All Loans:", loans.userId);
  const {data:information, isLoading:isGetting,} = useQuery({
  queryKey:['trackedLoan'],
  queryFn:getTrackedLoans,
  enabled: isQueryEnabled,
    refetchOnWindowFocus: false,
    refetchInterval: false,
    refetchIntervalInBackground: false,
    retry: false,
    staleTime: 30000,
    cacheTime: 5 * 60 * 1000,
  })

  
console.log("Tracked Loans:", information);
  const handleManualRetry = useCallback(() => {
    setIsManualRetry(true);
  }, []);

  const counts = useMemo(() => {
    const c = Array(8).fill(0);
    let activeCount = 0;

    for (const loan of loans) {
      const s = loan.status?.toLowerCase();
      const isActive = loan.userId === loans.userId; // Check if the loan belongs to the current user

      switch (s) {
        case 'pending': c[0]++; activeCount++; break;
        case 'approved': c[1]++; activeCount++; break;
        case 'processing': c[2]++; activeCount++; break;
        case 'disbursed': c[3]++; activeCount++; break;
        case 'ongoing': c[4]++; activeCount++; break;
        case 'completed': c[5]++; break;
        case 'cancelled': c[7]++; break;
        default:
          console.warn(`Unknown loan status: ${s}`);
      }
    }

    c[6] = activeCount;
    return c;
  }, [loans]);


  if (isLoading && !isRefetching) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
        <div className="text-gray-600">Loading loan details...</div>
      </div>
    );
  }

  if (error && !isManualRetry) {
    const errorMessage = error?.message || 'Failed to load loan data';
    const isNetworkError = !navigator.onLine || error?.code === 'NETWORK_ERROR';

    return (
      <ErrorPage
        title="Failed to Load Loan Data"
        message={`${errorMessage}${retryCount > 0 ? ` (Attempt ${retryCount})` : ''}`}
        onRetry={handleManualRetry}
        showHomeButton
        additionalInfo={
          <div className="text-sm text-gray-500 mt-2">
            {isNetworkError && "Please check your internet connection."}
            {hasError && " Auto-refresh has been disabled. Click retry to manually refresh."}
          </div>
        }
      />
    );
  }

  return (
    <div className="flex flex-col items-center justify-center bg-gray-50 p-6 mt-0">
      {hasError && (
        <div className="mb-4 px-4 py-2 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded-md text-sm">
          ⚠️ Auto-refresh disabled due to connection issues.
          <button
            onClick={handleManualRetry}
            className="ml-2 underline hover:no-underline"
            disabled={isRefetching}
          >
            {isRefetching ? 'Retrying...' : 'Retry now'}
          </button>
        </div>
      )}

      <div className="flex items-center justify-between w-full max-w-4xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-8">Loan Summary</h2>

        {isRefetching && (
          <div className="flex items-center text-sm text-gray-500 mb-8">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            Updating...
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 max-w-6xl mx-auto">
        {CARD_LABELS.map((label, i) => (
          <div
            key={label}
            className="bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg p-4 text-center border border-gray-200"
          >
            <div className="text-xl font-bold text-blue-600 mb-1">
              {counts[i] || 0}
            </div>
            <div className="text-sm font-medium text-gray-700">
              {label}
            </div>
          </div>
        ))}
      </div>
      <LoanRequest />
    </div>
  );
}

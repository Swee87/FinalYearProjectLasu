import React from 'react';
import { LoanHistory } from './LoanHistory';
import { getAllappliedLoan } from '../services/AdminRoutes/ApproveLoan';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

export function FetchLoanHistory() {
  const {
    data: fetchedData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['LoanRequest'],
    queryFn: getAllappliedLoan,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 2 * 60 * 1000,
    cacheTime: 5 * 60 * 1000,
    onError: (err) => {
      toast.error(`Loading failed: ${err.message}`);
    },
  });

  if (isLoading) {
    return <div className="p-6 text-gray-600">Loading loan requests...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600 font-medium">Failed to fetch loan requests.</div>;
  }

  const allLoanIds = Array.isArray(fetchedData)
    ? fetchedData.map((data) => data.loanId).filter(Boolean)
    : [];

  console.log("Fetched loan IDs:", allLoanIds);

  return (
    <div>
      <LoanHistory ArrayofLoanId={allLoanIds}/>
    </div>
  );
}

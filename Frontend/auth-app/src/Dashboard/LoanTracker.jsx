import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchLoanTrack, updatePayment } from '../services/TrackedLoan';

const months = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const LoanTracker = ({ loan }) => {
  const queryClient = useQueryClient();
  const loanId = loan.loanId;
  const repaymentAmount = loan.repaymentAmount;
  const [showToast, setShowToast] = useState(false);
  const [currentProcessing, setCurrentProcessing] = useState(null);

  const { 
    data: allLoanTrack, 
    isLoading, 
    isError, 
    error,
    refetch
  } = useQuery({
    queryKey: ['loanTrack', loanId],
    queryFn: () => fetchLoanTrack(loanId),
    enabled: !!loanId && loan?.status === 'disbursed',
    refetchOnWindowFocus: true,
    retry: 2,
    staleTime: 5 * 60 * 1000,
    onSuccess: (data) => {
      console.log('LoanTrack Data:', data);
    },
    onError: (err) => {
      console.error('LoanTrack Fetch Error:', err.message);
    }
  });
  const loanTrack = allLoanTrack?.data;

  const updatePaymentMutation = useMutation({
    mutationFn: updatePayment,
    onMutate: async ({ month, year }) => {
      setCurrentProcessing({ month, year });
      await queryClient.cancelQueries({ queryKey: ['loanTrack', loanId] });
      const previousLoanTrack = queryClient.getQueryData(['loanTrack', loanId]);
      if (previousLoanTrack && previousLoanTrack.data && Array.isArray(previousLoanTrack.data.payments)) {
        queryClient.setQueryData(['loanTrack', loanId], (old) => {
          const updatedPayments = old.data.payments.map(payment => 
            payment.month === month && payment.year === year
              ? { ...payment, paidPerMonth: true, datePaid: new Date() }
              : payment
          );
          return { ...old, data: { ...old.data, payments: updatedPayments } };
        });
      }
      return { previousLoanTrack };
    },
    onSuccess: (data) => {
      console.log('Mutation Success Data:', data);

      // Update the cache with the new payment state from the server
      queryClient.setQueryData(['loanTrack', loanId], (old) => ({
        ...old,
        data: {
          ...old?.data,
          payments: data?.updatedPayments || old?.data?.payments
        }
      }));

      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    },
    onError: (err, variables, context) => {
      if (context?.previousLoanTrack) {
        queryClient.setQueryData(['loanTrack', loanId], context.previousLoanTrack);
      }
      console.error('Payment Update Error:', err.message);
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ['trackedLoans'] });
      setCurrentProcessing(null);
    }
  });

  const handlePaymentUpdate = (month, year) => {
    console.log('Initiating Payment Update:', { loanId, month, year });
    updatePaymentMutation.mutate({ loanId, month, year , repaymentAmount });
    setCurrentProcessing({ month, year });
  };

  const getProgress = () => {
    if (!loanTrack || !loanTrack.payments || !Array.isArray(loanTrack.payments)) return 0;
    const paidCount = loanTrack.payments.filter(p => p.paidPerMonth).length;
    return Math.round((paidCount / loan.repayment) * 100);
  };

  if (loan.status !== 'disbursed') {
    return (
      <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
        <p>Loan not yet disbursed (Status: {loan.status}). Tracking will begin after disbursement.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
        <p>Error loading payment data: {error.message}</p>
        <button 
          onClick={refetch}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded-md text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 relative">
      {showToast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg z-50">
          Payment marked as paid successfully!
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold text-gray-800">
          Repayment Timeline - {loan.repayment} months
        </h3>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          {getProgress()}% Complete
        </span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-green-600 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${getProgress()}%` }}
        ></div>
      </div>

      {(!loanTrack?.payments || !Array.isArray(loanTrack.payments) || loanTrack.payments.length === 0) && (
        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 text-yellow-700">
          <p>No payment schedule available for this loan. Please ensure the loan track is created or contact support.</p>
          <button
            onClick={() => {
              refetch();
            }}  
            className="mt-2 px-3 py-1 bg-yellow-600 text-white rounded-md text-sm"
          >
            Refresh
          </button>
        </div>
      )}

      {loanTrack?.payments && Array.isArray(loanTrack.payments) && loanTrack.payments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loanTrack.payments.map((payment, idx) => {
            const isFirstUnpaid = !payment.paidPerMonth && loanTrack.payments.slice(0, idx).every(p => p.paidPerMonth);
            return (
              <div
                key={`${payment.month}-${payment.year}`}
                className={`border rounded-lg p-4 transition-all relative ${
                  payment.paidPerMonth
                    ? 'bg-green-50 border-green-200'
                    : isFirstUnpaid
                    ? 'bg-blue-50 border-blue-200 shadow-lg'
                    : 'bg-white border-gray-200 hover:shadow-md'
                }`}
              >
                {isFirstUnpaid && (
                  <span className="absolute top-2 right-2 text-xs text-blue-600 font-medium bg-blue-100 px-2 py-1 rounded-full">
                    Next Payment
                  </span>
                )}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {payment.month} {payment.year}
                    </h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {payment.paidPerMonth && payment.datePaid
                        ? `Paid on ${new Date(payment.datePaid).toLocaleDateString()}`
                        : `Due by end of ${payment.month}`}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    payment.paidPerMonth
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {payment.paidPerMonth ? 'Paid' : 'Pending'}
                  </span>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold">
                    {repaymentAmount}
                  </span>
                  {!payment.paidPerMonth && (
                    <button
                      onClick={() => handlePaymentUpdate(payment.month, payment.year)}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium flex items-center gap-2 transition-colors w-full sm:w-auto"
                      disabled={updatePaymentMutation.isPending}
                    >
                      {currentProcessing && currentProcessing.month === payment.month && currentProcessing.year === payment.year ? (
                        'Processing...'
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                          Mark as Paid
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {getProgress() === 100 && (
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
          <h4 className="font-semibold text-green-800 text-lg">
            Loan Fully Repaid!
          </h4>
          <p className="text-green-700">
            All payments completed. Loan status has been updated to "Paid".
          </p>
        </div>
      )}
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getAdminTransactions } from '../services/Paystackapi';
import toast from 'react-hot-toast';

export const AdminTransactions = () => {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
  } = useQuery({
    queryKey: ['admin-transactions', page],
    queryFn: () => getAdminTransactions({ page }),
    keepPreviousData: true,
    retry: 1,
    onError: (err) => {
      toast.error(`Error fetching data: ${err.message}`);
    }
  });

  // SSE setup for real-time update
  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/payStackPayment/admin/subscribe", {
      withCredentials: true
    });

    eventSource.onmessage = (e) => {
      const newTx = JSON.parse(e.data);
      toast.success(` New payment from ${newTx?.customer?.first_name || "Unknown"} received`);
      queryClient.invalidateQueries({ queryKey: ['admin-transactions'] });
    };

    eventSource.onerror = (err) => {
      console.error('SSE error:', err);
      toast.error(" Real-time connection lost");
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [queryClient]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-indigo-700">User Payments</h1>

      {isLoading ? (
        <p className="text-gray-500">Loading...</p>
      ) : isError ? (
        <p className="text-red-600 font-medium">Error: {error.message}</p>
      ) : (
        <>
          <div className="overflow-x-auto bg-white shadow rounded-lg">
            <table className="min-w-full text-sm text-left">
              <thead className="bg-indigo-700 text-white">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">Email</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Paid At</th>
                  <th className="px-4 py-2">Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.transactions.map((tx) => (
                  <tr key={tx._id}>
                    <td className="px-4 py-2">{tx.customer?.first_name} {tx.customer?.last_name}</td>
                    <td className="px-4 py-2">{tx.customer?.email}</td>
                    <td className="px-4 py-2">₦{(tx.amount / 100).toLocaleString()}</td>
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        tx.status === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{new Date(tx.paidAt).toLocaleString()}</td>
                    <td className="px-4 py-2">{tx.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-center items-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => {
                setPage((p) => Math.max(p - 1, 1));
                toast('⬅️ Page changed');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Prev
            </button>
            <span className="text-sm font-medium">Page {data.currentPage} of {data.totalPages}</span>
            <button
              disabled={page === data.totalPages}
              onClick={() => {
                setPage((p) => Math.min(p + 1, data.totalPages));
                toast('➡️ Page changed');
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>

          {isFetching && <p className="text-xs text-gray-500 mt-2">Refreshing...</p>}
        </>
      )}
    </div>
  );
};



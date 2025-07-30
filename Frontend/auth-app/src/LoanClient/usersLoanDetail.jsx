import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserReport } from "../services/UsersReport";
import { format } from "date-fns";
import { formatCurrency, convertCurrencyString } from "../helper";
import toast from "react-hot-toast";
import { FiLoader } from "react-icons/fi";
import { Loader2 } from "lucide-react";
export function  UserLoanDetails() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["userLoanDetails"],
    queryFn: getUserReport,
    retry: 1,
    onError: () => toast.error("Failed to fetch loan details."),
  });

  if (isLoading) {
    return (
      <div className="text-center py-10 text-gray-500">Loading loan details...</div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center text-red-600 py-10">
        Unable to load loan information.
      </div>
    );
  }

  const unpaidLoanTracks = (data.loanTracks || []).filter((track) =>
    track.payments.some((p) => !p.paidPerMonth)
  );

  return (
    <section className="max-w-5xl mx-auto p-6 bg-white rounded-lg shadow-md mt-8">
      <h2 className="text-2xl font-bold text-indigo-700 mb-6">
        Active Loan Repayment Details
      </h2>

      {unpaidLoanTracks.length === 0 ? (
        <p className="text-gray-600 text-sm">No unpaid or active loan repayments.</p>
      ) : (
        unpaidLoanTracks.map((track) => {
          const loanAmount = convertCurrencyString(track.loan?.loanAmount);
          const repayment = track.loan?.repayment;

          return (
            <div key={track._id} className="mb-10">
              <div className="flex flex-col sm:flex-row justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    Loan: {formatCurrency(loanAmount)}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Duration: {repayment} months
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    Applied on:{" "}
                    {track.loan?.createdAt
                      ? format(new Date(track.loan?.createdAt), "PPP")
                      : "N/A"}
                  </span>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border text-sm">
                  <thead>
                    <tr className="bg-gray-50 text-left">
                      <th className="py-2 px-3">Month</th>
                      <th className="py-2 px-3">Amount</th>
                      <th className="py-2 px-3">Paid Date</th>
                      <th className="py-2 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {track.payments.map((payment) => (
                      <tr
                        key={payment._id}
                        className="border-t hover:bg-gray-50"
                      >
                        <td className="py-2 px-3">
                          {payment.month} {payment.year}
                        </td>
                        <td className="py-2 px-3 font-medium">
                          {formatCurrency(convertCurrencyString(payment.amountPaid))}
                        </td>
                        <td className="py-2 px-3">
                          {payment.datePaid
                            ? format(new Date(payment.datePaid), "PPP")
                            : "N/A"}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${
                              payment.paidPerMonth
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {payment.paidPerMonth ? "Paid" : "Pending"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })
      )}
    </section>
  );
}

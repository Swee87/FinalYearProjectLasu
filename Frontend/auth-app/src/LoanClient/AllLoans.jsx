import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getAllUserLoans } from "../services/UserLoans";
import ReactPaginate from "react-paginate";
import { Loader2 } from "lucide-react";

const statuses = ["pending", "approved", "processing", "disbursed", "ongoing", "completed", "cancelled"];
const paidStates = ["paid", "not_paid"];
const sortOptions = [
  { label: "Newest First", value: "desc" },
  { label: "Oldest First", value: "asc" },
];

export function AllLoan() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["userLoans"],
    queryFn: getAllUserLoans,
  });

  const [currentPage, setCurrentPage] = useState(0);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPaid, setFilterPaid] = useState("");
  const [sortOrder, setSortOrder] = useState("desc");

  const allData = Array.isArray(data?.loans) ? data.loans : [];
  console.log("All Loans Data:", allData);

  const filteredData = useMemo(() => {
    return allData
      .filter((loan) => {
        return (
          (!filterStatus || loan.status === filterStatus) &&
          (!filterPaid || loan.LoanPaid === filterPaid)
        );
      })
      .sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
      });
  }, [allData, filterStatus, filterPaid, sortOrder]);

  // Only show ONE loan per page
  const pageCount = filteredData.length;
  const currentLoan = filteredData[currentPage];

  const handlePageClick = ({ selected }) => {
    setCurrentPage(selected);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-indigo-700">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading your loan info...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-10 text-red-600 font-semibold">
        Could not fetch your loans. Try again later.
      </div>
    );
  }

  return (
    <div className="px-4 py-10 max-w-6xl mx-auto">
      <h2 className="text-xl font-bold text-indigo-700 mb-6">
        Your Loan Repayment Summary
      </h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <select className="border rounded px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>

        <select className="border rounded px-3 py-2 text-sm" value={filterPaid} onChange={(e) => setFilterPaid(e.target.value)}>
          <option value="">All Payment States</option>
          {paidStates.map((state) => (
            <option key={state} value={state}>{state.toUpperCase()}</option>
          ))}
        </select>

        <select className="border rounded px-3 py-2 text-sm" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
          {sortOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {filteredData.length === 0 ? (
        <p className="text-gray-600">No loans match your filter.</p>
      ) : (
        <>
          {/* Page indicator */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">
              Showing loan {currentPage + 1} of {filteredData.length}
            </p>
            {pageCount > 1 && (
              <p className="text-sm text-gray-600">
                Use the navigation below to view other loans
              </p>
            )}
          </div>

          {/* Display current loan with ALL its monthly breakdown */}
          {currentLoan && (
            <div className="bg-white shadow rounded-lg border border-gray-200">
              <div className="px-4 py-4 border-b border-gray-100 bg-indigo-50">
                <h3 className="text-indigo-700 font-semibold text-sm sm:text-base">
                  Loan #{currentPage + 1} — {currentLoan.loanAmount}
                </h3>
                <p className="text-sm text-gray-600">
                  Duration: {currentLoan.repayment} months | Monthly: {currentLoan.repaymentAmount} | Status: {currentLoan.status}
                </p>
                <p className="text-sm mt-1">
                  Total Paid: <span className="text-green-600 font-semibold">₦{currentLoan.totalPaid}</span>
                </p>
                
                {/* Progress bar */}
                {(() => {
                  const paidCount = currentLoan.monthlyBreakdown?.filter((entry) => entry.paidPerMonth).length || 0;
                  const progressPercent = Math.min(100, (paidCount / currentLoan.repayment) * 100).toFixed(0);
                  return (
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-indigo-700 h-3 rounded-full" style={{ width: `${progressPercent}%` }}></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{progressPercent}% completed ({paidCount} of {currentLoan.repayment} months paid)</p>
                    </div>
                  );
                })()}
              </div>

              {/* Complete monthly breakdown table */}
              <div className="overflow-x-auto px-4 py-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Complete Monthly Breakdown ({currentLoan.monthlyBreakdown?.length || 0} entries)
                </h4>
                
                <table className="min-w-full text-sm text-left text-gray-700">
                  <thead>
                    <tr className="text-xs bg-gray-100">
                      <th className="px-3 py-2">Month</th>
                      <th className="px-3 py-2">Year</th>
                      <th className="px-3 py-2">Amount Paid</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLoan.monthlyBreakdown && currentLoan.monthlyBreakdown.length > 0 ? (
                      currentLoan.monthlyBreakdown.map((entry, idx) => (
                        <tr key={idx} className="border-b hover:bg-gray-50">
                          <td className="px-3 py-2">{entry.month}</td>
                          <td className="px-3 py-2">{entry.year}</td>
                          <td className="px-3 py-2">{entry.amountPaid}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              entry.paidPerMonth
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-600"
                            }`}>
                              {entry.paidPerMonth ? "PAID" : "UNPAID"}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="px-3 py-4 text-center text-gray-500">
                          No monthly breakdown available for this loan
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination for loans */}
          {pageCount > 1 && (
            <div className="mt-6 flex justify-center">
              <ReactPaginate
                previousLabel={"← Previous Loan"}
                nextLabel={"Next Loan →"}
                pageCount={pageCount}
                onPageChange={handlePageClick}
                forcePage={currentPage}
                containerClassName={"flex space-x-2 text-sm"}
                pageClassName={"px-3 py-1 border border-gray-300 rounded hover:bg-gray-100"}
                activeClassName={"bg-indigo-700 text-white"}
                previousClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
                nextClassName={"px-3 py-1 border rounded hover:bg-gray-100"}
                disabledClassName={"opacity-50 pointer-events-none"}
                marginPagesDisplayed={2}
                pageRangeDisplayed={3}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
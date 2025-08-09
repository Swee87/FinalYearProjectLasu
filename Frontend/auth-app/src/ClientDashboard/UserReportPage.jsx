import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getUserReport } from "../services/UsersReport";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { FiDownload, FiPrinter, FiChevronLeft, FiChevronRight } from "react-icons/fi";
import ReactPaginate from "react-paginate";
import { formatCurrency, convertCurrencyString } from "../helper";

// Print/download functionality
const handlePrint = () => window.print();
const handleDownloadPDF = () => {
  toast.success("PDF download started");
};

// Items per page
const ITEMS_PER_PAGE = 5;

// Paginated list component (generic)
const PaginatedList = ({ items, children, title }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const handlePageChange = (selectedPage) => {
    setCurrentPage(selectedPage.selected);
  };

  const offset = currentPage * ITEMS_PER_PAGE;
  const currentItems = items.slice(offset, offset + ITEMS_PER_PAGE);
  const pageCount = Math.ceil(items.length / ITEMS_PER_PAGE);

  if (items.length <= ITEMS_PER_PAGE) {
    return <>{children(items)}</>;
  }

  return (
    <>
      {children(currentItems)}
      {pageCount > 1 && (
        <div className="flex justify-center mt-6">
          <ReactPaginate
            previousLabel={<FiChevronLeft size={16} />}
            nextLabel={<FiChevronRight size={16} />}
            breakLabel="..."
            pageCount={pageCount}
            marginPagesDisplayed={1}
            pageRangeDisplayed={2}
            onPageChange={handlePageChange}
            containerClassName="inline-flex items-center space-x-1 text-sm"
            pageClassName=""
            pageLinkClassName="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition"
            previousClassName=""
            previousLinkClassName="flex items-center justify-center w-8 h-8 border border-gray-300 rounded hover:bg-gray-100 transition"
            nextClassName=""
            nextLinkClassName="flex items-center justify-center w-8 h-8 border border-gray-300 rounded hover:bg-gray-100 transition"
            breakClassName="px-3 py-1 text-gray-500"
            activeClassName="bg-indigo-600 text-white border-indigo-600"
            disabledClassName="opacity-50 cursor-not-allowed"
            renderOnZeroPageCount={null}
            forcePage={currentPage}
          />
        </div>
      )}
    </>
  );
};

export function UserReportPage() {
  const { data, error, isLoading } = useQuery({
    queryKey: ["userReport"],
    queryFn: getUserReport,
    retry: 1,
    onError: () => toast.error("Failed to load financial statement"),
  });
console.log("User Report Data:", data);
  if (isLoading)
    return <div className="text-center py-10 text-gray-600">Generating financial statement...</div>;
  if (error || !data)
    return <div className="text-red-600 text-center py-10">Unable to load financial information.</div>;

  const { userReport, cooperativeMembers, savingsTracks, loans, loanTracks } = data;

  // Flatten savings payments for pagination
  const allSavingsPayments = savingsTracks?.flatMap((track) =>
    track.payments.map((payment) => ({
      ...payment,
      memberId: track.memberId,
    }))
  ) || [];

  // Flatten loan payments for pagination
  const allLoanPayments = loanTracks?.flatMap((track) =>
    track.payments.map((payment) => ({
      ...payment,
      loanId: track.loan?._id,
      loanAmount: track.loan?.loanAmount,
      repayment: track.loan?.repayment,
    }))
  ) || [];

  return (
    <div className="max-w-6xl mx-auto p-4 bg-white print:p-0 print:max-w-none">
      {/* Statement Header */}
      <div className="print:hidden flex flex-col sm:flex-row justify-between items-center mb-8 border-b pb-4 gap-4">
        <h1 className="text-2xl font-bold text-gray-800 text-center sm:text-left"> General Report</h1>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            <FiDownload className="mr-2" /> Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            <FiPrinter className="mr-2" /> Print
          </button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="mb-10 p-6 border border-gray-200 rounded-lg print:border-0 print:p-0">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Account Holder</h2>
            <p className="text-gray-900">{userReport?.user?.FirstName} {userReport?.user?.LastName}</p>
            <p className="text-gray-600 text-sm">{userReport?.user?.email}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Statement Period</h2>
            <p className="text-gray-900">
              {userReport?.lastUpdated && !isNaN(new Date(userReport?.lastUpdated))
                ? format(new Date(userReport?.lastUpdated), "MMM dd, yyyy")
                : "N/A"}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg print:border print:border-gray-200">
            <h2 className="text-lg font-semibold text-gray-700 mb-1">Available Balance</h2>
            <p className="text-2xl font-bold text-blue-800">
              {formatCurrency(convertCurrencyString(userReport?.totalSaved))}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700">Withdrawable Balance</h3>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {formatCurrency(convertCurrencyString(userReport?.withdrawableBalance))}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-700">Total Savings</h3>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {formatCurrency(userReport?.totalSaved)}
            </p>
          </div>
        </div>
      </div>

      {/* Cooperative Membership */}
      {cooperativeMembers?.length > 0 && (
        <SectionContainer title="Cooperative Membership">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <TableHeader>Member ID</TableHeader>
                  <TableHeader>Bank Details</TableHeader>
                  <TableHeader>Monthly Savings</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </thead>
              <tbody>
                {cooperativeMembers.map((member) => (
                  <tr key={member._id} className="border-b hover:bg-gray-50">
                    <TableData>
                      <div className="font-medium">{member.memberId}</div>
                      <div className="text-sm text-gray-500">{member.appId}</div>
                    </TableData>
                    <TableData>
                      <div>{member.bankName}</div>
                      <div className="text-sm text-gray-600">{member.accountNumber}</div>
                    </TableData>
                    <TableData className="font-medium">
                      {formatCurrency(member.monthlySavings)}
                      <div className="text-sm text-gray-600 capitalize">{member.SavingsType}</div>
                    </TableData>
                    <TableData>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          member.isVerified
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {member.isVerified ? "Verified" : "Pending"}
                      </span>
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionContainer>
      )}

      {/* Savings History */}
      {allSavingsPayments.length > 0 && (
        <SectionContainer title="Savings History">
          <PaginatedList items={allSavingsPayments} title="Savings History">
            {(payments) => (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <TableHeader>Period</TableHeader>
                      <TableHeader>Amount</TableHeader>
                      <TableHeader>Date</TableHeader>
                      <TableHeader>Status</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment._id} className="border-b hover:bg-gray-50">
                        <TableData>
                          {payment.month} {payment.year}
                        </TableData>
                        <TableData className="font-medium">
                          {formatCurrency(payment.amountPaid)}
                        </TableData>
                        <TableData>
                          {payment.datePaid
                            ? format(new Date(payment.datePaid), "MMM dd, yyyy")
                            : "N/A"}
                        </TableData>
                        <TableData>
                          <span
                            className={`px-2 py-1 rounded-full text-xs ${
                              payment.paidPerMonth
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {payment.paidPerMonth ? "Paid" : "Pending"}
                          </span>
                        </TableData>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </PaginatedList>
        </SectionContainer>
      )}

      {/* Loan Accounts */}
      {loans?.length > 0 && (
        <SectionContainer title="Loan Accounts">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <TableHeader>Loan Amount</TableHeader>
                  <TableHeader>Term</TableHeader>
                  <TableHeader>Monthly Payment</TableHeader>
                  <TableHeader>Purpose</TableHeader>
                  <TableHeader>Status</TableHeader>
                </tr>
              </thead>
              <tbody>
                {loans.map((loan) => (
                  <tr key={loan._id} className="border-b hover:bg-gray-50">
                    <TableData className="font-medium">
                      {formatCurrency(convertCurrencyString(loan.loanAmount))}
                    </TableData>
                    <TableData>
                      {loan.repayment} months
                    </TableData>
                    <TableData className="font-medium">
                      {formatCurrency(convertCurrencyString(loan.repaymentAmount))}
                    </TableData>
                    <TableData className="text-gray-600">
                      {loan.about || "N/A"}
                    </TableData>
                    <TableData>
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          loan.status === "active"
                            ? "bg-blue-100 text-blue-800"
                            : loan.status === "completed"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {loan.status}
                      </span>
                    </TableData>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionContainer>
      )}

      {/* Loan Repayment History */}
      {allLoanPayments.length > 0 && (
        <SectionContainer title="Loan Repayment History">
          <PaginatedList items={allLoanPayments} title="Loan Repayments">
            {(payments) => (
              <>
                {payments.map((payment) => (
                  <div key={payment._id} className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex flex-col sm:flex-row justify-between mb-3 text-sm text-gray-700">
                      <span className="font-medium">
                        Loan: {formatCurrency(convertCurrencyString(payment.loanAmount) || 0)}
                      </span>
                      <span>Term: {payment.repayment || 0} months</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                      <div>
                        <strong>Installment:</strong> {payment.month} {payment.year}
                      </div>
                      <div>
                        <strong>Amount:</strong>{" "}
                        {formatCurrency(convertCurrencyString(payment.amountPaid))}
                      </div>
                      <div>
                        <strong>Paid Date:</strong>{" "}
                        {payment.datePaid
                          ? format(new Date(payment.datePaid), "MMM dd, yyyy")
                          : "N/A"}
                      </div>
                      <div>
                        <strong>Status:</strong>{" "}
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs ${
                            payment.paidPerMonth
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {payment.paidPerMonth ? "Paid" : "Due"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </PaginatedList>
        </SectionContainer>
      )}

      {/* Statement Footer */}
      <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm print:mt-8">
        <p>Generated on: {format(new Date(), "MMM dd, yyyy 'at' h:mm a")}</p>
        <p className="mt-2">This is an official financial statement from Gbewa Cooperative</p>
      </div>
    </div>
  );
}

// Reusable components
const SectionContainer = ({ title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">{title}</h2>
    {children}
  </div>
);

const TableHeader = ({ children }) => (
  <th className="text-left py-3 px-4 font-medium text-gray-700">{children}</th>
);

const TableData = ({ children, className = "" }) => (
  <td className={`py-3 px-4 ${className}`}>{children}</td>
);








// import React from "react";
// import { useQuery } from "@tanstack/react-query";
// import { getUserReport } from "../services/UsersReport";
// import { format } from "date-fns";
// import toast from "react-hot-toast";
// import { FiDownload, FiPrinter } from "react-icons/fi";
// import { formatCurrency, convertCurrencyString } from "../helper"; // Adjust the import path as needed

// // Helper function for currency formatting

// // Print/download functionality
// const handlePrint = () => window.print();
// const handleDownloadPDF = () => {
//   // PDF generation implementation would go here
//   toast.success("PDF download started");
// };

// export function UserReportPage() {
//   const { data, error, isLoading } = useQuery({
//     queryKey: ["userReport"],
//     queryFn: getUserReport,
//     retry: 1,
//     onError: () => toast.error("Failed to load financial statement"),
//   });
//   console.log("User Report Data:", data);

//   if (isLoading) return <div className="text-center py-10 text-gray-600">Generating financial statement...</div>;
//   if (error || !data) return <div className="text-red-600 text-center py-10">Unable to load financial information.</div>;

//   const { userReport, cooperativeMembers, savingsTracks, loans, loanTracks } = data;
//   console.log(userReport)

//   return (
//     <div className="max-w-6xl mx-auto p-4 bg-white print:p-0 print:max-w-none">
//       {/* Statement Header */}
//       <div className="print:hidden flex justify-between items-center mb-8 border-b pb-4">
//         <h1 className="text-2xl font-bold text-gray-800">Financial Statement</h1>
//         <div className="flex space-x-3">
//           <button 
//             onClick={handleDownloadPDF}
//             className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
//           >
//             <FiDownload className="mr-2" /> Download PDF
//           </button>
//           <button 
//             onClick={handlePrint}
//             className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
//           >
//             <FiPrinter className="mr-2" /> Print
//           </button>
//         </div>
//       </div>

//       {/* Account Summary */}
//       <div className="mb-10 p-6 border border-gray-200 rounded-lg print:border-0 print:p-0">
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
//           <div>
//             <h2 className="text-lg font-semibold text-gray-700 mb-2">Account Holder</h2>
//             <p className="text-gray-900">{userReport?.user?.FirstName} {userReport?.user?.LastName}</p>
//             <p className="text-gray-600 text-sm">{userReport?.user?.email}</p>
//           </div>
          
//           <div>
//             <h2 className="text-lg font-semibold text-gray-700 mb-2">Statement Period</h2>
//             <p className="text-gray-900">
//               {userReport?.lastUpdated && !isNaN(new Date(userReport?.lastUpdated))
//                 ? format(new Date(userReport?.lastUpdated), "MMM dd, yyyy")
//                 : "N/A"}
//             </p>
//           </div>
          
//           <div className="bg-blue-50 p-4 rounded-lg print:border print:border-gray-200">
//             <h2 className="text-lg font-semibold text-gray-700 mb-1">Available Balance</h2>
//             <p className="text-2xl font-bold text-blue-800">
//               {formatCurrency(convertCurrencyString(userReport?.totalSaved))}
//             </p>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6"></div>
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700">Withdrawable Balance</h3>
//             <p className="text-xl font-semibold text-gray-900 mt-1">
//               {formatCurrency(convertCurrencyString(userReport?.withdrawableBalance))}
//             </p>
//           </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
//           <div className="bg-gray-50 p-4 rounded-lg">
//             <h3 className="font-medium text-gray-700">Total Savings</h3>
//             <p className="text-xl font-semibold text-gray-900 mt-1">
//               {formatCurrency(userReport?.totalSaved)}
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* Cooperative Membership */}
//       {cooperativeMembers?.length > 0 && (
//         <SectionContainer title="Cooperative Membership">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-50">
//                 <TableHeader>Member ID</TableHeader>
//                 <TableHeader>Bank Details</TableHeader>
//                 <TableHeader>Monthly Savings</TableHeader>
//                 <TableHeader>Status</TableHeader>
//               </tr>
//             </thead>
//             <tbody>
//               {cooperativeMembers.map((member) => (
//                 <tr key={member._id} className="border-b hover:bg-gray-50">
//                   <TableData>
//                     <div className="font-medium">{member.memberId}</div>
//                     <div className="text-sm text-gray-500">{member.appId}</div>
//                   </TableData>
//                   <TableData>
//                     <div>{member.bankName}</div>
//                     <div className="text-sm text-gray-600">{member.accountNumber}</div>
//                   </TableData>
//                   <TableData className="font-medium">
//                     {formatCurrency(member.monthlySavings)}
//                     <div className="text-sm text-gray-600 capitalize">{member.SavingsType}</div>
//                   </TableData>
//                   <TableData>
//                     <span className={`px-2 py-1 rounded-full text-xs ${
//                       member.isVerified 
//                         ? "bg-green-100 text-green-800" 
//                         : "bg-yellow-100 text-yellow-800"
//                     }`}>
//                       {member.isVerified ? 'Verified' : 'Pending'}
//                     </span>
//                   </TableData>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </SectionContainer>
//       )}

//       {/* Savings History */}
//       {savingsTracks?.length > 0 && (
//         <SectionContainer title="Savings History">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-50">
//                 <TableHeader>Period</TableHeader>
//                 <TableHeader>Amount</TableHeader>
//                 <TableHeader>Date</TableHeader>
//                 <TableHeader>Status</TableHeader>
//               </tr>
//             </thead>
//             <tbody>
//               {savingsTracks.flatMap(track => 
//                 track.payments.map(payment => (
//                   <tr key={payment._id} className="border-b hover:bg-gray-50">
//                     <TableData>
//                       {payment.month} {payment.year}
//                     </TableData>
//                     <TableData className="font-medium">
//                       {formatCurrency(payment.amountPaid)}
//                     </TableData>
//                     <TableData>
//                       {payment.datePaid 
//                         ? format(new Date(payment.datePaid), "MMM dd, yyyy") 
//                         : "N/A"}
//                     </TableData>
//                     <TableData>
//                       <span className={`px-2 py-1 rounded-full text-xs ${
//                         payment.paidPerMonth 
//                           ? "bg-green-100 text-green-800" 
//                           : "bg-red-100 text-red-800"
//                       }`}>
//                         {payment.paidPerMonth ? 'Paid' : 'Pending'}
//                       </span>
//                     </TableData>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </SectionContainer>
//       )}

//       {/* Loan Accounts */}
//       {loans?.length > 0 && (
//         <SectionContainer title="Loan Accounts">
//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="bg-gray-50">
//                 <TableHeader>Loan Amount</TableHeader>
//                 <TableHeader>Term</TableHeader>
//                 <TableHeader>Monthly Payment</TableHeader>
//                 <TableHeader>Purpose</TableHeader>
//                 <TableHeader>Status</TableHeader>
//               </tr>
//             </thead>
//             <tbody>
//               {loans.map(loan => (
//                 <tr key={loan._id} className="border-b hover:bg-gray-50">
//                   <TableData className="font-medium">
//                     {formatCurrency(convertCurrencyString(loan.loanAmount))}
//                   </TableData>
//                   <TableData>
//                     {loan.repayment} months
//                   </TableData>
//                   <TableData className="font-medium">
//                     {formatCurrency(convertCurrencyString(loan.repaymentAmount))}
//                   </TableData>
//                   <TableData className="text-gray-600">
//                     {loan.about || "N/A"}
//                   </TableData>
//                   <TableData>
//                     <span className={`px-2 py-1 rounded-full text-xs ${
//                       loan.status === 'active' 
//                         ? "bg-blue-100 text-blue-800" 
//                         : loan.status === 'completed' 
//                           ? "bg-green-100 text-green-800" 
//                           : "bg-gray-100 text-gray-800"
//                     }`}>
//                       {loan.status}
//                     </span>
//                   </TableData>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </SectionContainer>
//       )}

//       {/* Loan Repayment History */}
//       {loanTracks?.length > 0 && (
//         <SectionContainer title="Loan Repayment History">
//           {loanTracks.map(track => (
//             <div key={track._id} className="mb-8">
//               <h3 className="font-semibold text-gray-800 mb-3">
//                 Loan: {formatCurrency(convertCurrencyString(track.loan?.loanAmount) || 0)} •
//                 Term: {track.loan?.repayment || 0} months
//               </h3>
//               <table className="w-full border-collapse">
//                 <thead>
//                   <tr className="bg-gray-50">
//                     <TableHeader>Installment</TableHeader>
//                     <TableHeader>Amount</TableHeader>
//                     <TableHeader>Paid Date</TableHeader>
//                     <TableHeader>Status</TableHeader>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {track.payments.map(payment => (
//                     <tr key={payment._id} className="border-b hover:bg-gray-50">
//                       <TableData>
//                         {payment.month} {payment.year}
//                       </TableData>
//                       <TableData className="font-medium">
//                         {formatCurrency(convertCurrencyString(payment.amountPaid))}
//                       </TableData>
//                       <TableData>
//                         {payment.datePaid 
//                           ? format(new Date(payment.datePaid), "MMM dd, yyyy") 
//                           : "N/A"}
//                       </TableData>
//                       <TableData>
//                         <span className={`px-2 py-1 rounded-full text-xs ${
//                           payment.paidPerMonth 
//                             ? "bg-green-100 text-green-800" 
//                             : "bg-yellow-100 text-yellow-800"
//                         }`}>
//                           {payment.paidPerMonth ? 'Paid' : 'Due'}
//                         </span>
//                       </TableData>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           ))}
//         </SectionContainer>
//       )}

//       {/* Statement Footer */}
//       <div className="mt-12 pt-6 border-t text-center text-gray-500 text-sm print:mt-8">
//         <p>Generated on: {format(new Date(), "MMM dd, yyyy 'at' h:mm a")}</p>
//         <p className="mt-2">This is an official financial statement from Gbewa Cooperative</p>
//       </div>
//     </div>
//   );
// }

// // Reusable section components
// const SectionContainer = ({ title, children }) => (
//   <div className="mb-10">
//     <h2 className="text-xl font-semibold text-gray-800 mb-4 pb-2 border-b">{title}</h2>
//     {children}
//   </div>
// );

// const TableHeader = ({ children }) => (
//   <th className="text-left py-3 px-4 font-medium text-gray-700">{children}</th>
// );

// const TableData = ({ children, className = "" }) => (
//   <td className={`py-3 px-4 ${className}`}>{children}</td>
// );
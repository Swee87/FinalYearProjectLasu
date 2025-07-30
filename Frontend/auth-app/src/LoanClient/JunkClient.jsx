// import { useQuery,useMutation } from '@tanstack/react-query';
// import { useState, useEffect, useRef } from "react";
// import toast from "react-hot-toast";
// import { CSVLink } from "react-csv";
// import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
// import { Tooltip } from 'react-tooltip';
// import { getAllappliedLoan, LoanActions } from '../services/AdminRoutes/ApproveLoan';



// function formatDateWithSuffix(dateStr) {
//   const date = new Date(dateStr);
//   if (isNaN(date)) return 'Due Date not set';

//   const day = date.getDate();
//   const month = date.toLocaleString('default', { month: 'long' }); // e.g. "June"
//   const year = date.getFullYear();

//   // Get ordinal suffix
//   const getOrdinal = (n) => {
//     if (n > 3 && n < 21) return 'th';
//     switch (n % 10) {
//       case 1: return 'st';
//       case 2: return 'nd';
//       case 3: return 'rd';
//       default: return 'th';
//     }
//   };

//   const ordinal = getOrdinal(day);
//   return `${day}${ordinal}, ${month}, ${year}`;
// }

// // Workflow stages in order
// const WORKFLOW = ["pending", "approved", "processing", "disbursed", "ongoing", "completed", "cancelled"];

// export function LoanRequest() {
  
//   const [loanData, setLoanData] = useState([]);
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeTab, setActiveTab] = useState("pending");
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc");
//   const [selectedRows, setSelectedRows] = useState(new Set());
//   const [showModal, setShowModal] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const itemsPerPage = 10;
//   const csvRef = useRef(null);
  
//   const { data: fetchedData, isLoading, error, refetch } = useQuery({
//     queryKey: ["LoanRequest", activeTab],
    
//     queryFn: getAllappliedLoan,
//     refetchOnWindowFocus: false,
//     retry: 1,
//     onError: (err) => {
//       toast.error(`Loading failed: ${err.message}`);
//     },
//   });
//   // Sync fetched data with state
//   useEffect(() => {
//     if (fetchedData && Array.isArray(fetchedData)) {
//       setLoanData(fetchedData);
//       refetch();
//     }
//   }, [fetchedData]);
  
//   // Get next status in workflow
//   const currentIndex = WORKFLOW.indexOf(activeTab);
//   const nextStatus =
//   currentIndex >= 0 && currentIndex < WORKFLOW.length - 1
//   ? WORKFLOW[currentIndex + 1]
//   : null;
  
//   // Toggle checkbox selection
//   const handleCheckboxChange = (memberId) => {
//     const newSelected = new Set(selectedRows);
//     if (newSelected.has(memberId)) {
//       newSelected.delete(memberId);
//     } else {
//       newSelected.add(memberId);
//     }
//     setSelectedRows(newSelected);
//   };
   
   
    
//     const { mutate } = useMutation({
//   mutationFn: ({ loanIds, newStatus }) => LoanActions(loanIds, newStatus),
//   onSuccess: () => {
//     toast.success("Loan status updated successfully");
//   },
//   onError: (err) => {
//     toast.error(`Error updating loan status: ${err.message}`);
//   },
// });

// const handleMoveToNextTab = () => {
//   if (!nextStatus || selectedRows.size === 0) return;

//   const loanIdsToUpdate = Array.from(selectedRows);
//   // Optimistically update UI
//   setLoanData((prev) =>
//     prev.map((loan) =>
//       loanIdsToUpdate.includes(loan.memberId)
//         ? { ...loan, status: nextStatus }
//         : loan
//     )
//   );

//   // Send real update to server
//   mutate(
//     { loanIds: loanIdsToUpdate, newStatus: nextStatus },
//     {
//       onSuccess: () => {
//         toast.success(`${loanIdsToUpdate.length} loan(s) moved to "${nextStatus}"`);
//       },
//       onError: () => {
//         // Revert UI on error
//         setLoanData((prev) =>
//           prev.map((loan) =>
//             loanIdsToUpdate.includes(loan.memberId)
//               ? { ...loan, status: nextStatus }
//               : loan
//           )
//         );
//       }
//     }
//   );

//   // Reset selection
//   setSelectedRows(new Set());
//   setShowModal(false);
// };




//   // Sort table by column
//   const handleSort = (columnKey) => {
//     if (sortColumn === columnKey) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortColumn(columnKey);
//       setSortOrder("asc");
//     }
//   };

//   // Apply sorting and filtering
//   const filteredData = loanData.filter((loan) => {
//     const { status = "N/A", member = {} , loanId,  disbursedAt,approvedAt,dueAt} = loan;  
//     const { firstName = "", lastName = "" ,   bankName = "",
//           accountNumber = "", accountName = "" , phoneNumber = "", memberId, appId ,} = member;

//     const values = [
//       status,
//       disbursedAt,approvedAt,dueAt,
//       firstName,
//       lastName,
//       bankName,
//        phoneNumber,
//       accountNumber,
//       accountName,
//       memberId,
//       loanId,
//       appId,
//       loan.loanId?.toString(),
//       loan.loanAmount?.toString(),
//       loan.monthlySavings?.toString(),
//       loan.repayment?.toString(),
//       loan.createdAt?.toString(),
//       loan.disbursedAt?.toString(),
//       loan.approvedAt?.toString(),
//       loan.dueAt?.toString(),
//       loan.repaymentAmount?.toString(),
//       loan.loanRepaymentDuration?.toString()
//     ];
//     console.log(disbursedAt,approvedAt,dueAt);
//     return (
//       status === activeTab &&
//       values.some(
//         (value) =>
//           value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
//       )
//     );
//   });

//   const sortedData = [...filteredData].sort((a, b) => {
//     if (!sortColumn) return 0;

//     const valA = a[sortColumn] || "";
//     const valB = b[sortColumn] || "";

//     if (valA < valB) return sortOrder === "asc" ? -1 : 1;
//     if (valA > valB) return sortOrder === "asc" ? 1 : -1;
//     return 0;
//   });

//   // Paginate data
//   const totalPages = Math.ceil(sortedData.length / itemsPerPage);
//   const paginatedData = sortedData.slice(
//     (currentPage - 1) * itemsPerPage,
//     currentPage * itemsPerPage
//   );

//   // Format CSV data
//   const csvData = paginatedData.map((loan) => {
//     const { firstName = "N/A", lastName = "N/A" } = loan.member || {};
//     return {
//       memberId: loan.memberId,
//       appId: loan.loanId,
//       loanId: loan.loanId,
//       phoneNumber: loan.member?.phoneNumber || "N/A",
//       firstName,
//       lastName,
//       amount: `₦${parseInt(loan.loanAmount).toLocaleString()}`,
//       monthlySavings: `₦${parseInt(loan.monthlySavings).toLocaleString()}`,
//       bankName: loan.bankName || "N/A",
//       accountNumber: loan.accountNumber || "N/A",
//       accountName: `${firstName} ${lastName}`,
//       date: loan.createdAt,
//     };
//   });

//   return (
//     <div className="container mx-auto p-6">
//       {/* Header */}
//       <div className="flex justify-between items-center mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">LOAN REQUESTS</h1>
//         <div className="space-x-2">
//           <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100">
//             All Loans
//           </button>
//           <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100">
//             Loan Fees
//           </button>
//           <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
//             Export Table
//           </button>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="mb-8 flex items-center space-x-2">
//         <input
//           type="text"
//           placeholder="Search through list"
//           className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//         <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
//           <MagnifyingGlassIcon className="h-5 w-5" />
//         </button>
//       </div>

//       {/* Tab Navigation */}
//       <div className="mb-6">
//         <nav className="flex space-x-6 overflow-x-auto">
//           {WORKFLOW.map((status) => (
//             <button
//               key={status}
//               onClick={() => setActiveTab(status)}
//               className={`px-4 py-2 font-medium transition-colors duration-300 capitalize ${
//                 activeTab === status
//                   ? "text-blue-600 border-b-2 border-blue-600"
//                   : "text-gray-600 hover:text-blue-600"
//               }`}
//             >
//               {status}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
//                 <div className="flex items-center space-x-2">
//                   <input
//                     type="checkbox"
//                     className="h-4 w-4"
//                     onChange={(e) => {
//                       if (e.target.checked) {
//                         const allIds = paginatedData.map((d) => d.loanId);
//                         setSelectedRows(new Set(allIds));
//                       } else {
//                         setSelectedRows(new Set());
//                       }
//                     }}
//                   />
//                   <span>Member ID</span>
//                 </div>
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("loanId")}>
//                 App ID
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("firstName")}>
//                 First Name
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("lastName")}>
//                 Last Name
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("loanAmount")}>
//                 Amount
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("monthlySavings")}>
//                 Monthly Savings
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("bankName")}>
//                 Bank Name
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("accountNumber")}>
//                 Account Number
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
//                 Account Name
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("phoneNumber")}>
//                 Phone Number
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort("createdAt")}>
//                 Date
//               </th>
//               <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
//                 Details
//               </th>
//                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
//                 loan Repayment Duration
//               </th>
//                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
//                 loan Repayment Amount
//               </th>
//                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
//                 Approved at
//               </th>
//                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer">
//                Due Date
//               </th>
//             </tr>
            
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {paginatedData.map((loan) => {
//               const { firstName = "N/A", lastName = "N/A" , bankName = "N/A", accountNumber = "N/A", accountName = "N/A", phoneNumber = "N/A", memberId, appId} = loan.member || {};
//               return (
//                 <tr key={loan.loanId} className="hover:bg-gray-50">
//                   <td className="px-6 py-4 whitespace-nowrap flex items-center">
//                     <div className="flex items-center space-x-2 mx-3">
//                       <input
//                         type="checkbox"
//                         className="h-4 w-4"
//                         checked={selectedRows.has(loan.loanId)}
//                         onChange={() => handleCheckboxChange(loan.loanId)}
//                       />
//                     </div>
//                     {memberId}
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">{appId}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{firstName}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{lastName}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{(loan.loanAmount)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">₦{parseInt(loan.monthlySavings).toLocaleString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{bankName || "N/A"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{accountNumber || "N/A"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{`${firstName} ${lastName}`}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{phoneNumber || "N/A"}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{new Date(loan.createdAt).toLocaleDateString()}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">
//                     <span
//                       data-tooltip-id="details-tooltip"
//                       data-tooltip-content="This is the full loan request details."
//                       className="flex items-center cursor-pointer text-blue-600 underline"
//                     >
//                       Details
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                       </svg>
//                     </span>
//                   </td>
//                   <td className="px-6 py-4 whitespace-nowrap">{loan.loanRepaymentDuration}months</td>
//                    <td className="px-6 py-4 whitespace-nowrap">{(loan.repaymentAmount)}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{loan.approvedAt? formatDateWithSuffix(loan.approvedAt) : 'Approved Date not set'}</td>
//                   <td className="px-6 py-4 whitespace-nowrap">{loan.dueAt? formatDateWithSuffix(loan.dueAt) : 'Due Date not set'}</td>
//                 </tr>
//               );
//             })}
//           </tbody>
//         </table>
//       </div>

//       {/* Pagination */}
//       <div className="mt-4 flex justify-between items-center">
//         <div>
//           Page {currentPage} of {totalPages}
//         </div>
//         <div className="flex space-x-2">
//           <button
//             disabled={currentPage === 1}
//             onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//           >
//             Previous
//           </button>
//           <button
//             disabled={currentPage === totalPages}
//             onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
//             className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* Tooltip */}
//       <Tooltip id="details-tooltip" />

//       {/* Confirmation Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
//           <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
//             <h2 className="text-xl font-semibold mb-4">Confirm Move</h2>
//             <p className="mb-4">
//               Are you sure you want to move{" "}
//               <strong>{selectedRows.size}</strong> selected request(s) to{" "}
//               <strong>{nextStatus?.charAt(0).toUpperCase() + nextStatus?.slice(1)}</strong>
//               ?
//             </p>
//             <div className="flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleMoveToNextTab}
//                 disabled={!nextStatus}
//                 className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
//               >
//                 Confirm
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Actions */}
//       <div className="mt-6 flex justify-between">
//         <button
//           onClick={() => {
//             if (selectedRows.size > 0 && nextStatus) setShowModal(true);
//           }}
//           disabled={selectedRows.size === 0 || !nextStatus}
//           className={`px-4 py-2 rounded-lg ${
//             selectedRows.size === 0 || !nextStatus
//               ? "bg-gray-400 cursor-not-allowed"
//               : "bg-blue-600 hover:bg-blue-700 text-white"
//           }`}
//         >
//           Move to{" "}
//           {nextStatus
//             ? nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)
//             : "—"}
//         </button>
//         <CSVLink
//           data={csvData}
//           filename={"loan_requests.csv"}
//           className="hidden"
//           ref={csvRef}
//         />
//         <button
//           onClick={() => {
//             if (csvRef.current) {
//               csvRef.current.click();
//             }
//           }}
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           Export Table
//         </button>
//       </div>
//     </div>
//   );
// }

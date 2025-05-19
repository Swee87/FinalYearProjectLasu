// import { useState } from "react";
// import { CSVLink } from "react-csv"; // For exporting CSV
// // import { SearchIcon } from "@heroicons/react/solid";
// import { useRef } from "react";
// import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

// // Sample data (replace with your API call)
// const LOAN_DATA = [
//   {
//     memberId: "MEMB-001",
//     appId: "APP-12345",
//     firstName: "John",
//     lastName: "Doe",
//     amount: "$5000",
//     monthlySavings: "$200",
//     bankName: "Chase Bank",
//     accountNumber: "1234567890",
//     accountName: "John Doe Savings",
//     date: "2023-10-15",
//     status: "pending",
//   },
//   // Add more sample data...
// ];

// export function LoanRequest() {
//   const [searchQuery, setSearchQuery] = useState("");
//   const [activeTab, setActiveTab] = useState("pending");
//   const [sortColumn, setSortColumn] = useState(null);
//   const [sortOrder, setSortOrder] = useState("asc");
//   const csvRef = useRef(null);
//   // Filter data based on active tab and search query
//   const filteredData = LOAN_DATA.filter((loan) => {
//     return (
//       loan.status === activeTab &&
//       Object.values(loan).some(
//         (value) =>
//           value
//             ?.toString()
//             .toLowerCase()
//             .includes(searchQuery.toLowerCase())
//       )
//     );
//   });

//   // Sort data when a header is clicked
//   const handleSort = (column) => {
//     if (sortColumn === column) {
//       setSortOrder(sortOrder === "asc" ? "desc" : "asc");
//     } else {
//       setSortColumn(column);
//       setSortOrder("asc");
//     }

//     const sortedData = [...filteredData].sort((a, b) => {
//       if (sortOrder === "asc") {
//         return a[column]?.localeCompare(b[column]);
//       }
//       return b[column]?.localeCompare(a[column]);
//     });
//   };

//   return (
//     <div className="container mx-auto p-6">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-6">
//         <h1 className="text-2xl font-bold text-gray-800">LOAN REQUESTS</h1>

//         {/* Filter Buttons */}
//         <div className="space-x-2">
//           <button
//             className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100"
//           >
//             All Loans
//           </button>
//           <button
//             className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100"
//           >
//             Loan Fees
//           </button>
//           <button
//             className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
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
//         <button
//           className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
//         >
//           <MagnifyingGlassIcon  className="h-5 w-5" />
//         </button>
//       </div>

//       {/* Tab Navigation */}
//       <div className="mb-6">
//         <nav className="flex space-x-6">
//           {[
//             "Pending",
//             "Approved",
//             "Processing",
//             "Disbursed",
//             "Ongoing",
//             "Completed",
//             "Cancelled",
//           ].map((status) => (
//             <button
//               key={status}
//               onClick={() => setActiveTab(status.toLowerCase())}
//               className={`px-4 py-2 font-medium transition-colors duration-300 ${
//                 activeTab === status.toLowerCase()
//                   ? "text-blue-600 border-b-2 border-blue-600"
//                   : "text-gray-600 hover:text-blue-600"
//               }`}
//             >
//               {status}
//             </button>
//           ))}
//         </nav>
//       </div>

//       {/* DataTable */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full divide-y divide-gray-200">
//           <thead className="bg-gray-50">
//             <tr>
//             <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("memberId")}
//           >
//   <div className="flex items-center space-x-2">
//     <input
//       type="checkbox"
//       className="h-4 w-4"
//       onChange={(e) => handleCheckbox(e)} // define handleCheckbox separately
//     />
//     <span className='items-center-safe'>Member ID</span>
//   </div>
// </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("appId")}
//               >
//                 App ID
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("firstName")}
//               >
//                 First Name
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("lastName")}
//               >
//                 Last Name
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("amount")}
//               >
//                 Amount
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("monthlySavings")}
//               >
//                 Monthly Savings Amount
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("bankName")}
//               >
//                 Bank Name
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("accountNumber")}
//               >
//                 Account Number
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("accountName")}
//               >
//                 Account Name
//               </th>
//               <th
//                 scope="col"
//                 className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
//                 onClick={() => handleSort("date")}
//               >
//                 Date
//               </th>
//             </tr>
//           </thead>
//           <tbody className="divide-y divide-gray-200">
//             {filteredData.map((loan) => (
//               <tr key={loan.memberId}>
//                 <td className="px-6 py-4 whitespace-nowrap flex items-center"> 
                
//                 <div className="flex items-center space-x-2 mx-3">
//     <input
//       type="checkbox"
//       className="h-4 w-4"
//       onChange={(e) => handleCheckbox(e)} // define handleCheckbox separately
//     />
//   </div>
//                 {loan.memberId}
                
                
//                 </td>
//                 <td className="px-6 py-4 whitespace-nowrap">{loan.appId}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{loan.firstName}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{loan.lastName}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{loan.amount}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{loan.monthlySavings}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{loan.bankName}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{loan.accountNumber}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{loan.accountName}</td>
//                 <td className="px-6 py-4 whitespace-nowrap">{loan.date}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>

//       {/* Export Button */}
//       <div>
//       {/* Other components... */}

//       {/* CSV Link */}
//       <CSVLink
//         data={filteredData}
//         filename={"loan_requests.csv"}
//         className="hidden"
//         ref={csvRef} // 
//       />
//       <button aria-disabled={false} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
//         {`move to ${activeTab}`}
//       </button>
//       {/* Export Button */}
//       <button
//         onClick={() => {
//           if (csvRef.current) {
//             csvRef.current.click(); // Trigger download
//           }
//         }}
//         className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 float-right"
//       >
//         Export Table
//       </button>
//     </div>
//     </div>
//   );
// }


import { useState } from "react";
import { CSVLink } from "react-csv";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useRef } from "react";
import { Tooltip } from 'react-tooltip';


// Sample data
const LOAN_DATA = [
  {
    memberId: "MEMB-001",
    appId: "APP-12345",
    firstName: "John",
    lastName: "Doe",
    amount: "$5000",
    monthlySavings: "$200",
    bankName: "Chase Bank",
    accountNumber: "1234567890",
    accountName: "John Doe Savings",
    date: "2023-10-15",
    status: "pending",
  },
  {
    memberId: "MEMB-002",
    appId: "APP-67890",
    firstName: "Jane",
    lastName: "Smith",
    amount: "$3000",
    monthlySavings: "$150",
    bankName: "Wells Fargo",
    accountNumber: "0987654321",
    accountName: "Jane Smith Checking",
    date: "2023-10-16",
    status: "pending",
  },
];

// Workflow stages in order
const WORKFLOW = ["pending", "approved", "processing", "disbursed", "ongoing", "completed", "cancelled"];

export function LoanRequest() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("pending");
  const [sortColumn, setSortColumn] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [loanData, setLoanData] = useState(LOAN_DATA);
  const csvRef = useRef(null);

  // Get the next status in workflow
  const currentIndex = WORKFLOW.indexOf(activeTab);
  const nextStatus =
    currentIndex >= 0 && currentIndex < WORKFLOW.length - 1
      ? WORKFLOW[currentIndex + 1]
      : null;

  // Handle checkbox selection
  const handleCheckboxChange = (memberId) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedRows(newSelected);
  };

  // Move selected rows to the next tab
  const handleMoveToNextTab = () => {
    if (!nextStatus) return;

    setLoanData((prev) =>
      prev.map((loan) =>
        selectedRows.has(loan.memberId)
          ? { ...loan, status: nextStatus }
          : loan
      )
    );
    setSelectedRows(new Set());
    setShowModal(false);
  };

  // Filter data based on active tab and search query
  const filteredData = loanData.filter((loan) => {
    return (
      loan.status === activeTab &&
      Object.values(loan).some(
        (value) =>
          value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  });

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">LOAN REQUESTS</h1>
        <div className="space-x-2">
          <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100">
            All Loans
          </button>
          <button className="px-4 py-2 bg-white border rounded-lg hover:bg-gray-100">
            Loan Fees
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Export Table
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-8 flex items-center space-x-2">
        <input
          type="text"
          placeholder="Search through list"
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          <MagnifyingGlassIcon className="h-5 w-5" />
        </button>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <nav className="flex space-x-6">
          {WORKFLOW.map((status) => (
            <button
              key={status}
              onClick={() => setActiveTab(status)}
              className={`px-4 py-2 font-medium transition-colors duration-300 capitalize ${
                activeTab === status
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600 hover:text-blue-600"
              }`}
            >
              {status}
            </button>
          ))}
        </nav>
      </div>

      {/* DataTable */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    onChange={(e) => {
                      if (e.target.checked) {
                        const allIds = filteredData.map((d) => d.memberId);
                        setSelectedRows(new Set(allIds));
                      } else {
                        setSelectedRows(new Set());
                      }
                    }}
                  />
                  <span>Member ID</span>
                </div>
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                App ID
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                First Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Last Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Amount
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Monthly Savings
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Bank Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Account Number
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Account Name
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
              >
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredData.map((loan) => (
              <tr key={loan.memberId}>
                <td className="px-6 py-4 whitespace-nowrap flex items-center">
                  <div className="flex items-center space-x-2 mx-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4"
                      checked={selectedRows.has(loan.memberId)}
                      onChange={() => handleCheckboxChange(loan.memberId)}
                    />
                  </div>
                  {loan.memberId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{loan.appId}</td>
                <td className="px-6 py-4 whitespace-nowrap">{loan.firstName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{loan.lastName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{loan.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {loan.monthlySavings}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{loan.bankName}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {loan.accountNumber}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{loan.accountName}</td>
                <td className="px-6 py-4 whitespace-nowrap">{loan.date}</td>
                <td className="px-6 py-4 whitespace-nowrap">
  <span
    data-tooltip-id="details-tooltip"
    data-tooltip-content="This is the full loan request details."
    className="flex items-center cursor-pointer text-blue-600 underline"
  >
    Details
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4 ml-1"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  </span>
  <Tooltip id="details-tooltip" />
</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-lg">
            <h2 className="text-xl font-semibold mb-4">Confirm Move</h2>
            <p className="mb-4">
              Are you sure you want to move{" "}
              <strong>{selectedRows.size}</strong> selected request(s) to{" "}
              <strong>{nextStatus?.charAt(0).toUpperCase() + nextStatus?.slice(1)}</strong>
              ?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleMoveToNextTab}
                disabled={!nextStatus}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => {
            if (selectedRows.size > 0 && nextStatus) setShowModal(true);
          }}
          disabled={selectedRows.size === 0 || !nextStatus}
          className={`px-4 py-2 rounded-lg ${
            selectedRows.size === 0 || !nextStatus
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          Move to{" "}
          {nextStatus
            ? nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)
            : "—"}
        </button>

        {/* CSV Link */}
        <CSVLink
          data={filteredData}
          filename={"loan_requests.csv"}
          className="hidden"
          ref={csvRef}
        />
        <button
          onClick={() => {
            if (csvRef.current) {
              csvRef.current.click();
            }
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Export Table
        </button>
      </div>
    </div>
  );
}
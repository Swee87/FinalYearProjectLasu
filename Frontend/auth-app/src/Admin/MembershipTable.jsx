// src/components/MemberTable.jsx
import { useState } from "react";

export const MemberTable = ({ members, onApprove, approving, isSidebarOpen = false }) => {
  const [selectedMember, setSelectedMember] = useState(null);

  const openModal = (member) => setSelectedMember(member);
  const closeModal = () => setSelectedMember(null);

  const handleApprove = () => {
    if (selectedMember) {
      onApprove(selectedMember._id);
      closeModal();
    }
  };

  return (
    <>
      {/* Responsive Table */}
      <div className="overflow-x-auto bg-white shadow-lg rounded-xl border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-blue-50 to-indigo-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Staff Type
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700 uppercase tracking-wider">
                SavingsType
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member._id} className="hover:bg-gray-50 transition duration-150 ease-in-out">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {member.userId.LastName} {member.userId.FirstName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {member.staffType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                    <button
                      onClick={() => openModal(member)}
                      className="text-indigo-600 hover:text-indigo-800 focus:outline-none"
                    >
                      View / Approve
                    </button>
                  </td>
                   <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {member.SavingsType}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">
                  No pending members found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Full Page Modal - With Sidebar Offset */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/10"
          onClick={closeModal}
        >
          <div
            className={`bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-screen overflow-y-auto mx-auto p-8 transition-all duration-300 ${
              isSidebarOpen ? 'lg:ml-64' : ''
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Back Button */}
            <div className="flex justify-end mb-4">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Back
              </button>
            </div>

            {/* Modal Title & Close Icon */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Approve Member</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close modal"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Member Info Grid */}
            <div className="px-4 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-3 text-sm text-gray-700 ml-4">
                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="font-medium text-gray-900 whitespace-nowrap">Name:</span>
                  <span>{selectedMember.userId.LastName} {selectedMember.userId.FirstName}</span>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="font-medium text-gray-900 whitespace-nowrap">Email:</span>
                  <span className="break-all">{selectedMember.userId.email}</span>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="font-medium text-gray-900 whitespace-nowrap">Phone:</span>
                  <span>{selectedMember.phoneNumber}</span>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="font-medium text-gray-900 whitespace-nowrap">Member ID:</span>
                  <span>{selectedMember.memberId}</span>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="font-medium text-gray-900 whitespace-nowrap">App ID:</span>
                  <span>{selectedMember.appId}</span>
                </div>

                <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                  <span className="font-medium text-gray-900 whitespace-nowrap">Staff Type:</span>
                  <span>{selectedMember.staffType}</span>
                </div>

                {selectedMember.accountNumber && selectedMember.bankName && (
                  <>
                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                      <span className="font-medium text-gray-900 whitespace-nowrap">Account Number:</span>
                      <span>{selectedMember.accountNumber}</span>
                    </div>

                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                      <span className="font-medium text-gray-900 whitespace-nowrap">Bank:</span>
                      <span>{selectedMember.bankName}</span>
                    </div>

                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                      <span className="font-medium text-gray-900 whitespace-nowrap">SavingsType:</span>
                      <span>{selectedMember.SavingsType}</span>
                    </div>

                    <div className="grid grid-cols-[auto_1fr] gap-2 items-start">
                      <span className="font-medium text-gray-900 whitespace-nowrap">monthlySavings:</span>
                      <span>₦{selectedMember.monthlySavings}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Payment Proof Image Below Info */}
              <div className="mt-6">
                <p className="font-medium text-gray-800 mb-2">Payment Proof:</p>
                <img
                  src={selectedMember.payMentProof}
                  alt="Payment Proof"
                  className="w-full h-auto object-contain rounded-lg border border-gray-300 max-h-96"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 px-4 flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                onClick={closeModal}
                className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition duration-200"
              >
                Back
              </button>
              <button
                onClick={handleApprove}
                disabled={approving}
                className={`px-5 py-2 rounded-lg text-white font-medium ${
                  approving
                    ? 'bg-green-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {approving ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
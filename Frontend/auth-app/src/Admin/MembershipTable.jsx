// src/components/MemberTable.jsx
import { useState } from "react";

export const MemberTable = ({ members, onApprove }) => {
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
      <div className="overflow-x-auto bg-white shadow rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Staff Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {members.length > 0 ? (
              members.map((member) => (
                <tr key={member._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {member.userId.FirstName} {member.userId.LastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.userId.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {member.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                    {member.staffType}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => openModal(member)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View / Approve
                    </button>
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

      {/* Modal */}
      {selectedMember && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">Approve Member</h2>
            <div className="space-y-4">
              <p><strong>Name:</strong> {selectedMember.userId.FirstName} {selectedMember.userId.LastName}</p>
              <p><strong>Email:</strong> {selectedMember.userId.email}</p>
              <p><strong>Phone:</strong> {selectedMember.phoneNumber}</p>
              <p><strong>Member ID:</strong> {selectedMember.memberId}</p>
              <p><strong>App ID:</strong> {selectedMember.appId}</p>
              <p><strong>Staff Type:</strong> {selectedMember.staffType}</p>
              {selectedMember.accountNumber && selectedMember.bankName && (
                <>
                  <p><strong>Account Number:</strong> {selectedMember.accountNumber}</p>
                  <p><strong>Bank:</strong> {selectedMember.bankName}</p>
                </>
              )}
              <p><strong>Payment Proof:</strong></p>
              <img src={selectedMember.payMentProof} alt="Payment Proof" className="w-full h-auto rounded-md border" />
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


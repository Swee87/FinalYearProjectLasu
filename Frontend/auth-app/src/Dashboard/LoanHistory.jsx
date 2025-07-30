import { useQueries } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import { fetchLoanHistory } from "../services/AdminRoutes/LoanHistory"; 

export const LoanHistory = ({ ArrayofLoanId = [], filters = {} }) => {
  const loanQueries = useQueries({
    queries: ArrayofLoanId.map((loanId) => ({
      queryKey: ["loan-history", loanId, filters],
      queryFn: () => fetchLoanHistory({ loanId, filters }),
      enabled: !!loanId,
    })),
  });

  const isLoading = loanQueries.some((q) => q.isLoading);
  const isError = loanQueries.some((q) => q.isError);
  const error = loanQueries.find((q) => q.error)?.error;

  // Combine all histories from multiple loans
  const history = loanQueries
    .map((q) => q.data?.data || [])
    .flat()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // optional: sort by date

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    toast.error(error?.message || "Error loading loan history");
    return (
      <div className="p-6 text-center text-red-600 font-medium">
        Failed to load loan history.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mt-6">
      <h2 className="text-2xl font-semibold text-indigo-700 mb-4">Loan History</h2>

      {history.length === 0 ? (
        <div className="text-center text-gray-500 bg-gray-50 border border-dashed border-gray-300 rounded p-6">
          <p className="text-lg font-semibold text-gray-700 mb-1">No history available</p>
          <p className="text-sm">These loans have not been acted upon yet.</p>
        </div>
      ) : (
        <ul className="space-y-6">
  {history.map((entry) => {
    const loan = entry.loan;
    const memberUser = loan?.member?.userId;
    const memberId = loan?.member?.memberId
    const appID = loan?.member?.appId
    const approvedBy = loan?.approvedBy;
    const disbursedBy = loan?.disbursedBy;

    return (
      <li
        key={entry._id}
        className="p-5 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:bg-gray-100 transition"
      >
        {/* Loan Action Info */}
        <div className="mb-4">
          <p className="text-gray-800 font-medium">
            <span className="capitalize text-indigo-600">{entry.status}</span> by{" "}
            <span className="font-semibold">
              {entry.user?.FirstName} {entry.user?.LastName}
            </span>{" "}
            <span className="text-xs text-gray-500">({entry.role})</span>
          </p>
          {entry.comment && (
            <p className="text-sm text-gray-600 mt-1 italic">"{entry.comment}"</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            {format(new Date(entry.createdAt), "PPpp")}
          </p>
        </div>

        {/* Loan & Applicant Info */}
        <div className="grid sm:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p><span className="font-medium">Loan Amount:</span> ₦{loan?.loanAmount}</p>
            <p><span className="font-medium">Repayment Amount:</span> ₦{loan?.repaymentAmount}</p>
            <p><span className="font-medium">Duration:</span> {loan?.repayment} month(s)</p>
            <p><span className="font-medium">Loan Status:</span> {loan?.status}</p>
             <p><span className="font-medium">AppId:</span> {appID}</p>
          </div>

          <div>
            <p><span className="font-medium">Applicant:</span> {memberUser?.FirstName} {memberUser?.LastName}</p>
            <p><span className="font-medium">Email:</span> {memberUser?.email}</p>
            <p><span className="font-medium">Phone:</span> {loan?.member?.phoneNumber}</p>
            <p><span className="font-medium">Bank:</span> {loan?.member?.bankName} ({loan?.member?.accountNumber})</p>
            <p><span className="font-medium">MemberID:</span> {memberId}</p>
          </div>
        </div>

        {/* Approver/Disburser Info */}
        {(approvedBy || disbursedBy) && (
          <div className="mt-4 text-xs text-gray-600 border-t pt-3">
            {approvedBy && (
              <p>
                <span className="font-semibold">Approved By:</span> {approvedBy.FirstName} {approvedBy.LastName} ({approvedBy.email})
              </p>
            )}
            {disbursedBy && (
              <p>
                <span className="font-semibold">Disbursed By:</span> {disbursedBy.FirstName} {disbursedBy.LastName} ({disbursedBy.email})
              </p>
            )}
          </div>
        )}
      </li>
    );
  })}
</ul>

      )}
    </div>
  );
};

import React from "react";

const loanData = {
  borrower: {
    name: "Latifat Quadri",
    loanId: "123456",
    email: "latifatquadri@gmail.com",
    phone: "+2348012345678",
  },
  summary: {
    amount: 500000,
    tenure: 10,
    monthlyPayment: 50000.0,
    totalPayable: 500000.0,
    amountPaid: 500000.0,
    remainingBalance: 400000.0,
    nextPaymentDate: "2025-07-26",
  },

  payments: Array.from({ length: 10 }, (_, i) => {
    const dueDate = new Date();
    dueDate.setMonth(dueDate.getMonth() + i);
    return {
      number: i + 1,
      dueDate: dueDate.toISOString().slice(0, 10),
      amountDue: 50000,
      amountPaid: i < 1 ? 50000 : 0,
      datePaid: i < 1 ? dueDate.toISOString().slice(0, 10) : "-",
      status: i < 1 ? "Paid" : i === 1 ? "Upcoming" : "Pending",
    };
  }),
};

export default function LoanReportPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md">
      {/* Loan Payment Overview */}
      <div className="p-4 my-4">
        <section className="mb-6">
          <h3 className="font-bold mb-2">Payment Overview</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {loanData.payments.map((payment) => (
              <div
                key={payment.number}
                className={` p-4 rounded-2xl shadow-lg ${
                  payment.status === "Paid"
                    ? "bg-green-100"
                    : payment.status === "Upcoming"
                    ? "bg-yellow-100"
                    : "bg-white"
                }`}
              >
                <h4 className="font-semibold text-lg mb-2">
                  Payment #{payment.number}
                </h4>
                <p>
                  <strong>Due Date:</strong> {payment.dueDate}
                </p>
                <p>
                  <strong>Amount:</strong> ₦{payment.amountDue.toLocaleString()}
                </p>
                <p>
                  <strong>Status:</strong> {payment.status}
                </p>
                {payment.amountPaid > 0 && (
                  <p>
                    <strong>Paid:</strong> ₦
                    {payment.amountPaid.toLocaleString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
        <hr />
      </div>
      {/* header  */}
      <header className="flex justify-between items-center border-b pb-4 mb-6">
        <h1 className="text-xl font-bold">PLATFORM</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
          Download PDF
        </button>
      </header>
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Loan Report</h2>
        <p>Generated on: {new Date().toLocaleDateString()}</p>
      </section>
      {/* Borrower Information */}
      <section className="mb-6">
        <h3 className="font-bold mb-2">Borrower Information</h3>
        <ul className="grid grid-cols-2 gap-x-4">
          <li>
            <strong>Name:</strong> {loanData.borrower.name}
          </li>
          <li>
            <strong>Loan ID:</strong> {loanData.borrower.loanId}
          </li>
          <li>
            <strong>Email:</strong> {loanData.borrower.email}
          </li>
          <li>
            <strong>Phone:</strong> {loanData.borrower.phone}
          </li>
        </ul>
      </section>
      {/* Loan Summary  */}
      <section className="mb-6">
        <h3 className="font-bold mb-2">Loan Summary</h3>
        <ul className="grid grid-cols-2 gap-x-4">
          <li>
            <strong>Loan Amount:</strong> ₦
            {loanData.summary.amount.toLocaleString()}
          </li>
          <li>
            <strong>Tenure:</strong> {loanData.summary.tenure} months
          </li>
          <li>
            <strong>Monthly Payment:</strong> ₦
            {loanData.summary.monthlyPayment.toLocaleString()}
          </li>
          <li>
            <strong>Total Payable:</strong> ₦
            {loanData.summary.totalPayable.toLocaleString()}
          </li>
          <li>
            <strong>Amount Paid:</strong> ₦
            {loanData.summary.amountPaid.toLocaleString()}
          </li>
          <li>
            <strong>Remaining Balance:</strong> ₦
            {loanData.summary.remainingBalance.toLocaleString()}
          </li>
          <li>
            <strong>Next Payment Due:</strong>{" "}
            {loanData.summary.nextPaymentDate}
          </li>
        </ul>
      </section>
      {/* Payment schedule table  */}
      <section className="mb-6">
        <h3 className="font-bold mb-2">Payment Schedule</h3>
        <table className="w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">#</th>
              <th className="border px-2 py-1">Due Date</th>
              <th className="border px-2 py-1">Amount Due</th>
              <th className="border px-2 py-1">Amount Paid</th>
              <th className="border px-2 py-1">Date Paid</th>
              <th className="border px-2 py-1">Status</th>
            </tr>
          </thead>
          <tbody>
            {loanData.payments.map((p) => (
              <tr key={p.number}>
                <td className="border px-2 py-1 text-center">{p.number}</td>
                <td className="border px-2 py-1">{p.dueDate}</td>
                <td className="border px-2 py-1">
                  ₦{p.amountDue.toLocaleString()}
                </td>
                <td className="border px-2 py-1">
                  ₦{p.amountPaid?.toLocaleString() || "-"}
                </td>
                <td className="border px-2 py-1">{p.datePaid}</td>
                <td className="border px-2 py-1">{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      {/* Terms and Condition  */}
      <section>
        <h3 className="font-bold mb-2">Terms & Conditions</h3>
        <p className="text-sm text-gray-700">
          All repayments must be made on or before the due date. Late payments
          may attract penalties. Contact customer support for clarifications.
        </p>
      </section>
    </div>
  );
}

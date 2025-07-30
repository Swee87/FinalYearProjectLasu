/** FULLY UPDATED COMPONENT WITH TABLE AND CARD VIEW INCLUDING ALL USER DETAILS AND FIXED CARD DISPLAY **/
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAdminSavings } from '../services/AdminRoutes/fetchAdminSavings';
import { formatCurrency } from '../helper';
import { format } from 'date-fns';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import ReactPaginate from 'react-paginate';
import {
  Search,
  FileDown,
  Printer,
  Users,
  LayoutGrid,
  Table,
} from 'lucide-react';

export function AdminSavings() {
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('card');
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const limit = 10;

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-savings', page],
    queryFn: () => fetchAdminSavings(page, limit),
    keepPreviousData: true,
    refetchOnWindowFocus: false,
    select: (res) => {
      if (!res.success) throw new Error(res.error);
      return res;
    },
  });

  if (isLoading) return <div className="text-center py-10">Loading savings...</div>;
  if (error) return <div className="text-center text-red-600 py-10">{error.message}</div>;

  const { data: savingsData, pagination } = data.data;
  const { savings, coopMembers } = savingsData;
  const { totalPages, totalSavings } = pagination;

  const getMember = (userId) => coopMembers.find((m) => m.userId === userId);

  const filteredSavings = savings.filter((entry) => {
    const nameMatch = `${entry.user?.FirstName} ${entry.user?.LastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const monthMatch = monthFilter ? entry.payments.some(p => p.month === monthFilter) : true;
    const yearMatch = yearFilter && parseInt(yearFilter) > 0 ? entry.payments.some(p => p.year === parseInt(yearFilter)) : true;
    return nameMatch && monthMatch && yearMatch;
  });

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.text('Admin Savings Report', 14, 16);
    autoTable(doc, {
      startY: 22,
      head: [['Name', 'Email', 'Phone', 'Monthly', 'Bank', 'Total Paid']],
      body: filteredSavings.map((entry) => {
        const member = getMember(entry.user?._id);
        const totalPaid = entry.payments.reduce((sum, p) => sum + p.amountPaid, 0);
        return [
          `${entry.user?.FirstName} ${entry.user?.LastName}`,
          entry.user?.email,
          member?.phoneNumber || '-',
          formatCurrency(member?.monthlySavings || 0),
          `${member?.bankName} (${member?.accountNumber})`,
          formatCurrency(totalPaid),
        ];
      }),
    });
    doc.save('admin-savings.pdf');
  };

  const handlePrint = () => window.print();

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-indigo-700">Admin – All User Savings</h1>
          <div className="flex gap-2">
            <button onClick={handleExportPDF} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-xl shadow hover:bg-green-700">
              <FileDown size={16} /> Export PDF
            </button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700">
              <Printer size={16} /> Print
            </button>
            <button onClick={() => setViewMode(viewMode === 'card' ? 'table' : 'card')} className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-xl shadow hover:bg-gray-900">
              {viewMode === 'card' ? <Table size={16} /> : <LayoutGrid size={16} />}
              {viewMode === 'card' ? 'Table View' : 'Card View'}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow flex items-center justify-between px-6 py-5 border">
          <div className="flex items-center gap-4">
            <Users className="text-indigo-600" size={30} />
            <div>
              <p className="text-sm text-gray-500">Total Saved by All Users</p>
              <h2 className="text-2xl font-bold text-indigo-800">{formatCurrency(totalSavings)}</h2>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 sm:grid-cols-2 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by user name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-gray-300 rounded-xl shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="p-3 border border-gray-300 rounded-xl"
          >
            <option value="">All Months</option>
            {["January","February","March","April","May","June","July","August","September","October","November","December"].map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Year (e.g. 2025)"
            value={yearFilter}
            onChange={(e) => {
              const val = e.target.value;
              if (val === '' || parseInt(val) >= 0) setYearFilter(val);
            }}
            className="p-3 border border-gray-300 rounded-xl"
          />
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto bg-white rounded-xl shadow border">
            <table className="min-w-full text-sm text-left text-gray-600">
              <thead className="bg-indigo-100 text-indigo-700 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Phone</th>
                  <th className="px-4 py-3">Monthly</th>
                  <th className="px-4 py-3">Bank</th>
                  <th className="px-4 py-3">Savings Type</th>
                  <th className="px-4 py-3">Staff Type</th>
                  <th className="px-4 py-3">Latest Payment</th>
                  <th className="px-4 py-3">Total Paid</th>
                </tr>
              </thead>
              <tbody>
                {filteredSavings.map((entry) => {
                  const member = getMember(entry.user?._id);
                  const latest = entry.payments.at(-1);
                  const total = entry.payments.reduce((sum, p) => sum + p.amountPaid, 0);
                  return (
                    <tr key={entry._id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{entry.user?.FirstName} {entry.user?.LastName}</td>
                      <td className="px-4 py-3">{entry.user?.email}</td>
                      <td className="px-4 py-3">{member?.phoneNumber || '—'}</td>
                      <td className="px-4 py-3">{formatCurrency(member?.monthlySavings || 0)}</td>
                      <td className="px-4 py-3">{member?.bankName} ({member?.accountNumber})</td>
                      <td className="px-4 py-3">{member?.SavingsType || '—'}</td>
                      <td className="px-4 py-3">{member?.staffType || '—'}</td>
                      <td className="px-4 py-3">{latest?.month} {latest?.year}</td>
                      <td className="px-4 py-3 text-green-600 font-semibold">{formatCurrency(total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredSavings.map((entry) => {
              const member = getMember(entry.user?._id);
              const latest = entry.payments.at(-1);
              const total = entry.payments.reduce((sum, p) => sum + p.amountPaid, 0);
              return (
                <div key={entry._id} className="bg-white rounded-2xl shadow-md border p-6 hover:scale-[1.01] transition-all duration-300">
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-indigo-700">{entry.user?.FirstName} {entry.user?.LastName}</h2>
                    <p className="text-sm text-gray-500">{entry.user?.email}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                    <p><strong>Phone:</strong> {member?.phoneNumber || '—'}</p>
                    <p><strong>App ID:</strong> {member?.appId || '—'}</p>
                    <p><strong>Member ID:</strong> {member?.memberId || '—'}</p>
                    <p><strong>Monthly:</strong> {formatCurrency(member?.monthlySavings || 0)}</p>
                    <p><strong>Bank:</strong> {member?.bankName} ({member?.accountNumber})</p>
                    <p><strong>Savings Type:</strong> {member?.SavingsType || '—'}</p>
                    <p><strong>Staff Type:</strong> {member?.staffType || '—'}</p>
                    <p><strong>Total Paid:</strong> {formatCurrency(total)}</p>
                  </div>

                  {latest && (
                    <div className="mt-4 p-4 bg-indigo-50 rounded-xl text-sm">
                      <p className="text-indigo-600 font-semibold mb-1">Latest Payment</p>
                      <p><strong>Month:</strong> {latest.month} {latest.year}</p>
                      <p><strong>Amount:</strong> {formatCurrency(latest.amountPaid)}</p>
                      <p><strong>Date:</strong> {format(new Date(latest.datePaid), 'dd MMM yyyy, h:mm a')}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="flex justify-center mt-10">
          <ReactPaginate
            previousLabel={'← Previous'}
            nextLabel={'Next →'}
            breakLabel={'...'}
            pageCount={totalPages}
            onPageChange={({ selected }) => setPage(selected + 1)}
            containerClassName={'flex gap-2'}
            pageClassName={'px-3 py-1 border rounded-lg text-gray-700'}
            activeClassName={'bg-indigo-600 text-white'}
            previousClassName={'px-3 py-1 border rounded-lg text-gray-700'}
            nextClassName={'px-3 py-1 border rounded-lg text-gray-700'}
            disabledClassName={'opacity-50'}
          />
        </div>
      </div>
    </div>
  );
}

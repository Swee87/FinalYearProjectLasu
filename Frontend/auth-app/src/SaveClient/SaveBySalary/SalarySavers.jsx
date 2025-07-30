import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllSavingsBySalary, updatePaymentStatus } from '../../services/AdminRoutes/SalaryBySavings';
import ReactPaginate from 'react-paginate';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const SalarySaversList = () => {
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;

  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['salarySavers'],
    queryFn: fetchAllSavingsBySalary,
    select: (res) => res.data,
    retry: 2,
    refetchOnWindowFocus: false,
  });

  const handlePageChange = ({ selected }) => setPage(selected);

  if (isLoading) return <Loading />;
  if (isError) return <ErrorDisplay error={error} />;
  if (!data || data.length === 0) return <EmptyMessage />;

  const pageCount = Math.ceil(data.length / itemsPerPage);
  const paginatedData = data.slice(page * itemsPerPage, (page + 1) * itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Salary Savings Tracking</h1>
            <p className="text-gray-600 mt-2">Monitor and manage monthly savings payments</p>
          </div>
          <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow-sm">
            <p className="text-sm font-medium text-gray-600">
              Showing <span className="text-indigo-600 font-bold">{paginatedData.length}</span> of{' '}
              <span className="text-indigo-600 font-bold">{data.length}</span> members
            </p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Savings
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payments
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progress
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {console.log(paginatedData)}
              {paginatedData.map((member) => (
                <SaverRow key={member.user._id} member={member} queryClient={queryClient} />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pageCount > 1 && (
        <div className="mt-8 flex justify-center">
          <ReactPaginate
            previousLabel={<ChevronLeftIcon />}
            nextLabel={<ChevronRightIcon />}
            breakLabel="..."
            pageCount={pageCount}
            onPageChange={handlePageChange}
            containerClassName="flex items-center space-x-1 text-sm font-medium"
            pageClassName="px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
            activeClassName="bg-indigo-600 text-white hover:bg-indigo-700"
            previousClassName="px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
            nextClassName="px-3 py-1.5 rounded-md hover:bg-gray-100 transition-colors"
            disabledClassName="opacity-50 cursor-not-allowed"
          />
        </div>
      )}
    </div>
  );
};

const SaverRow = ({ member, queryClient }) => {
  const regDate = new Date(member.user.createdAt);
  const regYear = regDate.getFullYear();
  const regMonth = regDate.getMonth(); // 0-indexed

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();

  const [selectedYear, setSelectedYear] = useState(currentYear);

  const years = Array.from({ length: currentYear - regYear + 2 }, (_, i) => regYear + i);

  const payments = member.savingsTrack?.payments || [];
  const yearPayments = payments.filter(p => p.year === selectedYear);

  // Determine which months to show
  const monthsToShow = MONTHS.filter((_, index) => {
    if (selectedYear < regYear) return false;
    if (selectedYear === regYear && index < regMonth) return false;
    if (selectedYear === currentYear && index > currentMonth) return false;
    return true;
  });

  const paidMonths = yearPayments.filter(p => p.paidPerMonth && monthsToShow.includes(p.month)).length;
  const progress = Math.round((paidMonths / monthsToShow.length) * 100) || 0;

  const progressColor = progress === 100
    ? 'bg-green-500'
    : progress >= 75
    ? 'bg-indigo-500'
    : progress >= 50
    ? 'bg-blue-500'
    : 'bg-amber-500';

  return (
    <tr className="hover:bg-gray-50 transition-colors">
      {/* Member Info */}
      <td className="px-6 py-5 min-w-[220px]">
        <div className="flex items-center">
          <div className="bg-indigo-100 rounded-lg w-10 h-10 flex items-center justify-center">
            <span className="text-indigo-800 font-medium">
              {member.user.FirstName.charAt(0)}{member.user.LastName.charAt(0)}
            </span>
          </div>
          <div className="ml-4">
            <h3 className="text-base font-semibold text-gray-900">
              {member.user.FirstName} {member.user.LastName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">ID: {member.user._id.substring(0, 8)}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {member.staffType}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Verified
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Savings Info */}
      <td className="px-6 py-5 min-w-[160px]">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-baseline">
            <span className="text-2xl font-bold text-gray-900">
              ₦{member.monthlySavings.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500 ml-1">/month</span>
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center text-sm text-gray-600">
              <BankIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span>{member.bankName}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <CreditCardIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span>•••• {member.accountNumber.slice(-4)}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" />
              <span>{member.phoneNumber}</span>
            </div>

            <div className="flex items-center text-sm text-gray-600">
              {/* <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" /> */}
              <span>{member.memberID}</span>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              {/* <PhoneIcon className="h-4 w-4 text-gray-400 mr-2" /> */}
              <span>{member.appId}</span>
            </div>
          </div>
        </div>
      </td>

      {/* Monthly Payments */}
      <td className="px-6 py-5 min-w-[240px]">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="year-select" className="text-sm font-medium text-gray-700">
              Select Year:
            </label>
            <span className="text-xs text-gray-500">
              {paidMonths} of {monthsToShow.length} paid
            </span>
          </div>
          <select
            id="year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
          >
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {monthsToShow.map((month) => (
            <MonthButton
              key={`${month}-${selectedYear}`}
              month={month}
              member={member}
              selectedYear={selectedYear}
              queryClient={queryClient}
              regMonth={regMonth}
              regYear={regYear}
              currentMonth={currentMonth}
              currentYear={currentYear}
            />
          ))}
        </div>
      </td>

      {/* Progress */}
      <td className="px-6 py-5">
        <div className="flex flex-col items-center">
          <div className="relative w-24 h-24">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="8"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                strokeLinecap="round"
                stroke={
                  progress === 100
                    ? '#10b981'
                    : progress >= 75
                    ? '#6366f1'
                    : progress >= 50
                    ? '#3b82f6'
                    : '#f59e0b'
                }
                strokeWidth="8"
                strokeDasharray={2 * Math.PI * 45}
                strokeDashoffset={2 * Math.PI * 45 * (1 - progress / 100)}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-gray-900">{progress}%</span>
              <span className="text-xs text-gray-500 mt-1">Complete</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm text-gray-600">
              {paidMonths} of {monthsToShow.length} months
            </div>
            {progress === 100 && (
              <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircleIcon className="h-4 w-4 mr-1" />
                Payment Complete
              </div>
            )}
          </div>
        </div>
      </td>
    </tr>
  );
};

const MonthButton = ({
  month,
  member,
  selectedYear,
  queryClient,
  regMonth,
  regYear,
  currentMonth,
  currentYear
}) => {
  const monthIndex = MONTHS.indexOf(month);
  const isPaid = member.savingsTrack?.payments?.some(
    p => p.month === month && p.year === selectedYear && p.paidPerMonth
  );

  const isBeforeRegistration =
    selectedYear < regYear || (selectedYear === regYear && monthIndex < regMonth);

  const isFutureMonth =
    selectedYear > currentYear || (selectedYear === currentYear && monthIndex > currentMonth);

  const disabled = isBeforeRegistration || isFutureMonth;

  const mutation = useMutation({
    mutationFn: () => updatePaymentStatus(member.user._id, {
      month,
      year: selectedYear,
      amountPaid: isPaid ? 0 : member.monthlySavings,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['salarySavers'] });
    },
  });

  return (
    <button
      onClick={() => !disabled && mutation.mutate()}
      disabled={disabled || mutation.isLoading}
      title={
        isBeforeRegistration
          ? `User registered in ${MONTHS[regMonth]} ${regYear}`
          : isFutureMonth
          ? "Cannot mark future months"
          : `Mark ${month} as ${isPaid ? 'unpaid' : 'paid'}`
      }
      className={`
        relative flex flex-col items-center justify-center h-14 rounded-lg border transition-all
        ${disabled ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed' : ''}
        ${isPaid ? 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100' : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'}
        ${selectedYear === currentYear && monthIndex === currentMonth ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
        ${mutation.isLoading ? 'cursor-wait opacity-75' : ''}
      `}
    >
      <span className="text-xs font-medium mb-1">{month.substring(0, 3)}</span>
      {isPaid ? (
        <CheckIcon className="h-4 w-4 text-green-500" />
      ) : (
        <span className="text-xs opacity-70">—</span>
      )}
      {mutation.isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70">
          <div className="w-4 h-4 border-t-2 border-indigo-500 rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

// Icons
const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const BankIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21h18M4 18h16M6 10v7m4-7v7m4-7v7m4-7v7M4 8l8-6 8 6" />
  </svg>
);

const CreditCardIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  </svg>
);

const PhoneIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Loading
const Loading = () => (
  <div className="flex justify-center items-center min-h-[60vh]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600 mx-auto"></div>
      <p className="mt-4 text-lg font-medium text-gray-600">Loading savings data...</p>
    </div>
  </div>
);

// Error
const ErrorDisplay = ({ error }) => (
  <div className="max-w-3xl mx-auto mt-16">
    <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-medium text-red-800">Failed to load data</h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{error.message}</p>
            {error.status && <p className="mt-2">Status code: {error.status}</p>}
          </div>
          <div className="mt-4">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Empty
const EmptyMessage = () => (
  <div className="max-w-3xl mx-auto mt-16 text-center">
    <svg className="mx-auto h-24 w-24 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
    <h3 className="mt-4 text-2xl font-medium text-gray-900">No salary savers found</h3>
    <p className="mt-2 text-lg text-gray-500 max-w-2xl mx-auto">
      Currently there are no verified members saving via salary deduction. When new members are verified, they will appear here.
    </p>
  </div>
);
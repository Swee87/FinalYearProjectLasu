import { useState, useEffect } from 'react';
import { socket } from '../services/socket'
import {
  FiMenu, FiX, FiHome, FiUsers, FiDollarSign,
  FiPieChart, FiSettings, FiCreditCard, FiSearch, FiTarget, FiList,
  FiUserPlus, FiClock, FiBell
} from 'react-icons/fi';
import { FaProductHunt } from "react-icons/fa";

import { DashboardPage } from './AdminPages/AdminDashboard';
import { MembersPage } from './AdminPages/AdminMemberPage';
import { SavingsPage } from './AdminPages/SavingsPage';
import { LoansPage } from './AdminPages/LoansPage';
import { ReportsPage } from './AdminPages/ReportPage';
import { SettingsPage } from './AdminPages/SettingsPage';
import { WalletsPage } from './AdminPages/WalletsPage';
import { ProcurementPage } from './AdminPages/ProcurementPage';
import { ShareCapitalPage } from './AdminPages/ShareCapitalPage';
import { StatsCard } from './AdminPages/StatisticCard';
import { Loan } from './Loan';
import { LoanDetails } from './LoanDetails';
import { MembershipApproval } from '../Admin/approveMember';
import { AdminTransactions } from './AdminTransactions';
import { AdminSavings } from './AdminSavings';
import { OnboardUserForm } from '../Admin/OnboardUser';
import { FetchLoanHistory } from './fetchLoanHistory';
import { Notification } from './AllNotifications';
import { SalarySaversList } from '../SaveClient/SaveBySalary/SalarySavers';
import { ProductDashboard } from '../Admin/AdminProductManagement/ProductDashboard';


export const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    socket.on("notification", (data) => {
      setNotifications(prev => [data, ...prev]);
    });

    return () => socket.disconnect();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const handlePageChange = (page) => {
    setActivePage(page);
    setMobileSidebarOpen(false);
  };

  const menuItems = [
    { name: 'Dashboard', icon: FiHome },
    { name: 'Members', icon: FiUsers },
    { name: 'Savings', icon: FiDollarSign },
    { name: 'Loans', icon: FiCreditCard },
    { name: 'Reports', icon: FiPieChart },
    { name: 'Settings', icon: FiSettings },
    { name: 'LoanDetails', icon: FiTarget },
    { name: 'Transaction', icon: FiList },
    { name: 'OnboardUser', icon: FiUserPlus },
    { name: 'LoanHistory', icon: FiClock },
    {name:'SalarySavers', icon : FiDollarSign},
    {name: 'Product', icon: FaProductHunt},
  ];

  const pageComponents = {
    Dashboard: <DashboardPage onNavigate={handlePageChange} />,
    Members: <MembershipApproval />,
    Savings: <AdminSavings />,
    Loans: <Loan />,
    Reports: <ReportsPage />,
    Settings: <SettingsPage />,
    Wallets: <WalletsPage />,
    Procurement: <ProcurementPage />,
    ShareCapital: <ShareCapitalPage />,
    Stats: <StatsCard />,
    LoanDetails: <LoanDetails />,
    Transaction: <AdminTransactions />,
    OnboardUser: <OnboardUserForm />,
    LoanHistory: <FetchLoanHistory />,
    SalarySavers: <SalarySaversList />,
    Product: <ProductDashboard />

  };

  const baseSidebarWidth = sidebarOpen ? 'w-64' : 'w-20';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <aside
        className={`fixed lg:relative z-50 bg-indigo-800 text-white transition-all duration-300 ease-in-out flex-shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${baseSidebarWidth}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-indigo-700">
          {sidebarOpen && <h1 className="text-xl font-bold whitespace-nowrap">Lasu</h1>}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-indigo-700 lg:block hidden"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <button
            onClick={toggleMobileSidebar}
            className="p-1 rounded-md hover:bg-indigo-700 lg:hidden block"
            aria-label="Close sidebar"
          >
            <FiX size={20} />
          </button>
        </div>

        <nav className={`p-4 ${sidebarOpen ? 'overflow-y-auto h-[calc(100vh-64px)]' : 'overflow-visible'}`}>
          <ul className="space-y-2">
            {menuItems.map((item, idx) => (
              <li key={idx} className="relative group">
                <button
                  onClick={() => handlePageChange(item.name)}
                  className={`w-full flex items-center justify-center p-3 rounded-md hover:bg-indigo-700 relative transition-colors ${
                    activePage === item.name ? 'bg-indigo-700' : ''
                  }`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span className="ml-3">{item.name}</span>}

                  {!sidebarOpen && (
                    <div
                      className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1 bg-gray-900 text-white text-sm rounded shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                      style={{ zIndex: 9999 }}
                    >
                      {item.name}
                    </div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ml-0 lg:ml-${sidebarOpen ? '[16rem]' : '[5rem]'}`}>
        <header className="bg-white shadow-sm p-4 flex items-center justify-between sticky top-0 z-10">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-md hover:bg-gray-100 lg:hidden block"
            aria-label="Open sidebar"
          >
            <FiMenu size={20} />
          </button>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <FiSearch className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full max-w-xs"
              />
            </div>
            <div className="absolute right-4 cursor-pointer" onClick={() => setShowNotifications(!showNotifications)}>
             { <Notification/>}
            </div>
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-indigo-600">
              AD
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 z-0 relative">
          {pageComponents[activePage] || <div>Page not found</div>}
        </div>
      </div>
    </div>
  );
};

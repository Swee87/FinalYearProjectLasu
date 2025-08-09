import { useState } from 'react';
import {
  FiMenu, FiX, FiHome, FiUsers, FiDollarSign,
  FiPieChart, FiSettings, FiCreditCard, FiSearch,FiTarget 
} from 'react-icons/fi';
import { GrTransaction } from "react-icons/gr";
import { MdSavings } from "react-icons/md";
import { MdAttachMoney } from "react-icons/md"


import { AllLoan } from '../LoanClient/AllLoans';
import { ReportsPage } from '../Dashboard/AdminPages/ReportPage';
import { SettingsPage } from '../Dashboard/AdminPages/SettingsPage';
import { WalletsPage } from '../Dashboard/AdminPages/WalletsPage';
import { ClientDashboard } from './clientdash';
import { VerifyMemberShip } from './verifyMembership';
import { SaveDashboard } from '../SaveClient/SaveDashboard';
import { UserReportPage } from './UserReportPage';
import { UserLoanDetails } from '../LoanClient/usersLoanDetail';
import { LoanReport } from './LoanReport';
import { SavingsReport } from './SavingsReport';


export const ClientGeneralDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('Dashboard');

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const toggleMobileSidebar = () => setMobileSidebarOpen(!mobileSidebarOpen);
  const handlePageChange = (page) => {
    setActivePage(page);
    setMobileSidebarOpen(false); // Close mobile sidebar on navigation
  };

  const menuItems = [
    { name: 'Dashboard', icon: FiHome },
    { name: 'Membership', icon: FiUsers },
    { name: 'Savings', icon: FiDollarSign },
    { name: 'AllLoans', icon: FiCreditCard },
    { name: 'Reports', icon: FiPieChart },
    { name: 'Settings', icon: FiSettings },
    { name: 'LoanDetails', icon: FiTarget },
    { name:'SavingsReport', icon: MdSavings },
    { name: 'LoanReport', icon: MdAttachMoney },
    {name: 'Transaction History', icon:GrTransaction }
  ];

  // Page components mapping
  const pageComponents = {
    // Dashboard: <DashboardPage onNavigate={handlePageChange} />,
    Dashboard:<ClientDashboard/>,
    Membership: <VerifyMemberShip  />,
    Savings: <SaveDashboard />,
     AllLoans: <AllLoan/>,
    Reports: <UserReportPage />,
    Settings: <SettingsPage />,
    Wallets: <WalletsPage />,
    LoanReport: <LoanReport />,
    SavingsReport: <SavingsReport />,
    LoanReport: <LoanReport />,
    // Procurement: <ProcurementPage />,
    // ShareCapital: <ShareCapitalPage />,
    // Stats: <StatsCard />,
    LoanDetails: <UserLoanDetails />,
  };

  const baseSidebarWidth = sidebarOpen ? 'w-64' : 'w-20';

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
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
                  {sidebarOpen && (
                    <span className="ml-3">{item.name}</span>
                  )}

                  {/* Tooltip to the right */}
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

      {/* Main content */}
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
            <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold cursor-pointer hover:bg-indigo-600">
              AD
            </div>
            
          </div>
        </header>

        {/* Dynamic page content */}
        <div className="flex-1 overflow-y-auto p-6 z-0 relative">
          {pageComponents[activePage] || <div>Page not found</div>}
        </div>
      </div>
    </div>
  );
};
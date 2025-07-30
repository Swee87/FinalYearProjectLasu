import React from 'react';
import { StatsCard } from './StatisticCard';
import {
  FiUsers, FiDollarSign, FiCreditCard, FiPieChart, FiHome
} from 'react-icons/fi';

export const DashboardPage = ({ onNavigate }) => {
  const stats = [
    {
      title: "ACTIVE MEMBERS",
      value: "19,768",
      trend: "+2.5%",
      icon: <FiUsers className="text-indigo-500" size={20} />,
      change: "vs last month",
      tooltip: "Total number of active cooperative members",
      navigateTo: "Members"
    },
    {
      title: "TOTAL SAVINGS BALANCE",
      value: "₦4,096,382,079.38",
      trend: "+1.2%",
      icon: <FiDollarSign className="text-green-500" size={20} />,
      change: "vs last month",
      tooltip: "Combined savings across all member accounts",
      navigateTo: "Savings"
    },
    {
      title: "TOTAL WALLET BALANCE",
      value: "₦1,015,876,121.00",
      trend: "+0.8%",
      icon: <FiCreditCard className="text-blue-500" size={20} />,
      change: "vs last month",
      tooltip: "Available funds in member digital wallets",
      navigateTo: "Wallets"
    },
    {
      title: "TOTAL LOAN BALANCE",
      value: "₦2,889,251,583.98",
      trend: "-0.3%",
      icon: <FiDollarSign className="text-yellow-500" size={20} />,
      change: "vs last month",
      tooltip: "Outstanding loan amounts across all members",
      navigateTo: "Loans"
    },
    {
      title: "TOTAL PROCUREMENT BALANCE",
      value: "₦330,490,965.44",
      trend: "+1.7%",
      icon: <FiPieChart className="text-purple-500" size={20} />,
      change: "vs last month",
      tooltip: "Funds allocated for group procurement activities",
      navigateTo: "Procurement"
    },
    {
      title: "TOTAL SHARE CAPITAL BALANCE",
      value: "₦355,325,435.00",
      trend: "+0.5%",
      icon: <FiHome className="text-red-500" size={20} />,
      change: "vs last month",
      tooltip: "Member contributions to cooperative share capital",
      navigateTo: "ShareCapital"
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Today's Statistics</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            trend={stat.trend}
            icon={stat.icon}
            change={stat.change}
            tooltip={stat.tooltip}
            onClick={() => onNavigate(stat.navigateTo)}
          />
        ))}
      </div>
    </div>
  );
};

"use client"

import React from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { formatVND, formatCurrency } from '../../utils/currency';
import { getVietnameseGreeting } from '../../utils/helpers';
import { TrendingUp, TrendingDown, Wallet, Eye, EyeOff } from 'lucide-react';
import { QuickActions } from './QuickActions';
import { RecentTransactions } from './RecentTransactions';
import { useSavingsGoals } from '../../contexts/SavingsGoalContext';
import { useState } from 'react';

interface DashboardViewProps {
  onNavigate: (view: 'savings' | 'trends' | 'reports' | 'projects') => void;
}

export function DashboardView({ onNavigate }: DashboardViewProps) {
  const { getBalance, getIncomeTotal, getExpenseTotal, transactions } =
    useTransactions();
  const { getTotalSavings, goals } = useSavingsGoals();
  const { getTotalPortfolioValue, getProfitableProjects, getLosingProjects } =
    useProjects();
  const [showBalance, setShowBalance] = useState(true);

  const balance = getBalance();
  const income = getIncomeTotal();
  const expense = getExpenseTotal();
  const totalSavings = getTotalSavings();
  const portfolioValue = getTotalPortfolioValue();
  const profitableProjects = getProfitableProjects();
  const losingProjects = getLosingProjects();
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          {getVietnameseGreeting()}! 👋
        </h1>
        <p className="text-gray-600">Quản lý tài chính thông minh</p>
      </div>

      {/* Balance Card */}
      <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Wallet className="w-6 h-6" />
            <span className="text-lg font-medium">Số dư hiện tại</span>
          </div>
          <button
            onClick={() => setShowBalance(!showBalance)}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            {showBalance ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
          </button>
        </div>
        <div className="text-3xl font-bold mb-2">
          {showBalance ? formatVND(balance) : '••••••• ₫'}
        </div>
        <div className="text-red-100">
          {balance >= 0 ? 'Tài chính ổn định' : 'Cần cân đối chi tiêu'}
        </div>
      </div>

      {/* Income/Expense Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Thu nhập</span>
          </div>
          <div className="text-xl font-bold text-green-700">
            {showBalance ? formatCurrency(income, true) : '•••••'}
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Chi tiêu</span>
          </div>
          <div className="text-xl font-bold text-red-700">
            {showBalance ? formatCurrency(expense, true) : '•••••'}
          </div>
        </div>
      </div>

      {/* Savings Goals Summary */}
      {totalSavings > 0 && (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">
              Tiết kiệm & Mục tiêu
            </h3>
            <button
              onClick={() => onNavigate('savings')}
              className="text-blue-600 text-xs sm:text-sm font-medium hover:text-blue-700"
            >
              Xem chi tiết →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-green-600">
                {showBalance ? formatCurrency(totalSavings, true) : '•••••'}
              </div>
              <div className="text-xs sm:text-sm text-green-700">
                Tổng tiết kiệm
              </div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-blue-600">
                {goals.filter((g) => !g.isCompleted).length}
              </div>
              <div className="text-xs sm:text-sm text-blue-700">
                Mục tiêu đang thực hiện
              </div>
            </div>
          </div>

          {/* Show progress of top 2 active goals */}
          {goals
            .filter((g) => !g.isCompleted)
            .slice(0, 2)
            .map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100;
              return (
                <div key={goal.id} className="mb-3 last:mb-0">
                  <div className="flex justify-between text-xs sm:text-sm mb-1">
                    <span className="text-gray-600 truncate">{goal.title}</span>
                    <span className="font-medium">{progress.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      )}
      {/* Project Portfolio Summary */}
      {(profitableProjects.length > 0 || losingProjects.length > 0) && (
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Danh mục dự án</h3>
            <button
              onClick={() => onNavigate('projects')}
              className="text-blue-600 text-xs sm:text-sm font-medium hover:text-blue-700"
            >
              Xem chi tiết →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-green-600">
                {profitableProjects.length}
              </div>
              <div className="text-xs sm:text-sm text-green-700">
                Dự án có lãi
              </div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-base sm:text-lg font-bold text-red-600">
                {losingProjects.length}
              </div>
              <div className="text-xs sm:text-sm text-red-700">
                Dự án thua lỗ
              </div>
            </div>
          </div>

          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div
              className={`text-lg sm:text-xl font-bold ${
                portfolioValue.totalProfit >= 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {portfolioValue.totalProfit >= 0 ? '+' : ''}
              {formatCurrency(portfolioValue.totalProfit, true)}
            </div>
            <div className="text-xs sm:text-sm text-gray-700">
              Tổng lợi nhuận dự án
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <QuickActions onNavigate={onNavigate} />

      {/* Recent Transactions */}
      <RecentTransactions
        transactions={recentTransactions}
        showBalance={showBalance}
      />
    </div>
  );
}

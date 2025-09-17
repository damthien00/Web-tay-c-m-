import React, { useState } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { CATEGORY_INFO } from '../../constants/vietnamese';
import { formatCurrency } from '../../utils/currency';
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from 'lucide-react';

export function SpendingTrendsView() {
  const { transactions } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');

  const getDateRange = (period: 'week' | 'month' | 'quarter') => {
    const now = new Date();
    const ranges = {
      week: 7,
      month: 30,
      quarter: 90
    };

    const days = ranges[period];
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return { startDate, endDate: now };
  };

  const getTransactionsInPeriod = (period: 'week' | 'month' | 'quarter') => {
    const { startDate, endDate } = getDateRange(period);
    return transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  };

  const getSpendingByCategory = (periodTransactions: any[]) => {
    const categorySpending: { [key: string]: number } = {};
    periodTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
      });

    return Object.entries(categorySpending)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8);
  };

  const getWeeklyTrend = () => {
    const weeks = [];
    for (let i = 3; i >= 0; i--) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() - (i * 7));
      const startDate = new Date(endDate);
      startDate.setDate(startDate.getDate() - 6);

      const weekTransactions = transactions.filter(t => {
        const transactionDate = new Date(t.createdAt);
        return transactionDate >= startDate && transactionDate <= endDate;
      });

      const weekExpense = weekTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      weeks.push({
        label: `Tuần ${4 - i}`,
        amount: weekExpense,
        startDate: startDate.toLocaleDateString('vi-VN'),
        endDate: endDate.toLocaleDateString('vi-VN')
      });
    }
    return weeks;
  };

  const currentPeriodTransactions = getTransactionsInPeriod(selectedPeriod);
  const categorySpending = getSpendingByCategory(currentPeriodTransactions);
  const weeklyTrend = getWeeklyTrend();

  const totalExpense = currentPeriodTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = currentPeriodTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const maxWeeklyExpense = Math.max(...weeklyTrend.map(w => w.amount));

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Xu hướng chi tiêu</h1>
        <p className="text-gray-600">Phân tích thói quen tài chính của bạn</p>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">Khoảng thời gian</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'week', label: '7 ngày qua' },
            { key: 'month', label: '30 ngày qua' },
            { key: 'quarter', label: '90 ngày qua' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key as any)}
              className={`p-3 rounded-lg font-medium transition-colors ${
                selectedPeriod === key
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Period Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-800">Thu nhập</span>
          </div>
          <div className="text-xl font-bold text-green-700">
            {formatCurrency(totalIncome, true)}
          </div>
        </div>

        <div className="bg-red-50 rounded-xl p-4 border border-red-200">
          <div className="flex items-center space-x-2 mb-2">
            <TrendingDown className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-800">Chi tiêu</span>
          </div>
          <div className="text-xl font-bold text-red-700">
            {formatCurrency(totalExpense, true)}
          </div>
        </div>
      </div>

      {/* Weekly Trend Chart */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center space-x-2 mb-4">
          <BarChart3 className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Xu hướng chi tiêu theo tuần</h3>
        </div>

        <div className="space-y-3">
          {weeklyTrend.map((week, index) => {
            const percentage = maxWeeklyExpense > 0 ? (week.amount / maxWeeklyExpense * 100) : 0;

            return (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{week.label}</span>
                  <span className="font-bold text-red-600">
                    {formatCurrency(week.amount, true)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-red-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {week.startDate} - {week.endDate}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-4">Chi tiêu theo danh mục</h3>

        {categorySpending.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Chưa có dữ liệu chi tiêu</p>
        ) : (
          <div className="space-y-3">
            {categorySpending.map(([categoryKey, amount]) => {
              const category = CATEGORY_INFO[categoryKey as keyof typeof CATEGORY_INFO];
              const percentage = totalExpense > 0 ? (amount / totalExpense * 100) : 0;

              return (
                <div key={categoryKey} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{category.icon}</span>
                      <span className="font-medium text-gray-800">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-red-600">{formatCurrency(amount, true)}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-red-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Insights */}
      <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
        <h3 className="font-semibold text-blue-800 mb-3">Nhận xét về xu hướng</h3>
        <div className="space-y-2 text-sm text-blue-700">
          {categorySpending.length > 0 && (
            <p>
              • Danh mục chi tiêu nhiều nhất: <strong>{CATEGORY_INFO[categorySpending[0][0] as keyof typeof CATEGORY_INFO]?.name}</strong>
            </p>
          )}
          {totalIncome > totalExpense && (
            <p>• Bạn đang có thặng dư {formatCurrency(totalIncome - totalExpense, true)} trong kỳ này</p>
          )}
          {totalExpense > totalIncome && (
            <p>• Bạn đang chi tiêu vượt thu nhập {formatCurrency(totalExpense - totalIncome, true)}</p>
          )}
          <p>• Trung bình chi tiêu mỗi ngày: {formatCurrency(totalExpense / (selectedPeriod === 'week' ? 7 : selectedPeriod === 'month' ? 30 : 90), true)}</p>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { AddTransactionModal } from './AddTransactionModal';
import { CATEGORY_INFO } from '../../constants/vietnamese';
import { formatVND, formatCurrency } from '../../utils/currency';
import { PieChart, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export function AnalyticsView() {
  const { transactions, getCategoryExpenses, getIncomeTotal, getExpenseTotal } = useTransactions();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');
  const [showAddModal, setShowAddModal] = useState(false);

  const categoryExpenses = getCategoryExpenses();
  const totalIncome = getIncomeTotal();
  const totalExpense = getExpenseTotal();
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

  const topCategories = Object.entries(categoryExpenses)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const getFinancialAdvice = () => {
    if (savingsRate > 20) {
      return {
        message: "Tuyệt vời! Bạn đang tiết kiệm rất tốt.",
        advice: "Hãy xem xét đầu tư để tăng thu nhập từ tiền tiết kiệm.",
        color: "text-green-600"
      };
    } else if (savingsRate > 10) {
      return {
        message: "Bạn đang tiết kiệm ở mức trung bình.",
        advice: "Cố gắng giảm chi tiêu không cần thiết để tăng tỷ lệ tiết kiệm.",
        color: "text-yellow-600"
      };
    } else {
      return {
        message: "Cần cải thiện thói quen tiết kiệm.",
        advice: "Hãy xem xét lại các khoản chi tiêu và tìm cách cắt giảm.",
        color: "text-red-600"
      };
    }
  };

  const advice = getFinancialAdvice();

  return (
    <>
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Phân tích tài chính</h1>
        <p className="text-gray-600">Hiểu rõ thói quen chi tiêu của bạn</p>
      </div>

      {/* Period Selection */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center space-x-2 mb-3">
          <Calendar className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">Thời gian</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'week', label: 'Tuần này' },
            { key: 'month', label: 'Tháng này' },
            { key: 'year', label: 'Năm này' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setSelectedPeriod(key as any)}
              className={`p-2 rounded-lg font-medium transition-colors ${
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

      {/* Financial Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-4">Tổng quan tài chính</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <span className="text-gray-600">Tổng thu nhập</span>
            </div>
            <span className="font-bold text-green-600">{formatCurrency(totalIncome, true)}</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <span className="text-gray-600">Tổng chi tiêu</span>
            </div>
            <span className="font-bold text-red-600">{formatCurrency(totalExpense, true)}</span>
          </div>

          <div className="border-t pt-3">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-800">Tỷ lệ tiết kiệm</span>
              <span className={`font-bold ${advice.color}`}>
                {savingsRate.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Advice */}
      <div className={`rounded-xl p-4 ${
        savingsRate > 20 ? 'bg-green-50 border-green-500' :
        savingsRate > 10 ? 'bg-yellow-50 border-yellow-500' :
        'bg-red-50'
      }`}>
        <h3 className={`font-semibold mb-2 ${advice.color}`}>Lời khuyên tài chính</h3>
        <p className={`${advice.color} mb-2`}>{advice.message}</p>
        <p className="text-gray-600 text-sm">{advice.advice}</p>
      </div>

      {/* Top Spending Categories */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <div className="flex items-center space-x-2 mb-4">
          <PieChart className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Chi tiêu theo danh mục</h3>
        </div>

        {topCategories.length === 0 ? (
          <p className="text-center text-gray-500 py-4">Chưa có dữ liệu chi tiêu</p>
        ) : (
          <div className="space-y-3">
            {topCategories.map(([categoryKey, amount]) => {
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

      {/* Monthly Trend (Simplified) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-4">Xu hướng chi tiêu</h3>
        <div className="text-center py-8 text-gray-500">
          <p>Biểu đồ xu hướng sẽ hiển thị ở đây</p>
          <p className="text-sm mt-1">Cần thêm dữ liệu từ nhiều tháng</p>
        </div>
      </div>
    </div>

    <AddTransactionModal
      isOpen={showAddModal}
      onClose={() => setShowAddModal(false)}
    />
    </>
  );
}

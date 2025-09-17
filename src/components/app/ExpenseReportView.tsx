import React, { useState } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { CATEGORY_INFO, PAYMENT_METHOD_INFO } from '../../constants/vietnamese';
import { formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/helpers';
import { FileText, Download, Calendar, Filter, TrendingDown } from 'lucide-react';

export function ExpenseReportView() {
  const { transactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getMonthlyTransactions = () => {
    return transactions.filter(t => {
      const transactionDate = new Date(t.createdAt);
      return transactionDate.getMonth() === selectedMonth &&
             transactionDate.getFullYear() === selectedYear;
    });
  };

  const monthlyTransactions = getMonthlyTransactions();
  const filteredTransactions = selectedCategory === 'all'
    ? monthlyTransactions
    : monthlyTransactions.filter(t => t.category === selectedCategory);

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const paymentMethodBreakdown = monthlyTransactions
    .reduce((acc, t) => {
      acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  const topPaymentMethods = Object.entries(paymentMethodBreakdown)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  const generateReport = () => {
    const monthName = new Date(selectedYear, selectedMonth).toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' });

    let report = `BÁO CÁO CHI TIÊU THÁNG ${monthName.toUpperCase()}\n`;
    report += `Được tạo ngày: ${new Date().toLocaleDateString('vi-VN')}\n\n`;

    report += `TỔNG QUAN:\n`;
    report += `- Tổng thu nhập: ${formatCurrency(monthlyIncome)}\n`;
    report += `- Tổng chi tiêu: ${formatCurrency(monthlyExpense)}\n`;
    report += `- Số dư: ${formatCurrency(monthlyIncome - monthlyExpense)}\n`;
    report += `- Số giao dịch: ${monthlyTransactions.length}\n\n`;

    if (topCategories.length > 0) {
      report += `CHI TIÊU THEO DANH MỤC:\n`;
      topCategories.forEach(([category, amount]) => {
        const categoryInfo = CATEGORY_INFO[category as keyof typeof CATEGORY_INFO];
        const percentage = (amount / monthlyExpense * 100).toFixed(1);
        report += `- ${categoryInfo.name}: ${formatCurrency(amount)} (${percentage}%)\n`;
      });
      report += '\n';
    }

    if (topPaymentMethods.length > 0) {
      report += `PHƯƠNG THỨC THANH TOÁN:\n`;
      topPaymentMethods.forEach(([method, amount]) => {
        const methodInfo = PAYMENT_METHOD_INFO[method as keyof typeof PAYMENT_METHOD_INFO];
        report += `- ${methodInfo.name}: ${formatCurrency(amount)}\n`;
      });
    }

    // Create and download the report
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bao-cao-chi-tieu-${selectedMonth + 1}-${selectedYear}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const months = [
    'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
    'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
  ];

  const expenseCategories = Object.keys(CATEGORY_INFO).filter(cat =>
    !['luong-chinh', 'thu-nhap-phu', 'kinh-doanh', 'dau-tu', 'tien-thuong', 'tien-cho'].includes(cat)
  );

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Báo cáo chi tiêu</h1>
          <p className="text-gray-600">Phân tích chi tiết tài chính</p>
        </div>
        <button
          onClick={generateReport}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Xuất báo cáo</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border space-y-4">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-600" />
          <span className="font-medium text-gray-800">Bộ lọc</span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tháng</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {months.map((month, index) => (
                <option key={index} value={index}>{month}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Năm</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Danh mục</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
          >
            <option value="all">Tất cả danh mục</option>
            {expenseCategories.map((cat) => (
              <option key={cat} value={cat}>
                {CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO].icon} {CATEGORY_INFO[cat as keyof typeof CATEGORY_INFO].name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-4">Tổng quan tháng {selectedMonth + 1}/{selectedYear}</h3>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome, true)}</div>
            <div className="text-sm text-green-700">Thu nhập</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpense, true)}</div>
            <div className="text-sm text-red-700">Chi tiêu</div>
          </div>
        </div>

        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className={`text-2xl font-bold ${monthlyIncome - monthlyExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(monthlyIncome - monthlyExpense, true)}
          </div>
          <div className="text-sm text-gray-700">
            {monthlyIncome - monthlyExpense >= 0 ? 'Thặng dư' : 'Thâm hụt'}
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {topCategories.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Top danh mục chi tiêu</h3>
          <div className="space-y-3">
            {topCategories.map(([categoryKey, amount]) => {
              const category = CATEGORY_INFO[categoryKey as keyof typeof CATEGORY_INFO];
              const percentage = (amount / monthlyExpense * 100);

              return (
                <div key={categoryKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">{category.name}</div>
                      <div className="text-sm text-gray-500">{percentage.toFixed(1)}% tổng chi tiêu</div>
                    </div>
                  </div>
                  <div className="font-bold text-red-600">
                    {formatCurrency(amount, true)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Payment Method Breakdown */}
      {topPaymentMethods.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">Phương thức thanh toán</h3>
          <div className="space-y-3">
            {topPaymentMethods.map(([methodKey, amount]) => {
              const method = PAYMENT_METHOD_INFO[methodKey as keyof typeof PAYMENT_METHOD_INFO];
              const percentage = ((amount / (monthlyIncome + monthlyExpense)) * 100);

              return (
                <div key={methodKey} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{method.icon}</span>
                    <div>
                      <div className="font-medium text-gray-800">{method.name}</div>
                      <div className="text-sm text-gray-500">{percentage.toFixed(1)}% tổng giao dịch</div>
                    </div>
                  </div>
                  <div className="font-bold text-gray-700">
                    {formatCurrency(amount, true)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Transaction Details */}
      {filteredTransactions.length > 0 && (
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <h3 className="font-semibold text-gray-800 mb-4">
            Chi tiết giao dịch ({filteredTransactions.length})
          </h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {filteredTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{CATEGORY_INFO[transaction.category].icon}</span>
                  <div>
                    <div className="font-medium text-gray-800 text-sm">{transaction.description}</div>
                    <div className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</div>
                  </div>
                </div>
                <div className={`font-bold text-sm ${
                  transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {monthlyTransactions.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">Không có dữ liệu</h3>
          <p className="text-gray-500">Chưa có giao dịch nào trong tháng này</p>
        </div>
      )}
    </div>
  );
}

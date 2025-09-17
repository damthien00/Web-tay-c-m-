import React from 'react';
import { Transaction } from '../../types/Transaction';
import { CATEGORY_INFO, PAYMENT_METHOD_INFO } from '../../constants/vietnamese';
import { formatVND, formatCurrency } from '../../utils/currency';
import { formatDateTime } from '../../utils/helpers';
import { Clock } from 'lucide-react';

interface RecentTransactionsProps {
  transactions: Transaction[];
  showBalance: boolean;
}

export function RecentTransactions({ transactions, showBalance }: RecentTransactionsProps) {
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Giao dịch gần đây
        </h3>
        <div className="text-center py-8 text-gray-500">
          <p>Chưa có giao dịch nào</p>
          <p className="text-sm mt-1">Thêm giao dịch đầu tiên của bạn!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border">
      <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
        <Clock className="w-5 h-5 mr-2" />
        Giao dịch gần đây
      </h3>
      <div className="space-y-3">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${CATEGORY_INFO[transaction.category].color}`}>
                <span className="text-lg">{CATEGORY_INFO[transaction.category].icon}</span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{transaction.description}</p>
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  <span>{PAYMENT_METHOD_INFO[transaction.paymentMethod].icon}</span>
                  <span>{PAYMENT_METHOD_INFO[transaction.paymentMethod].name}</span>
                  <span>•</span>
                  <span>{formatDateTime(transaction.createdAt)}</span>
                </div>
              </div>
            </div>
            <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {transaction.type === 'income' ? '+' : '-'}
              {showBalance ? formatCurrency(transaction.amount, true) : '•••'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

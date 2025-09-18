import React from 'react';
import { X, Eye } from 'lucide-react';
import { Transaction, PaymentMethod, TransactionCategory } from '../../types/Transaction';
import { CATEGORY_INFO, PAYMENT_METHOD_INFO } from '../../constants/vietnamese';
import { formatCurrency } from '../../utils/currency';

interface ViewTransactionModalProps {
  transaction: Transaction;
  isOpen: boolean;
  onClose: () => void;
}

export function ViewTransactionModal({ transaction, isOpen, onClose }: ViewTransactionModalProps) {
  if (!isOpen) return null;

  const date = new Date(transaction.createdAt);
  const dateStr = date.toLocaleDateString();
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const category = CATEGORY_INFO[transaction.category as TransactionCategory];
  const method = PAYMENT_METHOD_INFO[transaction.paymentMethod as PaymentMethod];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50">
      <div className="bg-white w-full rounded-t-3xl max-h-[90vh] overflow-y-auto">
        <div className="max-w-md mx-auto p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-gray-600" />
              <h2 className="text-xl font-bold text-gray-800">Chi tiết giao dịch</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Đóng"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-2xl p-4 border">
            <div className="flex items-center space-x-4">
              <div className={`w-14 h-14 rounded-full flex items-center justify-center ${category.color}`}>
                <span className="text-2xl">{category.icon}</span>
              </div>
              <div className="flex-1">
                <div className={`text-2xl font-extrabold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, true)}
                </div>
                <div className="mt-1">
                  <span className={`inline-block px-2 py-0.5 text-xs rounded-full ${transaction.type === 'income' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {transaction.type === 'income' ? 'Thu nhập' : 'Chi tiêu'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <DetailRow label="Mô tả" value={transaction.description} />
            <DetailRow
              label="Danh mục"
              value={`${category.icon} ${category.name}`}
            />
            <DetailRow
              label="Phương thức"
              value={`${method.icon} ${method.name}`}
            />
            <DetailRow
              label="Thời gian"
              value={`${dateStr} • ${timeStr}`}
            />
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-black transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between p-3 bg-white rounded-xl border">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right ml-4">{value}</span>
    </div>
  );
}

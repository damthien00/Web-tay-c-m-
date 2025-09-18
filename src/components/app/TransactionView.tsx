import React, { useState } from 'react';
import { useTransactions } from '../../contexts/TransactionContext';
import { Transaction } from '../../types/Transaction';
import { CATEGORY_INFO, PAYMENT_METHOD_INFO } from '../../constants/vietnamese';
import { formatVND, formatCurrency } from '../../utils/currency';
import { formatDate } from '../../utils/helpers';
import { Search, Filter, Plus, Trash2, Edit3, Eye } from 'lucide-react';
import { AddTransactionModal } from './AddTransactionModal';
import { EditTransactionModal } from './EditTransactionModal';
import { ViewTransactionModal } from './ViewTransactionModal';

export function TransactionView() {
  const { transactions, deleteTransaction } = useTransactions();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [viewingTransaction, setViewingTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         CATEGORY_INFO[transaction.category].name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || transaction.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
    const date = formatDate(transaction.createdAt);
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  return (
    <>
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Quản lý giao dịch</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm giao dịch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent focus:outline-none"
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Thu nhập
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterType === 'expense'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Chi tiêu
            </button>
          </div>
        </div>

        {/* Transactions List */}
        <div className="space-y-4">
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>Không tìm thấy giao dịch nào</p>
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([date, dayTransactions]) => (
              <div key={date} className="space-y-2">
                <h3 className="font-semibold text-gray-600 text-sm uppercase tracking-wide">
                  {date}
                </h3>
                <div className="space-y-2">
                  {dayTransactions.map((transaction) => (
                    <div key={transaction.id} className="bg-white rounded-xl p-4 shadow-sm border">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${CATEGORY_INFO[transaction.category].color}`}>
                            <span className="text-xl">{CATEGORY_INFO[transaction.category].icon}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-800">{transaction.description}</p>
                            <p className="text-sm text-gray-500">{CATEGORY_INFO[transaction.category].name}</p>
                            <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                              <span>{PAYMENT_METHOD_INFO[transaction.paymentMethod].icon}</span>
                              <span>{PAYMENT_METHOD_INFO[transaction.paymentMethod].name}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <div className={`font-bold text-lg ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount, true)}
                          </div>
                          <div className="flex space-x-1 justify-end">
                            <button
                              onClick={() => setViewingTransaction(transaction)}
                              className="p-1 text-gray-400 hover:text-gray-700 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingTransaction(transaction)}
                              className="p-1 text-gray-400 hover:text-blue-600 rounded transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={async () => {
                                try { await deleteTransaction(transaction.id); } catch (e) { console.error(e); }
                              }}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {viewingTransaction && (
        <ViewTransactionModal
          transaction={viewingTransaction}
          isOpen={!!viewingTransaction}
          onClose={() => setViewingTransaction(null)}
        />
      )}

      {editingTransaction && (
        <EditTransactionModal
          transaction={editingTransaction}
          isOpen={!!editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </>
  );
}

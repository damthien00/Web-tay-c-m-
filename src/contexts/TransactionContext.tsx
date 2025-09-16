import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, TransactionCategory, PaymentMethod } from '../types/Transaction';
import { generateId } from '../utils/helpers';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getBalance: () => number;
  getIncomeTotal: () => number;
  getExpenseTotal: () => number;
  getCategoryExpenses: () => { [key in TransactionCategory]?: number };
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Load transactions from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('vietnamese-money-tracker-transactions');
    if (saved && JSON.parse(saved).length > 0) {
      setTransactions(JSON.parse(saved));
    } else {
      // Add sample data for demonstration
      const sampleTransactions: Transaction[] = [
        {
          id: generateId(),
          type: 'expense',
          amount: 35000,
          category: 'an-uong-duong-pho',
          description: 'Phở bò tái',
          paymentMethod: 'tien-mat',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          type: 'income',
          amount: 15000000,
          category: 'luong-chinh',
          description: 'Lương tháng 1',
          paymentMethod: 'chuyen-khoan',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          type: 'expense',
          amount: 150000,
          category: 'chi-phi-xe-may',
          description: 'Xăng xe máy',
          paymentMethod: 'tien-mat',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          type: 'expense',
          amount: 2500000,
          category: 'gui-tien-gia-dinh',
          description: 'Gửi tiền về quê',
          paymentMethod: 'chuyen-khoan',
          createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        },
        {
          id: generateId(),
          type: 'expense',
          amount: 80000,
          category: 'an-uong-duong-pho',
          description: 'Cơm tấm sườn',
          paymentMethod: 'momo',
          createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        },
      ];
      setTransactions(sampleTransactions);
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vietnamese-money-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(t => (t.id === id ? { ...t, ...updatedTransaction } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const getBalance = () => {
    return transactions.reduce((acc, transaction) => {
      return transaction.type === 'income' 
        ? acc + transaction.amount 
        : acc - transaction.amount;
    }, 0);
  };

  const getIncomeTotal = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getExpenseTotal = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);
  };

  const getCategoryExpenses = () => {
    const categoryTotals: { [key in TransactionCategory]?: number } = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    return categoryTotals;
  };

  return (
    <TransactionContext.Provider value={{
      transactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      getBalance,
      getIncomeTotal,
      getExpenseTotal,
      getCategoryExpenses,
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, TransactionCategory } from '../types/Transaction';
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

  // Hydrate from localStorage then fetch recent transactions from API
  useEffect(() => {
    let isMounted = true;

    // 1) Load cached transactions (if any)
    try {
      const saved = localStorage.getItem('vietnamese-money-tracker-transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setTransactions(parsed);
        }
      }
    } catch {
      // ignore parse errors
    }

    // 2) Fetch real recent transactions
    async function load() {
      try {
        const uid = typeof window !== 'undefined' ? (localStorage.getItem('userId') || 'demo-user') : 'demo-user';
        const res = await fetch(`/api/transactions/recent?userId=${encodeURIComponent(uid)}&limit=20`);
        const json = await res.json();
        if (!isMounted) return;
        if (Array.isArray(json?.data)) {
          const mapped: Transaction[] = json.data.map((t: any) => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount),
            category: t.category,
            description: t.description || '',
            paymentMethod: t.paymentMethod,
            createdAt: typeof t.createdAt === 'string' ? t.createdAt : new Date(t.createdAt).toISOString(),
            location: t.location || undefined,
            tags: t.tags || [],
          }));
          setTransactions(mapped);
        }
      } catch (e) {
        console.error(e);
      }
    }

    load();
    return () => { isMounted = false };
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

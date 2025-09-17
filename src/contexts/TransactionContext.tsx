import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, TransactionCategory } from '../types/Transaction';

interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getBalance: () => number;
  getIncomeTotal: () => number;
  getExpenseTotal: () => number;
  getCategoryExpenses: () => { [key in TransactionCategory]?: number };
  reloadRecentTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Helper to fetch and set recent transactions
  const reloadRecentTransactions = async () => {
    try {
      const uid = typeof window !== 'undefined' ? (localStorage.getItem('userId') || 'demo-user') : 'demo-user';
      const res = await fetch(`/api/transactions/recent?userId=${encodeURIComponent(uid)}&limit=20`);
      const json = await res.json();
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
  };

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
    (async () => { if (isMounted) await reloadRecentTransactions(); })();

    return () => { isMounted = false };
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('vietnamese-money-tracker-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt'>) => {
    try {
      const uid = typeof window !== 'undefined' ? (localStorage.getItem('userId') || 'demo-user') : 'demo-user';
      // Optimistic UI: insert locally first
      setTransactions(prev => [
        {
          ...transaction,
          id: `temp-${Date.now()}`,
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);

      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          type: transaction.type,
          amount: transaction.amount,
          category: transaction.category,
          description: transaction.description,
          paymentMethod: transaction.paymentMethod,
        }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        throw new Error(json?.error || 'Failed to create transaction');
      }

      // Reload recent transactions from server to replace the optimistic item with real one
      await reloadRecentTransactions();
    } catch (e) {
      console.error(e);
      // On failure, refetch to ensure consistency (and effectively revert optimistic insert)
      await reloadRecentTransactions();
      throw e;
    }
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
      reloadRecentTransactions,
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

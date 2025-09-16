"use client"
import { useEffect } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import { useProjects } from '../contexts/ProjectContext';
import { useSavingsGoals } from '../contexts/SavingsGoalContext';

export function useProjectIntegration() {
  const { addTransaction } = useTransactions();
  const { revenues, expenses } = useProjects();
  const { goals } = useSavingsGoals();

  useEffect(() => {
    // Sync project revenues to general income when they are marked as received
    revenues.forEach(revenue => {
      if (revenue.status === 'received' && revenue.paidAmount > 0) {
        // Check if this revenue has already been added to transactions
        const existingTransaction = localStorage.getItem(`project-revenue-${revenue.id}`);
        if (!existingTransaction) {
          addTransaction({
            type: 'income',
            amount: revenue.paidAmount,
            category: 'kinh-doanh',
            description: `Dự án: ${revenue.description}`,
            paymentMethod: 'chuyen-khoan',
          });

          // Mark as synced
          localStorage.setItem(`project-revenue-${revenue.id}`, 'synced');
        }
      }
    });

    // Sync project expenses to general expenses
    expenses.forEach(expense => {
      const existingTransaction = localStorage.getItem(`project-expense-${expense.id}`);
      if (!existingTransaction) {
        addTransaction({
          type: 'expense',
          amount: expense.amount,
          category: 'kinh-doanh',
          description: `Chi phí dự án: ${expense.description}`,
          paymentMethod: 'chuyen-khoan',
        });

        // Mark as synced
        localStorage.setItem(`project-expense-${expense.id}`, 'synced');
      }
    });

    // Handle savings goal contributions
    const handleSavingsContribution = (event: CustomEvent) => {
      const { goalId, amount, goalTitle } = event.detail;

      // Check if this contribution has already been recorded
      const contributionKey = `savings-contribution-${goalId}-${Date.now()}`;
      const existingContribution = localStorage.getItem(contributionKey);

      if (!existingContribution) {
        addTransaction({
          type: 'expense',
          amount: amount,
          category: 'tien-le-tet', // Using this as savings allocation category
          description: `Tiết kiệm: ${goalTitle}`,
          paymentMethod: 'chuyen-khoan',
        });

        // Mark as synced
        localStorage.setItem(contributionKey, 'synced');
      }
    };

    // Listen for savings goal contributions
    window.addEventListener('savingsGoalContribution', handleSavingsContribution as EventListener);

    return () => {
      window.removeEventListener('savingsGoalContribution', handleSavingsContribution as EventListener);
    };
  }, [revenues, expenses, goals, addTransaction]);
}

"use client"
import { useEffect } from 'react';
import { useTransactions } from '../contexts/TransactionContext';
import { useProjects } from '../contexts/ProjectContext';
import { useSavingsGoals } from '../contexts/SavingsGoalContext';
import { useIntegrationSyncStore } from '@/stores/integration';

export function useProjectIntegration() {
  const { addTransaction } = useTransactions();
  const { revenues, expenses } = useProjects();
  const { goals } = useSavingsGoals();

  const hasSyncedRevenue = useIntegrationSyncStore(s => s.hasSyncedRevenue);
  const markRevenueSynced = useIntegrationSyncStore(s => s.markRevenueSynced);
  const hasSyncedExpense = useIntegrationSyncStore(s => s.hasSyncedExpense);
  const markExpenseSynced = useIntegrationSyncStore(s => s.markExpenseSynced);
  const hasProcessedContribution = useIntegrationSyncStore(s => s.hasProcessedContribution);
  const markContributionProcessed = useIntegrationSyncStore(s => s.markContributionProcessed);

  useEffect(() => {
    // Sync project revenues to general income when they are marked as received
    revenues.forEach(revenue => {
      if (revenue.status === 'received' && revenue.paidAmount > 0) {
        // Check if this revenue has already been added to transactions
        if (!hasSyncedRevenue(revenue.id)) {
          addTransaction({
            type: 'income',
            amount: revenue.paidAmount,
            category: 'kinh-doanh',
            description: `Dự án: ${revenue.description}`,
            paymentMethod: 'chuyen-khoan',
          });

          // Mark as synced
          markRevenueSynced(revenue.id);
        }
      }
    });

    // Sync project expenses to general expenses
    expenses.forEach(expense => {
      if (!hasSyncedExpense(expense.id)) {
        addTransaction({
          type: 'expense',
          amount: expense.amount,
          category: 'kinh-doanh',
          description: `Chi phí dự án: ${expense.description}`,
          paymentMethod: 'chuyen-khoan',
        });

        // Mark as synced
        markExpenseSynced(expense.id);
      }
    });

    // Handle savings goal contributions
    const handleSavingsContribution = (event: CustomEvent) => {
      const { goalId, amount, goalTitle } = event.detail;

      // Create a transient contribution key (session-only)
      const contributionKey = `goal-${goalId}-${amount}-${Date.now()}`;

      if (!hasProcessedContribution(contributionKey)) {
        addTransaction({
          type: 'expense',
          amount: amount,
          category: 'tien-le-tet', // Using this as savings allocation category
          description: `Tiết kiệm: ${goalTitle}`,
          paymentMethod: 'chuyen-khoan',
        });

        // Mark as processed to avoid double-submit within session
        markContributionProcessed(contributionKey);
      }
    };

    // Listen for savings goal contributions
    window.addEventListener('savingsGoalContribution', handleSavingsContribution as EventListener);

    return () => {
      window.removeEventListener('savingsGoalContribution', handleSavingsContribution as EventListener);
    };
  }, [revenues, expenses, goals, addTransaction]);
}

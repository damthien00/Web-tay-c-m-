import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SavingsGoal } from '../types/SavingsGoal';
import { generateId } from '../utils/helpers';

interface SavingsGoalContextType {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount' | 'isCompleted'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;
  getTotalSavings: () => number;
  getCompletedGoals: () => SavingsGoal[];
  getActiveGoals: () => SavingsGoal[];
}

const SavingsGoalContext = createContext<SavingsGoalContextType | undefined>(undefined);

export function SavingsGoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);

  // Helper to fetch and set goals from API
  const reloadGoals = async () => {
    try {
      const uid = typeof window !== 'undefined' ? (localStorage.getItem('userId') || 'demo-user') : 'demo-user';
      const res = await fetch(`/api/savings-goals?userId=${encodeURIComponent(uid)}&per_page=100`);
      const json = await res.json();
      const items = Array.isArray(json?.data?.items) ? json.data.items : (Array.isArray(json?.data) ? json.data : []);
      if (Array.isArray(items)) {
        const mapped: SavingsGoal[] = items.map((g: any) => ({
          id: g.id,
          title: g.title,
          targetAmount: Number(g.targetAmount),
          currentAmount: Number(g.currentAmount ?? 0),
          deadline: typeof g.deadline === 'string' ? g.deadline : new Date(g.deadline).toISOString(),
          category: g.category,
          createdAt: typeof g.createdAt === 'string' ? g.createdAt : new Date(g.createdAt).toISOString(),
          isCompleted: Boolean(g.isCompleted),
        }));
        setGoals(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Hydrate from cache first for fast initial render
    try {
      const saved = localStorage.getItem('vietnamese-money-tracker-goals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setGoals(parsed);
        }
      }
    } catch {
      // ignore
    }

    // Then fetch real goals from API
    (async () => { if (isMounted) await reloadGoals(); })();

    return () => { isMounted = false };
  }, []);

  useEffect(() => {
    localStorage.setItem('vietnamese-money-tracker-goals', JSON.stringify(goals));
  }, [goals]);

  const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount' | 'isCompleted'>) => {
    try {
      const uid = typeof window !== 'undefined' ? (localStorage.getItem('userId') || 'demo-user') : 'demo-user';

      // Optimistic insert
      const temp: SavingsGoal = {
        ...goal,
        id: `temp-${generateId()}`,
        createdAt: new Date().toISOString(),
        currentAmount: 0,
        isCompleted: false,
      };
      setGoals(prev => [temp, ...prev]);

      const res = await fetch('/api/savings-goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          title: goal.title,
          targetAmount: goal.targetAmount,
          deadline: goal.deadline,
          category: goal.category,
        }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) {
        throw new Error(json?.error || 'Failed to create savings goal');
      }

      // Refresh from server to replace optimistic item
      await reloadGoals();
    } catch (e) {
      console.error(e);
      // Re-fetch to revert optimistic change on failure
      await reloadGoals();
      throw e;
    }
  };

  const updateGoal = (id: string, updatedGoal: Partial<SavingsGoal>) => {
    setGoals(prev =>
      prev.map(goal => {
        if (goal.id === id) {
          const updated = { ...goal, ...updatedGoal };
          // Check if goal is completed
          if (updated.currentAmount >= updated.targetAmount) {
            updated.isCompleted = true;
          }
          return updated;
        }
        return goal;
      })
    );
  };

  const deleteGoal = (id: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== id));
  };

  const addToGoal = (id: string, amount: number) => {
    // Add to goal progress
    updateGoal(id, {
      currentAmount: Number(goals?.find(g => g.id === id)?.currentAmount) + amount || amount
    });

    // Create a corresponding expense transaction to track money allocation
    const goal = goals.find(g => g.id === id);
    if (goal) {
      // This will be handled by the transaction integration hook
      const event = new CustomEvent('savingsGoalContribution', {
        detail: { goalId: id, amount, goalTitle: goal.title }
      });
      window.dispatchEvent(event);
    }
  };

  const getTotalSavings = () => {
    return goals.reduce((total, goal) => total + goal.currentAmount, 0);
  };

  const getCompletedGoals = () => {
    return goals.filter(goal => goal.isCompleted);
  };

  const getActiveGoals = () => {
    return goals.filter(goal => !goal.isCompleted);
  };

  return (
    <SavingsGoalContext.Provider value={{
      goals,
      addGoal,
      updateGoal,
      deleteGoal,
      addToGoal,
      getTotalSavings,
      getCompletedGoals,
      getActiveGoals,
    }}>
      {children}
    </SavingsGoalContext.Provider>
  );
}

export function useSavingsGoals() {
  const context = useContext(SavingsGoalContext);
  if (context === undefined) {
    throw new Error('useSavingsGoals must be used within a SavingsGoalProvider');
  }
  return context;
}

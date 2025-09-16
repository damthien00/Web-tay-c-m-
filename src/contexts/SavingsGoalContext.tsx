import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { SavingsGoal } from '../types/SavingsGoal';
import { generateId } from '../utils/helpers';

interface SavingsGoalContextType {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount' | 'isCompleted'>) => void;
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

  useEffect(() => {
    const saved = localStorage.getItem('vietnamese-money-tracker-goals');
    if (saved && JSON.parse(saved).length > 0) {
      setGoals(JSON.parse(saved));
    } else {
      // Add sample goals
      const sampleGoals: SavingsGoal[] = [
        {
          id: generateId(),
          title: 'Quỹ khẩn cấp',
          targetAmount: 50000000,
          currentAmount: 15000000,
          deadline: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'emergency',
          createdAt: new Date().toISOString(),
          isCompleted: false,
        },
        {
          id: generateId(),
          title: 'Du lịch Đà Lạt',
          targetAmount: 10000000,
          currentAmount: 7500000,
          deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'vacation',
          createdAt: new Date().toISOString(),
          isCompleted: false,
        }
      ];
      setGoals(sampleGoals);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vietnamese-money-tracker-goals', JSON.stringify(goals));
  }, [goals]);

  const addGoal = (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount' | 'isCompleted'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: generateId(),
      createdAt: new Date().toISOString(),
      currentAmount: 0,
      isCompleted: false,
    };
    setGoals(prev => [newGoal, ...prev]);
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

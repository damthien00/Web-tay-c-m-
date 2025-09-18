import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { SavingsGoal } from '../types/SavingsGoal';
import { generateId } from '../utils/helpers';
import {useTransactions} from "@/contexts/TransactionContext";

interface SavingsGoalContextType {
  goals: SavingsGoal[];
  addGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount' | 'isCompleted'>) => Promise<void>;
  updateGoal: (id: string, goal: Partial<SavingsGoal>) => void;
  deleteGoal: (id: string) => void;
	addToGoal: (id: string, amount: number) => Promise<void>;
  getTotalSavings: () => number;
  getCompletedGoals: () => SavingsGoal[];
  getActiveGoals: () => SavingsGoal[];
}

const SavingsGoalContext = createContext<SavingsGoalContextType | undefined>(undefined);

export function SavingsGoalProvider({ children }: { children: ReactNode }) {
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const session = useSession();
	const { reloadRecentTransactions } = useTransactions();

  // Helper to fetch and set goals from API
  const reloadGoals = async () => {
    try {
      const uid = session.data?.user?.id as string | undefined;
      if (!uid) { setGoals([]); return; }
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
    (async () => { if (isMounted) await reloadGoals(); })();
    return () => { isMounted = false };
  }, [session.data?.user?.id]);


  const addGoal = async (goal: Omit<SavingsGoal, 'id' | 'createdAt' | 'currentAmount' | 'isCompleted'>) => {
    try {
      const uid = session.data?.user?.id as string | undefined;
      if (!uid) throw new Error('No userId available');

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
    // Optimistic update
    setGoals(prev =>
      prev.map(goal => {
        if (goal.id === id) {
          const updated = { ...goal, ...updatedGoal };
          if (updated.currentAmount >= updated.targetAmount) {
            updated.isCompleted = true;
          }
          return updated;
        }
        return goal;
      })
    );

    // Fire-and-forget API call to persist
    (async () => {
      try {
        const uid = session.data?.user?.id as string | undefined;
        if (!uid) throw new Error('No userId available');
        const payload: any = { userId: uid };
        if (updatedGoal.title !== undefined) payload.title = updatedGoal.title;
        if (updatedGoal.targetAmount !== undefined) payload.targetAmount = updatedGoal.targetAmount;
        if (updatedGoal.deadline !== undefined) payload.deadline = updatedGoal.deadline;
        if (updatedGoal.category !== undefined) payload.category = updatedGoal.category;
        if (updatedGoal.isCompleted !== undefined) payload.isCompleted = updatedGoal.isCompleted;

        const res = await fetch(`/api/savings-goals/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || 'Failed to update savings goal');
        await reloadGoals();
      } catch (e) {
        console.error(e);
        await reloadGoals();
      }
    })();
  };

  const deleteGoal = (id: string) => {
    // Optimistic remove
    const prevGoals = goals;
    setGoals(prev => prev.filter(goal => goal.id !== id));

    (async () => {
      try {
        const uid = session.data?.user?.id as string | undefined;
        if (!uid) throw new Error('No userId available');
        const res = await fetch(`/api/savings-goals/${encodeURIComponent(id)}?userId=${encodeURIComponent(uid)}`, {
          method: 'DELETE',
        });
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || 'Failed to delete savings goal');
        await reloadGoals();
      } catch (e) {
        console.error(e);
        // Revert by reloading from server
        await reloadGoals();
      }
    })();
  };

  const addToGoal = async (id: string, amount: number) => {
    // Optimistic local bump
    setGoals(prev =>
      prev.map(goal => (goal.id === id ? { ...goal, currentAmount: goal.currentAmount + amount } : goal))
    );

	  try {
		  const uid = session.data?.user?.id as string | undefined;
		  if (!uid) throw new Error('No userId available');
			const goal = goals.find(g => g.id === id);
		  const res = await fetch('/api/savings-contributions', {
			  method: 'POST',
			  headers: { 'Content-Type': 'application/json' },
			  body: JSON.stringify({ userId: uid, goalId: id, amount, title: goal?.title || 'New Contribution', description: `Contribution to ${goal?.title || 'a goal'}` }),
		  });
		  const json = await res.json();
		  if (!res.ok || json?.error) throw new Error(json?.error || 'Failed to add contribution');
		  await Promise.all([reloadGoals(), reloadRecentTransactions()]);
	  } catch (e) {
		  console.error(e);
		  await reloadGoals();
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

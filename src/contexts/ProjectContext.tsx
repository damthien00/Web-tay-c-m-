import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth';
import { Project, ProjectExpense, ProjectRevenue } from '../types/Project';
import { generateId } from '../utils/helpers';

interface ProjectContextType {
  projects: Project[];
  expenses: ProjectExpense[];
  revenues: ProjectRevenue[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'totalExpenses' | 'totalRevenue'>) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addExpense: (expense: Omit<ProjectExpense, 'id' | 'createdAt'>) => void;
  addRevenue: (revenue: Omit<ProjectRevenue, 'id' | 'createdAt'>) => void;
  getProjectProfit: (projectId: string) => number;
  getProjectExpenses: (projectId: string) => number;
  getProjectRevenue: (projectId: string) => number;
  getProjectPaidRevenue: (projectId: string) => number;
  getProjectUnpaidRevenue: (projectId: string) => number;
  getBudgetUtilization: (projectId: string) => number;
  getTotalPortfolioValue: () => { totalRevenue: number; totalExpenses: number; totalProfit: number };
  getTotalPortfolioPaid: () => { totalPaidRevenue: number; totalUnpaidRevenue: number };
  getProfitableProjects: () => Project[];
  getLosingProjects: () => Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<ProjectExpense[]>([]);
  const [revenues, setRevenues] = useState<ProjectRevenue[]>([]);

  // Helpers to load from API
  const getUid = () => useAuthStore.getState().userId;

  const reloadProjects = async () => {
    try {
      const uid = getUid();
      if (!uid) { setProjects([]); return; }
      const res = await fetch(`/api/projects?userId=${encodeURIComponent(uid)}&per_page=100&sort=createdAt.desc`);
      const json = await res.json();
      const items = Array.isArray(json?.data?.items) ? json.data.items : (Array.isArray(json?.data) ? json.data : []);
      if (Array.isArray(items)) {
        const mapped: Project[] = items.map((p: any) => ({
          id: p.id,
          name: p.name,
          description: p.description || '',
          budget: Number(p.budget ?? 0),
          totalExpenses: Number(p.totalExpenses ?? 0),
          totalRevenue: Number(p.totalRevenue ?? 0),
          status: p.status,
          startDate: typeof p.startDate === 'string' ? p.startDate : new Date(p.startDate).toISOString(),
          endDate: p.endDate ? (typeof p.endDate === 'string' ? p.endDate : new Date(p.endDate).toISOString()) : undefined,
          category: p.category,
          currency: p.currency || 'VND',
          createdAt: typeof p.createdAt === 'string' ? p.createdAt : new Date(p.createdAt).toISOString(),
          updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : new Date(p.updatedAt).toISOString(),
        }));
        setProjects(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const reloadExpenses = async () => {
    try {
      const uid = getUid();
      if (!uid) { setExpenses([]); return; }
      const res = await fetch(`/api/project-expenses?userId=${encodeURIComponent(uid)}&per_page=200&sort=date.desc`);
      const json = await res.json();
      const items = Array.isArray(json?.data?.items) ? json.data.items : (Array.isArray(json?.data) ? json.data : []);
      if (Array.isArray(items)) {
        const mapped: ProjectExpense[] = items.map((x: any) => ({
          id: x.id,
          projectId: x.projectId,
          amount: Number(x.amount ?? 0),
          description: x.description || '',
          category: x.category,
          date: typeof x.date === 'string' ? x.date : new Date(x.date).toISOString(),
          createdAt: typeof x.createdAt === 'string' ? x.createdAt : new Date(x.createdAt).toISOString(),
        }));
        setExpenses(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const reloadRevenues = async () => {
    try {
      const uid = getUid();
      if (!uid) { setRevenues([]); return; }
      const res = await fetch(`/api/project-revenues?userId=${encodeURIComponent(uid)}&per_page=200&sort=date.desc`);
      const json = await res.json();
      const items = Array.isArray(json?.data?.items) ? json.data.items : (Array.isArray(json?.data) ? json.data : []);
      if (Array.isArray(items)) {
        const mapped: ProjectRevenue[] = items.map((x: any) => ({
          id: x.id,
          projectId: x.projectId,
          amount: Number(x.amount ?? 0),
          description: x.description || '',
          source: x.source,
          date: typeof x.date === 'string' ? x.date : new Date(x.date).toISOString(),
          status: x.status,
          paidAmount: Number(x.paidAmount ?? 0),
          invoiceNumber: x.invoiceNumber || undefined,
          dueDate: x.dueDate ? (typeof x.dueDate === 'string' ? x.dueDate : new Date(x.dueDate).toISOString()) : undefined,
          createdAt: typeof x.createdAt === 'string' ? x.createdAt : new Date(x.createdAt).toISOString(),
        }));
        setRevenues(mapped);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const reloadAll = async () => {
    await Promise.all([reloadProjects(), reloadExpenses(), reloadRevenues()]);
  };

  // Initial hydration: cache → server
  useEffect(() => {
    let isMounted = true;
    (async () => { if (isMounted) await reloadAll(); })();
    return () => { isMounted = false };
  }, []);


  // Mutations
  const addProject = async (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'totalExpenses' | 'totalRevenue'>) => {
    // Optimistic insert
    const temp: Project = {
      ...project,
      id: `temp-${generateId()}`,
      totalExpenses: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [temp, ...prev]);

    try {
      const uid = getUid();
      if (!uid) throw new Error('No userId available');
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: uid,
          name: project.name,
          description: project.description,
          budget: project.budget,
          status: project.status,
          startDate: project.startDate,
          endDate: project.endDate,
          category: project.category,
          currency: project.currency,
        }),
      });
      const json = await res.json();
      if (!res.ok || json?.error) throw new Error(json?.error || 'Failed to create project');
      await reloadProjects();
    } catch (e) {
      console.error(e);
      await reloadProjects();
      throw e;
    }
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    // Optimistic update
    setProjects(prev => prev.map(p => (p.id === id ? { ...p, ...updatedProject, updatedAt: new Date().toISOString() } : p)));

    (async () => {
      try {
        const uid = getUid();
        if (!uid) throw new Error('No userId available');
        const payload: any = { userId: uid };
        if (updatedProject.name !== undefined) payload.name = updatedProject.name;
        if (updatedProject.description !== undefined) payload.description = updatedProject.description;
        if (updatedProject.budget !== undefined) payload.budget = updatedProject.budget;
        if (updatedProject.status !== undefined) payload.status = updatedProject.status;
        if (updatedProject.startDate !== undefined) payload.startDate = updatedProject.startDate;
        if (updatedProject.endDate !== undefined) payload.endDate = updatedProject.endDate;
        if (updatedProject.category !== undefined) payload.category = updatedProject.category;
        if (updatedProject.currency !== undefined) payload.currency = updatedProject.currency;

        const res = await fetch(`/api/projects/${encodeURIComponent(id)}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || 'Failed to update project');
        await reloadProjects();
      } catch (e) {
        console.error(e);
        await reloadProjects();
      }
    })();
  };

  const deleteProject = (id: string) => {
    // Optimistic remove
    setProjects(prev => prev.filter(p => p.id !== id));
    setExpenses(prev => prev.filter(x => x.projectId !== id));
    setRevenues(prev => prev.filter(x => x.projectId !== id));

    (async () => {
      try {
        const uid = getUid();
        if (!uid) throw new Error('No userId available');
        const res = await fetch(`/api/projects/${encodeURIComponent(id)}?userId=${encodeURIComponent(uid)}`, { method: 'DELETE' });
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || 'Failed to delete project');
        await reloadAll();
      } catch (e) {
        console.error(e);
        await reloadAll();
      }
    })();
  };

  const addExpense = (expense: Omit<ProjectExpense, 'id' | 'createdAt'>) => {
    // Optimistic insert
    const temp: ProjectExpense = { ...expense, id: `temp-${generateId()}`, createdAt: new Date().toISOString() };
    setExpenses(prev => [temp, ...prev]);
    // bump project total locally for quick feedback
    setProjects(prev => prev.map(p => (p.id === expense.projectId ? { ...p, totalExpenses: (p.totalExpenses || 0) + expense.amount } : p)));

    (async () => {
      try {
        const uid = getUid();
        if (!uid) throw new Error('No userId available');
        const res = await fetch('/api/project-expenses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: uid,
            projectId: expense.projectId,
            amount: expense.amount,
            description: expense.description,
            category: expense.category,
            date: expense.date,
          }),
        });
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || 'Failed to add expense');
        // reload expenses and projects to refresh totals
        await Promise.all([reloadExpenses(), reloadProjects()]);
      } catch (e) {
        console.error(e);
        await Promise.all([reloadExpenses(), reloadProjects()]);
      }
    })();
  };

  const addRevenue = (revenue: Omit<ProjectRevenue, 'id' | 'createdAt'>) => {
    // Optimistic insert
    const temp: ProjectRevenue = {
      ...revenue,
      id: `temp-${generateId()}`,
      paidAmount: revenue.status === 'received' ? revenue.amount : (revenue.paidAmount ?? 0),
      createdAt: new Date().toISOString(),
    };
    setRevenues(prev => [temp, ...prev]);
    // bump project total revenue locally if received
    setProjects(prev => prev.map(p => (p.id === revenue.projectId ? { ...p, totalRevenue: (p.totalRevenue || 0) + revenue.amount } : p)));

    (async () => {
      try {
        const res = await fetch('/api/project-revenues', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: uid,
            projectId: revenue.projectId,
            amount: revenue.amount,
            description: revenue.description,
            source: revenue.source,
            status: revenue.status,
            paidAmount: revenue.paidAmount ?? undefined,
            invoiceNumber: revenue.invoiceNumber,
            dueDate: revenue.dueDate,
            date: revenue.date,
          }),
        });
        const json = await res.json();
        if (!res.ok || json?.error) throw new Error(json?.error || 'Failed to add revenue');
        await Promise.all([reloadRevenues(), reloadProjects()]);
      } catch (e) {
        console.error(e);
        await Promise.all([reloadRevenues(), reloadProjects()]);
      }
    })();
  };

  // Calculations
  const getProjectExpenses = (projectId: string): number => {
    return expenses.filter(exp => exp.projectId === projectId).reduce((total, exp) => total + exp.amount, 0);
  };

  const getProjectRevenue = (projectId: string): number => {
    return revenues.filter(rev => rev.projectId === projectId).reduce((total, rev) => total + rev.amount, 0);
  };

  const getProjectPaidRevenue = (projectId: string): number => {
    return revenues.filter(rev => rev.projectId === projectId).reduce((total, rev) => total + (rev.paidAmount || 0), 0);
  };

  const getProjectUnpaidRevenue = (projectId: string): number => {
    return revenues.filter(rev => rev.projectId === projectId).reduce((total, rev) => total + (rev.amount - (rev.paidAmount || 0)), 0);
  };

  const getProjectProfit = (projectId: string): number => {
    const revenue = getProjectPaidRevenue(projectId);
    const exp = getProjectExpenses(projectId);
    return revenue - exp;
  };

  const getBudgetUtilization = (projectId: string): number => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.budget === 0) return 0;
    const exp = getProjectExpenses(projectId);
    return (exp / project.budget) * 100;
  };

  const getTotalPortfolioValue = () => {
    const totalRevenue = projects.reduce((sum, project) => sum + getProjectPaidRevenue(project.id), 0);
    const totalExpenses = projects.reduce((sum, project) => sum + getProjectExpenses(project.id), 0);
    const totalProfit = totalRevenue - totalExpenses;
    return { totalRevenue, totalExpenses, totalProfit };
  };

  const getTotalPortfolioPaid = () => {
    const totalPaidRevenue = projects.reduce((sum, project) => sum + getProjectPaidRevenue(project.id), 0);
    const totalUnpaidRevenue = projects.reduce((sum, project) => sum + getProjectUnpaidRevenue(project.id), 0);
    return { totalPaidRevenue, totalUnpaidRevenue };
  };

  const getProfitableProjects = (): Project[] => projects.filter(p => getProjectProfit(p.id) > 0);
  const getLosingProjects = (): Project[] => projects.filter(p => getProjectProfit(p.id) < 0);

  return (
    <ProjectContext.Provider value={{
      projects,
      expenses,
      revenues,
      addProject,
      updateProject,
      deleteProject,
      addExpense,
      addRevenue,
      getProjectProfit,
      getProjectExpenses,
      getProjectRevenue,
      getProjectPaidRevenue,
      getProjectUnpaidRevenue,
      getBudgetUtilization,
      getTotalPortfolioValue,
      getTotalPortfolioPaid,
      getProfitableProjects,
      getLosingProjects,
    }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjects() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
}

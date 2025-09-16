import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Project, ProjectExpense, ProjectRevenue } from '../types/Project';
import { generateId } from '../utils/helpers';

interface ProjectContextType {
  projects: Project[];
  expenses: ProjectExpense[];
  revenues: ProjectRevenue[];
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'totalExpenses' | 'totalRevenue'>) => void;
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

  useEffect(() => {
    // Load data from localStorage
    const savedProjects = localStorage.getItem('vietnamese-money-tracker-projects');
    const savedExpenses = localStorage.getItem('vietnamese-money-tracker-project-expenses');
    const savedRevenues = localStorage.getItem('vietnamese-money-tracker-project-revenues');

    // Define sample projects outside conditional block
    const sampleProjects: Project[] = [
      {
        id: generateId(),
        name: 'Website Bán Hàng Online',
        description: 'Phát triển website thương mại điện tử cho khách hàng',
        budget: 50000000,
        totalExpenses: 28000000,
        totalRevenue: 60000000,
        status: 'active',
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'web-development',
        currency: 'VND',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'App Quản Lý Kho',
        description: 'Ứng dụng mobile quản lý kho hàng',
        budget: 80000000,
        totalExpenses: 37000000,
        totalRevenue: 70000000,
        status: 'active',
        startDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'mobile-app',
        currency: 'VND',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: generateId(),
        name: 'Tư Vấn Digital Marketing',
        description: 'Dịch vụ tư vấn marketing online cho doanh nghiệp nhỏ',
        budget: 20000000,
        totalExpenses: 8000000,
        totalRevenue: 25000000,
        status: 'completed',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'consulting',
        currency: 'VND',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    ];

    if (savedProjects && JSON.parse(savedProjects).length > 0) {
      setProjects(JSON.parse(savedProjects));
    } else {
      setProjects(sampleProjects);
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }

    if (savedRevenues) {
      setRevenues(JSON.parse(savedRevenues));
    } else {
      // Add sample revenues
      const sampleRevenues: ProjectRevenue[] = [
        {
          id: generateId(),
          projectId: sampleProjects[0].id,
          amount: 30000000,
          paidAmount: 30000000,
          description: 'Thanh toán giai đoạn 1 - Thiết kế UI/UX',
          source: 'milestone-payment',
          status: 'received',
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          invoiceNumber: 'INV-001',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          projectId: sampleProjects[0].id,
          amount: 30000000,
          paidAmount: 0,
          description: 'Thanh toán giai đoạn 2 - Phát triển',
          source: 'milestone-payment',
          status: 'pending',
          date: new Date().toISOString(),
          dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
          invoiceNumber: 'INV-002',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          projectId: sampleProjects[1].id,
          amount: 40000000,
          paidAmount: 40000000,
          description: 'Thanh toán đầu tiên',
          source: 'client-payment',
          status: 'received',
          date: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
          invoiceNumber: 'INV-003',
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          projectId: sampleProjects[1].id,
          amount: 30000000,
          paidAmount: 0,
          description: 'Thanh toán cuối',
          source: 'client-payment',
          status: 'overdue',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          invoiceNumber: 'INV-004',
          createdAt: new Date().toISOString(),
        }
      ];
      setRevenues(sampleRevenues);

      // Add sample expenses
      const sampleExpenses: ProjectExpense[] = [
        {
          id: generateId(),
          projectId: sampleProjects[0].id,
          amount: 15000000,
          description: 'Thuê developer React',
          category: 'development',
          date: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          projectId: sampleProjects[0].id,
          amount: 8000000,
          description: 'Thiết kế UI/UX',
          category: 'design',
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          projectId: sampleProjects[0].id,
          amount: 5000000,
          description: 'Hosting và domain',
          category: 'infrastructure',
          date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          projectId: sampleProjects[1].id,
          amount: 25000000,
          description: 'Developer mobile app',
          category: 'development',
          date: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
        {
          id: generateId(),
          projectId: sampleProjects[1].id,
          amount: 12000000,
          description: 'Testing và QA',
          category: 'development',
          date: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        }
      ];
      setExpenses(sampleExpenses);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('vietnamese-money-tracker-projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('vietnamese-money-tracker-project-expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('vietnamese-money-tracker-project-revenues', JSON.stringify(revenues));
  }, [revenues]);

  const addProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'totalExpenses' | 'totalRevenue'>) => {
    const newProject: Project = {
      ...project,
      id: generateId(),
      totalExpenses: 0,
      totalRevenue: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects(prev => [newProject, ...prev]);
  };

  const updateProject = (id: string, updatedProject: Partial<Project>) => {
    setProjects(prev =>
      prev.map(project =>
        project.id === id
          ? { ...project, ...updatedProject, updatedAt: new Date().toISOString() }
          : project
      )
    );
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
    setExpenses(prev => prev.filter(expense => expense.projectId !== id));
    setRevenues(prev => prev.filter(revenue => revenue.projectId !== id));
  };

  const addExpense = (expense: Omit<ProjectExpense, 'id' | 'createdAt'>) => {
    const newExpense: ProjectExpense = {
      ...expense,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExpenses(prev => [newExpense, ...prev]);
    
    // Update project total expenses
    const projectExpenses = getProjectExpenses(expense.projectId) + expense.amount;
    updateProject(expense.projectId, { totalExpenses: projectExpenses });
  };

  const addRevenue = (revenue: Omit<ProjectRevenue, 'id' | 'createdAt'>) => {
    const newRevenue: ProjectRevenue = {
      ...revenue,
      id: generateId(),
      paidAmount: revenue.status === 'received' ? revenue.amount : 0,
      createdAt: new Date().toISOString(),
    };
    setRevenues(prev => [newRevenue, ...prev]);
    
    // Update project total revenue
    const projectRevenue = getProjectRevenue(revenue.projectId) + revenue.amount;
    updateProject(revenue.projectId, { totalRevenue: projectRevenue });

    // Add to general income if payment is received
    if (revenue.status === 'received') {
      // This will be handled by the transaction context integration
    }
  };

  const getProjectExpenses = (projectId: string): number => {
    return expenses
      .filter(expense => expense.projectId === projectId)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getProjectRevenue = (projectId: string): number => {
    return revenues
      .filter(revenue => revenue.projectId === projectId)
      .reduce((total, revenue) => total + revenue.amount, 0);
  };

  const getProjectPaidRevenue = (projectId: string): number => {
    return revenues
      .filter(revenue => revenue.projectId === projectId)
      .reduce((total, revenue) => total + revenue.paidAmount, 0);
  };

  const getProjectUnpaidRevenue = (projectId: string): number => {
    return revenues
      .filter(revenue => revenue.projectId === projectId)
      .reduce((total, revenue) => total + (revenue.amount - revenue.paidAmount), 0);
  };

  const getProjectProfit = (projectId: string): number => {
    const revenue = getProjectPaidRevenue(projectId);
    const expenses = getProjectExpenses(projectId);
    return revenue - expenses;
  };

  const getBudgetUtilization = (projectId: string): number => {
    const project = projects.find(p => p.id === projectId);
    if (!project || project.budget === 0) return 0;
    
    const expenses = getProjectExpenses(projectId);
    return (expenses / project.budget) * 100;
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

  const getProfitableProjects = (): Project[] => {
    return projects.filter(project => getProjectProfit(project.id) > 0);
  };

  const getLosingProjects = (): Project[] => {
    return projects.filter(project => getProjectProfit(project.id) < 0);
  };

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
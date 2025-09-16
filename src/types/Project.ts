export interface Project {
  id: string;
  name: string;
  description: string;
  budget: number;
  totalExpenses: number;
  totalRevenue: number;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  startDate: string;
  endDate?: string;
  category: ProjectCategory;
  currency: 'VND' | 'USD';
  createdAt: string;
  updatedAt: string;
}

export interface ProjectExpense {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  category: ExpenseCategory;
  date: string;
  createdAt: string;
}

export interface ProjectRevenue {
  id: string;
  projectId: string;
  amount: number;
  description: string;
  source: RevenueSource;
  date: string;
  status: 'pending' | 'received' | 'overdue';
  paidAmount: number;
  invoiceNumber?: string;
  dueDate?: string;
  createdAt: string;
}

export type ProjectCategory = 
  | 'web-development'
  | 'mobile-app'
  | 'consulting'
  | 'design'
  | 'marketing'
  | 'e-commerce'
  | 'other';

export type ExpenseCategory = 
  | 'development'
  | 'design'
  | 'marketing'
  | 'infrastructure'
  | 'tools'
  | 'outsourcing'
  | 'travel'
  | 'other';

export type RevenueSource = 
  | 'client-payment'
  | 'milestone-payment'
  | 'subscription'
  | 'commission'
  | 'bonus'
  | 'other';

export interface ProjectCategoryInfo {
  name: string;
  icon: string;
  color: string;
}

export interface ExpenseCategoryInfo {
  name: string;
  icon: string;
  color: string;
}

export interface RevenueSourceInfo {
  name: string;
  icon: string;
  color: string;
}
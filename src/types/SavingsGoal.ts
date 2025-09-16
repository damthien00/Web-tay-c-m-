export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: 'emergency' | 'vacation' | 'house' | 'education' | 'retirement' | 'other';
  createdAt: string;
  isCompleted: boolean;
}

export interface SavingsGoalCategory {
  name: string;
  icon: string;
  color: string;
  description: string;
}

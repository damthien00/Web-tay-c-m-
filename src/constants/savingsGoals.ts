import { SavingsGoalCategory } from '../types/SavingsGoal';

export const SAVINGS_GOAL_CATEGORIES: Record<string, SavingsGoalCategory> = {
  emergency: {
    name: 'Quỹ khẩn cấp',
    icon: '🚨',
    color: 'bg-red-100 text-red-800',
    description: 'Dành cho các tình huống bất ngờ'
  },
  vacation: {
    name: 'Du lịch',
    icon: '✈️',
    color: 'bg-blue-100 text-blue-800',
    description: 'Tiết kiệm cho chuyến đi'
  },
  house: {
    name: 'Mua nhà',
    icon: '🏠',
    color: 'bg-green-100 text-green-800',
    description: 'Tiền đặt cọc hoặc mua nhà'
  },
  education: {
    name: 'Học tập',
    icon: '📚',
    color: 'bg-purple-100 text-purple-800',
    description: 'Học phí, khóa học'
  },
  retirement: {
    name: 'Hưu trí',
    icon: '👴',
    color: 'bg-gray-100 text-gray-800',
    description: 'Tiết kiệm cho tương lai'
  },
  other: {
    name: 'Khác',
    icon: '💰',
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Mục tiêu khác'
  }
};
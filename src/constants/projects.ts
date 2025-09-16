import { ProjectCategoryInfo, ExpenseCategoryInfo, RevenueSourceInfo } from '../types/Project';

export const PROJECT_CATEGORIES: Record<string, ProjectCategoryInfo> = {
  'web-development': { name: 'Phát triển Web', icon: '💻', color: 'bg-blue-100 text-blue-800' },
  'mobile-app': { name: 'Ứng dụng Mobile', icon: '📱', color: 'bg-purple-100 text-purple-800' },
  'consulting': { name: 'Tư vấn', icon: '🤝', color: 'bg-green-100 text-green-800' },
  'design': { name: 'Thiết kế', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
  'marketing': { name: 'Marketing', icon: '📢', color: 'bg-orange-100 text-orange-800' },
  'e-commerce': { name: 'Thương mại điện tử', icon: '🛒', color: 'bg-indigo-100 text-indigo-800' },
  'other': { name: 'Khác', icon: '📋', color: 'bg-gray-100 text-gray-800' },
};

export const EXPENSE_CATEGORIES: Record<string, ExpenseCategoryInfo> = {
  'development': { name: 'Phát triển', icon: '⚙️', color: 'bg-blue-100 text-blue-800' },
  'design': { name: 'Thiết kế', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
  'marketing': { name: 'Marketing', icon: '📢', color: 'bg-orange-100 text-orange-800' },
  'infrastructure': { name: 'Hạ tầng', icon: '🏗️', color: 'bg-gray-100 text-gray-800' },
  'tools': { name: 'Công cụ', icon: '🔧', color: 'bg-yellow-100 text-yellow-800' },
  'outsourcing': { name: 'Thuê ngoài', icon: '👥', color: 'bg-purple-100 text-purple-800' },
  'travel': { name: 'Di chuyển', icon: '✈️', color: 'bg-cyan-100 text-cyan-800' },
  'other': { name: 'Khác', icon: '📝', color: 'bg-gray-100 text-gray-800' },
};

export const REVENUE_SOURCES: Record<string, RevenueSourceInfo> = {
  'client-payment': { name: 'Thanh toán khách hàng', icon: '💰', color: 'bg-green-100 text-green-800' },
  'milestone-payment': { name: 'Thanh toán theo giai đoạn', icon: '🎯', color: 'bg-blue-100 text-blue-800' },
  'subscription': { name: 'Đăng ký', icon: '🔄', color: 'bg-purple-100 text-purple-800' },
  'commission': { name: 'Hoa hồng', icon: '💸', color: 'bg-yellow-100 text-yellow-800' },
  'bonus': { name: 'Thưởng', icon: '🎁', color: 'bg-pink-100 text-pink-800' },
  'other': { name: 'Khác', icon: '💵', color: 'bg-gray-100 text-gray-800' },
};
import React, { useState } from 'react';
import { X, Plus, TrendingUp, TrendingDown, DollarSign, Calendar, AlertTriangle, Edit3, CheckCircle, Trash2 } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { Project } from '../types/Project';
import { PROJECT_CATEGORIES, EXPENSE_CATEGORIES, REVENUE_SOURCES } from '../constants/projects';
import { formatCurrency } from '../utils/currency';
import { formatDate } from '../utils/helpers';
import { AddProjectExpenseModal } from './AddProjectExpenseModal';
import { AddProjectRevenueModal } from './AddProjectRevenueModal';
import { EditProjectModal } from './EditProjectModal';

interface ProjectDetailModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export function ProjectDetailModal({ project, isOpen, onClose }: ProjectDetailModalProps) {
  const { 
    expenses, 
    revenues, 
    updateProject,
    deleteProject,
    getProjectProfit, 
    getProjectPaidRevenue,
    getProjectUnpaidRevenue,
    getBudgetUtilization,
    getProjectExpenses,
    getProjectRevenue 
  } = useProjects();
  
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showRevenueModal, setShowRevenueModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'revenue'>('overview');

  const projectExpenses = expenses.filter(e => e.projectId === project.id);
  const projectRevenues = revenues.filter(r => r.projectId === project.id);
  const profit = getProjectProfit(project.id);
  const paidRevenue = getProjectPaidRevenue(project.id);
  const unpaidRevenue = getProjectUnpaidRevenue(project.id);
  const utilization = getBudgetUtilization(project.id);
  const totalExpenses = getProjectExpenses(project.id);
  const totalRevenue = getProjectRevenue(project.id);
  const profitMargin = totalRevenue > 0 ? (profit / totalRevenue) * 100 : 0;
  const category = PROJECT_CATEGORIES[project.category];

  const handleComplete = () => {
    if (confirm('Bạn có chắc muốn đánh dấu dự án này là hoàn thành?')) {
      updateProject(project.id, { status: 'completed' });
      onClose();
    }
  };

  const handleDelete = () => {
    if (confirm(`Bạn có chắc muốn xóa dự án "${project.name}"? Hành động này không thể hoàn tác.`)) {
      deleteProject(project.id);
      onClose();
    }
  };

  const getExpensesByCategory = () => {
    const categoryTotals: { [key: string]: number } = {};
    projectExpenses.forEach(expense => {
      categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
    });
    return Object.entries(categoryTotals).sort(([,a], [,b]) => b - a);
  };

  const getRevenueBySource = () => {
    const sourceTotals: { [key: string]: number } = {};
    projectRevenues.forEach(revenue => {
      sourceTotals[revenue.source] = (sourceTotals[revenue.source] || 0) + revenue.amount;
    });
    return Object.entries(sourceTotals).sort(([,a], [,b]) => b - a);
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white w-full max-w-4xl rounded-2xl max-h-[90vh] overflow-hidden mx-2 sm:mx-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${category.color}`}>
                <span className="text-lg sm:text-xl">{category.icon}</span>
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-gray-800">{project.name}</h2>
                <p className="text-sm sm:text-base text-gray-600">{category.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 rounded-full bg-blue-100 hover:bg-blue-200 transition-colors"
                title="Chỉnh sửa dự án"
              >
                <Edit3 className="w-5 h-5 text-blue-600" />
              </button>
              
              {project.status !== 'completed' && (
                <button
                  onClick={handleComplete}
                  className="p-2 rounded-full bg-green-100 hover:bg-green-200 transition-colors"
                  title="Đánh dấu hoàn thành"
                >
                  <CheckCircle className="w-5 h-5 text-green-600" />
                </button>
              )}
              
              <button
                onClick={handleDelete}
                className="p-2 rounded-full bg-red-100 hover:bg-red-200 transition-colors"
                title="Xóa dự án"
              >
                <Trash2 className="w-5 h-5 text-red-600" />
              </button>
              
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Financial Summary */}
          <div className={`p-6 border-b ${
            profit > 0 ? 'bg-green-50' : profit < 0 ? 'bg-red-50' : 'bg-gray-50'
          }`}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-gray-800">{formatCurrency(project.budget, true)}</div>
                <div className="text-xs sm:text-sm text-gray-600">Ngân sách</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-red-600">{formatCurrency(totalExpenses, true)}</div>
                <div className="text-xs sm:text-sm text-gray-600">Chi phí</div>
              </div>
              <div className="text-center">
                <div className="text-lg sm:text-2xl font-bold text-green-600">{formatCurrency(totalRevenue, true)}</div>
                <div className="text-xs sm:text-sm text-gray-600">Doanh thu</div>
              </div>
              <div className="text-center">
                <div className={`text-2xl font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profit >= 0 ? '+' : ''}{formatCurrency(profit, true)}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">Lợi nhuận</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-xs sm:text-sm mb-2">
                <span>Sử dụng ngân sách</span>
                <span className={`font-medium ${utilization > 100 ? 'text-red-600' : 'text-gray-800'}`}>
                  {utilization.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    utilization > 100 ? 'bg-red-500' :
                    utilization > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
            </div>

            {/* Alerts */}
            {utilization > 100 && (
              <div className="mt-3 bg-red-100 border border-red-300 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <span className="text-red-800 font-medium">Cảnh báo: Dự án đã vượt ngân sách!</span>
                </div>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="border-b">
            <div className="flex overflow-x-auto">
              {[
                { key: 'overview', label: 'Tổng quan', icon: TrendingUp },
                { key: 'expenses', label: 'Chi phí', icon: TrendingDown },
                { key: 'revenue', label: 'Doanh thu', icon: DollarSign }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center space-x-2 px-4 sm:px-6 py-3 font-medium transition-colors whitespace-nowrap ${
                    activeTab === key
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4 sm:inline hidden" />
                  <span className="text-sm sm:text-base">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-4 sm:p-6 max-h-80 sm:max-h-96 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Project Info */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Thông tin dự án</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <p><strong>Mô tả:</strong> {project.description}</p>
                    <p><strong>Ngày bắt đầu:</strong> {formatDate(project.startDate)}</p>
                    {project.endDate && <p><strong>Ngày kết thúc:</strong> {formatDate(project.endDate)}</p>}
                    <p><strong>Trạng thái:</strong> 
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'active' ? 'Đang thực hiện' :
                         project.status === 'completed' ? 'Hoàn thành' :
                         project.status === 'on-hold' ? 'Tạm dừng' : 'Lên kế hoạch'}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Financial Metrics */}
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">Chỉ số tài chính</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs sm:text-sm text-gray-600">Tỷ suất lợi nhuận</div>
                      <div className={`text-lg sm:text-xl font-bold ${profitMargin >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {profitMargin.toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="text-xs sm:text-sm text-gray-600">Hiệu quả ngân sách</div>
                      <div className={`text-lg sm:text-xl font-bold ${utilization <= 100 ? 'text-green-600' : 'text-red-600'}`}>
                        {utilization.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expense Breakdown */}
                {getExpensesByCategory().length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-800 mb-3">Chi phí theo danh mục</h3>
                    <div className="space-y-2">
                      {getExpensesByCategory().slice(0, 5).map(([categoryKey, amount]) => {
                        const category = EXPENSE_CATEGORIES[categoryKey];
                        const percentage = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
                        
                        return (
                          <div key={categoryKey} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm sm:text-base">{category.icon}</span>
                              <span className="text-xs sm:text-sm font-medium">{category.name}</span>
                            </div>
                            <div className="text-right">
                              <div className="font-semibold text-red-600 text-sm sm:text-base">{formatCurrency(amount, true)}</div>
                              <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Chi phí dự án</h3>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="flex items-center space-x-1 sm:space-x-2 bg-red-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Thêm</span>
                  </button>
                </div>

                {projectExpenses.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có chi phí nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectExpenses.map((expense) => {
                      const category = EXPENSE_CATEGORIES[expense.category];
                      return (
                        <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-base sm:text-lg">{category.icon}</span>
                            <div>
                              <div className="font-medium text-gray-800 text-sm sm:text-base">{expense.description}</div>
                              <div className="text-xs sm:text-sm text-gray-500">{category.name} • {formatDate(expense.date)}</div>
                            </div>
                          </div>
                          <div className="font-bold text-red-600 text-sm sm:text-base">
                            -{formatCurrency(expense.amount, true)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'revenue' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">Doanh thu dự án</h3>
                  <button
                    onClick={() => setShowRevenueModal(true)}
                    className="flex items-center space-x-1 sm:space-x-2 bg-green-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="text-sm sm:text-base">Thêm</span>
                  </button>
                </div>

                {projectRevenues.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Chưa có doanh thu nào</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {projectRevenues.map((revenue) => {
                      const source = REVENUE_SOURCES[revenue.source];
                      return (
                        <div key={revenue.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <span className="text-base sm:text-lg">{source.icon}</span>
                            <div>
                              <div className="font-medium text-gray-800 text-sm sm:text-base">{revenue.description}</div>
                              <div className="text-xs sm:text-sm text-gray-500 flex items-center space-x-1 sm:space-x-2">
                                <span>{source.name}</span>
                                <span>•</span>
                                <span>{formatDate(revenue.date)}</span>
                                {revenue.invoiceNumber && (
                                  <>
                                    <span>•</span>
                                    <span>{revenue.invoiceNumber}</span>
                                  </>
                                )}
                                <span>•</span>
                                <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-medium ${
                                  revenue.status === 'received' ? 'bg-green-100 text-green-800' :
                                  revenue.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-red-100 text-red-800'
                                }`}>
                                  {revenue.status === 'received' ? 'Đã nhận' :
                                   revenue.status === 'pending' ? 'Chờ thanh toán' : 'Quá hạn'}
                                </span>
                              </div>
                              {revenue.status !== 'received' && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Đã nhận: {formatCurrency(revenue.paidAmount, true)} / {formatCurrency(revenue.amount, true)}
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="font-bold text-green-600 text-sm sm:text-base">
                            +{formatCurrency(revenue.paidAmount, true)}
                            {revenue.amount > revenue.paidAmount && (
                              <div className="text-xs text-yellow-600">
                                (Thiếu: {formatCurrency(revenue.amount - revenue.paidAmount, true)})
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <AddProjectExpenseModal
        projectId={project.id}
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
      />

      <AddProjectRevenueModal
        projectId={project.id}
        isOpen={showRevenueModal}
        onClose={() => setShowRevenueModal(false)}
      />

      {showEditModal && (
        <EditProjectModal
          project={project}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </>
  );
}
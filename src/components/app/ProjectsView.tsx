import React, { useState } from 'react';
import { useProjects } from '../../contexts/ProjectContext';
import { PROJECT_CATEGORIES } from '../../constants/projects';
import { formatCurrency } from '../../utils/currency';
import { Plus, TrendingUp, TrendingDown, AlertTriangle, Target, Filter, MoreVertical } from 'lucide-react';
import { AddProjectModal } from './AddProjectModal';
import { ProjectDetailModal } from './ProjectDetailModal';
import { EditProjectModal } from './EditProjectModal';
import { ProjectActionsMenu } from './ProjectActionsMenu';
import { Project } from '../../types/Project';

export function ProjectsView() {
  const {
    projects,
    updateProject,
    deleteProject,
    getProjectProfit,
    getProjectPaidRevenue,
    getProjectUnpaidRevenue,
    getBudgetUtilization,
    getTotalPortfolioValue,
    getTotalPortfolioPaid,
    getProfitableProjects,
    getLosingProjects
  } = useProjects();

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectMenuId, setProjectMenuId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'profitable' | 'losing' | 'active'>('all');

  const portfolioValue = getTotalPortfolioValue();
  const portfolioPaid = getTotalPortfolioPaid();
  const profitableProjects = getProfitableProjects();
  const losingProjects = getLosingProjects();

  const getFilteredProjects = () => {
    switch (filter) {
      case 'profitable':
        return profitableProjects;
      case 'losing':
        return losingProjects;
      case 'active':
        return projects.filter(p => p.status === 'active');
      default:
        return projects;
    }
  };

  const filteredProjects = getFilteredProjects();

  const getProjectStatusColor = (project: Project) => {
    const profit = getProjectProfit(project.id);
    const utilization = getBudgetUtilization(project.id);

    if (profit > 0) return 'border-green-500 bg-green-50';
    if (profit < 0) return 'border-red-500 bg-red-50';
    if (utilization > 80) return 'border-yellow-500 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  const getProjectStatusIcon = (project: Project) => {
    const profit = getProjectProfit(project.id);
    const utilization = getBudgetUtilization(project.id);

    if (profit > 0) return <TrendingUp className="w-5 h-5 text-green-600" />;
    if (profit < 0) return <TrendingDown className="w-5 h-5 text-red-600" />;
    if (utilization > 80) return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    return <Target className="w-5 h-5 text-gray-600" />;
  };

  return (
    <>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Quản lý dự án</h1>
            <p className="text-gray-600">Theo dõi lợi nhuận và ngân sách</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Portfolio Summary */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-4 sm:p-6 text-white">
          <h3 className="text-lg font-semibold mb-4">Tổng quan danh mục dự án</h3>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(portfolioPaid.totalPaidRevenue, true)}</div>
              <div className="text-blue-100 text-xs sm:text-sm">Đã nhận</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold text-yellow-200">{formatCurrency(portfolioPaid.totalUnpaidRevenue, true)}</div>
              <div className="text-blue-100 text-xs sm:text-sm">Chưa nhận</div>
            </div>
            <div className="text-center">
              <div className="text-xl sm:text-2xl font-bold">{formatCurrency(portfolioValue.totalExpenses, true)}</div>
              <div className="text-blue-100 text-xs sm:text-sm">Tổng chi phí</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${portfolioValue.totalProfit >= 0 ? 'text-green-200' : 'text-red-200'}`}>
                {formatCurrency(portfolioValue.totalProfit, true)}
              </div>
              <div className="text-blue-100 text-xs sm:text-sm">Lợi nhuận ròng</div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-200" />
              <span>{profitableProjects.length} dự án có lãi</span>
            </div>
            <div className="flex items-center space-x-2">
              <TrendingDown className="w-4 h-4 text-red-200" />
              <span>{losingProjects.length} dự án thua lỗ</span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm border">
          <div className="flex items-center space-x-2 mb-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-800">Bộ lọc</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { key: 'all', label: 'Tất cả', count: projects.length },
              { key: 'profitable', label: 'Có lãi', count: profitableProjects.length },
              { key: 'losing', label: 'Thua lỗ', count: losingProjects.length },
              { key: 'active', label: 'Đang thực hiện', count: projects.filter(p => p.status === 'active').length }
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`p-2 rounded-lg font-medium transition-colors text-sm ${
                  filter === key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span className="hidden sm:inline">{label} ({count})</span>
                <span className="sm:hidden">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                {filter === 'all' ? 'Chưa có dự án nào' : `Không có dự án ${filter === 'profitable' ? 'có lãi' : filter === 'losing' ? 'thua lỗ' : 'đang thực hiện'}`}
              </h3>
              <p className="text-gray-500 mb-4">
                {filter === 'all' ? 'Tạo dự án đầu tiên để bắt đầu theo dõi' : 'Thử thay đổi bộ lọc để xem các dự án khác'}
              </p>
              {filter === 'all' && (
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                >
                  Tạo dự án đầu tiên
                </button>
              )}
            </div>
          ) : (
            filteredProjects.map((project) => {
              const profit = getProjectProfit(project.id);
              const paidRevenue = getProjectPaidRevenue(project.id);
              const unpaidRevenue = getProjectUnpaidRevenue(project.id);
              const utilization = getBudgetUtilization(project.id);
              const category = PROJECT_CATEGORIES[project.category];

              return (
                <div
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`rounded-xl p-3 sm:p-4 shadow-sm border-2 cursor-pointer hover:shadow-md transition-all ${getProjectStatusColor(project)}`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center ${category.color}`}>
                        <span className="text-lg sm:text-xl">{category.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800 text-sm sm:text-base">{project.name}</h4>
                        <p className="text-xs sm:text-sm text-gray-600">{category.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getProjectStatusIcon(project)}
                      <span className={`px-2 py-1 rounded-full text-xs font-medium hidden sm:inline ${
                        project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'on-hold' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {project.status === 'active' ? 'Đang thực hiện' :
                         project.status === 'completed' ? 'Hoàn thành' :
                         project.status === 'on-hold' ? 'Tạm dừng' : 'Lên kế hoạch'}
                      </span>
                      <div className="relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectMenuId(projectMenuId === project.id ? null : project.id);
                          }}
                          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-600" />
                        </button>

                        {projectMenuId === project.id && (
                          <ProjectActionsMenu
                            project={project}
                            onEdit={() => {
                              setEditingProject(project);
                              setProjectMenuId(null);
                            }}
                            onComplete={() => {
                              updateProject(project.id, { status: 'completed' });
                              setProjectMenuId(null);
                            }}
                            onDelete={() => {
                              if (confirm(`Bạn có chắc muốn xóa dự án "${project.name}"?`)) {
                                deleteProject(project.id);
                              }
                              setProjectMenuId(null);
                            }}
                            onClose={() => setProjectMenuId(null)}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Budget Progress */}
                    <div>
                      <div className="flex justify-between text-xs sm:text-sm mb-1">
                        <span className="text-gray-600">Sử dụng ngân sách</span>
                        <span className={`font-medium ${utilization > 100 ? 'text-red-600' : utilization > 80 ? 'text-yellow-600' : 'text-gray-800'}`}>
                          {utilization.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            utilization > 100 ? 'bg-red-500' :
                            utilization > 80 ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${Math.min(utilization, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 text-xs sm:text-sm">
                      <div>
                        <span className="text-gray-600">Ngân sách:</span>
                        <div className="font-semibold text-sm sm:text-base">{formatCurrency(project.budget, true)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Chi phí:</span>
                        <div className="font-semibold text-red-600 text-sm sm:text-base">{formatCurrency(project.totalExpenses, true)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Đã nhận:</span>
                        <div className="font-semibold text-green-600 text-sm sm:text-base">{formatCurrency(paidRevenue, true)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Chưa nhận:</span>
                        <div className="font-semibold text-yellow-600 text-sm sm:text-base">{formatCurrency(unpaidRevenue, true)}</div>
                      </div>
                    </div>

                    {/* Profit Summary */}
                    <div className="text-center pt-2 border-t border-gray-200">
                      <div>
                        <span className="text-gray-600">Lợi nhuận:</span>
                        <div className={`font-semibold text-sm sm:text-base ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {profit >= 0 ? '+' : ''}{formatCurrency(profit, true)}
                        </div>
                      </div>
                    </div>

                    {/* Alerts */}
                    {utilization > 100 && (
                      <div className="bg-red-100 border border-red-300 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-red-600" />
                          <span className="text-red-800 text-xs sm:text-sm font-medium">Vượt ngân sách!</span>
                        </div>
                      </div>
                    )}

                    {profit < 0 && project.totalRevenue > 0 && (
                      <div className="bg-red-100 border border-red-300 rounded-lg p-2 sm:p-3">
                        <div className="flex items-center space-x-2">
                          <TrendingDown className="w-4 h-4 text-red-600" />
                          <span className="text-red-800 text-xs sm:text-sm font-medium">Dự án đang thua lỗ</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      <AddProjectModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          isOpen={!!selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          isOpen={!!editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </>
  );
}

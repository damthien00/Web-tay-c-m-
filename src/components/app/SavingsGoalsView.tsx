import React, { useState } from 'react';
import { useSavingsGoals } from '../../contexts/SavingsGoalContext';
import { SAVINGS_GOAL_CATEGORIES } from '../../constants/savingsGoals';
import { formatCurrency } from '../../utils/currency';
import { Plus, Target, Calendar, Trash2, PiggyBank } from 'lucide-react';
import { SavingsGoalModal } from './SavingsGoalModal';
import { AddToGoalModal } from './AddToGoalModal';

export function SavingsGoalsView() {
  const { goals, deleteGoal, getTotalSavings, getActiveGoals, getCompletedGoals } = useSavingsGoals();
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);

  const activeGoals = getActiveGoals();
  const completedGoals = getCompletedGoals();
  const totalSavings = getTotalSavings();

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getDaysRemaining = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <>
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mục tiêu tiết kiệm</h1>
            <p className="text-gray-600">Theo dõi tiến độ tiết kiệm của bạn</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 text-white">
          <div className="flex items-center space-x-3 mb-4">
            <PiggyBank className="w-8 h-8" />
            <div>
              <h3 className="text-lg font-semibold">Tổng tiết kiệm</h3>
              <p className="text-green-100">Từ tất cả mục tiêu</p>
            </div>
          </div>
          <div className="text-3xl font-bold">{formatCurrency(totalSavings, true)}</div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-green-200">Đang thực hiện</span>
              <div className="font-semibold">{activeGoals.length} mục tiêu</div>
            </div>
            <div>
              <span className="text-green-200">Đã hoàn thành</span>
              <div className="font-semibold">{completedGoals.length} mục tiêu</div>
            </div>
          </div>
        </div>

        {/* Active Goals */}
        {activeGoals.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Mục tiêu đang thực hiện</h3>
            {activeGoals.map((goal) => {
              const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
              const daysRemaining = getDaysRemaining(goal.deadline);
              const category = SAVINGS_GOAL_CATEGORIES[goal.category];

              return (
                <div key={goal.id} className="bg-white rounded-xl p-4 shadow-sm border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
                        <span className="text-xl">{category.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                        <p className="text-sm text-gray-500">{category.name}</p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setSelectedGoal(goal.id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tiến độ</span>
                      <span className="font-medium">{progress.toFixed(1)}%</span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <span className="text-gray-600">Đã tiết kiệm: </span>
                        <span className="font-semibold text-green-600">
                          {formatCurrency(goal.currentAmount, true)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Mục tiêu: </span>
                        <span className="font-semibold">
                          {formatCurrency(goal.targetAmount, true)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {daysRemaining > 0
                            ? `Còn ${daysRemaining} ngày`
                            : daysRemaining === 0
                            ? 'Hết hạn hôm nay'
                            : `Quá hạn ${Math.abs(daysRemaining)} ngày`
                          }
                        </span>
                      </div>
                      <span>
                        Còn thiếu: {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount), true)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Completed Goals */}
        {completedGoals.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-800">Mục tiêu đã hoàn thành 🎉</h3>
            {completedGoals.map((goal) => {
              const category = SAVINGS_GOAL_CATEGORIES[goal.category];

              return (
                <div key={goal.id} className="bg-green-50 rounded-xl p-4 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${category.color}`}>
                        <span className="text-xl">{category.icon}</span>
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">{goal.title}</h4>
                        <p className="text-sm text-green-600">✅ Đã hoàn thành</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-600">
                        {formatCurrency(goal.targetAmount, true)}
                      </div>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">Chưa có mục tiêu nào</h3>
            <p className="text-gray-500 mb-4">Tạo mục tiêu đầu tiên để bắt đầu tiết kiệm</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              Tạo mục tiêu đầu tiên
            </button>
          </div>
        )}
      </div>

      <SavingsGoalModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {selectedGoal && (
        <AddToGoalModal
          goalId={selectedGoal}
          isOpen={!!selectedGoal}
          onClose={() => setSelectedGoal(null)}
        />
      )}
    </>
  );
}

import React, { useState } from 'react';
import { Plus, Target, TrendingUp, FileText, Briefcase } from 'lucide-react';
import { AddTransactionModal } from './AddTransactionModal';

interface QuickActionsProps {
  onNavigate: (view: 'savings' | 'trends' | 'reports' | 'projects') => void;
}

export function QuickActions({ onNavigate }: QuickActionsProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl p-4 shadow-sm border">
        <h3 className="font-semibold text-gray-800 mb-3">Thao tác nhanh</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-200 hover:bg-green-100 transition-colors"
          >
            <Plus className="w-6 h-6 text-red-600 mb-2" />
            <span className="text-sm font-medium text-red-800">Thêm giao dịch</span>
          </button>
          
          <button
            onClick={() => onNavigate('savings')}
            className="flex flex-col items-center p-4 bg-yellow-50 rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-colors"
          >
            <Target className="w-6 h-6 text-green-600 mb-2" />
            <span className="text-sm font-medium text-green-800">Mục tiêu tiết kiệm</span>
          </button>
          
          <button 
            onClick={() => onNavigate('projects')}
            className="flex flex-col items-center p-4 bg-purple-50 rounded-xl border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            <Briefcase className="w-6 h-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium text-purple-800">Quản lý dự án</span>
          </button>
          
          <button 
            onClick={() => onNavigate('trends')}
            className="flex flex-col items-center p-4 bg-blue-50 rounded-xl border border-blue-200 hover:bg-blue-100 transition-colors"
          >
            <TrendingUp className="w-6 h-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium text-blue-800">Xu hướng chi tiêu</span>
          </button>
        </div>
      </div>

      <AddTransactionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </>
  );
}
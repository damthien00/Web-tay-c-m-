import React from 'react';
import { Home, List, PieChart, Settings, Target, TrendingUp, FileText, Briefcase } from 'lucide-react';

interface NavigationBarProps {
  currentView: string;
  onViewChange: (view: 'dashboard' | 'transactions' | 'analytics' | 'settings' | 'savings' | 'trends' | 'reports' | 'projects') => void;
}

export function NavigationBar({ currentView, onViewChange }: NavigationBarProps) {
  const navItems = [
    { key: 'dashboard', icon: Home, label: 'Trang chủ' },
    { key: 'transactions', icon: List, label: 'Giao dịch' },
    { key: 'projects', icon: Briefcase, label: 'Dự án' },
    { key: 'savings', icon: Target, label: 'Tiết kiệm' },
    { key: 'settings', icon: Settings, label: 'Cài đặt' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200 shadow-lg overflow-x-auto">
      <div className="grid grid-cols-5 min-w-full">
        {navItems.map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => onViewChange(key as any)}
            className={`flex flex-col items-center py-2 px-1 transition-colors min-w-0 ${
              currentView === key
                ? 'text-red-600 bg-red-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4 mb-1" />
            <span className="text-xs font-medium truncate w-full text-center">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
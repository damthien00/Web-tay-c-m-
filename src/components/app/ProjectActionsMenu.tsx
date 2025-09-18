import React, { useRef, useEffect } from 'react';
import { Edit3, CheckCircle, Trash2, X } from 'lucide-react';
import { Project } from '../../types/Project';

interface ProjectActionsMenuProps {
  project: Project;
  onEdit: () => void;
  onComplete: () => void;
  onDelete: () => void;
  onClose: () => void;
}

export function ProjectActionsMenu({ project, onEdit, onComplete, onDelete, onClose }: ProjectActionsMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      onClick={(e) => e.stopPropagation()}
      className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 py-1"
    >
      <button
        onClick={onEdit}
        className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
      >
        <Edit3 className="w-4 h-4 text-blue-600" />
        <span className="text-gray-800">Chỉnh sửa dự án</span>
      </button>

      {project.status !== 'completed' && (
        <button
          onClick={onComplete}
          className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-gray-50 transition-colors"
        >
          <CheckCircle className="w-4 h-4 text-green-600" />
          <span className="text-gray-800">Đánh dấu hoàn thành</span>
        </button>
      )}

      <div className="border-t border-gray-100 my-1" />

      <button
        onClick={onDelete}
        className="w-full flex items-center space-x-3 px-4 py-2 text-left hover:bg-red-50 transition-colors text-red-600"
      >
        <Trash2 className="w-4 h-4" />
        <span>Xóa dự án</span>
      </button>
    </div>
  );
}

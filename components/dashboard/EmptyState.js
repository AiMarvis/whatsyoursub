import React from 'react';
import { Plus } from 'lucide-react';

const EmptyState = ({ 
  title = "데이터가 없습니다", 
  description = "아직 등록된 항목이 없습니다.",
  icon: Icon = Plus,
  actionLabel = "추가하기",
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 border border-dashed border-base-300 rounded-lg bg-base-100">
      <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-base-content/60" />
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-base-content/60 text-center max-w-md mb-6">{description}</p>
      
      {onAction && (
        <button 
          onClick={onAction}
          className="btn btn-primary btn-sm gap-2"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState; 
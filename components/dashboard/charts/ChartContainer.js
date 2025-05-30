'use client';

import React, { memo } from 'react';
import { Loader2 } from 'lucide-react';
import { ChartSquare } from 'lucide-react';
import EmptyState from '../EmptyState';

const ChartContainer = memo(({ 
  title, 
  description, 
  loading, 
  isEmpty, 
  children 
}) => {
  return (
    <div className="card bg-base-100 shadow-sm border border-base-200 h-full">
      <div className="card-body">
        {title && <h3 className="card-title text-lg">{title}</h3>}
        {description && <p className="text-sm text-base-content/70 mb-4">{description}</p>}
        
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : isEmpty ? (
          <div className="flex-1 flex justify-center items-center">
            <EmptyState 
              title="데이터가 없습니다" 
              description="표시할 차트 데이터가 없습니다."
              icon={ChartSquare}
              actionLabel={null}
            />
          </div>
        ) : (
          <div className="mt-2 flex-1 flex items-center justify-center">
            {children}
          </div>
        )}
      </div>
    </div>
  );
});

ChartContainer.displayName = 'ChartContainer';

export default ChartContainer; 
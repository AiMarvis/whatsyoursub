import React from 'react';

// 스켈레톤 로딩 상태를 표시하는 컴포넌트
const SubscriptionsSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* 검색 및 필터 스켈레톤 */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="h-10 bg-base-300 rounded-full w-72"></div>
        <div className="h-10 bg-base-300 rounded-full w-36"></div>
        <div className="h-10 bg-base-300 rounded-full w-24 ml-auto"></div>
      </div>
      
      {/* 구독 목록 스켈레톤 */}
      <div className="grid gap-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="card bg-base-100 shadow-sm border border-base-200">
            <div className="card-body p-5">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-base-300 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-5 bg-base-300 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-base-300 rounded w-2/3 mb-4"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-4 bg-base-300 rounded w-full"></div>
                    <div className="h-4 bg-base-300 rounded w-full"></div>
                    <div className="h-4 bg-base-300 rounded w-full"></div>
                  </div>
                </div>
                <div className="w-20">
                  <div className="h-8 bg-base-300 rounded-full w-20 mb-2"></div>
                  <div className="h-6 bg-base-300 rounded w-16 mx-auto"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SubscriptionsSkeleton; 
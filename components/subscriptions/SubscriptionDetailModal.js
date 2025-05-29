'use client'

import React, { memo } from 'react';
import { X, Edit, Trash, Calendar, CreditCard, Clock, Info } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { ko } from 'date-fns/locale';

// 결제 주기 레이블
const getBillingCycleLabel = (cycle) => {
  const labels = {
    monthly: '월간',
    yearly: '연간',
    quarterly: '분기',
    weekly: '주간',
  };
  return labels[cycle] || cycle;
};

// 카테고리 레이블
const getCategoryLabel = (category) => {
  const labels = {
    entertainment: '엔터테인먼트',
    productivity: '생산성',
    utility: '유틸리티',
    education: '교육',
    other: '기타',
  };
  return labels[category] || category;
};

// 구독 상세 정보 모달 컴포넌트
const SubscriptionDetailModal = memo(({
  isOpen,
  onClose,
  subscription,
  onEdit,
  onDelete,
}) => {
  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen || !subscription) return null;

  // 다음 결제일까지 남은 일수 계산
  const daysUntilNextPayment = subscription.next_payment_date
    ? differenceInDays(new Date(subscription.next_payment_date), new Date())
    : null;

  // 결제 주기별 연간 비용 계산
  const calculateAnnualCost = () => {
    const price = subscription.price || 0;
    
    switch (subscription.billing_cycle) {
      case 'monthly':
        return price * 12;
      case 'yearly':
        return price;
      case 'quarterly':
        return price * 4;
      case 'weekly':
        return price * 52;
      default:
        return price;
    }
  };

  const annualCost = calculateAnnualCost();

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">구독 상세 정보</h3>
          <button 
            className="btn btn-sm btn-ghost btn-circle" 
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 구독 정보 헤더 */}
        <div className="bg-base-200 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{subscription.name}</h2>
              <p className="text-base-content/70">{getCategoryLabel(subscription.category)}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">₩{subscription.price?.toLocaleString()}</p>
              <p className="text-base-content/70">{getBillingCycleLabel(subscription.billing_cycle)}</p>
            </div>
          </div>
        </div>

        {/* 구독 상세 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* 다음 결제일 */}
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">다음 결제일</h4>
              <p>
                {subscription.next_payment_date 
                  ? format(new Date(subscription.next_payment_date), 'PPP', { locale: ko })
                  : '정보 없음'}
              </p>
              {daysUntilNextPayment !== null && (
                <p className={`text-sm ${daysUntilNextPayment <= 7 ? 'text-error' : 'text-base-content/70'}`}>
                  {daysUntilNextPayment > 0 
                    ? `${daysUntilNextPayment}일 남음` 
                    : daysUntilNextPayment === 0 
                      ? '오늘 결제' 
                      : `${Math.abs(daysUntilNextPayment)}일 지남`}
                </p>
              )}
            </div>
          </div>

          {/* 연간 비용 */}
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">연간 비용</h4>
              <p>₩{annualCost.toLocaleString()}</p>
              <p className="text-sm text-base-content/70">
                월 평균: ₩{Math.round(annualCost / 12).toLocaleString()}
              </p>
            </div>
          </div>

          {/* 결제 주기 */}
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">결제 주기</h4>
              <p>{getBillingCycleLabel(subscription.billing_cycle)}</p>
            </div>
          </div>

          {/* 카테고리 */}
          <div className="flex items-start space-x-3">
            <div className="bg-primary/10 p-2 rounded-lg">
              <Info className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h4 className="font-medium">카테고리</h4>
              <p>{getCategoryLabel(subscription.category)}</p>
            </div>
          </div>
        </div>

        {/* 설명 */}
        {subscription.description && (
          <div className="mb-6">
            <h4 className="font-medium mb-2">설명</h4>
            <div className="bg-base-200 p-4 rounded-lg">
              <p className="whitespace-pre-wrap">{subscription.description}</p>
            </div>
          </div>
        )}

        {/* 버튼 영역 */}
        <div className="modal-action">
          <button 
            className="btn btn-error" 
            onClick={() => onDelete(subscription)}
          >
            <Trash className="h-4 w-4 mr-1" />
            삭제
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => onEdit(subscription)}
          >
            <Edit className="h-4 w-4 mr-1" />
            편집
          </button>
        </div>
      </div>
      <div className="modal-backdrop bg-black/25" onClick={onClose} />
    </dialog>
  );
});

SubscriptionDetailModal.displayName = 'SubscriptionDetailModal';

export default SubscriptionDetailModal; 
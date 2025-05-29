'use client'

import React, { memo, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Save, Plus } from 'lucide-react';
import { format } from 'date-fns';

// 구독 데이터 스키마 정의
const subscriptionSchema = z.object({
  name: z.string().min(1, '서비스 이름을 입력해주세요'),
  price: z.coerce.number().min(0, '0 이상의 가격을 입력해주세요'),
  billing_cycle: z.enum(['monthly', 'yearly', 'quarterly', 'weekly'], {
    errorMap: () => ({ message: '결제 주기를 선택해주세요' })
  }),
  category: z.enum(['entertainment', 'productivity', 'utility', 'education', 'other'], {
    errorMap: () => ({ message: '카테고리를 선택해주세요' })
  }),
  description: z.string().optional(),
  next_payment_date: z.string().refine(val => !val || !isNaN(new Date(val).getTime()), {
    message: '유효한 날짜를 입력해주세요'
  }),
});

// 결제 주기 옵션
const billingCycleOptions = [
  { value: 'monthly', label: '월간' },
  { value: 'yearly', label: '연간' },
  { value: 'quarterly', label: '분기' },
  { value: 'weekly', label: '주간' },
];

// 카테고리 옵션
const categoryOptions = [
  { value: 'entertainment', label: '엔터테인먼트' },
  { value: 'productivity', label: '생산성' },
  { value: 'utility', label: '유틸리티' },
  { value: 'education', label: '교육' },
  { value: 'other', label: '기타' },
];

// 구독 폼 모달 컴포넌트
const SubscriptionFormModal = memo(({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 폼 상태 관리
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: initialData || {
      name: '',
      price: 0,
      billing_cycle: 'monthly',
      category: 'entertainment',
      description: '',
      next_payment_date: format(new Date(), 'yyyy-MM-dd'),
    }
  });

  // 초기 데이터가 변경되면 폼 리셋
  useEffect(() => {
    if (isOpen) {
      reset(initialData || {
        name: '',
        price: 0,
        billing_cycle: 'monthly',
        category: 'entertainment',
        description: '',
        next_payment_date: format(new Date(), 'yyyy-MM-dd'),
      });
    }
  }, [isOpen, initialData, reset]);

  // 폼 제출 핸들러
  const submitHandler = (data) => {
    onSubmit(data);
  };

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-2xl">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-lg">
            {initialData ? '구독 정보 편집' : '새 구독 추가'}
          </h3>
          <button 
            className="btn btn-sm btn-ghost btn-circle" 
            onClick={onClose}
            aria-label="닫기"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(submitHandler)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* 서비스 이름 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">서비스 이름</span>
              </label>
              <input
                type="text"
                placeholder="Netflix, Spotify 등"
                className={`input input-bordered w-full ${errors.name ? 'input-error' : ''}`}
                {...register('name')}
              />
              {errors.name && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.name.message}</span>
                </label>
              )}
            </div>

            {/* 가격 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">가격</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  className={`input input-bordered w-full pl-8 ${errors.price ? 'input-error' : ''}`}
                  {...register('price')}
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">
                  ₩
                </div>
              </div>
              {errors.price && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.price.message}</span>
                </label>
              )}
            </div>

            {/* 결제 주기 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">결제 주기</span>
              </label>
              <select 
                className={`select select-bordered w-full ${errors.billing_cycle ? 'select-error' : ''}`}
                {...register('billing_cycle')}
              >
                {billingCycleOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.billing_cycle && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.billing_cycle.message}</span>
                </label>
              )}
            </div>

            {/* 카테고리 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">카테고리</span>
              </label>
              <select 
                className={`select select-bordered w-full ${errors.category ? 'select-error' : ''}`}
                {...register('category')}
              >
                {categoryOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {errors.category && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.category.message}</span>
                </label>
              )}
            </div>

            {/* 다음 결제일 */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium">다음 결제일</span>
              </label>
              <input
                type="date"
                className={`input input-bordered w-full ${errors.next_payment_date ? 'input-error' : ''}`}
                {...register('next_payment_date')}
              />
              {errors.next_payment_date && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.next_payment_date.message}</span>
                </label>
              )}
            </div>
          </div>

          {/* 설명 */}
          <div className="form-control w-full mb-6">
            <label className="label">
              <span className="label-text font-medium">설명 (선택사항)</span>
            </label>
            <textarea
              placeholder="구독에 대한 메모나 설명을 입력하세요"
              className={`textarea textarea-bordered w-full h-24 ${errors.description ? 'textarea-error' : ''}`}
              {...register('description')}
            />
            {errors.description && (
              <label className="label">
                <span className="label-text-alt text-error">{errors.description.message}</span>
              </label>
            )}
          </div>

          {/* 버튼 */}
          <div className="modal-action">
            <button 
              type="button" 
              className="btn" 
              onClick={onClose}
              disabled={isLoading}
            >
              취소
            </button>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  처리 중...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1" />
                  {initialData ? '저장' : '추가'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop bg-black/25" onClick={onClose} />
    </dialog>
  );
});

SubscriptionFormModal.displayName = 'SubscriptionFormModal';

export default SubscriptionFormModal; 
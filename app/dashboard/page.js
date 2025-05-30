'use client'

import { useState, useEffect, useMemo, useCallback, Suspense } from 'react'
import { CreditCard, BarChart3, TrendingUp, Calendar, DollarSign, Package, Bell, Sparkles, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

// 커스텀 훅
import { useSessionManager } from '@/hooks/useSessionManager'
import { useSubscriptions } from '@/hooks/useSubscriptions'

// 컴포넌트
import StatCard from '@/components/dashboard/StatCard'
import DashboardTabs from '@/components/dashboard/DashboardTabs'
import StatusAlert from '@/components/dashboard/StatusAlert'
import EmptyState from '@/components/dashboard/EmptyState'
import SubscriptionsSkeleton from '@/components/dashboard/SubscriptionsSkeleton'
import SubscriptionFormModal from '@/components/subscriptions/SubscriptionFormModal'
import SubscriptionDetailModal from '@/components/subscriptions/SubscriptionDetailModal'
// 차트 컴포넌트 추가
import CategoryPieChart from '@/components/dashboard/charts/CategoryPieChart'
import MonthlyExpenseChart from '@/components/dashboard/charts/MonthlyExpenseChart'

// 대시보드 페이지 컴포넌트
export default function DashboardPage() {
  const router = useRouter()
  
  // 탭 관리
  const [activeTab, setActiveTab] = useState('overview');
  
  // 모달 상태 관리
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 세션 관리 (커스텀 훅 사용)
  const { 
    user, 
    loading: authLoading, 
    sessionError, 
    showSuccessMessage, 
    signOut,
    toggleSuccessMessage 
  } = useSessionManager();
  
  // 구독 정보 관리 (커스텀 훅 사용)
  const {
    subscriptions,
    loading: subscriptionsLoading,
    error: subscriptionsError,
    refresh: refreshSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    totalMonthlyAmount,
    upcomingPayments,
    useLocalBackup,
    setUseLocalBackup
  } = useSubscriptions(user?.id || '');

  // 통계 데이터 (useMemo로 최적화)
  const stats = useMemo(() => [
    { 
      title: '활성 구독', 
      value: subscriptions.length.toString(), 
      subtitle: '구독 중인 서비스', 
      icon: CreditCard, 
      color: 'primary' 
    },
    { 
      title: '월 지출', 
      value: `${totalMonthlyAmount.toLocaleString()}원`, 
      subtitle: '모든 구독 서비스 합계', 
      icon: DollarSign, 
      color: 'secondary' 
    },
    { 
      title: '다가오는 결제', 
      value: upcomingPayments.length.toString(), 
      subtitle: '이번 주 예정', 
      icon: Calendar, 
      color: 'accent' 
    },
    { 
      title: '절약 금액', 
      value: '0원', 
      subtitle: '최적화 제안', 
      icon: TrendingUp, 
      color: 'info' 
    }
  ], [subscriptions.length, totalMonthlyAmount, upcomingPayments.length]);

  // 구독 추가 모달 열기
  const handleAddSubscription = useCallback(() => {
    setSelectedSubscription(null);
    setFormModalOpen(true);
  }, []);

  // 구독 편집 모달 열기
  const handleEditSubscription = useCallback((subscription) => {
    setSelectedSubscription(subscription);
    setDetailModalOpen(false);
    setFormModalOpen(true);
  }, []);

  // 구독 상세 정보 모달 열기
  const handleViewSubscription = useCallback((subscription) => {
    setSelectedSubscription(subscription);
    setDetailModalOpen(true);
  }, []);

  // 로컬 백업 모드 토글
  const toggleLocalBackupMode = useCallback(() => {
    const newMode = !useLocalBackup;
    setUseLocalBackup(newMode);
    // 모드 변경 후 구독 목록 새로고침
    setTimeout(() => {
      refreshSubscriptions();
    }, 300);
  }, [useLocalBackup, setUseLocalBackup, refreshSubscriptions]);

  // 상태 메시지 관리
  const [statusMessage, setStatusMessage] = useState(null);

  // 상태 메시지 표시
  const showStatusMessage = useCallback((message, type = 'info', duration = 5000) => {
    setStatusMessage({ message, type });
    
    // 자동으로 사라지는 타이머
    if (duration > 0) {
      setTimeout(() => {
        setStatusMessage(null);
      }, duration);
    }
  }, []);

  // 구독 폼 제출 처리
  const handleFormSubmit = useCallback(async (data) => {
    try {
      setIsSubmitting(true);
      
      let result;
      if (selectedSubscription) {
        // 기존 구독 수정
        result = await updateSubscription(selectedSubscription.id, data);
      } else {
        // 새 구독 추가
        console.log('[폼제출] 구독 추가 시도:', data);
        result = await addSubscription(data);
      }
      
      if (result.success) {
        console.log('[폼제출] 성공 결과:', result);
        setFormModalOpen(false);
        
        // 상태 알림 표시
        const actionType = selectedSubscription ? '수정' : '추가';
        let successMessage = `구독이 성공적으로 ${actionType}되었습니다.`;
        
        // 로컬 저장소에 저장된 경우 안내 메시지 추가
        if (result.isLocal) {
          successMessage += ' (RLS 정책 문제로 로컬에 저장됨)';
          // 로컬 백업 모드로 자동 전환
          setUseLocalBackup(true);
        }
        
        // 성공 메시지 표시
        showStatusMessage(successMessage, 'success');
        
        // 구독 목록 새로고침
        setTimeout(() => {
          refreshSubscriptions();
        }, 500);
      } else {
        // 오류 처리
        console.error('[폼제출] 실패:', result.error);
        showStatusMessage(`구독 저장 실패: ${result.error}`, 'error');
      }
    } catch (error) {
      console.error('[폼제출] 오류 발생:', error);
      showStatusMessage(`오류 발생: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedSubscription, addSubscription, updateSubscription, refreshSubscriptions, showStatusMessage, setUseLocalBackup]);

  // 구독 삭제 처리
  const handleDeleteSubscription = useCallback(async (subscription) => {
    try {
      const result = await deleteSubscription(subscription.id);
      if (result.success) {
        setDetailModalOpen(false);
        refreshSubscriptions();
      } else {
        console.error('구독 삭제 실패:', result.error);
      }
    } catch (error) {
      console.error('구독 삭제 중 오류:', error);
    }
  }, [deleteSubscription, refreshSubscriptions]);

  // 로딩 중 상태
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>
        <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-medium">데이터를 불러오는 중...</span>
      </div>
    )
  }

  // 인증되지 않은 상태
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="card w-96 bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center text-error">인증 오류</h2>
            <p className="text-center">{sessionError || '인증 세션을 찾을 수 없습니다. 다시 로그인해주세요.'}</p>
            <div className="card-actions justify-center mt-4">
              <button className="btn btn-primary" onClick={() => router.push('/auth/login')}>
                로그인 페이지로 이동
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* 세션 만료 경고 */}
      {sessionError && (
        <StatusAlert
          type="warning"
          message={sessionError}
          description="5초 후 로그인 페이지로 이동합니다."
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-auto max-w-3xl"
        />
      )}
      
      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                안녕하세요, {user.user_metadata?.full_name || user.email || '사용자'}님! 👋
              </h2>
              <p className="text-base-content/70">
                오늘도 스마트한 AI 구독 관리를 시작해보세요.
              </p>
            </div>
            
            {/* 알림 아이콘 */}
            <div className="ml-auto flex items-center gap-4">
              {/* 로컬 백업 모드 토글 버튼 */}
              <button 
                className={`btn btn-sm ${useLocalBackup ? 'btn-warning' : 'btn-outline'} flex items-center gap-1`}
                onClick={toggleLocalBackupMode}
                title={useLocalBackup ? '로컬 저장소 모드 활성화됨' : '로컬 저장소 모드 비활성화됨'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <circle cx="8" cy="10" r="2" />
                  <path d="M8 16v-2" />
                  <path d="M16 16v-6" />
                  <path d="M16 8v0" />
                </svg>
                {useLocalBackup ? '로컬 모드' : '동기화 모드'}
              </button>

              <button className="btn btn-circle btn-ghost btn-sm relative group">
                <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                <span className="sr-only">알림</span>
              </button>
              <button className="btn btn-circle btn-ghost btn-sm group" onClick={signOut}>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 group-hover:text-error transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                <span className="sr-only">로그아웃</span>
              </button>
            </div>
          </div>
          
          {/* 성공 메시지 */}
          {showSuccessMessage && (
            <StatusAlert
              type="success"
              message="로그인에 성공했습니다!"
              description="이제 모든 기능을 사용할 수 있습니다."
              onClose={() => toggleSuccessMessage(false)}
            />
          )}
        </div>

        {/* 탭 네비게이션 */}
        <DashboardTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              subtitle={stat.subtitle}
              icon={stat.icon}
              color={stat.color}
            />
          ))}
        </div>

        {/* 차트 섹션 - 개요 탭에만 표시 */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            <CategoryPieChart 
              subscriptions={subscriptions} 
              loading={subscriptionsLoading} 
            />
            <MonthlyExpenseChart 
              subscriptions={subscriptions} 
              loading={subscriptionsLoading}
              totalMonthlyAmount={totalMonthlyAmount}
            />
          </div>
        )}

        {/* 탭 콘텐츠 */}
        <div className="mt-8">
          {/* 개요 탭 */}
          {activeTab === 'overview' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">구독 개요</h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleAddSubscription}
                >
                  구독 추가
                </button>
              </div>
              
              {/* 구독이 없는 경우 */}
              {!subscriptionsLoading && subscriptions.length === 0 ? (
                <EmptyState
                  title="구독 정보 없음"
                  description="아직 등록된 구독이 없습니다. 새로운 구독을 추가해보세요."
                  icon={CreditCard}
                  actionLabel="구독 추가하기"
                  onAction={handleAddSubscription}
                />
              ) : subscriptionsLoading ? (
                <SubscriptionsSkeleton />
              ) : (
                <div className="grid gap-4">
                  {/* 구독 목록 표시 (3개만) */}
                  {subscriptions.slice(0, 3).map((subscription) => (
                    <div 
                      key={subscription.id} 
                      className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleViewSubscription(subscription)}
                    >
                      <div className="card-body p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-base-300 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-base-content" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{subscription.name || '구독 서비스'}</h4>
                            <p className="text-sm text-base-content/70">{subscription.description || '설명 없음'}</p>
                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-base-content/60">결제 주기:</span>
                                <span className="ml-1">{subscription.billing_cycle || '월간'}</span>
                              </div>
                              <div>
                                <span className="text-base-content/60">다음 결제:</span>
                                <span className="ml-1">{subscription.next_payment_date || '-'}</span>
                              </div>
                              <div>
                                <span className="text-base-content/60">카테고리:</span>
                                <span className="ml-1">{subscription.category || '-'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="badge badge-primary mb-2">{subscription.price?.toLocaleString() || '0'}원</div>
                            <p className="text-xs text-base-content/50">{subscription.billing_cycle || '월간'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* 더보기 버튼 */}
                  {subscriptions.length > 3 && (
                    <button 
                      className="btn btn-outline btn-sm w-full mt-2"
                      onClick={() => setActiveTab('subscriptions')}
                    >
                      모든 구독 보기 ({subscriptions.length})
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* 구독 탭 */}
          {activeTab === 'subscriptions' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">구독 관리</h3>
                <button 
                  className="btn btn-primary btn-sm"
                  onClick={handleAddSubscription}
                >
                  구독 추가
                </button>
              </div>
              
              {/* 구독 목록 */}
              {!subscriptionsLoading && subscriptions.length === 0 ? (
                <EmptyState
                  title="구독 정보 없음"
                  description="아직 등록된 구독이 없습니다. 새로운 구독을 추가해보세요."
                  icon={CreditCard}
                  actionLabel="구독 추가하기"
                  onAction={handleAddSubscription}
                />
              ) : subscriptionsLoading ? (
                <SubscriptionsSkeleton />
              ) : (
                <div className="grid gap-4">
                  {subscriptions.map((subscription) => (
                    <div 
                      key={subscription.id} 
                      className="card bg-base-100 shadow-sm border border-base-200 hover:shadow-md transition-all cursor-pointer"
                      onClick={() => handleViewSubscription(subscription)}
                    >
                      <div className="card-body p-5">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-base-300 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-base-content" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold">{subscription.name || '구독 서비스'}</h4>
                            <p className="text-sm text-base-content/70">{subscription.description || '설명 없음'}</p>
                            <div className="grid grid-cols-3 gap-4 mt-2 text-sm">
                              <div>
                                <span className="text-base-content/60">결제 주기:</span>
                                <span className="ml-1">{subscription.billing_cycle || '월간'}</span>
                              </div>
                              <div>
                                <span className="text-base-content/60">다음 결제:</span>
                                <span className="ml-1">{subscription.next_payment_date || '-'}</span>
                              </div>
                              <div>
                                <span className="text-base-content/60">카테고리:</span>
                                <span className="ml-1">{subscription.category || '-'}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="badge badge-primary mb-2">{subscription.price?.toLocaleString() || '0'}원</div>
                            <p className="text-xs text-base-content/50">{subscription.billing_cycle || '월간'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* 구독 추가/편집 모달 */}
      <SubscriptionFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedSubscription}
        isLoading={isSubmitting}
      />

      {/* 구독 상세 정보 모달 */}
      <SubscriptionDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        subscription={selectedSubscription}
        onEdit={handleEditSubscription}
        onDelete={handleDeleteSubscription}
      />

      {/* 상태 메시지 표시 */}
      {statusMessage && (
        <StatusAlert
          type={statusMessage.type}
          message={statusMessage.message}
          onClose={() => setStatusMessage(null)}
          className="mt-4"
        />
      )}

      {/* 로컬 백업 모드 활성화 시 안내 배너 */}
      {useLocalBackup && (
        <div className="alert alert-warning shadow-lg mt-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <div>
              <h3 className="font-bold">로컬 저장소 모드 활성화됨</h3>
              <div className="text-xs">구독 정보가 브라우저 로컬 스토리지에 저장됩니다. 브라우저 데이터 삭제 시 정보가 사라질 수 있습니다.</div>
            </div>
          </div>
          <div className="flex-none">
            <button className="btn btn-sm btn-ghost" onClick={toggleLocalBackupMode}>
              클라우드 모드로 전환
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 
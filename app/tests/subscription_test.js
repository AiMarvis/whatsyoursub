'use client'

import { useState, useEffect } from 'react'
import { useSubscriptions } from '@/hooks/useSubscriptions'
import SubscriptionDetailModal from '@/components/subscriptions/SubscriptionDetailModal'
import SubscriptionFormModal from '@/components/subscriptions/SubscriptionFormModal'
import SubscriptionsSkeleton from '@/components/dashboard/SubscriptionsSkeleton'

// 테스트 사용자 ID
const TEST_USER_ID = 'test-user-123'

// 테스트용 구독 데이터
const TEST_SUBSCRIPTION = {
  name: '테스트 구독',
  price: 9900,
  billing_cycle: 'monthly',
  category: 'entertainment',
  description: '테스트 목적으로 생성된 구독입니다.',
  next_payment_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 30일 후
}

// 오류 유발 테스트용 구독 데이터 (필수 필드 누락)
const INVALID_SUBSCRIPTION = {
  description: '필수 필드가 누락된 구독입니다.',
  // name 필드 누락 (필수)
  price: -100, // 음수 가격 (유효하지 않음)
  billing_cycle: 'invalid', // 유효하지 않은 결제 주기
}

export default function SubscriptionTest() {
  const [testLog, setTestLog] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [lastAddedSubscription, setLastAddedSubscription] = useState(null)
  const [selectedSubscription, setSelectedSubscription] = useState(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [formModalOpen, setFormModalOpen] = useState(false)
  const [showLoadingSkeleton, setShowLoadingSkeleton] = useState(false)
  const [simulateLoading, setSimulateLoading] = useState(false)
  
  // useSubscriptions 훅 사용
  const {
    subscriptions,
    loading,
    error,
    refresh,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    totalMonthlyAmount,
    upcomingPayments,
    useLocalBackup,
    setUseLocalBackup,
    setError // 테스트용 에러 설정 함수
  } = useSubscriptions(TEST_USER_ID)

  // 로그 추가 함수
  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toISOString()
    setTestLog(prev => [...prev, { timestamp, message, type }])
    // 로그 파일에도 기록
    console.log(`[${timestamp}][${type}] ${message}`)
  }

  // 컴포넌트 마운트 시 테스트 시작
  useEffect(() => {
    addLog('구독 관리 기능 테스트 시작')
    
    // 로컬 백업 모드 활성화
    setUseLocalBackup(true)
    addLog('로컬 백업 모드 활성화됨')
    
    // 구독 목록 가져오기
    refresh()
  }, [refresh, setUseLocalBackup])

  // 로딩 상태 변경 감지 및 로깅
  useEffect(() => {
    if (loading) {
      addLog('구독 데이터 로딩 중...', 'info')
    }
  }, [loading])

  // 에러 상태 변경 감지 및 로깅
  useEffect(() => {
    if (error) {
      addLog(`에러 발생: ${error}`, 'error')
    }
  }, [error])

  // 구독 목록 조회 결과 로깅
  useEffect(() => {
    if (!loading && !error) {
      addLog(`구독 목록 조회 완료: ${subscriptions.length}개 항목`, 'success')
      addLog(`월 총액: ${totalMonthlyAmount}원`, 'info')
      addLog(`다가오는 결제: ${upcomingPayments.length}개`, 'info')
    }
  }, [loading, error, subscriptions, totalMonthlyAmount, upcomingPayments])

  // 로딩 시뮬레이션 효과
  useEffect(() => {
    if (simulateLoading) {
      setShowLoadingSkeleton(true)
      const timer = setTimeout(() => {
        setSimulateLoading(false)
        setShowLoadingSkeleton(false)
      }, 3000) // 3초 후 로딩 종료
      
      return () => clearTimeout(timer)
    }
  }, [simulateLoading])

  // 구독 추가 테스트
  const handleAddSubscription = async () => {
    try {
      setIsSubmitting(true)
      addLog('구독 추가 테스트 시작', 'info')
      
      // 테스트 구독에 고유 식별자 추가
      const testData = {
        ...TEST_SUBSCRIPTION,
        name: `${TEST_SUBSCRIPTION.name} ${new Date().toLocaleTimeString()}`
      }
      
      addLog(`추가할 구독 데이터: ${JSON.stringify(testData)}`, 'info')
      
      const result = await addSubscription(testData)
      
      if (result.success) {
        addLog(`구독 추가 성공: ${result.data?.id || '알 수 없음'}`, 'success')
        setLastAddedSubscription(result.data)
      } else {
        addLog(`구독 추가 실패: ${result.error}`, 'error')
      }
      
      // 구독 목록 새로고침
      refresh()
    } catch (error) {
      addLog(`구독 추가 중 오류 발생: ${error.message}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 유효하지 않은 구독 추가 테스트 (오류 케이스)
  const handleAddInvalidSubscription = async () => {
    try {
      setIsSubmitting(true)
      addLog('유효하지 않은 구독 추가 테스트 시작', 'info')
      
      addLog(`추가할 구독 데이터: ${JSON.stringify(INVALID_SUBSCRIPTION)}`, 'info')
      
      const result = await addSubscription(INVALID_SUBSCRIPTION)
      
      if (result.success) {
        addLog(`구독 추가 성공 (예상치 못한 결과): ${result.data?.id || '알 수 없음'}`, 'warning')
        setLastAddedSubscription(result.data)
      } else {
        addLog(`구독 추가 실패 (예상된 결과): ${result.error}`, 'success')
      }
    } catch (error) {
      addLog(`구독 추가 중 오류 발생 (예상된 결과): ${error.message}`, 'success')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 로딩 상태 테스트
  const handleTestLoading = () => {
    addLog('로딩 상태 테스트 시작', 'info')
    setSimulateLoading(true)
  }

  // 에러 상태 테스트
  const handleTestError = () => {
    addLog('에러 상태 테스트 시작', 'info')
    setError('테스트용 에러 메시지입니다.')
  }

  // 구독 상세 정보 조회
  const handleViewSubscription = (subscription) => {
    setSelectedSubscription(subscription)
    setDetailModalOpen(true)
    addLog(`구독 상세 정보 조회: ${subscription.id}`, 'info')
  }

  // 구독 편집 모달 열기
  const handleEditSubscription = (subscription) => {
    setSelectedSubscription(subscription)
    setDetailModalOpen(false)
    setFormModalOpen(true)
    addLog(`구독 편집 모달 열기: ${subscription.id}`, 'info')
  }

  // 구독 편집 저장
  const handleFormSubmit = async (data) => {
    try {
      setIsSubmitting(true)
      addLog('구독 편집 저장 시작', 'info')
      
      if (!selectedSubscription) {
        throw new Error('선택된 구독이 없습니다.')
      }
      
      addLog(`편집할 구독 데이터: ${JSON.stringify(data)}`, 'info')
      
      const result = await updateSubscription(selectedSubscription.id, data)
      
      if (result.success) {
        addLog(`구독 편집 성공: ${result.data?.id || selectedSubscription.id}`, 'success')
        setFormModalOpen(false)
        // 구독 목록 새로고침
        refresh()
      } else {
        addLog(`구독 편집 실패: ${result.error}`, 'error')
      }
    } catch (error) {
      addLog(`구독 편집 중 오류 발생: ${error.message}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 구독 삭제
  const handleDeleteSubscription = async (subscription) => {
    try {
      setIsSubmitting(true)
      addLog(`구독 삭제 시작: ${subscription.id}`, 'info')
      
      const result = await deleteSubscription(subscription.id)
      
      if (result.success) {
        addLog(`구독 삭제 성공: ${subscription.id}`, 'success')
        setDetailModalOpen(false)
        // 구독 목록 새로고침
        refresh()
      } else {
        addLog(`구독 삭제 실패: ${result.error}`, 'error')
      }
    } catch (error) {
      addLog(`구독 삭제 중 오류 발생: ${error.message}`, 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">구독 관리 기능 테스트</h1>

      {/* 테스트 상태 */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">테스트 상태</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>테스트 사용자 ID: {TEST_USER_ID}</p>
              <p>로딩 상태: {loading || simulateLoading ? '로딩 중' : '완료'}</p>
              <p>오류: {error || '없음'}</p>
              <p>로컬 백업 모드: {useLocalBackup ? '활성화' : '비활성화'}</p>
            </div>
            <div>
              <p>구독 수: {subscriptions.length}</p>
              <p>월 총액: {totalMonthlyAmount}원</p>
              <p>다가오는 결제: {upcomingPayments.length}개</p>
            </div>
          </div>
        </div>
      </div>

      {/* 테스트 작업 */}
      <div className="card bg-base-100 shadow-xl mb-6">
        <div className="card-body">
          <h2 className="card-title">테스트 작업</h2>
          <div className="flex flex-wrap gap-2 mt-4">
            <button 
              className="btn btn-primary" 
              onClick={handleAddSubscription}
              disabled={isSubmitting || simulateLoading}
            >
              {isSubmitting ? '처리 중...' : '구독 추가 테스트'}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={refresh}
              disabled={loading || isSubmitting || simulateLoading}
            >
              구독 목록 새로고침
            </button>
            <button 
              className="btn btn-warning"
              onClick={handleAddInvalidSubscription}
              disabled={isSubmitting || simulateLoading}
            >
              유효하지 않은 구독 추가
            </button>
            <button 
              className="btn btn-info"
              onClick={handleTestLoading}
              disabled={simulateLoading}
            >
              로딩 상태 테스트
            </button>
            <button 
              className="btn btn-error"
              onClick={handleTestError}
              disabled={isSubmitting || simulateLoading}
            >
              에러 상태 테스트
            </button>
          </div>
        </div>
      </div>

      {/* 로딩 스켈레톤 */}
      {(loading || showLoadingSkeleton) ? (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">구독 목록 로딩 중...</h2>
            <SubscriptionsSkeleton />
          </div>
        </div>
      ) : (
        /* 구독 목록 */
        subscriptions.length > 0 && (
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title">구독 목록</h2>
              <div className="grid gap-4 mt-4">
                {subscriptions.map((subscription) => (
                  <div 
                    key={subscription.id} 
                    className="card bg-base-200 shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => handleViewSubscription(subscription)}
                  >
                    <div className="card-body p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold">{subscription.name}</h3>
                          <p className="text-sm">{subscription.description || '설명 없음'}</p>
                        </div>
                        <div className="text-right">
                          <div className="badge badge-primary">{subscription.price?.toLocaleString() || '0'}원</div>
                          <p className="text-xs">{subscription.billing_cycle || '월간'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )
      )}

      {/* 에러 표시 */}
      {error && (
        <div className="alert alert-error mb-6">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>오류: {error}</span>
          </div>
          <button className="btn btn-sm" onClick={() => setError(null)}>닫기</button>
        </div>
      )}

      {/* 마지막 추가된 구독 */}
      {lastAddedSubscription && (
        <div className="card bg-base-100 shadow-xl mb-6">
          <div className="card-body">
            <h2 className="card-title">마지막 추가된 구독</h2>
            <pre className="bg-base-200 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(lastAddedSubscription, null, 2)}
            </pre>
          </div>
        </div>
      )}

      {/* 테스트 로그 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title">테스트 로그</h2>
          <div className="overflow-x-auto">
            <table className="table w-full">
              <thead>
                <tr>
                  <th>시간</th>
                  <th>타입</th>
                  <th>메시지</th>
                </tr>
              </thead>
              <tbody>
                {testLog.map((log, index) => (
                  <tr key={index}>
                    <td>{new Date(log.timestamp).toLocaleTimeString()}</td>
                    <td>
                      <span className={`badge badge-${log.type === 'error' ? 'error' : log.type === 'success' ? 'success' : log.type === 'warning' ? 'warning' : 'info'}`}>
                        {log.type}
                      </span>
                    </td>
                    <td>{log.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 구독 상세 정보 모달 */}
      <SubscriptionDetailModal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        subscription={selectedSubscription}
        onEdit={handleEditSubscription}
        onDelete={handleDeleteSubscription}
      />

      {/* 구독 편집 모달 */}
      <SubscriptionFormModal
        isOpen={formModalOpen}
        onClose={() => setFormModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedSubscription}
        isLoading={isSubmitting}
      />
    </div>
  )
} 
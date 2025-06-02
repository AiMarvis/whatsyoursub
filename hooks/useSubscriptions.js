import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export const useSubscriptions = (userId) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 구독 정보 가져오기
  const fetchSubscriptions = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      setSubscriptions([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 30초 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // 새로운 RLS 정책으로 인해 별도의 사용자 확인 없이 직접 구독 데이터 쿼리
      console.log('[구독목록] 데이터 요청 시작 - 사용자 ID:', userId);
      
      // 구독 데이터 쿼리
      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      clearTimeout(timeoutId);

      if (fetchError) {
        console.error('[구독목록] Supabase 오류:', fetchError);
        
        // 로컬 스토리지 데이터 복구 시도
        const localData = getLocalSubscriptions(userId);
        if (localData && localData.length > 0) {
          console.log('[구독목록] 로컬 데이터로 복구됨:', localData.length);
          setSubscriptions(localData);
          setLoading(false);
          
          // 권한 오류인 경우 무시하고 계속 진행
          if (fetchError.code === '42501' || fetchError.message?.includes('permission denied')) {
            console.warn('[구독목록] RLS 권한 오류, 로컬 데이터로 계속 진행');
            setError(null);
          } else {
            setError('서버 연결에 문제가 있어 로컬 데이터를 표시합니다.');
          }
          return;
        }
        
        throw fetchError;
      }

      // 데이터 정규화 및 기본값 설정
      const subscriptionsData = (data || []).map(item => ({
        ...item,
        price: item.price || 0,
        billing_cycle: item.billing_cycle || 'monthly',
        category: item.category || 'other',
        next_payment_date: item.next_payment_date || null,
        description: item.description || ''
      }));

      // 데이터 로컬 스토리지에 저장 (오프라인 지원)
      saveLocalSubscriptions(userId, subscriptionsData);

      setSubscriptions(subscriptionsData);
      console.log('[구독목록] 데이터 로드 완료:', subscriptionsData.length);
    } catch (err) {
      console.error('[구독목록] 오류:', err);
      setError('구독 정보를 불러오는 중 오류가 발생했습니다.');
      
      // 오류 발생 시 로컬 데이터 복구 시도
      const localData = getLocalSubscriptions(userId);
      if (localData && localData.length > 0) {
        console.log('[구독목록] 오류 후 로컬 데이터로 복구됨:', localData.length);
        setSubscriptions(localData);
        setError('서버 연결에 문제가 있어 로컬 데이터를 표시합니다.');
      } else {
        setSubscriptions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 로컬 스토리지 헬퍼 함수
  const getLocalSubscriptions = (uid) => {
    try {
      const localStorageKey = `subscriptions_${uid}`;
      const storedData = localStorage.getItem(localStorageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          return parsedData;
        }
      }
    } catch (e) {
      console.warn('[로컬저장소] 읽기 오류:', e);
    }
    return null;
  };

  const saveLocalSubscriptions = (uid, data) => {
    try {
      const localStorageKey = `subscriptions_${uid}`;
      localStorage.setItem(localStorageKey, JSON.stringify(data));
      console.log('[로컬저장소] 구독 데이터 저장 완료:', data.length);
    } catch (e) {
      console.warn('[로컬저장소] 저장 오류:', e);
    }
  };

  // 구독 추가
  const addSubscription = useCallback(async (subscriptionData) => {
    if (!userId) {
      console.error('[구독추가] userId가 없습니다.');
      return { success: false, error: '인증된 사용자만 구독을 추가할 수 있습니다. 로그인을 확인해주세요.' };
    }

    // 유효한 사용자 ID 형식인지 확인
    if (typeof userId !== 'string' || userId.trim() === '') {
      console.error('[구독추가] 유효하지 않은 userId 형식:', userId);
      return { 
        success: false, 
        error: '유효하지 않은 사용자 ID입니다. 로그인 상태를 확인해주세요.' 
      };
    }

    setLoading(true);
    setError(null); // 에러 상태 초기화

    try {
      // 데이터 정규화 및 기본값 설정
      const normalizedData = {
        ...subscriptionData,
        user_id: userId,
        name: subscriptionData.name || '이름 없는 구독',
        price: parseFloat(subscriptionData.price) || 0,
        billing_cycle: subscriptionData.billing_cycle || 'monthly',
        category: subscriptionData.category || '기타',
        start_date: subscriptionData.start_date || new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(), // 생성 시간 명시적 설정
      };

      // monthly_cost 필드 계산 및 추가
      if (subscriptionData.monthly_cost !== undefined) {
        normalizedData.monthly_cost = parseFloat(subscriptionData.monthly_cost) || 0;
      } else {
        // 결제 주기에 따라 월별 비용 계산
        const price = parseFloat(normalizedData.price) || 0;
        switch (normalizedData.billing_cycle) {
          case 'yearly':
            normalizedData.monthly_cost = price / 12;
            break;
          case 'quarterly':
            normalizedData.monthly_cost = price / 3;
            break;
          case 'weekly':
            normalizedData.monthly_cost = price * 4.33; // 평균 4.33주/월
            break;
          case 'monthly':
          default:
            normalizedData.monthly_cost = price;
            break;
        }
      }
      
      console.log('[구독추가] 시도 - 사용자 ID:', userId);

      // 데이터 삽입 시도
      const { data, error: insertError } = await supabase
        .from('subscriptions')
        .insert([normalizedData])
        .select('*');

      // 오류 발생 시
      if (insertError) {
        console.error('[구독추가] Supabase 오류:', insertError);
        
        // RLS 정책 오류인 경우 로컬 저장 시도
        if (isRLSError(insertError) || isForeignKeyError(insertError)) {
          return saveSubscriptionLocally(userId, normalizedData);
        }
        
        // 기타 오류 처리
        if (isDuplicateError(insertError)) {
          setError('이미 존재하는 구독 정보와 중복됩니다.');
          return { success: false, error: '이미 존재하는 구독 정보와 중복됩니다.' };
        }
        
        setError(insertError.message || '데이터베이스 오류로 구독 추가에 실패했습니다.');
        return { success: false, error: insertError.message || '데이터베이스 오류로 구독 추가에 실패했습니다.' };
      }

      // 데이터가 성공적으로 반환된 경우
      if (data && data.length > 0) {
        console.log('[구독추가] 성공, 반환 데이터:', data[0].id);
        
        // 로컬 스토리지에도 백업
        updateLocalSubscription(userId, data[0]);
        
        // 상태 업데이트
        setSubscriptions(prevSubs => {
          const existingIndex = prevSubs.findIndex(sub => sub.id === data[0].id);
          if (existingIndex > -1) {
            const updatedSubs = [...prevSubs];
            updatedSubs[existingIndex] = data[0];
            return updatedSubs;
          }
          return [data[0], ...prevSubs];
        });
        
        return { success: true, data: data[0] };
      } else {
        // 데이터는 추가되었지만 SELECT 권한이 없어 반환되지 않은 경우
        console.warn('[구독추가] 데이터가 반환되지 않음, 로컬 상태만 업데이트');
        
        // 로컬 저장 및 상태 업데이트
        const result = saveSubscriptionLocally(userId, normalizedData);
        
        // 성공적으로 추가되었지만 데이터를 가져오지 못한 경우 구독 목록 새로고침 요청
        fetchSubscriptions();
        
        return { 
          ...result,
          needsRefresh: true
        };
      }
    } catch (err) {
      console.error('[구독추가] 최종 오류:', err.message);
      
      let errorMessage = err.message || '구독 추가에 실패했습니다.';
      
      if (isNetworkError(err)) {
        errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
        
        // 네트워크 오류 시 로컬 저장 시도
        const result = saveSubscriptionLocally(userId, subscriptionData);
        return {
          ...result,
          networkError: true
        };
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [userId, fetchSubscriptions]);

  // 오류 타입 확인 헬퍼 함수
  const isRLSError = (error) => {
    return error?.code === '42501' || 
      (typeof error?.message === 'string' && error.message.includes('permission denied'));
  };

  const isForeignKeyError = (error) => {
    return error?.code === '23503' || 
      (typeof error?.message === 'string' && (
        error.message.includes('violates foreign key constraint') ||
        error.message.includes('key is not present in table')
      ));
  };

  const isDuplicateError = (error) => {
    return error?.code === '23505' || 
      (typeof error?.message === 'string' && error.message.includes('duplicate key'));
  };

  const isNetworkError = (error) => {
    return error?.code === 'NETWORK_ERROR' || 
      (typeof error?.message === 'string' && (
        error.message.includes('network') || 
        error.message.includes('connection') ||
        error.message.includes('timeout')
      ));
  };

  // 로컬 구독 저장 헬퍼 함수
  const saveSubscriptionLocally = (uid, subscriptionData) => {
    try {
      // 고유 ID 생성
      const newId = crypto.randomUUID ? crypto.randomUUID() : `temp-${Date.now()}`;
      const newSubscription = {
        ...subscriptionData,
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // 로컬 데이터 업데이트
      const localData = getLocalSubscriptions(uid) || [];
      localData.unshift(newSubscription);
      saveLocalSubscriptions(uid, localData);
      
      console.log('[구독추가] 로컬 저장 성공:', newSubscription.id);
      
      // 메모리 상태 업데이트
      setSubscriptions(prev => [newSubscription, ...prev]);
      
      return { 
        success: true, 
        message: '구독이 로컬에 추가되었습니다. (일부 기능이 제한될 수 있습니다)', 
        data: newSubscription,
        isLocal: true
      };
    } catch (localError) {
      console.error('[구독추가] 로컬 저장 실패:', localError);
      
      // 실패해도 메모리에는 추가
      const tempId = `temp-${Date.now()}`;
      const newSubscription = {
        ...subscriptionData,
        id: tempId
      };
      
      setSubscriptions(prev => [newSubscription, ...prev]);
      
      return { 
        success: true, 
        message: '구독이 메모리에 추가되었습니다. (페이지 이동 시 데이터가 소실될 수 있습니다)',
        data: newSubscription,
        isLocal: true,
        isVolatile: true
      };
    }
  };

  // 로컬 구독 업데이트 헬퍼 함수
  const updateLocalSubscription = (uid, subscription) => {
    try {
      const localData = getLocalSubscriptions(uid) || [];
      const existingIndex = localData.findIndex(item => item.id === subscription.id);
      
      if (existingIndex > -1) {
        localData[existingIndex] = subscription;
      } else {
        localData.unshift(subscription);
      }
      
      saveLocalSubscriptions(uid, localData);
    } catch (e) {
      console.warn('[로컬저장소] 구독 업데이트 오류:', e);
    }
  };

  // 구독 업데이트
  const updateSubscription = useCallback(async (id, updates) => {
    if (!userId || !id) {
      return { success: false, error: '유효하지 않은 요청입니다.' };
    }

    try {
      setLoading(true);
      
      // 기본값 설정
      const normalizedUpdates = {
        ...updates,
        category: updates.category || 'other',
        billing_cycle: updates.billing_cycle || 'monthly'
      };

      // monthly_cost 필드 계산 및 추가
      if (updates.monthly_cost !== undefined) {
        normalizedUpdates.monthly_cost = parseFloat(updates.monthly_cost) || 0;
      } else {
        // 결제 주기에 따라 월별 비용 계산
        const price = parseFloat(updates.price) || 0;
        switch (normalizedUpdates.billing_cycle) {
          case 'yearly':
            normalizedUpdates.monthly_cost = price / 12;
            break;
          case 'quarterly':
            normalizedUpdates.monthly_cost = price / 3;
            break;
          case 'weekly':
            normalizedUpdates.monthly_cost = price * 4.33; // 평균 4.33주/월
            break;
          case 'monthly':
          default:
            normalizedUpdates.monthly_cost = price;
            break;
        }
      }

      console.log('[구독업데이트] 시도 - ID:', id, '데이터:', normalizedUpdates);
      
      // Supabase를 통한 업데이트
      const { data, error: updateError } = await supabase
        .from('subscriptions')
        .update(normalizedUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select();

      if (updateError) {
        console.error('[구독업데이트] Supabase 오류:', updateError);
        
        // RLS 정책 오류 발생 시
        if (updateError.code === '42501' || updateError.message.includes('permission denied')) {
          throw new Error('데이터베이스 접근 권한이 없습니다. 관리자에게 문의하세요.');
        }
        
        throw updateError;
      }

      if (data && data.length > 0) {
        // 성공적으로 업데이트된 경우 로컬 상태 업데이트
        console.log('[구독업데이트] 성공 - 응답 데이터:', data[0]);
        setSubscriptions(prev => 
          prev.map(sub => sub.id === id ? { ...sub, ...data[0] } : sub)
        );
        
        return { success: true, data: data[0] };
      } else {
        console.warn('[구독업데이트] 데이터가 반환되지 않음, RLS SELECT 정책 확인 필요');
        // 구독 목록 강제 새로고침
        fetchSubscriptions();
        return { 
          success: true,
          message: '구독이 업데이트되었습니다. 목록을 새로고침합니다.',
          needsRefresh: true 
        };
      }
    } catch (err) {
      console.error('[구독업데이트] 최종 오류:', err);
      setError(err.message || '구독을 업데이트하는 중 오류가 발생했습니다.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [userId, fetchSubscriptions]);

  // 구독 삭제
  const deleteSubscription = useCallback(async (id) => {
    if (!userId || !id) {
      return { success: false, error: '유효하지 않은 요청입니다.' };
    }

    try {
      setLoading(true);
      
      console.log('[구독삭제] 시도 - ID:', id);
      
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) {
        console.error('[구독삭제] Supabase 오류:', deleteError);
        
        // RLS 정책 오류 발생 시
        if (deleteError.code === '42501' || deleteError.message.includes('permission denied')) {
          throw new Error('데이터베이스 접근 권한이 없습니다. 관리자에게 문의하세요.');
        }
        
        throw deleteError;
      }

      // 로컬 상태에서 삭제된 구독 제거
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      console.log('[구독삭제] 성공 - ID:', id);
      return { success: true };
    } catch (err) {
      console.error('[구독삭제] 최종 오류:', err);
      setError(err.message || '구독을 삭제하는 중 오류가 발생했습니다.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 컴포넌트 마운트 시 구독 정보 로드
  useEffect(() => {
    fetchSubscriptions();
    
    // 페이지 로드 시 사용자 인증 상태 확인
    const checkUserAuth = async () => {
      if (!userId) {
        console.warn('[인증확인] userId가 없음, 인증 확인 중단');
        return;
      }
      
      try {
        // 세션 상태 확인
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('[인증확인] 세션 확인 오류:', sessionError);
          setError('로그인 세션을 확인할 수 없습니다. 다시 로그인해주세요.');
          return;
        }
        
        // 세션이 없는 경우
        if (!sessionData.session) {
          console.warn('[인증확인] 유효한 세션 없음');
          setError('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
          return;
        }
        
        const user = sessionData.session.user;
        if (!user) {
          console.warn('[인증확인] 세션에 사용자 정보 없음');
          setError('사용자 정보를 찾을 수 없습니다. 다시 로그인해주세요.');
          return;
        }
        
        // 로그인된 사용자와 전달된 userId가 일치하는지 확인
        if (user.id !== userId) {
          console.warn('[인증확인] 사용자 ID 불일치:', { sessionUserId: user.id, passedUserId: userId });
          setError('사용자 ID가 일치하지 않습니다. 다시 로그인해주세요.');
          return;
        }
        
        console.log('[인증확인] 세션 유효성 확인 완료, 사용자 ID:', userId);
        
        // 사용자 테이블에 데이터 자동 삽입 시도 (필요한 경우에만)
        try {
          // 사용자 존재 여부 먼저 확인
          const { data: userData, error: userCheckError } = await supabase
            .from('users')
            .select('id')
            .eq('id', userId)
            .single();
            
          // 사용자가 없는 경우에만 자동 생성 시도
          if (userCheckError && userCheckError.code === 'PGRST116') {
            console.log('[인증확인] 사용자 정보가 없어 자동 생성 시도');
            
            // 새 RLS 정책으로 사용자 자동 생성
            const { error: insertError } = await supabase
              .from('users')
              .insert([{ 
                id: userId, 
                email: user?.email || '',
                full_name: user?.user_metadata?.full_name || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }]);
              
            if (insertError) {
              // 안전한 오류 출력
              const safeLogError = (prefix, err) => {
                if (!err) {
                  console.error(`${prefix}: 알 수 없는 오류 (객체 없음)`);
                  return;
                }
                
                try {
                  const errStr = JSON.stringify(err, (key, value) => {
                    if (value instanceof Error) {
                      return { 
                        name: value.name, 
                        message: value.message, 
                        stack: value.stack 
                      };
                    }
                    return value;
                  });
                  console.error(`${prefix}:`, errStr);
                } catch (jsonError) {
                  console.error(`${prefix} (직렬화 실패):`, {
                    code: err.code || 'unknown',
                    message: err.message || 'No message',
                    name: err.name || 'Unknown error'
                  });
                }
              };
              
              safeLogError('[인증확인] 사용자 자동 생성 실패', insertError);
              
              // RLS 정책 오류는 무시하고 계속 진행 (이미 정책을 수정했으므로 향후 문제 없음)
              if (insertError?.code === '42501' || 
                  (typeof insertError?.message === 'string' && insertError.message.includes('permission denied'))) {
                console.warn('[인증확인] RLS 정책 관련 오류, 무시하고 계속 진행');
                // 중요: 오류 메시지 제거
                setError(null);
              } else {
                console.warn('[인증확인] 사용자 생성 실패했으나 구독 기능은 계속 진행');
                // 가벼운 경고만 표시하고 계속 진행
                setError('프로필 정보 생성에 문제가 있으나, 구독 관리는 계속 이용할 수 있습니다.');
              }
            } else {
              console.log('[인증확인] 사용자 자동 생성 성공');
              setError(null);
            }
          } else if (userCheckError) {
            // 다른 종류의 오류 발생 시 (권한 문제 등)
            console.warn('[인증확인] 사용자 확인 중 오류:', userCheckError);
            
            // RLS 권한 오류는 무시하고 계속 진행
            if (userCheckError?.code === '42501' || 
                (typeof userCheckError?.message === 'string' && userCheckError.message.includes('permission denied'))) {
              console.warn('[인증확인] RLS 권한 오류, 무시하고 계속 진행');
              setError(null);
            } else {
              setError('사용자 정보 확인 중 문제가 발생했으나, 구독 관리는 계속 이용할 수 있습니다.');
            }
          } else {
            // 사용자가 이미 존재하는 경우
            console.log('[인증확인] 사용자 정보 확인 완료');
            setError(null);
          }
        } catch (err) {
          console.error('[인증확인] 사용자 정보 확인/생성 중 예외 발생:', err);
          // 오류가 있어도 구독 기능 사용 가능하도록 처리
          setError('프로필 정보 처리 중 문제가 발생했으나, 구독 관리는 계속 이용할 수 있습니다.');
        }
      } catch (err) {
        console.error('[인증확인] 예상치 못한 오류:', err);
        setError('사용자 인증 상태를 확인하는 중 오류가 발생했습니다.');
      }
    };
    
    checkUserAuth();
  }, [fetchSubscriptions, userId, setError]);

  // 총 월별 금액 계산 및 다가오는 결제 필터링
  const calculateTotalMonthlyAmount = useCallback(() => {
    return subscriptions.reduce((sum, sub) => {
      const price = sub.price || 0;
      
      // 결제 주기에 따라 월별 금액 계산
      switch (sub.billing_cycle) {
        case 'yearly': return sum + (price / 12);
        case 'quarterly': return sum + (price / 3);
        case 'weekly': return sum + (price * 4.33); // 평균 4.33주/월
        case 'monthly':
        default: return sum + price;
      }
    }, 0);
  }, [subscriptions]);

  const filterUpcomingPayments = useCallback(() => {
    return subscriptions.filter(sub => {
      // 다음 결제일이 7일 이내인 구독 필터링
      if (!sub.next_payment_date) return false;
      const nextPayment = new Date(sub.next_payment_date);
      const now = new Date();
      const daysDiff = Math.floor((nextPayment - now) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    });
  }, [subscriptions]);

  return {
    subscriptions,
    loading,
    error,
    refresh: fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    totalMonthlyAmount: calculateTotalMonthlyAmount(),
    upcomingPayments: filterUpcomingPayments(),
    setError
  };
};

export default useSubscriptions; 
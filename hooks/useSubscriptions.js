import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

// 로컬 스토리지 키
const LOCAL_STORAGE_KEY = 'whatsyoursub_local_subscriptions';

export const useSubscriptions = (userId) => {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [useLocalBackup, setUseLocalBackup] = useState(false);

  // 로컬 백업에서 구독 데이터 가져오기
  const getLocalSubscriptions = useCallback(() => {
    try {
      const localData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (localData) {
        return JSON.parse(localData);
      }
      return [];
    } catch (err) {
      console.error('로컬 구독 데이터 로딩 오류:', err);
      return [];
    }
  }, []);

  // 로컬 백업에 구독 데이터 저장
  const saveLocalSubscriptions = useCallback((data) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (err) {
      console.error('로컬 구독 데이터 저장 오류:', err);
      return false;
    }
  }, []);

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

      let subscriptionsData = [];

      // Supabase에서 구독 정보 가져오기 시도
      if (!useLocalBackup) {
        try {
          let query = supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId);
          
          // 정렬 적용 (오류 발생 시 정렬 생략)
          try {
            query = query.order('created_at', { ascending: false });
          } catch (sortError) {
            console.warn('정렬 적용 중 오류:', sortError);
          }

          const { data, error: fetchError } = await query;

          clearTimeout(timeoutId);

          if (fetchError) {
            console.error('Supabase 구독 정보 가져오기 오류:', fetchError);
            throw fetchError;
          }

          // 데이터 정규화 및 기본값 설정
          subscriptionsData = (data || []).map(item => ({
            ...item,
            price: item.price || 0,
            billing_cycle: item.billing_cycle || 'monthly',
            category: item.category || 'other',
            next_payment_date: item.next_payment_date || null,
            description: item.description || ''
          }));
        } catch (err) {
          console.error('Supabase에서 구독 정보 가져오기 실패:', err);
          // Supabase 실패 시 로컬 백업으로 전환
          setUseLocalBackup(true);
          const localData = getLocalSubscriptions();
          subscriptionsData = localData.filter(sub => sub.user_id === userId);
        }
      } else {
        // 로컬 백업에서 구독 정보 가져오기
        console.log('로컬 백업에서 구독 정보 가져오기');
        const localData = getLocalSubscriptions();
        subscriptionsData = localData.filter(sub => sub.user_id === userId);
      }

      setSubscriptions(subscriptionsData);
    } catch (err) {
      console.error('구독 정보 로딩 중 오류:', err);
      setError(err.message || '구독 정보를 불러오는 중 오류가 발생했습니다.');
      setSubscriptions([]); // 오류 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  }, [userId, useLocalBackup, getLocalSubscriptions]);

  // 구독 추가
  const addSubscription = useCallback(async (subscriptionData) => {
    if (!userId) {
      console.error('addSubscription: userId가 없습니다.');
      return { success: false, error: '인증된 사용자만 구독을 추가할 수 있습니다. 로그인을 확인해주세요.' };
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
      
      console.log('[구독추가] 시도 - 사용자 ID:', userId);
      console.log('[구독추가] 정규화된 데이터:', JSON.stringify(normalizedData, null, 2));

      // 로컬 백업 모드인 경우 로컬 스토리지에 직접 저장
      if (useLocalBackup) {
        // 로컬 고유 ID 생성
        const localId = `local-${uuidv4()}`;
        const localSubscription = {
          ...normalizedData,
          id: localId,
          is_local: true, // 로컬 저장소에서 생성된 항목임을 표시
          created_at: new Date().toISOString(),
        };

        // 로컬 저장소에 추가
        const localData = getLocalSubscriptions();
        const updatedData = [localSubscription, ...localData];
        const saveResult = saveLocalSubscriptions(updatedData);

        if (saveResult) {
          // 메모리 상태 업데이트
          setSubscriptions(prev => [localSubscription, ...prev]);
          return { success: true, data: localSubscription, isLocal: true };
        } else {
          throw new Error('로컬 저장소에 구독 정보를 저장하는 데 실패했습니다.');
        }
      }

      // Supabase에 저장 시도
      // 세션 상태 확인
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('[구독추가] 세션 확인 오류:', sessionError);
        throw new Error('인증 세션 확인 중 오류가 발생했습니다.');
      }
      console.log('[구독추가] 세션 확인 완료:', !!sessionData.session);

      // 데이터 삽입 시도
      const { data, error: insertError } = await supabase
        .from('subscriptions')
        .insert([normalizedData])
        .select('*');

      if (insertError) {
        console.error('[구독추가] Supabase 오류:', insertError);
        console.error('[구독추가] 오류 상세:', JSON.stringify(insertError, null, 2));
        
        // RLS 정책 오류 발생 시 로컬 저장소로 전환
        if (insertError.code === '42501' || insertError.message.includes('permission denied')) {
          console.log('[구독추가] RLS 정책 오류, 로컬 저장소로 전환');
          setUseLocalBackup(true);
          
          // 로컬 고유 ID 생성
          const localId = `local-${uuidv4()}`;
          const localSubscription = {
            ...normalizedData,
            id: localId,
            is_local: true, // 로컬 저장소에서 생성된 항목임을 표시
            created_at: new Date().toISOString(),
          };

          // 로컬 저장소에 추가
          const localData = getLocalSubscriptions();
          const updatedData = [localSubscription, ...localData];
          const saveResult = saveLocalSubscriptions(updatedData);

          if (saveResult) {
            // 메모리 상태 업데이트
            setSubscriptions(prev => [localSubscription, ...prev]);
            return { 
              success: true, 
              data: localSubscription, 
              isLocal: true,
              message: 'Supabase 저장 실패로 로컬에 저장되었습니다.'
            };
          } else {
            throw new Error('로컬 저장소에 구독 정보를 저장하는 데 실패했습니다.');
          }
        }
        
        if (insertError.code === '23505' || insertError.message.includes('duplicate key')) {
          setError('이미 존재하는 구독 정보와 중복됩니다.');
          throw new Error('이미 존재하는 구독 정보와 중복됩니다. (Unique Constraint)');
        }
        setError(insertError.message || '데이터베이스 오류로 구독 추가에 실패했습니다.');
        throw insertError;
      }

      if (data && data.length > 0) {
        console.log('[구독추가] 성공, 반환 데이터:', data);
        setSubscriptions(prevSubs => {
          // 기존에 같은 ID의 구독이 있다면 교체, 없다면 맨 앞에 추가
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
        console.warn('[구독추가] 데이터가 반환되지 않음, RLS SELECT 정책 확인 필요');
        // 구독 목록 강제 새로고침
        fetchSubscriptions();
        return { 
          success: true, 
          message: '구독이 추가되었습니다. 목록을 새로고침합니다.',
          needsRefresh: true 
        };
      }
    } catch (err) {
      console.error('[구독추가] 최종 오류:', err.message);
      return { success: false, error: err.message || '구독 추가에 실패했습니다.' };
    } finally {
      setLoading(false);
    }
  }, [userId, fetchSubscriptions, useLocalBackup, getLocalSubscriptions, saveLocalSubscriptions]);

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

      const { data, error: updateError } = await supabase
        .from('subscriptions')
        .update(normalizedUpdates)
        .eq('id', id)
        .eq('user_id', userId)
        .select();

      if (updateError) throw updateError;

      if (data && data.length > 0) {
        // 성공적으로 업데이트된 경우 로컬 상태 업데이트
        setSubscriptions(prev => 
          prev.map(sub => sub.id === id ? { ...sub, ...data[0] } : sub)
        );
        
        return { success: true, data: data[0] };
      } else {
        throw new Error('구독을 업데이트할 수 없습니다. 해당 ID를 찾을 수 없습니다.');
      }
    } catch (err) {
      console.error('구독 업데이트 중 오류:', err);
      setError(err.message || '구독을 업데이트하는 중 오류가 발생했습니다.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 구독 삭제
  const deleteSubscription = useCallback(async (id) => {
    if (!userId || !id) {
      return { success: false, error: '유효하지 않은 요청입니다.' };
    }

    try {
      setLoading(true);
      
      const { error: deleteError } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      // 로컬 상태에서 삭제된 구독 제거
      setSubscriptions(prev => prev.filter(sub => sub.id !== id));
      return { success: true };
    } catch (err) {
      console.error('구독 삭제 중 오류:', err);
      setError(err.message || '구독을 삭제하는 중 오류가 발생했습니다.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 컴포넌트 마운트 시 구독 정보 로드
  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

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
    setError, // 외부에서 에러 상태를 직접 제어할 필요가 있다면 추가
    useLocalBackup, // 로컬 백업 사용 여부
    setUseLocalBackup // 로컬 백업 모드 전환 함수
  };
};

export default useSubscriptions; 
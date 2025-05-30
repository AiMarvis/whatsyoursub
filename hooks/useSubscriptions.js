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

      // Supabase에서 구독 정보 가져오기
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

      if (fetchError) throw fetchError;

      // 데이터 정규화 및 기본값 설정
      const normalizedData = (data || []).map(item => ({
        ...item,
        price: item.price || 0,
        billing_cycle: item.billing_cycle || 'monthly',
        category: item.category || 'other', // 카테고리 기본값 설정
        next_payment_date: item.next_payment_date || null,
        description: item.description || ''
      }));

      setSubscriptions(normalizedData);
    } catch (err) {
      console.error('구독 정보 로딩 중 오류:', err);
      setError(err.message || '구독 정보를 불러오는 중 오류가 발생했습니다.');
      setSubscriptions([]); // 오류 시 빈 배열로 설정
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 구독 추가
  const addSubscription = useCallback(async (subscriptionData) => {
    if (!userId) {
      console.error('addSubscription: userId가 없습니다.');
      return { success: false, error: '인증된 사용자만 구독을 추가할 수 있습니다. 로그인을 확인해주세요.' };
    }

    setLoading(true);
    setError(null); // 에러 상태 초기화

    try {
      const normalizedData = {
        ...subscriptionData,
        user_id: userId,
        name: subscriptionData.name || '이름 없는 구독',
        price: parseFloat(subscriptionData.price) || 0,
        billing_cycle: subscriptionData.billing_cycle || 'monthly',
        category: subscriptionData.category || '기타',
        start_date: subscriptionData.start_date || new Date().toISOString().split('T')[0],
      };
      
      console.log('Supabase insert 시도 데이터:', JSON.stringify(normalizedData, null, 2));

      const { data, error: insertError } = await supabase
        .from('subscriptions')
        .insert([normalizedData])
        .select('*') // 필요한 모든 컬럼 명시 또는 '*'
        .single();

      if (insertError) {
        console.error('Supabase insert 에러:', JSON.stringify(insertError, null, 2));
        if (insertError.message.includes('violates row-level security policy')) {
          setError('구독 추가 권한이 없습니다. (RLS Policy)'); // 사용자에게 보여줄 에러 상태 업데이트
          throw new Error('새로운 행이 RLS(행 수준 보안) 정책을 위반합니다.');
        } else if (insertError.message.includes('duplicate key value violates unique constraint')) {
          setError('이미 존재하는 구독 정보와 중복됩니다.');
          throw new Error('이미 존재하는 구독 정보와 중복됩니다. (Unique Constraint)');
        }
        setError(insertError.message || '데이터베이스 오류로 구독 추가에 실패했습니다.');
        throw insertError;
      }

      if (data) {
        console.log('Supabase insert 성공, 반환 데이터:', data);
        setSubscriptions(prevSubs => {
          // 기존에 같은 ID의 구독이 있다면 교체, 없다면 맨 앞에 추가
          const existingIndex = prevSubs.findIndex(sub => sub.id === data.id);
          if (existingIndex > -1) {
            const updatedSubs = [...prevSubs];
            updatedSubs[existingIndex] = data;
            return updatedSubs;
          }
          return [data, ...prevSubs];
        });
        return { success: true, data };
      } else {
        console.warn('구독은 추가되었을 수 있으나, 반환된 데이터가 없습니다. RLS SELECT 정책을 확인해주세요.');
        // refreshSubscriptions(); // 강제 새로고침은 UI 깜빡임을 유발할 수 있으므로 신중히 결정
        return { success: true, data: normalizedData, needsRefresh: true, message: '구독이 추가되었습니다. 목록 반영에 시간이 걸릴 수 있습니다.' };
      }
    } catch (err) {
      console.error('구독 추가 중 최종 오류:', err.message);
      // 이미 setError가 try 블록 내에서 호출되었을 수 있으므로, 여기서는 최종 에러만 반환
      return { success: false, error: err.message || '구독 추가에 실패했습니다.' };
    } finally {
      setLoading(false);
    }
  }, [userId, setSubscriptions, setError, setLoading]); // 의존성 배열 업데이트

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
    setError // 외부에서 에러 상태를 직접 제어할 필요가 있다면 추가
  };
};

export default useSubscriptions; 
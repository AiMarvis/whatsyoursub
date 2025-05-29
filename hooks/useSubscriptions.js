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
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 30초 타임아웃 설정
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      // Supabase에서 구독 정보 가져오기 (실제 쿼리는 DB 구조에 맞게 수정 필요)
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      clearTimeout(timeoutId);

      if (error) throw error;

      setSubscriptions(data || []);
    } catch (err) {
      console.error('구독 정보 로딩 중 오류:', err);
      setError(err.message || '구독 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 구독 추가
  const addSubscription = useCallback(async (subscriptionData) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .insert([{ ...subscriptionData, user_id: userId }])
        .select();

      if (error) throw error;

      setSubscriptions(prev => [data[0], ...prev]);
      return { success: true, data: data[0] };
    } catch (err) {
      console.error('구독 추가 중 오류:', err);
      setError(err.message || '구독을 추가하는 중 오류가 발생했습니다.');
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // 구독 업데이트
  const updateSubscription = useCallback(async (id, updates) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('subscriptions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select();

      if (error) throw error;

      setSubscriptions(prev => 
        prev.map(sub => sub.id === id ? { ...sub, ...data[0] } : sub)
      );
      
      return { success: true, data: data[0] };
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
    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('subscriptions')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;

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

  return {
    subscriptions,
    loading,
    error,
    refresh: fetchSubscriptions,
    addSubscription,
    updateSubscription,
    deleteSubscription,
    totalMonthlyAmount: subscriptions.reduce((sum, sub) => sum + (sub.price || 0), 0),
    upcomingPayments: subscriptions.filter(sub => {
      // 다음 결제일이 7일 이내인 구독 필터링 (로직은 실제 데이터 구조에 맞게 수정 필요)
      if (!sub.next_payment_date) return false;
      const nextPayment = new Date(sub.next_payment_date);
      const now = new Date();
      const daysDiff = Math.floor((nextPayment - now) / (1000 * 60 * 60 * 24));
      return daysDiff >= 0 && daysDiff <= 7;
    })
  };
};

export default useSubscriptions; 
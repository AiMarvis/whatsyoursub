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
      const subscriptionsData = (data || []).map(item => ({
        ...item,
        price: item.price || 0,
        billing_cycle: item.billing_cycle || 'monthly',
        category: item.category || 'other',
        next_payment_date: item.next_payment_date || null,
        description: item.description || ''
      }));

      setSubscriptions(subscriptionsData);
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

    // 유효한 사용자 ID 형식인지 확인
    if (typeof userId !== 'string' || userId.trim() === '') {
      console.error('addSubscription: 유효하지 않은 userId 형식:', userId);
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
      console.log('[구독추가] 정규화된 데이터:', JSON.stringify(normalizedData, null, 2));

      // 사용자 존재 여부 확인 (외래 키 제약 조건 위반 방지)
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();
          
        if (userError || !userData) {
          console.warn('[구독추가] 사용자 확인 실패:', userError || '사용자 없음');
          throw new Error('사용자 확인에 실패했습니다. 로그인 상태를 확인해주세요.');
        }
      } catch (userCheckError) {
        console.error('[구독추가] 사용자 확인 중 오류:', userCheckError);
        throw new Error('사용자 확인 중 오류가 발생했습니다. 로그인 상태를 확인해주세요.');
      }

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
        
        // 외래 키 제약 조건 오류 처리
        if (insertError.code === '23503' || 
            insertError.message.includes('violates foreign key constraint') ||
            insertError.message.includes('key is not present in table')) {
          throw new Error('사용자 인증 문제가 발생했습니다. 로그아웃 후 다시 로그인해보세요.');
        }
        
        // RLS 정책 오류 발생 시
        if (insertError.code === '42501' || insertError.message.includes('permission denied')) {
          throw new Error('데이터베이스 접근 권한이 없습니다. 관리자에게 문의하세요.');
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
  }, [userId, fetchSubscriptions]);

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
      if (!userId) return;
      
      try {
        // 사용자 존재 여부 확인
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();
          
        if (error || !data) {
          console.warn('사용자 정보 확인 실패:', error);
          setError('사용자 인증에 문제가 있습니다. 로그아웃 후 다시 로그인해보세요.');
        }
      } catch (err) {
        console.error('사용자 인증 확인 오류:', err);
        setError('사용자 인증 상태를 확인하는 중 오류가 발생했습니다.');
      }
    };
    
    checkUserAuth();
  }, [fetchSubscriptions, userId]);

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
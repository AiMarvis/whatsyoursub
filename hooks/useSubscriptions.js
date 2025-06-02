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

      // 먼저 사용자 존재 여부 확인 (RLS 정책 오류 가능성 처리)
      try {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();
          
        if (userError) {
          // RLS 정책 오류인 경우에도 구독 목록 가져오기 시도
          if (userError.code === '42501' || (typeof userError.message === 'string' && userError.message.includes('permission denied'))) {
            console.warn('[구독목록] RLS 정책으로 인한 사용자 테이블 접근 제한, 계속 진행');
          } else {
            console.warn('[구독목록] 사용자 확인 오류:', userError);
          }
          
          // 모든 오류에도 불구하고 구독 목록을 로컬 스토리지에서 먼저 시도
          const localStorageKey = `subscriptions_${userId}`;
          try {
            const storedData = localStorage.getItem(localStorageKey);
            if (storedData) {
              const parsedData = JSON.parse(storedData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log('[구독목록] 로컬 스토리지에서 구독 데이터 복원:', parsedData.length);
                setSubscriptions(parsedData);
                setLoading(false);
                clearTimeout(timeoutId);
                return; // 로컬 데이터로 작업 완료
              }
            }
          } catch (localStorageError) {
            console.warn('[구독목록] 로컬 스토리지 접근 오류, 무시하고 계속:', localStorageError);
          }
        }
      } catch (userCheckError) {
        console.warn('[구독목록] 사용자 확인 중 오류 발생, 계속 진행:', userCheckError);
      }

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
        
        // RLS 정책 오류 발생 시 로컬 스토리지 데이터로 폴백
        if (fetchError.code === '42501' || (typeof fetchError.message === 'string' && fetchError.message.includes('permission denied'))) {
          console.warn('[구독목록] RLS 정책으로 접근 제한, 로컬 데이터 사용 시도');
          
          // 로컬 스토리지에서 데이터 가져오기 시도
          const localStorageKey = `subscriptions_${userId}`;
          try {
            const storedData = localStorage.getItem(localStorageKey);
            if (storedData) {
              const parsedData = JSON.parse(storedData);
              if (Array.isArray(parsedData) && parsedData.length > 0) {
                console.log('[구독목록] 로컬 스토리지에서 구독 데이터 복원:', parsedData.length);
                setSubscriptions(parsedData);
                setLoading(false);
                return; // 로컬 데이터로 작업 완료
              }
            }
          } catch (localStorageError) {
            console.warn('[구독목록] 로컬 스토리지 접근 오류:', localStorageError);
          }
          
          // 빈 배열 설정하고 오류 없이 계속 진행
          setSubscriptions([]);
          setLoading(false);
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
      try {
        const localStorageKey = `subscriptions_${userId}`;
        localStorage.setItem(localStorageKey, JSON.stringify(subscriptionsData));
        console.log('[구독목록] 구독 데이터 로컬 저장 완료:', subscriptionsData.length);
      } catch (localStorageError) {
        console.warn('[구독목록] 로컬 저장 실패, 무시하고 계속:', localStorageError);
      }

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

      // 데이터 삽입 시도
      const { data, error: insertError } = await supabase
        .from('subscriptions')
        .insert([normalizedData])
        .select('*');

      if (insertError) {
        console.error('[구독추가] Supabase 오류:', insertError);
        
        // 안전한 오류 출력을 위한 헬퍼 함수
        const safeLogError = (prefix, err) => {
          if (!err) {
            console.error(`${prefix}: 알 수 없는 오류 (객체 없음)`);
            return;
          }
          
          try {
            // 객체 직렬화 시도
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
            // 직렬화 실패 시 기본 정보만 출력
            console.error(`${prefix} (직렬화 실패):`, {
              code: err.code || 'unknown',
              message: err.message || 'No message',
              name: err.name || 'Unknown error'
            });
          }
        };
        
        // 안전하게 오류 로깅
        safeLogError('[구독추가] Supabase 오류 상세', insertError);
        
        // RLS 정책 오류 또는 외래 키 오류 발생 시 로컬 저장 시도
        if (insertError.code === '42501' || 
            (typeof insertError.message === 'string' && insertError.message.includes('permission denied')) ||
            insertError.code === '23503' || 
            (typeof insertError.message === 'string' && (
              insertError.message.includes('violates foreign key constraint') ||
              insertError.message.includes('key is not present in table')
            ))) {
          
          console.warn('[구독추가] 데이터베이스 권한 또는 제약 조건 오류, 로컬 저장 시도');
          
          // 고유 ID 생성
          const newId = crypto.randomUUID ? crypto.randomUUID() : `temp-${Date.now()}`;
          const newSubscription = {
            ...normalizedData,
            id: newId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          // 로컬 스토리지에 저장 시도
          try {
            const localStorageKey = `subscriptions_${userId}`;
            let existingData = [];
            
            const storedData = localStorage.getItem(localStorageKey);
            if (storedData) {
              existingData = JSON.parse(storedData);
              if (!Array.isArray(existingData)) {
                existingData = [];
              }
            }
            
            // 새 구독 추가
            existingData.unshift(newSubscription);
            
            // 로컬 스토리지에 저장
            localStorage.setItem(localStorageKey, JSON.stringify(existingData));
            
            console.log('[구독추가] 로컬 저장 성공:', newSubscription.id);
            
            // 메모리 상태 업데이트
            setSubscriptions(prev => [newSubscription, ...prev]);
            
            return { 
              success: true, 
              message: '구독이 로컬에 추가되었습니다. (일부 기능이 제한될 수 있습니다)', 
              data: newSubscription,
              isLocal: true
            };
          } catch (localStorageError) {
            console.error('[구독추가] 로컬 저장 실패:', localStorageError);
            
            // 실패해도 메모리에는 추가
            const newSubscription = {
              ...normalizedData,
              id: crypto.randomUUID ? crypto.randomUUID() : `temp-${Date.now()}`
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
        }
        
        // 기타 오류 처리
        if (insertError.code === '23505' || (typeof insertError.message === 'string' && insertError.message.includes('duplicate key'))) {
          setError('이미 존재하는 구독 정보와 중복됩니다.');
          return { success: false, error: '이미 존재하는 구독 정보와 중복됩니다.' };
        }
        
        setError(insertError.message || '데이터베이스 오류로 구독 추가에 실패했습니다.');
        return { success: false, error: insertError.message || '데이터베이스 오류로 구독 추가에 실패했습니다.' };
      }

      if (data && data.length > 0) {
        console.log('[구독추가] 성공, 반환 데이터:', data);
        
        // 로컬 스토리지에도 저장 (오프라인 지원)
        try {
          const localStorageKey = `subscriptions_${userId}`;
          let existingData = [];
          
          const storedData = localStorage.getItem(localStorageKey);
          if (storedData) {
            existingData = JSON.parse(storedData);
            if (!Array.isArray(existingData)) {
              existingData = [];
            }
          }
          
          // 새 구독 존재하는지 확인하고 추가 또는 업데이트
          const existingIndex = existingData.findIndex(item => item.id === data[0].id);
          if (existingIndex > -1) {
            existingData[existingIndex] = data[0];
          } else {
            existingData.unshift(data[0]);
          }
          
          // 로컬 스토리지에 저장
          localStorage.setItem(localStorageKey, JSON.stringify(existingData));
          
          console.log('[구독추가] 로컬 저장 성공 (백업)');
        } catch (localStorageError) {
          console.warn('[구독추가] 로컬 백업 저장 실패, 무시하고 계속:', localStorageError);
        }
        
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
        
        // 데이터가 반환되지 않는 경우에도 로컬 상태 업데이트 (중요 개선사항)
        const newSubscription = {
          ...normalizedData,
          id: crypto.randomUUID ? crypto.randomUUID() : `temp-${Date.now()}` // 임시 ID 생성
        };
        
        // 로컬 스토리지에 저장 시도
        try {
          const localStorageKey = `subscriptions_${userId}`;
          let existingData = [];
          
          const storedData = localStorage.getItem(localStorageKey);
          if (storedData) {
            existingData = JSON.parse(storedData);
            if (!Array.isArray(existingData)) {
              existingData = [];
            }
          }
          
          // 새 구독 추가
          existingData.unshift(newSubscription);
          
          // 로컬 스토리지에 저장
          localStorage.setItem(localStorageKey, JSON.stringify(existingData));
          
          console.log('[구독추가] SELECT 결과 없음, 로컬 저장 성공:', newSubscription.id);
        } catch (localStorageError) {
          console.warn('[구독추가] 로컬 저장 실패, 무시하고 계속:', localStorageError);
        }
        
        setSubscriptions(prevSubs => [newSubscription, ...prevSubs]);
        
        // 구독 목록 새로고침 호출 (백그라운드에서 실행)
        fetchSubscriptions();
        
        return { 
          success: true, 
          message: '구독이 추가되었습니다.',
          data: newSubscription, // 생성된 데이터 반환 (중요 개선사항)
          needsRefresh: true 
        };
      }
    } catch (err) {
      console.error('[구독추가] 최종 오류:', err.message);
      
      // 상세 에러 로깅 추가
      console.error('[구독추가] 오류 상세:', {
        name: err.name,
        message: err.message,
        code: err.code,
        stack: err.stack
      });
      
      // 명확한 오류 메시지 생성
      let errorMessage = err.message || '구독 추가에 실패했습니다.';
      
      if (err.code === 'NETWORK_ERROR' || err.message.includes('network') || err.message.includes('connection')) {
        errorMessage = '네트워크 연결을 확인하고 다시 시도해주세요.';
      } else if (err.message.includes('timeout')) {
        errorMessage = '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.';
      } else if (err.message.includes('auth') || err.message.includes('인증') || err.message.includes('권한')) {
        errorMessage = '인증 문제가 발생했습니다. 로그아웃 후 다시 로그인해보세요.';
      }
      
      setError(errorMessage);
      return { success: false, error: errorMessage };
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
        
        // 사용자 존재 여부 확인
        const { data, error } = await supabase
          .from('users')
          .select('id')
          .eq('id', userId)
          .single();
          
        if (error) {
          console.warn('[인증확인] 사용자 확인 오류:', error);
          
          // 사용자 테이블에 기본 정보 자동 삽입 시도
          if (error.code === 'PGRST116') { // 결과가 없는 경우
            try {
              console.log('[인증확인] 사용자 정보 자동 생성 시도');
              // 사용자 ID 유효성 추가 검증
              if (!userId || typeof userId !== 'string' || !userId.trim()) {
                console.error('[인증확인] 유효하지 않은 사용자 ID:', userId);
                throw new Error('유효하지 않은 사용자 ID');
              }
              
              // 세션에서 사용자 정보 가져오기
              const user = sessionData.session.user;
              
              const { error: insertError } = await supabase
                .from('users')
                .insert([{ 
                  id: userId, 
                  created_at: new Date().toISOString(),
                  email: user?.email || '',
                  name: user?.user_metadata?.full_name || ''
                }]);
                
                if (insertError) {
                  console.error('[인증확인] 사용자 자동 생성 실패:', insertError);
                  
                  // 안전한 오류 출력을 위한 헬퍼 함수
                  const safeLogError = (prefix, err) => {
                    if (!err) {
                      console.error(`${prefix}: 알 수 없는 오류 (객체 없음)`);
                      return;
                    }
                    
                    try {
                      // 객체 직렬화 시도
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
                      // 직렬화 실패 시 기본 정보만 출력
                      console.error(`${prefix} (직렬화 실패):`, {
                        code: err.code || 'unknown',
                        message: err.message || 'No message',
                        name: err.name || 'Unknown error'
                      });
                    }
                  };
                  
                  // 안전하게 오류 로깅
                  safeLogError('[인증확인] 사용자 자동 생성 실패', insertError);
                  
                  // RLS 정책 오류 구체적 처리
                  if (insertError && (insertError.code === '42501' || 
                      (typeof insertError.message === 'string' && insertError.message.includes('permission denied')))) {
                    console.warn('[인증확인] RLS 정책으로 인한 권한 오류, 계속 진행');
                    
                    // 중요: RLS 오류가 있어도 사용자 정보가 있는 것으로 처리하고 계속 진행
                    console.log('[인증확인] RLS 오류이지만 사용자 인증 성공으로 처리, 계속 진행');
                    
                    // 오류 메시지 제거하고 계속 진행 (이것이 핵심임)
                    setError(null);
                    return;
                  }
                  
                  // 기타 데이터베이스 오류 처리
                  if (insertError && insertError.code && typeof insertError.code === 'string' && insertError.code.startsWith('23')) {
                    console.warn('[인증확인] 데이터베이스 제약조건 오류:', insertError.code);
                    setError('사용자 정보 생성에 실패했습니다. 구독 기능이 제한될 수 있습니다.');
                  } else if (insertError) {
                    // 일반적인 오류이지만, 메시지 없이 클라이언트 기능 계속 사용 가능하도록 함
                    console.warn('[인증확인] DB 오류 발생, 오프라인 모드로 진행');
                    setError(null);
                  }
                } else {
                  console.log('[인증확인] 사용자 자동 생성 성공');
                  // 성공 시 오류 메시지 제거
                  setError(null);
                }
            } catch (createError) {
              console.error('[인증확인] 사용자 자동 생성 중 오류:', createError);
              // 상세 오류 로깅 추가
              console.error('[인증확인] 오류 상세:', {
                name: createError.name,
                message: createError.message,
                stack: createError.stack
              });
              setError('사용자 정보 생성 중 오류가 발생했습니다. 구독 기능이 제한될 수 있습니다.');
            }
          } else {
            setError('사용자 정보 확인 중 오류가 발생했습니다. 로그아웃 후 다시 로그인해보세요.');
          }
        } else if (!data) {
          console.warn('[인증확인] 사용자 데이터 없음');
          setError('사용자 정보를 찾을 수 없습니다. 로그아웃 후 다시 로그인해보세요.');
        } else {
          // 성공 시 오류 메시지 제거
          setError(null);
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
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase, checkSession, refreshSession, signOut } from '@/lib/supabase';

export const useSessionManager = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const router = useRouter();

  // 인증 초기화
  const initializeAuth = useCallback(async () => {
    try {
      setLoading(true);
      
      // 현재 세션 상태 확인
      const { session, isAuthenticated, error } = await checkSession();
      
      if (error) {
        console.error('세션 초기화 오류:', error);
        setSessionError(error);
        router.push(`/auth/login?error=session_error&message=${encodeURIComponent(error)}`);
        return;
      }
      
      if (!isAuthenticated) {
        console.log('인증되지 않은 사용자, 로그인 페이지로 리다이렉트');
        router.push('/auth/login');
        return;
      }
      
      setUser(session.user);
      setShowSuccessMessage(true);
      
      // 5초 후 성공 메시지 숨기기
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    } catch (err) {
      console.error('인증 초기화 오류:', err);
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 로그아웃 처리
  const handleSignOut = useCallback(async () => {
    try {
      setLoading(true);
      const { success, error } = await signOut();
      
      if (!success) {
        console.error('로그아웃 실패:', error);
        setSessionError(`로그아웃 실패: ${error}`);
        return;
      }
      
      // 로그아웃 성공
      setUser(null);
      router.push('/auth/login?success=true&message=성공적으로 로그아웃되었습니다.');
    } catch (error) {
      console.error('로그아웃 처리 오류:', error);
      setSessionError('로그아웃 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // 성공 메시지 토글
  const toggleSuccessMessage = useCallback((show = true) => {
    setShowSuccessMessage(show);
    
    if (show) {
      // 5초 후 자동으로 닫기
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
    }
  }, []);

  // 초기화 및 인증 상태 구독
  useEffect(() => {
    initializeAuth();
    
    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_OUT' || !session) {
          // 로그아웃 처리
          setUser(null);
          router.push('/auth/login');
        } else if (event === 'SIGNED_IN') {
          // 로그인 처리
          setUser(session.user);
          setLoading(false);
          toggleSuccessMessage(true);
        } else if (event === 'TOKEN_REFRESHED') {
          // 토큰 갱신 처리
          setUser(session.user);
          setLoading(false);
        } else if (event === 'USER_UPDATED') {
          // 사용자 정보 업데이트 처리
          setUser(session.user);
        }
      }
    );
    
    // 주기적 세션 확인 (5분마다)
    const sessionCheckInterval = setInterval(async () => {
      try {
        const { success, session, error } = await refreshSession();
        
        if (!success || error) {
          console.warn('세션 갱신 실패:', error);
          setSessionError('세션이 만료되었습니다. 다시 로그인해주세요.');
          
          // 에러 메시지 표시 후 5초 후 로그인 페이지로 리다이렉트
          setTimeout(() => {
            router.push('/auth/login?error=session_expired');
          }, 5000);
        } else if (session) {
          // 세션 갱신 성공
          setUser(session.user);
          setSessionError(null);
        }
      } catch (err) {
        console.error('세션 체크 오류:', err);
      }
    }, 300000); // 5분마다 체크
    
    // 컴포넌트 언마운트 시 정리
    return () => {
      subscription.unsubscribe();
      clearInterval(sessionCheckInterval);
    };
  }, [initializeAuth, router, toggleSuccessMessage]);

  return {
    user,
    loading,
    sessionError,
    showSuccessMessage,
    signOut: handleSignOut,
    setSessionError,
    toggleSuccessMessage
  };
};

export default useSessionManager; 
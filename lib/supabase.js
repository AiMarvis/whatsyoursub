import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// 브라우저용 클라이언트 - implicit flow 사용
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'implicit', // PKCE에서 implicit으로 변경
    storageKey: 'ai-subscription-auth'
  }
})

/**
 * 인증 에러 메시지를 사용자 친화적으로 변환
 */
const getReadableErrorMessage = (error) => {
  if (!error) return '알 수 없는 오류가 발생했습니다.'
  
  const errorMsg = error.message || error.error_description || String(error)
  
  // 일반적인 OAuth 에러 메시지
  if (errorMsg.includes('popup')) {
    return '팝업이 차단되었습니다. 팝업 차단을 해제하고 다시 시도해주세요.'
  } else if (errorMsg.includes('network')) {
    return '네트워크 연결을 확인하고 다시 시도해주세요.'
  } else if (errorMsg.includes('timeout')) {
    return '요청 시간이 초과되었습니다. 나중에 다시 시도해주세요.'
  } else if (errorMsg.includes('invalid') && errorMsg.includes('email')) {
    return '유효하지 않은 이메일 주소입니다.'
  } else if (errorMsg.includes('not found') || errorMsg.includes('not_found')) {
    return '계정을 찾을 수 없습니다. 다른 로그인 방법을 시도해주세요.'
  } else if (errorMsg.includes('unauthorized') || errorMsg.includes('invalid_grant')) {
    return '인증에 실패했습니다. 권한이 없거나 만료되었습니다.'
  }
  
  return `로그인 오류: ${errorMsg}`
}

/**
 * 현재 세션 상태 확인
 */
export const checkSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    
    if (error) {
      console.error('세션 확인 오류:', error)
      throw error
    }
    
    return { 
      session: data.session,
      isAuthenticated: !!data.session
    }
  } catch (error) {
    console.error('세션 확인 중 오류 발생:', error)
    return { 
      session: null, 
      isAuthenticated: false,
      error: getReadableErrorMessage(error)
    }
  }
}

/**
 * Google OAuth 로그인
 */
export const signInWithGoogle = async () => {
  try {
    // 30초 타임아웃 설정
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('로그인 요청 시간이 초과되었습니다.')), 30000)
    )
    
    const authPromise = supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`, // 콜백 페이지로 리다이렉트
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });
    
    // Race between timeout and auth request
    const { data, error } = await Promise.race([authPromise, timeoutPromise])

    if (error) {
      console.error('Google 로그인 오류:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Google OAuth error:', error)
    // 사용자 친화적 에러 메시지 변환
    const friendlyError = new Error(getReadableErrorMessage(error))
    friendlyError.originalError = error
    throw friendlyError
  }
}

/**
 * Kakao OAuth 로그인
 */
export const signInWithKakao = async () => {
  try {
    // 30초 타임아웃 설정
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('로그인 요청 시간이 초과되었습니다.')), 30000)
    )
    
    const authPromise = supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback` // 콜백 페이지로 리다이렉트
      }
    });
    
    // Race between timeout and auth request
    const { data, error } = await Promise.race([authPromise, timeoutPromise])

    if (error) {
      console.error('카카오 로그인 오류:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Kakao OAuth error:', error)
    // 사용자 친화적 에러 메시지 변환
    const friendlyError = new Error(getReadableErrorMessage(error))
    friendlyError.originalError = error
    throw friendlyError
  }
}

/**
 * 로그아웃
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('로그아웃 오류:', error)
      throw error
    }
    
    // 로그아웃 후 로컬 스토리지 정리
    window.localStorage.removeItem('ai-subscription-auth')
    
    return { success: true }
  } catch (error) {
    console.error('로그아웃 실패:', error)
    return { 
      success: false, 
      error: getReadableErrorMessage(error)
    }
  }
}

/**
 * 세션 리프레시
 */
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession()
    
    if (error) {
      console.error('세션 리프레시 오류:', error)
      throw error
    }
    
    return { 
      success: true, 
      session: data.session
    }
  } catch (error) {
    console.error('세션 리프레시 실패:', error)
    return { 
      success: false, 
      error: getReadableErrorMessage(error)
    }
  }
} 
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

// OAuth 로그인 함수들
export const signInWithGoogle = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`, // 직접 대시보드로 리다이렉트
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    });

    if (error) {
      console.error('Google 로그인 오류:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }
};

export const signInWithKakao = async () => {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/dashboard` // 직접 대시보드로 리다이렉트
      }
    });

    if (error) {
      console.error('카카오 로그인 오류:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Kakao OAuth error:', error);
    throw error;
  }
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('로그아웃 오류:', error);
    throw error;
  }
}; 
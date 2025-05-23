'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Mail, MessageCircle, Loader2 } from 'lucide-react'
import { signInWithGoogle, signInWithKakao } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingProvider, setLoadingProvider] = useState(null)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {    const errorParam = searchParams.get('error');    const messageParam = searchParams.get('message');        if (errorParam === 'callback_error') {      const errorMessage = messageParam         ? `로그인 오류: ${decodeURIComponent(messageParam)}`        : '로그인 중 오류가 발생했습니다. 다시 시도해주세요.';      setError(errorMessage);    }  }, [searchParams]);

  const handleSocialLogin = async (provider) => {
    setIsLoading(true)
    setLoadingProvider(provider)
    
    try {
      if (provider === 'google') {
        await signInWithGoogle()
      } else if (provider === 'kakao') {
        await signInWithKakao()
      }
      
      // 성공 시 대시보드로 리다이렉트
      // router.push('/dashboard')
      
    } catch (error) {
      console.error('로그인 실패:', error)
      setError(error.message)
      // 에러 처리
    } finally {
      setIsLoading(false)
      setLoadingProvider(null)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              AI 구독 관리
            </h1>
          </Link>
          <p className="text-gray-600">
            AI 서비스 구독을 효율적으로 관리하세요
          </p>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title justify-center text-2xl mb-6">로그인</h2>
            
            {error && (
              <div className="alert alert-error mb-4">
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* 구글 로그인 */}
              <button
                onClick={() => handleSocialLogin('google')}
                disabled={isLoading}
                className="btn btn-outline w-full relative"
              >
                {loadingProvider === 'google' ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                      <path
                        fill="currentColor"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="currentColor"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="currentColor"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    <span className="ml-2">
                      {loadingProvider === 'google' ? '로그인 중...' : 'Google 계정으로 계속하기'}
                    </span>
                  </>
                )}
              </button>

              {/* 카카오 로그인 */}
              <button
                onClick={() => handleSocialLogin('kakao')}
                disabled={isLoading}
                className="btn w-full relative"
                style={{ backgroundColor: '#FEE500', borderColor: '#FEE500', color: '#000' }}
              >
                {loadingProvider === 'kakao' ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 3c5.799 0 10.5 3.664 10.5 8.185 0 4.52-4.701 8.184-10.5 8.184a13.5 13.5 0 0 1-1.727-.11l-4.408 2.883c-.501.265-.678.236-.472-.413l.892-3.678c-2.88-1.46-4.785-3.99-4.785-6.866C1.5 6.665 6.201 3 12 3z"/>
                    </svg>
                    <span className="ml-2">
                      {loadingProvider === 'kakao' ? '로그인 중...' : '카카오 계정으로 계속하기'}
                    </span>
                  </>
                )}
              </button>
            </div>

            <div className="divider">또는</div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                아직 계정이 없으신가요?
              </p>
              <p className="text-sm text-gray-500 mt-2">
                위의 소셜 로그인을 통해 간편하게 가입하실 수 있습니다
              </p>
            </div>
          </div>
        </div>

        {/* 이용약관 및 개인정보처리방침 */}
        <div className="text-center text-xs text-gray-500 space-y-1">
          <p>로그인 시 다음 약관에 동의한 것으로 간주됩니다</p>
          <div className="space-x-4">
            <Link href="/terms" className="underline hover:text-gray-700">
              이용약관
            </Link>
            <Link href="/privacy" className="underline hover:text-gray-700">
              개인정보처리방침
            </Link>
          </div>
        </div>

        {/* 기능 미리보기 */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 text-center">
            🚀 이런 기능들을 이용할 수 있어요
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>AI 서비스 구독 현황 대시보드</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>월별/연간 구독 비용 자동 계산</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>최신 AI 툴 정보 및 리뷰</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span>AI 관련 블로그 및 팁</span>
            </div>
          </div>
        </div>

        {/* 데모 계정 안내 */}
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-2">
            로그인하지 않고 둘러보기
          </p>
          <Link href="/" className="btn btn-ghost btn-sm">
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </div>
  )
} 
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, CreditCard, BarChart3, TrendingUp } from 'lucide-react'
import { supabase, signOut } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // URL에서 세션 처리 (OAuth 콜백)
    const handleAuthCallback = async () => {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('세션 오류:', error)
        router.push(`/auth/login?error=session_error&message=${encodeURIComponent(error.message)}`)
        return
      }

      if (data.session) {
        setUser(data.session.user)
        setLoading(false)
      } else {
        // 현재 사용자 확인
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.log('No user found, redirecting to login')
          router.push('/auth/login')
          return
        }
        
        setUser(user)
        setLoading(false)
      }
    }

    handleAuthCallback()

    // 인증 상태 변화 감지
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session)
        
        if (event === 'SIGNED_OUT' || !session) {
          router.push('/auth/login')
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [router])

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/auth/login')
    } catch (error) {
      console.error('로그아웃 실패:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-4">로그인 중...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">AI 구독 관리</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div className="avatar">
                  <div className="w-8 h-8 rounded-full">
                    <img 
                      src={user.user_metadata?.avatar_url || '/default-avatar.png'} 
                      alt="Profile"
                      onError={(e) => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.email)}&background=6366f1&color=fff`
                      }}
                    />
                  </div>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.user_metadata?.full_name || user.email}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="btn btn-ghost btn-sm"
                title="로그아웃"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 메인 콘텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 환영 메시지 */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            안녕하세요, {user.user_metadata?.full_name || '사용자'}님! 👋
          </h2>
          <p className="text-gray-600">
            AI 구독 서비스를 효율적으로 관리해보세요.
          </p>
        </div>

        {/* 성공 메시지 */}
        <div className="alert alert-success mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>로그인에 성공했습니다! 🎉</span>
        </div>

        {/* 통계 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-primary">
                <CreditCard size={32} />
              </div>
              <div className="stat-title">활성 구독</div>
              <div className="stat-value text-primary">0</div>
              <div className="stat-desc">구독 중인 서비스</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-secondary">
                <BarChart3 size={32} />
              </div>
              <div className="stat-title">월 비용</div>
              <div className="stat-value text-secondary">₩0</div>
              <div className="stat-desc">이번 달 지출</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-accent">
                <TrendingUp size={32} />
              </div>
              <div className="stat-title">연 비용</div>
              <div className="stat-value text-accent">₩0</div>
              <div className="stat-desc">연간 예상 지출</div>
            </div>
          </div>

          <div className="stats shadow">
            <div className="stat">
              <div className="stat-figure text-info">
                <Settings size={32} />
              </div>
              <div className="stat-title">도구 수</div>
              <div className="stat-value text-info">0</div>
              <div className="stat-desc">등록된 AI 도구</div>
            </div>
          </div>
        </div>

        {/* 기능 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">
                <CreditCard className="text-primary" />
                구독 관리
              </h3>
              <p>AI 서비스 구독을 추가하고 관리하세요.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-primary btn-sm">구독 추가</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">
                <BarChart3 className="text-secondary" />
                비용 분석
              </h3>
              <p>월별, 연별 구독 비용을 분석해보세요.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-secondary btn-sm">분석 보기</button>
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title">
                <Settings className="text-accent" />
                AI 도구 탐색
              </h3>
              <p>새로운 AI 도구를 발견하고 리뷰를 확인하세요.</p>
              <div className="card-actions justify-end">
                <button className="btn btn-accent btn-sm">도구 탐색</button>
              </div>
            </div>
          </div>
        </div>

        {/* 시작하기 가이드 */}
        <div className="mt-12">
          <div className="card bg-gradient-to-r from-blue-50 to-purple-50 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-2xl mb-4">🚀 시작하기</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">1단계: 구독 추가</h4>
                  <p className="text-gray-600">
                    현재 사용 중인 AI 서비스들을 등록해보세요. 
                    ChatGPT, Midjourney, Claude 등 다양한 서비스를 지원합니다.
                  </p>
                </div>
                <div className="space-y-4">
                  <h4 className="font-semibold text-lg">2단계: 비용 추적</h4>
                  <p className="text-gray-600">
                    월별, 연별 구독 비용을 자동으로 계산하고 
                    시각적으로 확인할 수 있습니다.
                  </p>
                </div>
              </div>
              <div className="card-actions justify-center mt-6">
                <button className="btn btn-primary">첫 구독 추가하기</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 
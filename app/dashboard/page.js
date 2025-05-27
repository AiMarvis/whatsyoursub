'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Settings, CreditCard, BarChart3, TrendingUp, Plus, ArrowRight, Sparkles, Calendar, DollarSign, Package, CheckCircle, Bell, FileText, Info, HelpCircle, Search, Filter, Eye } from 'lucide-react'
import { supabase, signOut } from '@/lib/supabase'

export default function DashboardPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-primary/5 to-secondary/5">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full border-t-4 border-primary animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Sparkles className="w-10 h-10 text-primary animate-pulse" />
          </div>
        </div>
        <span className="text-lg bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary font-medium">데이터를 불러오는 중...</span>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-base-100">
      {/* 메인 콘텐츠 */}
      <main className="container mx-auto px-4 py-8">
        {/* 환영 메시지 */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105 cursor-pointer">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">
                안녕하세요, {user.user_metadata?.full_name || '사용자'}님! 👋
              </h2>
              <p className="text-base-content/70">
                오늘도 스마트한 AI 구독 관리를 시작해보세요.
              </p>
            </div>
            
            {/* 알림 아이콘 */}
            <div className="ml-auto flex items-center gap-4">
              <button className="btn btn-circle btn-ghost btn-sm relative group">
                <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                <span className="sr-only">알림</span>
              </button>
              <button className="btn btn-circle btn-ghost btn-sm group" onClick={handleSignOut}>
                <LogOut className="w-5 h-5 group-hover:text-error transition-colors" />
                <span className="sr-only">로그아웃</span>
              </button>
            </div>
          </div>
          
          {/* 성공 메시지 - Glassmorphism 적용 */}
          <div className="alert bg-success/10 backdrop-blur-sm border border-success/20 shadow-lg text-success rounded-xl">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6" />
              <div>
                <span className="font-medium">로그인에 성공했습니다!</span>
                <p className="text-sm opacity-80">이제 모든 기능을 사용할 수 있습니다.</p>
              </div>
            </div>
            <button className="btn btn-sm btn-ghost btn-circle ml-auto">
              <span className="sr-only">닫기</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-8">
          <div className="flex overflow-x-auto gap-2 pb-2">
            <button 
              onClick={() => setActiveTab('overview')} 
              className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-ghost'} rounded-full transition-all duration-300`}
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              개요
            </button>
            <button 
              onClick={() => setActiveTab('subscriptions')} 
              className={`btn ${activeTab === 'subscriptions' ? 'btn-primary' : 'btn-ghost'} rounded-full transition-all duration-300`}
            >
              <CreditCard className="w-4 h-4 mr-2" />
              구독 관리
            </button>
            <button 
              onClick={() => setActiveTab('tools')} 
              className={`btn ${activeTab === 'tools' ? 'btn-primary' : 'btn-ghost'} rounded-full transition-all duration-300`}
            >
              <Package className="w-4 h-4 mr-2" />
              AI 툴
            </button>
            <button 
              onClick={() => setActiveTab('reports')} 
              className={`btn ${activeTab === 'reports' ? 'btn-primary' : 'btn-ghost'} rounded-full transition-all duration-300`}
            >
              <FileText className="w-4 h-4 mr-2" />
              리포트
            </button>
            <button 
              onClick={() => setActiveTab('settings')} 
              className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'btn-ghost'} rounded-full transition-all duration-300`}
            >
              <Settings className="w-4 h-4 mr-2" />
              설정
            </button>
          </div>
        </div>

        {/* 통계 카드 - Glassmorphism 스타일 적용 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="card bg-gradient-to-br from-primary/10 to-primary/5 backdrop-blur-sm border border-primary/20 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 mb-1">활성 구독</p>
                  <p className="text-3xl font-bold text-primary">0</p>
                  <p className="text-xs text-base-content/50 mt-1">구독 중인 서비스</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-all">
                  <CreditCard className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-secondary/10 to-secondary/5 backdrop-blur-sm border border-secondary/20 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 mb-1">월 비용</p>
                  <p className="text-3xl font-bold text-secondary">₩0</p>
                  <p className="text-xs text-base-content/50 mt-1">이번 달 지출</p>
                </div>
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-secondary" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-accent/10 to-accent/5 backdrop-blur-sm border border-accent/20 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 mb-1">연 비용</p>
                  <p className="text-3xl font-bold text-accent">₩0</p>
                  <p className="text-xs text-base-content/50 mt-1">연간 예상 지출</p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-accent" />
                </div>
              </div>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-info/10 to-info/5 backdrop-blur-sm border border-info/20 hover:shadow-lg transition-all hover:-translate-y-1 duration-300">
            <div className="card-body">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-base-content/60 mb-1">다음 결제일</p>
                  <p className="text-3xl font-bold text-info">--</p>
                  <p className="text-xs text-base-content/50 mt-1">가장 가까운 결제</p>
                </div>
                <div className="w-12 h-12 bg-info/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-info" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 차트 및 데이터 시각화 섹션 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* 데이터 시각화 - 월별 지출 */}
          <div className="lg:col-span-2 card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body">
              <div className="flex items-center justify-between mb-4">
                <h3 className="card-title">월별 구독 지출</h3>
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-ghost btn-sm btn-circle">
                    <Filter className="w-4 h-4" />
                  </label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52 border border-base-200">
                    <li><a>최근 3개월</a></li>
                    <li><a>최근 6개월</a></li>
                    <li><a>최근 1년</a></li>
                    <li><a>모든 기간</a></li>
                  </ul>
                </div>
              </div>
              <div className="h-64 flex items-center justify-center bg-base-200/50 rounded-lg">
                <div className="text-center">
                  <Info className="w-10 h-10 mx-auto mb-4 text-base-content/40" />
                  <p className="text-base-content/60">구독을 추가하면 데이터 시각화가 표시됩니다.</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* 카테고리별 구독 */}
          <div className="card bg-base-100 shadow-lg border border-base-200">
            <div className="card-body">
              <h3 className="card-title mb-4">카테고리별 구독</h3>
              <div className="h-48 flex items-center justify-center bg-base-200/50 rounded-lg mb-4">
                <div className="text-center">
                  <BarChart3 className="w-10 h-10 mx-auto mb-4 text-base-content/40" />
                  <p className="text-base-content/60">카테고리 데이터 없음</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-base-200/30 p-2 rounded-lg text-center">
                  <p className="text-xs text-base-content/60">생성형 AI</p>
                  <p className="font-bold">₩0</p>
                </div>
                <div className="bg-base-200/30 p-2 rounded-lg text-center">
                  <p className="text-xs text-base-content/60">비디오 AI</p>
                  <p className="font-bold">₩0</p>
                </div>
                <div className="bg-base-200/30 p-2 rounded-lg text-center">
                  <p className="text-xs text-base-content/60">이미지 AI</p>
                  <p className="font-bold">₩0</p>
                </div>
                <div className="bg-base-200/30 p-2 rounded-lg text-center">
                  <p className="text-xs text-base-content/60">코딩 AI</p>
                  <p className="font-bold">₩0</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 작업 섹션 - 카드 디자인 개선 */}
        <h3 className="text-xl font-bold mb-4">빠른 작업</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* 구독 추가 카드 */}
          <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-base-300 hover:shadow-xl transition-all hover:-translate-y-2 duration-300 group">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-primary to-secondary rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                <span className="badge badge-primary badge-outline">추천</span>
              </div>
              <h3 className="card-title text-xl mb-2">구독 추가하기</h3>
              <p className="text-base-content/70 mb-4">
                사용 중인 AI 서비스를 등록하고 비용을 추적하세요. ChatGPT, Claude, Midjourney 등 모든 서비스를 지원합니다.
              </p>
              <div className="card-actions">
                <button className="btn btn-primary btn-sm gap-2 w-full group">
                  <span className="flex items-center gap-2">
                    구독 추가 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* 비용 분석 카드 */}
          <div className="card bg-gradient-to-br from-secondary/5 to-accent/5 border border-base-300 hover:shadow-xl transition-all hover:-translate-y-2 duration-300 group">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-secondary to-accent rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="card-title text-xl mb-2">비용 분석</h3>
              <p className="text-base-content/70 mb-4">
                월별, 카테고리별 지출을 분석하고 비용 절감 기회를 찾아보세요. 시각적 차트로 한눈에 파악할 수 있습니다.
              </p>
              <div className="card-actions">
                <button className="btn btn-secondary btn-sm gap-2 w-full group">
                  <span className="flex items-center gap-2">
                    분석 보기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* AI 툴 탐색 카드 */}
          <div className="card bg-gradient-to-br from-accent/5 to-info/5 border border-base-300 hover:shadow-xl transition-all hover:-translate-y-2 duration-300 group">
            <div className="card-body">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 bg-gradient-to-r from-accent to-info rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Package className="w-7 h-7 text-white" />
                </div>
              </div>
              <h3 className="card-title text-xl mb-2">AI 툴 탐색</h3>
              <p className="text-base-content/70 mb-4">
                새로운 AI 도구를 발견하고, 실제 사용자 리뷰를 확인하세요. 카테고리별로 정리된 툴을 쉽게 찾을 수 있습니다.
              </p>
              <div className="card-actions">
                <button className="btn btn-accent btn-sm gap-2 w-full group">
                  <span className="flex items-center gap-2">
                    툴 둘러보기 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 시작하기 가이드 - Glassmorphism과 3D 효과 적용 */}
        <div className="card bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 backdrop-blur-sm shadow-xl relative overflow-hidden">
          {/* 배경 장식 요소 */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-primary/10 rounded-full blur-2xl"></div>
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-secondary/10 rounded-full blur-2xl"></div>
          
          <div className="card-body p-8 md:p-10 relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-md hover:shadow-lg hover:scale-105 transition-all">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold">빠른 시작 가이드</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white/70 dark:bg-base-100/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 border border-white/20 dark:border-base-300/20">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h4 className="font-bold mb-2">구독 등록하기</h4>
                <p className="text-sm text-base-content/70">
                  사용 중인 AI 서비스를 추가하고 결제 주기와 금액을 설정하세요.
                </p>
              </div>
              
              <div className="bg-white/70 dark:bg-base-100/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 border border-white/20 dark:border-base-300/20">
                <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-secondary">2</span>
                </div>
                <h4 className="font-bold mb-2">알림 설정하기</h4>
                <p className="text-sm text-base-content/70">
                  결제일 알림을 설정하여 구독 갱신 전에 미리 알림을 받으세요.
                </p>
              </div>
              
              <div className="bg-white/70 dark:bg-base-100/70 backdrop-blur-sm rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 duration-300 border border-white/20 dark:border-base-300/20">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-xl font-bold text-accent">3</span>
                </div>
                <h4 className="font-bold mb-2">리포트 확인하기</h4>
                <p className="text-sm text-base-content/70">
                  매월 분석 리포트를 통해 지출 패턴을 파악하고 최적화하세요.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button className="btn btn-ghost btn-sm gap-2">
                <HelpCircle className="w-4 h-4" />
                <span>도움말 센터</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* 접근성 도구 */}
        <button 
          aria-label="접근성 설정"
          className="fixed bottom-6 right-6 p-3 bg-base-100 rounded-full shadow-lg z-50 hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <Eye className="w-6 h-6 text-primary" />
        </button>
      </main>
    </div>
  );
} 
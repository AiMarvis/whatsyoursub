import Link from "next/link";
import { CreditCard, Wrench, BookOpen, TrendingUp, Users, Shield, Check, ArrowRight, Sparkles, Zap, BarChart3, Clock, MousePointer, ChevronDown } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-base-100">
      {/* Hero Section with Animated Gradient and 3D Elements */}
      <section className="relative min-h-[70vh] flex items-center justify-center overflow-hidden">
        {/* Animated gradient background with improved animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 animate-gradient-x"></div>
        <div className="absolute inset-0 bg-base-100/50 backdrop-blur-sm"></div>
        
        {/* 3D floating elements - modern UI trend */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[20%] left-[15%] w-16 h-16 bg-primary/20 rounded-2xl rotate-12 animate-float"></div>
          <div className="absolute top-[60%] right-[10%] w-24 h-24 bg-secondary/20 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-[15%] left-[20%] w-20 h-20 bg-accent/20 rounded-lg -rotate-12 animate-float" style={{animationDelay: '2s'}}></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-4 py-20">
          <div className="text-center max-w-5xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary rounded-full px-4 py-2 mb-6 backdrop-blur-sm hover:bg-primary/20 transition-all duration-300">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI 시대의 스마트한 구독 관리</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black mb-8 bg-gradient-to-br from-indigo-800 via-purple-700 to-indigo-600 bg-clip-text text-transparent animate-pulse-scale">
              모든 AI 구독을<br />한 곳에서 관리하세요
            </h1>
            
            <p className="text-xl md:text-2xl text-base-content/70 mb-10 max-w-3xl mx-auto">
              흩어져 있는 AI 서비스 구독을 효율적으로 관리하고,<br />
              새로운 AI 툴을 발견하여 생산성을 극대화하세요.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/dashboard" className="btn btn-primary btn-lg gap-2 transition-all hover:shadow-lg">
                대시보드
              </Link>
              <Link href="/tools" className="btn btn-secondary btn-lg gap-2 transition-all hover:shadow-lg">
                AI tool
              </Link>
              <Link href="/blog" className="btn btn-accent btn-lg gap-2 transition-all hover:shadow-lg">
                블로그
              </Link>
            </div>
            
            {/* Trust indicators removed */}
            
            {/* Scroll indicator - improved UX */}
            <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex flex-col items-center text-base-content/50 animate-pulse">
              <span className="text-base md:text-lg font-medium mb-2">스크롤하여 더 알아보기</span>
              <ChevronDown className="w-6 h-6 animate-bounce" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section with 3D Cards */}
      <section className="py-20 bg-base-200/50" id="features">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              강력한 기능으로 <span className="text-primary">스마트하게</span> 관리
            </h2>
            <p className="text-xl text-base-content/70 max-w-2xl mx-auto">
              복잡한 구독 관리는 이제 그만. 직관적인 대시보드로 한눈에 파악하세요.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature Card 1 - Modernized with 3D effect */}
            <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 group">
              <div className="card-body">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-all duration-300">
                  <CreditCard className="w-7 h-7 text-primary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="card-title text-2xl mb-3">구독 현황 대시보드</h3>
                <p className="text-base-content/70 mb-4">
                  모든 AI 서비스 구독을 한 곳에서 관리하고, 월별/연간 비용을 실시간으로 추적하세요.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>자동 비용 계산</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>결제일 알림</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>시각화 차트</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Feature Card 2 */}
            <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 group">
              <div className="card-body">
                <div className="w-14 h-14 bg-secondary/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-all duration-300">
                  <Wrench className="w-7 h-7 text-secondary group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="card-title text-2xl mb-3">AI 툴 큐레이션</h3>
                <p className="text-base-content/70 mb-4">
                  검증된 최신 AI 툴 정보와 상세 리뷰를 확인하고, 나에게 맞는 툴을 발견하세요.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>카테고리별 분류</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>가격 정보 제공</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>실사용 리뷰</span>
                  </li>
                </ul>
              </div>
            </div>
            
            {/* Feature Card 3 */}
            <div className="card bg-base-100 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:rotate-1 group">
              <div className="card-body">
                <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-all duration-300">
                  <BookOpen className="w-7 h-7 text-accent group-hover:scale-110 transition-transform duration-300" />
                </div>
                <h3 className="card-title text-2xl mb-3">AI 인사이트 블로그</h3>
                <p className="text-base-content/70 mb-4">
                  AI 활용 팁, 최신 트렌드, 그리고 실무 노하우를 전문가의 관점에서 공유합니다.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>실무 활용 가이드</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>트렌드 분석</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-success" />
                    <span>전문가 인터뷰</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section with Modern Design and Glassmorphism */}
      <section className="py-20 bg-gradient-to-r from-primary/5 to-secondary/5 relative">
        <div className="absolute inset-0 bg-base-100/30 backdrop-blur-[2px]"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              숫자로 보는 <span className="text-primary">임팩트</span>
            </h2>
            <p className="text-xl text-base-content/70">
              이미 많은 사용자들이 스마트한 AI 구독 관리를 경험하고 있습니다.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-10 h-10 text-primary" />
              </div>
              <div className="text-4xl font-bold mb-2">30%</div>
              <div className="text-base-content/70">평균 비용 절감</div>
            </div>
            
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-secondary" />
              </div>
              <div className="text-4xl font-bold mb-2">1,000+</div>
              <div className="text-base-content/70">활성 사용자</div>
            </div>
            
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-10 h-10 text-accent" />
              </div>
              <div className="text-4xl font-bold mb-2">50+</div>
              <div className="text-base-content/70">AI 툴 리뷰</div>
            </div>
            
            <div className="text-center backdrop-blur-sm bg-white/10 rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:-translate-y-1">
              <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-10 h-10 text-success" />
              </div>
              <div className="text-4xl font-bold mb-2">5분</div>
              <div className="text-base-content/70">설정 시간</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section with Modern Gradient and Microinteractions */}
      <section className="py-20 bg-gradient-to-br from-primary/80 via-secondary/80 to-accent/80 relative overflow-hidden" id="pricing">
        {/* Animated background shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[10%] -left-[5%] w-[40%] h-[40%] bg-white/15 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-indigo-300/20 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="flex justify-center mb-6 group">
              <Zap className="w-16 h-16 text-white group-hover:scale-110 transition-transform duration-300" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white drop-shadow-md">
              지금 시작하고 AI 구독을<br />효율적으로 관리하세요
            </h2>
            <p className="text-xl mb-10 text-white text-opacity-95 font-light">
              복잡한 설정 없이 5분 만에 시작할 수 있습니다.<br />
              지금 가입하고 더 나은 AI 활용을 경험해보세요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/login" className="btn btn-lg shadow-lg hover:shadow-xl transition-all gap-2 bg-white text-indigo-700 hover:bg-white group">
                <span className="flex items-center gap-2">
                  무료로 시작하기 <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/tools" className="btn btn-outline btn-lg border-2 border-white text-white hover:bg-white/10 transition-all duration-300">
                더 알아보기
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility button - modern UX trend */}
      <button 
        aria-label="접근성 설정"
        className="fixed bottom-6 right-6 p-3 bg-base-100 rounded-full shadow-lg z-50 hover:bg-primary/10 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <Shield className="w-6 h-6 text-primary" />
      </button>
    </div>
  );
}

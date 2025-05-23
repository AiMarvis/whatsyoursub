import Link from "next/link";
import { CreditCard, Wrench, BookOpen, TrendingUp, Users, Shield } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="hero bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">AI 구독 관리</h1>
            <p className="py-6">
              여러 AI 서비스 구독을 효율적으로 관리하고, 새로운 AI 툴을 발견하세요. 
              똑똑한 AI 활용으로 더 나은 생산성을 경험해보세요.
            </p>
            <Link href="/auth/login" className="btn btn-primary btn-lg">
              시작하기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-base-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">주요 기능</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <CreditCard className="w-12 h-12 text-primary mb-4" />
                <h3 className="card-title">구독 현황 관리</h3>
                <p>모든 AI 서비스 구독을 한 곳에서 관리하고 비용을 추적하세요.</p>
              </div>
            </div>
            
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <Wrench className="w-12 h-12 text-primary mb-4" />
                <h3 className="card-title">AI 툴 발견</h3>
                <p>최신 AI 툴 정보와 리뷰를 확인하고 나에게 맞는 툴을 찾아보세요.</p>
              </div>
            </div>
            
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body items-center text-center">
                <BookOpen className="w-12 h-12 text-primary mb-4" />
                <h3 className="card-title">AI 블로그</h3>
                <p>AI 활용 팁과 최신 트렌드를 블로그에서 확인하세요.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">왜 AI 구독 관리를 선택해야 할까요?</h2>
          <div className="stats shadow w-full">
            <div className="stat">
              <div className="stat-figure text-primary">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div className="stat-title">비용 절약</div>
              <div className="stat-value">평균 30%</div>
              <div className="stat-desc">불필요한 구독 관리로</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-secondary">
                <Users className="w-8 h-8" />
              </div>
              <div className="stat-title">사용자</div>
              <div className="stat-value">1,000+</div>
              <div className="stat-desc">이미 사용 중</div>
            </div>
            
            <div className="stat">
              <div className="stat-figure text-accent">
                <Shield className="w-8 h-8" />
              </div>
              <div className="stat-title">보안</div>
              <div className="stat-value">100%</div>
              <div className="stat-desc">안전한 데이터 관리</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-primary-content">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">지금 바로 시작하세요!</h2>
          <p className="text-xl mb-8">AI 구독을 효율적으로 관리하고 새로운 가능성을 발견하세요.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/login" className="btn btn-secondary btn-lg">
              무료로 시작하기
            </Link>
            <Link href="/tools" className="btn btn-outline btn-lg">
              AI 툴 둘러보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

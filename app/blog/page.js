'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Calendar, User, Tag, Clock, Eye } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'

export default function BlogPage() {
  const [selectedTag, setSelectedTag] = useState('all')

  // 임시 블로그 데이터
  const [posts] = useState([
    {
      id: 1,
      title: 'ChatGPT 활용법: 업무 효율성을 높이는 10가지 팁',
      excerpt: 'ChatGPT를 업무에 효과적으로 활용하는 실용적인 방법들을 소개합니다. 이메일 작성부터 코드 리뷰까지, 다양한 시나리오에서의 활용법을 알아보세요.',
      content: 'ChatGPT를 업무에 효과적으로 활용하는 방법...',
      author: 'AI 전문가',
      publishedAt: new Date('2024-05-20'),
      tags: ['ChatGPT', 'AI Chat', '업무효율'],
      readTime: '5분 읽기',
      views: 1250,
      thumbnail: '/api/placeholder/400/240',
      featured: true
    },
    {
      id: 2,
      title: 'Midjourney vs DALL-E: AI 이미지 생성 툴 비교',
      excerpt: '두 대표적인 AI 이미지 생성 서비스의 장단점을 비교해보고, 용도에 따른 선택 가이드를 제공합니다.',
      content: 'AI 이미지 생성 서비스 비교...',
      author: 'AI 디자이너',
      publishedAt: new Date('2024-05-18'),
      tags: ['Midjourney', 'DALL-E', 'AI Art', '비교'],
      readTime: '7분 읽기',
      views: 980,
      thumbnail: '/api/placeholder/400/240',
      featured: false
    },
    {
      id: 3,
      title: '2024년 AI 트렌드: 주목해야 할 5가지 기술',
      excerpt: '올해 AI 업계에서 주목받고 있는 최신 기술과 트렌드를 살펴보고, 향후 전망을 예측해봅니다.',
      content: '2024년 AI 트렌드 분석...',
      author: 'AI 연구원',
      publishedAt: new Date('2024-05-15'),
      tags: ['AI 트렌드', '기술전망', '분석'],
      readTime: '10분 읽기',
      views: 2100,
      thumbnail: '/api/placeholder/400/240',
      featured: true
    },
    {
      id: 4,
      title: 'AI 구독 서비스 비용 절약하는 방법',
      excerpt: '여러 AI 서비스 구독으로 인한 비용 부담을 줄이는 실용적인 전략을 제시합니다.',
      content: 'AI 구독 비용 절약 방법...',
      author: '구독 전문가',
      publishedAt: new Date('2024-05-12'),
      tags: ['구독관리', '비용절약', '팁'],
      readTime: '6분 읽기',
      views: 1580,
      thumbnail: '/api/placeholder/400/240',
      featured: false
    },
    {
      id: 5,
      title: 'Claude vs ChatGPT: 어떤 AI 어시스턴트가 더 나을까?',
      excerpt: '두 인기 AI 어시스턴트의 성능, 특징, 가격을 상세히 비교해보고 선택 기준을 제시합니다.',
      content: 'Claude와 ChatGPT 비교 분석...',
      author: 'AI 리뷰어',
      publishedAt: new Date('2024-05-10'),
      tags: ['Claude', 'ChatGPT', 'AI Chat', '비교'],
      readTime: '8분 읽기',
      views: 1750,
      thumbnail: '/api/placeholder/400/240',
      featured: false
    },
    {
      id: 6,
      title: '개발자를 위한 AI 코딩 툴 가이드',
      excerpt: 'GitHub Copilot, CodeT5, Tabnine 등 개발자에게 유용한 AI 코딩 도구들을 소개합니다.',
      content: '개발자용 AI 코딩 툴 가이드...',
      author: '개발자',
      publishedAt: new Date('2024-05-08'),
      tags: ['개발', 'AI 코딩', 'GitHub Copilot', '생산성'],
      readTime: '12분 읽기',
      views: 890,
      thumbnail: '/api/placeholder/400/240',
      featured: false
    }
  ])

  // 모든 태그 추출
  const allTags = [...new Set(posts.flatMap(post => post.tags))]
  
  // 필터링된 게시글
  const filteredPosts = selectedTag === 'all' 
    ? posts 
    : posts.filter(post => post.tags.includes(selectedTag))

  // 인기 게시글 (조회수 기준)
  const popularPosts = [...posts].sort((a, b) => b.views - a.views).slice(0, 3)

  // 최신 게시글
  const recentPosts = [...posts].sort((a, b) => b.publishedAt - a.publishedAt).slice(0, 3)

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AI 블로그</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          AI 툴 활용법, 최신 트렌드, 리뷰 등 유용한 정보를 공유합니다
        </p>
      </div>

      {/* 추천 게시글 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">추천 게시글</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {posts.filter(post => post.featured).map(post => (
            <Link key={post.id} href={`/blog/${post.id}`}>
              <div className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer">
                <figure className="h-48 bg-gray-200">
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    이미지 영역
                  </div>
                </figure>
                <div className="card-body">
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <User size={16} />
                    <span>{post.author}</span>
                    <Calendar size={16} />
                    <span>{format(post.publishedAt, 'yyyy년 M월 d일', { locale: ko })}</span>
                  </div>
                  <h3 className="card-title text-lg hover:text-primary transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-wrap gap-1">
                      {post.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="badge badge-secondary badge-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{post.readTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye size={14} />
                        <span>{post.views.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 블로그 목록 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 태그 필터 */}
          <div className="flex flex-wrap gap-2">
            <button
              className={`btn btn-sm ${selectedTag === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setSelectedTag('all')}
            >
              전체
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                className={`btn btn-sm ${selectedTag === tag ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setSelectedTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 게시글 목록 */}
          <div className="space-y-6">
            {filteredPosts.map(post => (
              <Link key={post.id} href={`/blog/${post.id}`}>
                <article className="card bg-base-100 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                  <div className="card-body">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <User size={16} />
                      <span>{post.author}</span>
                      <Calendar size={16} />
                      <span>{format(post.publishedAt, 'yyyy년 M월 d일', { locale: ko })}</span>
                    </div>
                    
                    <h2 className="card-title text-xl hover:text-primary transition-colors mb-3">
                      {post.title}
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-2">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.map(tag => (
                          <span 
                            key={tag} 
                            className="badge badge-outline badge-sm"
                            onClick={(e) => {
                              e.preventDefault()
                              setSelectedTag(tag)
                            }}
                          >
                            <Tag size={12} className="mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock size={14} />
                          <span>{post.readTime}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* 검색 결과가 없을 때 */}
          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-2xl font-bold mb-2">게시글이 없습니다</h3>
              <p className="text-gray-600 mb-4">
                선택한 태그에 해당하는 게시글이 없습니다
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setSelectedTag('all')}
              >
                모든 게시글 보기
              </button>
            </div>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 인기 게시글 */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">인기 게시글</h3>
              <div className="space-y-4">
                {popularPosts.map((post, index) => (
                  <Link key={post.id} href={`/blog/${post.id}`}>
                    <div className="flex gap-3 hover:bg-base-200 p-2 rounded cursor-pointer transition-colors">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-content rounded-full flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-sm line-clamp-2 hover:text-primary">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <Eye size={12} />
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 최신 게시글 */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">최신 게시글</h3>
              <div className="space-y-4">
                {recentPosts.map(post => (
                  <Link key={post.id} href={`/blog/${post.id}`}>
                    <div className="hover:bg-base-200 p-2 rounded cursor-pointer transition-colors">
                      <h4 className="font-medium text-sm line-clamp-2 hover:text-primary mb-2">
                        {post.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>{format(post.publishedAt, 'M월 d일', { locale: ko })}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* 태그 클라우드 */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">태그</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => {
                  const count = posts.filter(post => post.tags.includes(tag)).length
                  return (
                    <button
                      key={tag}
                      className={`badge ${selectedTag === tag ? 'badge-primary' : 'badge-ghost'} cursor-pointer hover:badge-primary transition-colors`}
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* 뉴스레터 구독 */}
          <div className="card bg-gradient-to-r from-blue-500 to-purple-600 text-white">
            <div className="card-body text-center">
              <h3 className="card-title text-lg mb-2 justify-center">
                AI 뉴스레터 구독
              </h3>
              <p className="text-sm mb-4 opacity-90">
                최신 AI 트렌드와 툴 정보를 이메일로 받아보세요
              </p>
              <div className="form-control">
                <input
                  type="email"
                  placeholder="이메일 주소"
                  className="input input-bordered text-black mb-2"
                />
                <button className="btn btn-secondary">
                  구독하기
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
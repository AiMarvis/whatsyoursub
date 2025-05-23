'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, ExternalLink, Star, DollarSign, Users } from 'lucide-react'
import Image from 'next/image'

export default function ToolsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [priceFilter, setPriceFilter] = useState('all')

  // 임시 AI 툴 데이터
  const [tools] = useState([
    {
      id: 1,
      name: 'ChatGPT',
      description: '가장 인기 있는 AI 채팅 서비스로 질문 답변, 텍스트 생성, 코딩 등 다양한 작업을 지원합니다.',
      category: 'AI Chat',
      price: 'Free / $20/month',
      rating: 4.8,
      users: '100M+',
      homepage: 'https://chat.openai.com',
      features: ['자연어 처리', '코드 생성', '번역', '요약'],
      logo: '/api/placeholder/80/80',
      isPaid: true,
      isFree: true
    },
    {
      id: 2,
      name: 'Midjourney',
      description: 'AI로 고품질 이미지를 생성하는 최고의 서비스입니다. 아트워크, 일러스트, 컨셉 아트 제작에 특화되어 있습니다.',
      category: 'AI Art',
      price: '$10-60/month',
      rating: 4.7,
      users: '20M+',
      homepage: 'https://midjourney.com',
      features: ['이미지 생성', '스타일 변환', '고해상도 업스케일'],
      logo: '/api/placeholder/80/80',
      isPaid: true,
      isFree: false
    },
    {
      id: 3,
      name: 'Claude',
      description: 'Anthropic에서 개발한 AI 어시스턴트로 안전하고 유용한 대화를 제공합니다.',
      category: 'AI Chat',
      price: 'Free / $20/month',
      rating: 4.6,
      users: '5M+',
      homepage: 'https://claude.ai',
      features: ['긴 컨텍스트 지원', '안전한 AI', '문서 분석'],
      logo: '/api/placeholder/80/80',
      isPaid: true,
      isFree: true
    },
    {
      id: 4,
      name: 'Notion AI',
      description: '노션 내에서 사용할 수 있는 AI 어시스턴트로 글쓰기, 정리, 브레인스토밍을 도와줍니다.',
      category: 'Productivity',
      price: '$10/month',
      rating: 4.5,
      users: '30M+',
      homepage: 'https://notion.so/ai',
      features: ['글쓰기 도우미', '요약', '번역', '아이디어 생성'],
      logo: '/api/placeholder/80/80',
      isPaid: true,
      isFree: false
    },
    {
      id: 5,
      name: 'Stable Diffusion',
      description: '오픈소스 AI 이미지 생성 모델로 무료로 사용할 수 있습니다.',
      category: 'AI Art',
      price: 'Free',
      rating: 4.3,
      users: '10M+',
      homepage: 'https://stability.ai',
      features: ['오픈소스', '로컬 실행 가능', '커스터마이징'],
      logo: '/api/placeholder/80/80',
      isPaid: false,
      isFree: true
    },
    {
      id: 6,
      name: 'GitHub Copilot',
      description: 'AI 코딩 어시스턴트로 코드 자동완성과 제안을 제공합니다.',
      category: 'Development',
      price: '$10/month',
      rating: 4.4,
      users: '5M+',
      homepage: 'https://github.com/copilot',
      features: ['코드 자동완성', '함수 생성', '주석 생성'],
      logo: '/api/placeholder/80/80',
      isPaid: true,
      isFree: false
    }
  ])

  const categories = ['all', 'AI Chat', 'AI Art', 'Productivity', 'Development']
  const priceOptions = [
    { value: 'all', label: '전체' },
    { value: 'free', label: '무료' },
    { value: 'paid', label: '유료' },
    { value: 'freemium', label: '프리미엄' }
  ]

  const filteredTools = useMemo(() => {
    return tools.filter(tool => {
      const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tool.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory
      
      let matchesPrice = true
      if (priceFilter === 'free') {
        matchesPrice = tool.isFree && !tool.isPaid
      } else if (priceFilter === 'paid') {
        matchesPrice = tool.isPaid && !tool.isFree
      } else if (priceFilter === 'freemium') {
        matchesPrice = tool.isFree && tool.isPaid
      }
      
      return matchesSearch && matchesCategory && matchesPrice
    })
  }, [tools, searchTerm, selectedCategory, priceFilter])

  const renderStars = (rating) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 !== 0

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<Star key="half" size={16} className="fill-yellow-400 text-yellow-400 opacity-50" />)
    }

    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} size={16} className="text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">AI 툴 소개</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          최신 AI 툴들을 발견하고 당신의 업무에 맞는 완벽한 솔루션을 찾아보세요
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="form-control">
                <div className="input-group">
                  <span>
                    <Search size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder="AI 툴 검색..."
                    className="input input-bordered flex-1"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="form-control">
              <select
                className="select select-bordered w-full lg:w-48"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? '모든 카테고리' : category}
                  </option>
                ))}
              </select>
            </div>

            {/* 가격 필터 */}
            <div className="form-control">
              <select
                className="select select-bordered w-full lg:w-32"
                value={priceFilter}
                onChange={(e) => setPriceFilter(e.target.value)}
              >
                {priceOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 필터 결과 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t">
            <span className="text-sm text-gray-600">
              {filteredTools.length}개의 툴을 찾았습니다
            </span>
            {(searchTerm || selectedCategory !== 'all' || priceFilter !== 'all') && (
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setPriceFilter('all')
                }}
              >
                필터 초기화
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 툴 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTools.map(tool => (
          <div key={tool.id} className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              {/* 툴 로고와 기본 정보 */}
              <div className="flex items-start gap-4 mb-4">
                <div className="avatar">
                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-bold text-gray-400">
                      {tool.name.charAt(0)}
                    </span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="card-title text-lg">{tool.name}</h3>
                  <div className="badge badge-secondary badge-sm">{tool.category}</div>
                </div>
              </div>

              {/* 설명 */}
              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {tool.description}
              </p>

              {/* 주요 기능 */}
              <div className="mb-4">
                <h4 className="text-sm font-semibold mb-2">주요 기능</h4>
                <div className="flex flex-wrap gap-1">
                  {tool.features.slice(0, 3).map((feature, index) => (
                    <span key={index} className="badge badge-outline badge-xs">
                      {feature}
                    </span>
                  ))}
                  {tool.features.length > 3 && (
                    <span className="badge badge-outline badge-xs">
                      +{tool.features.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* 통계 */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 mb-1">
                    {renderStars(tool.rating)}
                  </div>
                  <div className="text-xs text-gray-500">{tool.rating}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <DollarSign size={14} className="text-green-500" />
                  </div>
                  <div className="text-xs text-gray-500">{tool.price}</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Users size={14} className="text-blue-500" />
                  </div>
                  <div className="text-xs text-gray-500">{tool.users}</div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="card-actions justify-end">
                <a
                  href={tool.homepage}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary btn-sm"
                >
                  <ExternalLink size={16} />
                  방문하기
                </a>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 검색 결과가 없을 때 */}
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-2xl font-bold mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-600 mb-4">
            다른 검색어를 시도하거나 필터를 조정해보세요
          </p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setSearchTerm('')
              setSelectedCategory('all')
              setPriceFilter('all')
            }}
          >
            모든 툴 보기
          </button>
        </div>
      )}

      {/* 추천 섹션 */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 text-center">
        <h2 className="text-3xl font-bold mb-4">새로운 AI 툴을 추천해주세요!</h2>
        <p className="text-xl mb-6">
          유용한 AI 툴을 발견하셨나요? 커뮤니티와 공유해주세요.
        </p>
        <button className="btn btn-secondary btn-lg">
          툴 추천하기
        </button>
      </div>
    </div>
  )
} 
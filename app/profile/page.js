'use client'

import { useState } from 'react'
import { User, Mail, Calendar, Edit, Trash2, Save, X } from 'lucide-react'

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // 임시 사용자 데이터
  const [user, setUser] = useState({
    id: 1,
    email: 'user@example.com',
    nickname: 'AI 구독 관리자',
    provider: 'google',
    joinedAt: new Date('2024-01-15'),
    lastLoginAt: new Date('2024-05-20'),
    subscriptionCount: 5,
    totalSpending: 120
  })

  const [editForm, setEditForm] = useState({
    nickname: user.nickname
  })

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({ nickname: user.nickname })
    }
    setIsEditing(!isEditing)
  }

  const handleSave = () => {
    setUser(prev => ({
      ...prev,
      nickname: editForm.nickname
    }))
    setIsEditing(false)
  }

  const handleDeleteAccount = () => {
    // 실제로는 API 호출
    console.log('계정 삭제 요청')
    setShowDeleteModal(false)
    // 로그아웃 처리 및 홈으로 리다이렉트
  }

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date)
  }

  const getProviderName = (provider) => {
    switch (provider) {
      case 'google':
        return 'Google'
      case 'kakao':
        return '카카오'
      default:
        return provider
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 헤더 */}
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">내 프로필</h1>
        <p className="text-gray-600">계정 정보를 확인하고 관리하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 기본 정보 카드 */}
        <div className="lg:col-span-2">
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="flex items-center justify-between mb-6">
                <h2 className="card-title text-xl">기본 정보</h2>
                <button
                  onClick={handleEditToggle}
                  className={`btn btn-sm ${isEditing ? 'btn-ghost' : 'btn-outline'}`}
                >
                  {isEditing ? (
                    <>
                      <X size={16} />
                      취소
                    </>
                  ) : (
                    <>
                      <Edit size={16} />
                      수정
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-6">
                {/* 프로필 이미지 */}
                <div className="flex items-center gap-4">
                  <div className="avatar">
                    <div className="w-20 h-20 rounded-full bg-primary text-primary-content flex items-center justify-center">
                      <User size={32} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      {isEditing ? (
                        <input
                          type="text"
                          className="input input-bordered w-full max-w-xs"
                          value={editForm.nickname}
                          onChange={(e) => setEditForm(prev => ({ ...prev, nickname: e.target.value }))}
                        />
                      ) : (
                        user.nickname
                      )}
                    </h3>
                    <p className="text-gray-600 flex items-center gap-2">
                      <Mail size={16} />
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* 계정 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">이메일 주소</span>
                    </label>
                    <div className="input input-bordered flex items-center">
                      <Mail size={16} className="mr-2 text-gray-400" />
                      <span>{user.email}</span>
                    </div>
                    <label className="label">
                      <span className="label-text-alt text-gray-500">
                        이메일은 변경할 수 없습니다
                      </span>
                    </label>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">로그인 방식</span>
                    </label>
                    <div className="input input-bordered flex items-center">
                      <User size={16} className="mr-2 text-gray-400" />
                      <span>{getProviderName(user.provider)} 계정</span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">가입일</span>
                    </label>
                    <div className="input input-bordered flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      <span>{formatDate(user.joinedAt)}</span>
                    </div>
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text font-medium">최근 로그인</span>
                    </label>
                    <div className="input input-bordered flex items-center">
                      <Calendar size={16} className="mr-2 text-gray-400" />
                      <span>{formatDate(user.lastLoginAt)}</span>
                    </div>
                  </div>
                </div>

                {/* 저장 버튼 */}
                {isEditing && (
                  <div className="card-actions justify-end">
                    <button
                      onClick={handleSave}
                      className="btn btn-primary"
                    >
                      <Save size={16} />
                      저장
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 사이드바 통계 */}
        <div className="space-y-6">
          {/* 구독 통계 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">구독 현황</h3>
              <div className="space-y-4">
                <div className="stat">
                  <div className="stat-title">활성 구독</div>
                  <div className="stat-value text-primary">{user.subscriptionCount}</div>
                  <div className="stat-desc">개의 서비스</div>
                </div>
                <div className="stat">
                  <div className="stat-title">월 총 비용</div>
                  <div className="stat-value text-secondary">${user.totalSpending}</div>
                  <div className="stat-desc">예상 금액</div>
                </div>
              </div>
              <div className="card-actions justify-end mt-4">
                <a href="/dashboard" className="btn btn-primary btn-sm">
                  대시보드 보기
                </a>
              </div>
            </div>
          </div>

          {/* 빠른 액션 */}
          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <h3 className="card-title text-lg mb-4">빠른 액션</h3>
              <div className="space-y-2">
                <a href="/dashboard" className="btn btn-outline btn-sm w-full justify-start">
                  구독 관리
                </a>
                <a href="/tools" className="btn btn-outline btn-sm w-full justify-start">
                  AI 툴 둘러보기
                </a>
                <a href="/blog" className="btn btn-outline btn-sm w-full justify-start">
                  블로그 읽기
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 계정 관리 */}
      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl text-error mb-4">계정 관리</h2>
          <div className="alert alert-warning">
            <div>
              <h3 className="font-bold">주의사항</h3>
              <div className="text-sm">
                계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
              </div>
            </div>
          </div>
          <div className="card-actions justify-end">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-error"
            >
              <Trash2 size={16} />
              계정 삭제
            </button>
          </div>
        </div>
      </div>

      {/* 계정 삭제 확인 모달 */}
      {showDeleteModal && (
        <dialog className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg text-error">계정 삭제 확인</h3>
            <div className="py-4">
              <p className="mb-4">
                정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="bg-error/10 border border-error/20 rounded-lg p-4">
                <p className="text-sm text-error font-medium mb-2">
                  삭제될 데이터:
                </p>
                <ul className="text-sm text-error space-y-1">
                  <li>• 모든 구독 정보</li>
                  <li>• 계정 설정 및 프로필</li>
                  <li>• 이용 기록</li>
                </ul>
              </div>
            </div>
            <div className="modal-action">
              <button
                className="btn"
                onClick={() => setShowDeleteModal(false)}
              >
                취소
              </button>
              <button
                className="btn btn-error"
                onClick={handleDeleteAccount}
              >
                삭제
              </button>
            </div>
          </div>
        </dialog>
      )}
    </div>
  )
} 
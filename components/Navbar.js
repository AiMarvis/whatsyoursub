'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { Home, CreditCard, Wrench, BookOpen, User, LogOut, Menu, X, Sparkles, ChevronDown, Bell, Video, FileText, Star, Users } from 'lucide-react'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 임시로 false, 나중에 인증 상태로 연결
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 모바일 메뉴 토글 함수
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    // 모바일 메뉴가 열릴 때 스크롤 방지
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
  }

  // 모바일 메뉴 클릭 시 메뉴 닫기
  const closeMenu = () => {
    setIsMobileMenuOpen(false)
    document.body.style.overflow = 'auto'
  }

  return (
    <div className={`navbar fixed top-0 z-50 transition-all duration-300 ${
      isScrolled || isMobileMenuOpen ? 'bg-base-100/95 backdrop-blur-md shadow-md' : 'bg-lavender-50 backdrop-blur-sm'
    }`}>
      <div className="container mx-auto px-4">
        <div className="navbar-start flex flex-1 items-center">
          <button
            aria-label="메뉴 열기/닫기"
            onClick={toggleMobileMenu}
            className="btn btn-circle btn-ghost md:hidden flex items-center justify-center relative"
          >
            <div className={`transition-all duration-300 ${isMobileMenuOpen ? 'rotate-90 opacity-0' : 'rotate-0 opacity-100'}`}>
              <Menu size={24} />
            </div>
            <div className={`absolute transition-all duration-300 ${isMobileMenuOpen ? 'rotate-0 opacity-100' : '-rotate-90 opacity-0'}`}>
              <X size={24} />
            </div>
            <span className="sr-only">메뉴</span>
          </button>
          
          <Link href="/" className="flex items-center gap-3 text-2xl font-bold mr-10" onClick={closeMenu}>
            <Image 
              src="/images/wys_logo_saved.png" 
              alt="WhatYourSub 로고" 
              width={48} 
              height={48}
              quality={100}
              priority
              style={{ objectFit: 'contain' }}
              className="rounded-md"
            />
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-500 via-pink-500 to-indigo-500 bg-clip-text text-transparent animate-gradient-x">WhatYourSub</span>
          </Link>
          
          <ul className="hidden md:flex items-center space-x-10">
            <li><Link href="/" className="text-gray-700 hover:text-primary font-medium text-lg">홈</Link></li>
            <li><Link href="/dashboard" className="text-gray-700 hover:text-primary font-medium text-lg">대시보드</Link></li>
            <li><Link href="/tools" className="text-gray-700 hover:text-primary font-medium text-lg">AI tool</Link></li>
            <li><Link href="/blog" className="text-gray-700 hover:text-primary font-medium text-lg">블로그</Link></li>
            <li><Link href="/profile" className="text-gray-700 hover:text-primary font-medium text-lg">프로필</Link></li>
          </ul>
        </div>
        
        <div className="navbar-end gap-2">
          {isLoggedIn ? (
            <div className="flex items-center gap-3">
              <button className="btn btn-circle btn-ghost btn-sm relative group">
                <Bell className="w-5 h-5 group-hover:text-primary transition-colors" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></span>
                <span className="sr-only">알림</span>
              </button>
              
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar hover:bg-base-200">
                  <div className="w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
                    <User size={20} className="text-white" />
                  </div>
                </div>
                <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow-xl border border-base-200">
                  <li className="menu-title">
                    <span>내 계정</span>
                  </li>
                  <li><Link href="/profile" className="flex items-center gap-2"><User size={16} />프로필</Link></li>
                  <li><Link href="/dashboard" className="flex items-center gap-2"><CreditCard size={16} />구독 관리</Link></li>
                  <div className="divider my-1"></div>
                  <li><button className="flex items-center gap-2 text-error"><LogOut size={16} />로그아웃</button></li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex gap-3 items-center">
              {/* 로그인 및 회원가입 버튼 삭제 */}
            </div>
          )}
        </div>
      </div>

      {/* 모바일 메뉴 - 개선된 버전 */}
      <div className={`fixed inset-0 bg-base-100/95 backdrop-blur-md z-40 pt-16 transition-all duration-300 md:hidden overflow-auto ${
        isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
      }`}>
        <div className="container mx-auto px-4 py-6">
          <ul className="menu p-0 gap-2">
            <li>
              <Link href="/" className="flex items-center gap-3 py-3 px-4 hover:bg-base-200 rounded-lg transition-all" onClick={closeMenu}>
                <Home className="w-5 h-5 text-primary" />
                <span className="font-medium">홈</span>
              </Link>
            </li>
            <li>
              <Link href="/dashboard" className="flex items-center gap-3 py-3 px-4 hover:bg-base-200 rounded-lg transition-all" onClick={closeMenu}>
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-medium">대시보드</span>
              </Link>
            </li>
            <li>
              <Link href="/tools" className="flex items-center gap-3 py-3 px-4 hover:bg-base-200 rounded-lg transition-all" onClick={closeMenu}>
                <Wrench className="w-5 h-5 text-primary" />
                <span className="font-medium">AI tool</span>
              </Link>
            </li>
            <li>
              <Link href="/blog" className="flex items-center gap-3 py-3 px-4 hover:bg-base-200 rounded-lg transition-all" onClick={closeMenu}>
                <BookOpen className="w-5 h-5 text-primary" />
                <span className="font-medium">블로그</span>
              </Link>
            </li>
            <li>
              <Link href="/profile" className="flex items-center gap-3 py-3 px-4 hover:bg-base-200 rounded-lg transition-all" onClick={closeMenu}>
                <User className="w-5 h-5 text-primary" />
                <span className="font-medium">프로필</span>
              </Link>
            </li>
            {!isLoggedIn && (
              <>
                <div className="divider my-4"></div>
                <div className="flex flex-col gap-3 px-4 mt-2">
                  {/* 로그인 및 회원가입 버튼 삭제 */}
                </div>
              </>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
} 
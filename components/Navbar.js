'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Home, CreditCard, Wrench, BookOpen, User, LogOut } from 'lucide-react'

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false) // 임시로 false, 나중에 인증 상태로 연결

  return (
    <div className="navbar bg-base-200 shadow-lg">
      <div className="navbar-start">
        <div className="dropdown">
          <div tabIndex={0} role="button" className="btn btn-ghost lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </div>
          <ul
            tabIndex={0}
            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
            <li><Link href="/" className="flex items-center gap-2"><Home size={16} />홈</Link></li>
            {isLoggedIn && (
              <>
                <li><Link href="/dashboard" className="flex items-center gap-2"><CreditCard size={16} />내 구독</Link></li>
                <li><Link href="/tools" className="flex items-center gap-2"><Wrench size={16} />AI 툴</Link></li>
                <li><Link href="/blog" className="flex items-center gap-2"><BookOpen size={16} />블로그</Link></li>
                <li><Link href="/profile" className="flex items-center gap-2"><User size={16} />프로필</Link></li>
              </>
            )}
          </ul>
        </div>
        <Link href="/" className="btn btn-ghost text-xl font-bold">
          AI 구독 관리
        </Link>
      </div>
      
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1">
          <li><Link href="/" className="flex items-center gap-2"><Home size={16} />홈</Link></li>
          {isLoggedIn && (
            <>
              <li><Link href="/dashboard" className="flex items-center gap-2"><CreditCard size={16} />내 구독</Link></li>
              <li><Link href="/tools" className="flex items-center gap-2"><Wrench size={16} />AI 툴</Link></li>
              <li><Link href="/blog" className="flex items-center gap-2"><BookOpen size={16} />블로그</Link></li>
            </>
          )}
        </ul>
      </div>
      
      <div className="navbar-end">
        {isLoggedIn ? (
          <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <User size={24} />
              </div>
            </div>
            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow">
              <li><Link href="/profile" className="flex items-center gap-2"><User size={16} />프로필</Link></li>
              <li><button className="flex items-center gap-2"><LogOut size={16} />로그아웃</button></li>
            </ul>
          </div>
        ) : (
          <Link href="/auth/login" className="btn btn-primary">
            로그인
          </Link>
        )}
      </div>
    </div>
  )
} 
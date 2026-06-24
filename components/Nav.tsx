'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Nav() {
  const pathname = usePathname()

  function linkClass(href: string) {
    const active = pathname === href || (href !== '/' && pathname.startsWith(href))
    return active
      ? 'text-sm font-medium text-indigo-600 border-b-2 border-indigo-600 pb-0.5'
      : 'text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors'
  }

  return (
    <header className="border-b border-gray-200 bg-white sticky top-0 z-20">
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-6">
        <span className="text-base font-bold text-gray-900 tracking-tight">
          Project Master
        </span>
        <nav className="flex items-center gap-4">
          <Link href="/board" className={linkClass('/board')}>
            Board
          </Link>
          <Link href="/dashboard" className={linkClass('/dashboard')}>
            Dashboard
          </Link>
        </nav>
      </div>
    </header>
  )
}

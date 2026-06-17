'use client'

import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { RESTAURANTS } from '@/lib/types'

export default function Header() {
  const { user, logout } = useUser()

  if (!user) return null

  const isManager = user === 'manager'
  const restaurantInfo = !isManager ? RESTAURANTS[user as keyof typeof RESTAURANTS] : null
  const displayName = isManager ? 'FNB Manager' : restaurantInfo?.name || ''
  const color = isManager ? '#EF4444' : restaurantInfo?.color || '#6B7280'

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Centralisation Commandes
            </Link>
            <span className="hidden sm:block text-gray-300">|</span>
            <div className="hidden sm:flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="font-medium text-gray-700">{displayName}</span>
            </div>
          </div>
          <nav className="flex items-center gap-4">
            {isManager ? (
              <Link
                href="/manager"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Vue Manager
              </Link>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Mon tableau de bord
                </Link>
                <Link
                  href="/catalog"
                  className="text-sm font-medium text-gray-600 hover:text-gray-900"
                >
                  Catalogue
                </Link>
              </>
            )}
            <button
              onClick={logout}
              className="text-sm font-medium text-red-500 hover:text-red-700"
            >
              Changer
            </button>
          </nav>
        </div>
      </div>
    </header>
  )
}

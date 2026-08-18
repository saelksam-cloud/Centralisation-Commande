'use client'
import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { RESTAURANTS } from '@/lib/types'

export default function Header() {
  const { user, loaded, logout } = useUser()
  const router = useRouter()

  if (!loaded || !user) return null

  const isManager = user === 'manager'
  const restaurantInfo = !isManager ? RESTAURANTS[user] : null
  const displayName = isManager ? 'FNB Manager' : restaurantInfo!.name
  const dotColor = isManager ? '#EF4444' : restaurantInfo!.color

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Link href="/commandes" className="font-semibold text-gray-900 text-sm">
          Centralisation Commandes
        </Link>
        <span className="flex items-center gap-1.5 text-sm text-gray-600">
          <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: dotColor }} />
          {displayName}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {isManager && (
          <Link href="/commandes" className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1">
            Commandes
          </Link>
        )}
        <Link href="/planning" className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1">
          Planning
        </Link>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
        >
          Changer
        </button>
      </div>
    </header>
  )
}

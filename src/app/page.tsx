'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { RESTAURANTS, RestaurantId } from '@/lib/types'

export default function HomePage() {
  const { user, loaded, selectUser } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (loaded && user) {
      router.replace('/commandes')
    }
  }, [loaded, user, router])

  if (!loaded || user) return null

  const handleSelect = (role: RestaurantId | 'manager') => {
    selectUser(role)
    router.push('/commandes')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
          Centralisation Commandes
        </h1>
        <p className="text-gray-500 text-center mb-8">Choisissez votre restaurant</p>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {(Object.entries(RESTAURANTS) as [RestaurantId, { name: string; color: string }][]).map(([id, r]) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className="rounded-xl p-5 text-white font-semibold text-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
              style={{ backgroundColor: r.color }}
            >
              {r.name}
            </button>
          ))}
        </div>

        <button
          onClick={() => handleSelect('manager')}
          className="w-full rounded-xl p-5 text-white font-semibold text-lg shadow-sm hover:opacity-90 active:scale-95 transition-all"
          style={{ backgroundColor: '#EF4444' }}
        >
          FNB Manager
        </button>
      </div>
    </div>
  )
}

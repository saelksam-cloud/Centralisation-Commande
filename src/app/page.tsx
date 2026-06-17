'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { RESTAURANTS, UserRole } from '@/lib/types'

const MANAGER = { name: 'FNB Manager', color: '#EF4444', description: 'Vue consolidée de tous les restaurants' }

export default function HomePage() {
  const { user, loaded, selectUser } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (loaded && user) {
      if (user === 'manager') {
        router.push('/manager')
      } else {
        router.push('/dashboard')
      }
    }
  }, [loaded, user, router])

  const handleSelect = (role: UserRole) => {
    selectUser(role)
    if (role === 'manager') {
      router.push('/manager')
    } else {
      router.push('/dashboard')
    }
  }

  if (!loaded) return null

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Centralisation des Commandes
          </h1>
          <p className="text-gray-500">
            Sélectionnez votre restaurant pour accéder à votre espace
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {(Object.entries(RESTAURANTS) as [keyof typeof RESTAURANTS, { name: string; color: string }][]).map(([id, info]) => (
            <button
              key={id}
              onClick={() => handleSelect(id)}
              className="bg-white rounded-xl shadow-sm border-2 p-6 text-left hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
              style={{ borderColor: info.color }}
            >
              <div
                className="w-10 h-10 rounded-full mb-4 flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: info.color }}
              >
                {info.name[0]}
              </div>
              <h2 className="text-lg font-semibold text-gray-900">{info.name}</h2>
              <p className="text-sm text-gray-500 mt-1">Accéder à mes commandes</p>
            </button>
          ))}

          <button
            onClick={() => handleSelect('manager')}
            className="bg-white rounded-xl shadow-sm border-2 p-6 text-left hover:shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] sm:col-span-2"
            style={{ borderColor: MANAGER.color }}
          >
            <div
              className="w-10 h-10 rounded-full mb-4 flex items-center justify-center text-white font-bold text-lg"
              style={{ backgroundColor: MANAGER.color }}
            >
              F
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{MANAGER.name}</h2>
            <p className="text-sm text-gray-500 mt-1">{MANAGER.description}</p>
          </button>
        </div>
      </div>
    </div>
  )
}

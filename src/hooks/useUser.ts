'use client'

import { useState, useEffect } from 'react'
import { UserRole } from '@/lib/types'

const USER_KEY = 'restaurant_user'

export function useUser() {
  const [user, setUser] = useState<UserRole | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(USER_KEY)
      if (stored) setUser(stored as UserRole)
      setLoaded(true)
    }
  }, [])

  const selectUser = (role: UserRole) => {
    setUser(role)
    if (typeof window !== 'undefined') {
      localStorage.setItem(USER_KEY, role)
    }
  }

  const logout = () => {
    setUser(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_KEY)
    }
  }

  return { user, loaded, selectUser, logout }
}

'use client'
import { useState, useEffect } from 'react'
import { UserRole } from '@/lib/types'

const STORAGE_KEY = 'restaurant_user'

export function useUser() {
  const [user, setUser] = useState<UserRole | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setUser(raw as UserRole)
    } catch {}
    setLoaded(true)
  }, [])

  const selectUser = (role: UserRole) => {
    setUser(role)
    localStorage.setItem(STORAGE_KEY, role)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return { user, loaded, selectUser, logout }
}

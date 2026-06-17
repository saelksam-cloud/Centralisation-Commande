'use client'

import { useState, useEffect, useCallback } from 'react'
import { Order, OrderItem, RestaurantId } from '@/lib/types'
import { generateId, getWeekYear } from '@/lib/utils'

const STORAGE_KEY = 'restaurant_orders'

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          setOrders(JSON.parse(stored))
        } catch {
          setOrders([])
        }
      }
      setLoaded(true)
    }
  }, [])

  const save = useCallback((newOrders: Order[]) => {
    setOrders(newOrders)
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders))
    }
  }, [])

  const getOrCreateOrder = useCallback((restaurantId: RestaurantId, weekYear?: string): Order => {
    const week = weekYear || getWeekYear()
    const existing = orders.find(o => o.restaurantId === restaurantId && o.weekYear === week)
    if (existing) return existing
    const newOrder: Order = {
      id: generateId(),
      restaurantId,
      weekYear: week,
      items: [],
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    return newOrder
  }, [orders])

  const addItem = useCallback((restaurantId: RestaurantId, item: Omit<OrderItem, 'id'>) => {
    const week = getWeekYear()
    const existing = orders.find(o => o.restaurantId === restaurantId && o.weekYear === week)
    const newItem: OrderItem = { ...item, id: generateId() }

    let newOrders: Order[]
    if (existing) {
      newOrders = orders.map(o =>
        o.id === existing.id
          ? { ...o, items: [...o.items, newItem], updatedAt: new Date().toISOString() }
          : o
      )
    } else {
      const newOrder: Order = {
        id: generateId(),
        restaurantId,
        weekYear: week,
        items: [newItem],
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      newOrders = [...orders, newOrder]
    }
    save(newOrders)
  }, [orders, save])

  const updateItem = useCallback((restaurantId: RestaurantId, itemId: string, updates: Partial<OrderItem>) => {
    const week = getWeekYear()
    const newOrders = orders.map(o => {
      if (o.restaurantId === restaurantId && o.weekYear === week) {
        return {
          ...o,
          items: o.items.map(item => item.id === itemId ? { ...item, ...updates } : item),
          updatedAt: new Date().toISOString(),
        }
      }
      return o
    })
    save(newOrders)
  }, [orders, save])

  const deleteItem = useCallback((restaurantId: RestaurantId, itemId: string) => {
    const week = getWeekYear()
    const newOrders = orders.map(o => {
      if (o.restaurantId === restaurantId && o.weekYear === week) {
        return {
          ...o,
          items: o.items.filter(item => item.id !== itemId),
          updatedAt: new Date().toISOString(),
        }
      }
      return o
    })
    save(newOrders)
  }, [orders, save])

  const validateOrder = useCallback((restaurantId: RestaurantId) => {
    const week = getWeekYear()
    const newOrders = orders.map(o =>
      o.restaurantId === restaurantId && o.weekYear === week
        ? { ...o, status: 'validated' as const, updatedAt: new Date().toISOString() }
        : o
    )
    save(newOrders)
  }, [orders, save])

  const markAsSent = useCallback((orderId: string) => {
    const newOrders = orders.map(o =>
      o.id === orderId ? { ...o, status: 'sent' as const, updatedAt: new Date().toISOString() } : o
    )
    save(newOrders)
  }, [orders, save])

  const getCurrentWeekOrders = useCallback((weekYear?: string) => {
    const week = weekYear || getWeekYear()
    return orders.filter(o => o.weekYear === week)
  }, [orders])

  return {
    orders,
    loaded,
    getOrCreateOrder,
    addItem,
    updateItem,
    deleteItem,
    validateOrder,
    markAsSent,
    getCurrentWeekOrders,
  }
}

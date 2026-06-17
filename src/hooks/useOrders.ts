'use client'
import { useState, useEffect, useCallback } from 'react'
import { WeekOrder, OrderItem, RestaurantId, SupplierId, SUPPLIERS } from '@/lib/types'
import { getWeekYear, generateId } from '@/lib/utils'

const STORAGE_KEY = 'restaurant_orders_v2'

function createEmptyOrder(restaurantId: RestaurantId, weekYear: string): WeekOrder {
  const statusBySupplier = Object.fromEntries(
    Object.keys(SUPPLIERS).map(id => [id, 'draft'])
  ) as Record<SupplierId, 'draft' | 'validated' | 'sent'>
  return {
    id: generateId(),
    restaurantId,
    weekYear,
    items: [],
    statusBySupplier,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function useOrders() {
  const [orders, setOrders] = useState<WeekOrder[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setOrders(JSON.parse(raw))
    } catch {}
    setLoaded(true)
  }, [])

  const save = useCallback((newOrders: WeekOrder[]) => {
    setOrders(newOrders)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrders))
  }, [])

  const getOrCreateOrder = useCallback((restaurantId: RestaurantId, weekYear?: string): WeekOrder => {
    const wk = weekYear ?? getWeekYear()
    return orders.find(o => o.restaurantId === restaurantId && o.weekYear === wk)
      ?? createEmptyOrder(restaurantId, wk)
  }, [orders])

  const addItem = useCallback((restaurantId: RestaurantId, item: Omit<OrderItem, 'id'>) => {
    const wk = getWeekYear()
    const existing = orders.find(o => o.restaurantId === restaurantId && o.weekYear === wk)
    const order = existing ?? createEmptyOrder(restaurantId, wk)
    const updated: WeekOrder = {
      ...order,
      items: [...order.items, { ...item, id: generateId() }],
      updatedAt: new Date().toISOString(),
    }
    const rest = orders.filter(o => !(o.restaurantId === restaurantId && o.weekYear === wk))
    save([...rest, updated])
  }, [orders, save])

  const updateItem = useCallback((restaurantId: RestaurantId, itemId: string, updates: Partial<OrderItem>) => {
    const wk = getWeekYear()
    const updated = orders.map(o => {
      if (o.restaurantId !== restaurantId || o.weekYear !== wk) return o
      return {
        ...o,
        items: o.items.map(i => i.id === itemId ? { ...i, ...updates } : i),
        updatedAt: new Date().toISOString(),
      }
    })
    save(updated)
  }, [orders, save])

  const deleteItem = useCallback((restaurantId: RestaurantId, itemId: string) => {
    const wk = getWeekYear()
    const updated = orders.map(o => {
      if (o.restaurantId !== restaurantId || o.weekYear !== wk) return o
      return {
        ...o,
        items: o.items.filter(i => i.id !== itemId),
        updatedAt: new Date().toISOString(),
      }
    })
    save(updated)
  }, [orders, save])

  const markSupplierSent = useCallback((restaurantId: RestaurantId, supplierId: SupplierId) => {
    const wk = getWeekYear()
    const existing = orders.find(o => o.restaurantId === restaurantId && o.weekYear === wk)
    if (!existing) return
    const updated = orders.map(o => {
      if (o.restaurantId !== restaurantId || o.weekYear !== wk) return o
      return {
        ...o,
        statusBySupplier: { ...o.statusBySupplier, [supplierId]: 'sent' as const },
        updatedAt: new Date().toISOString(),
      }
    })
    save(updated)
  }, [orders, save])

  const getCurrentWeekOrders = useCallback((weekYear?: string): WeekOrder[] => {
    const wk = weekYear ?? getWeekYear()
    return orders.filter(o => o.weekYear === wk)
  }, [orders])

  return {
    orders,
    loaded,
    getOrCreateOrder,
    addItem,
    updateItem,
    deleteItem,
    markSupplierSent,
    setSupplierStatus: markSupplierSent,
    getCurrentWeekOrders,
  }
}

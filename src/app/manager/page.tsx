'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useOrders } from '@/hooks/useOrders'
import { RESTAURANTS, RestaurantId } from '@/lib/types'
import { getWeekYear, exportToCSV } from '@/lib/utils'
import StatusBadge from '@/components/StatusBadge'

export default function ManagerPage() {
  const { user, loaded: userLoaded } = useUser()
  const { orders, loaded: ordersLoaded, markAsSent, getCurrentWeekOrders } = useOrders()
  const router = useRouter()

  const [filterSupplier, setFilterSupplier] = useState<'all' | 'rossi' | 'prodacteur'>('all')
  const [selectedWeek, setSelectedWeek] = useState(getWeekYear())

  useEffect(() => {
    if (userLoaded && user !== 'manager') router.push('/')
  }, [userLoaded, user, router])

  if (!userLoaded || !ordersLoaded || user !== 'manager') return null

  const weekOrders = getCurrentWeekOrders(selectedWeek)
  const restaurantIds = Object.keys(RESTAURANTS) as RestaurantId[]

  // Consolidated totals
  const allItems = weekOrders.flatMap(o => o.items.map(i => ({ ...i, restaurantId: o.restaurantId })))
  const filteredItems = allItems.filter(i => filterSupplier === 'all' || i.supplier === filterSupplier)

  // Group by product name for totals
  const totals: Record<string, { quantity: number; unit: string; supplier: string; restaurants: string[] }> = {}
  filteredItems.forEach(item => {
    const key = `${item.productName}__${item.unit}`
    if (!totals[key]) {
      totals[key] = { quantity: 0, unit: item.unit, supplier: item.supplier, restaurants: [] }
    }
    totals[key].quantity += item.quantity
    const rName = RESTAURANTS[item.restaurantId].name
    if (!totals[key].restaurants.includes(rName)) totals[key].restaurants.push(rName)
  })

  const handleExport = (supplier: 'rossi' | 'prodacteur') => {
    const rows = weekOrders.flatMap(o =>
      o.items
        .filter(i => i.supplier === supplier)
        .map(i => ({
          Restaurant: RESTAURANTS[o.restaurantId].name,
          Produit: i.productName,
          Quantite: i.quantity,
          Unite: i.unit,
          Categorie: i.category,
          Notes: i.notes || '',
          Statut: o.status,
        }))
    )
    exportToCSV(rows, `commande-${supplier}-${selectedWeek}.csv`)
  }

  // Available weeks (current + last 4)
  const availableWeeks = Array.from(new Set(orders.map(o => o.weekYear))).sort().reverse()
  if (!availableWeeks.includes(selectedWeek)) availableWeeks.unshift(selectedWeek)

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vue FNB Manager</h1>
          <p className="text-gray-500 text-sm mt-1">Commandes consolidées de tous les restaurants</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => handleExport('rossi')}
            className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-sm font-medium hover:bg-blue-100">
            Export Rossi
          </button>
          <button onClick={() => handleExport('prodacteur')}
            className="px-3 py-2 bg-green-50 text-green-700 border border-green-200 rounded-lg text-sm font-medium hover:bg-green-100">
            Export Prodacteur
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={selectedWeek}
          onChange={e => setSelectedWeek(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white"
        >
          {availableWeeks.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <div className="flex gap-2">
          {(['all', 'rossi', 'prodacteur'] as const).map(s => (
            <button key={s} onClick={() => setFilterSupplier(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${filterSupplier === s ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}>
              {s === 'all' ? 'Tous fournisseurs' : s === 'rossi' ? 'Rossi' : 'Prodacteur'}
            </button>
          ))}
        </div>
      </div>

      {/* Status per restaurant */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {restaurantIds.map(rId => {
          const rOrder = weekOrders.find(o => o.restaurantId === rId)
          const r = RESTAURANTS[rId]
          return (
            <div key={rId} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                <span className="font-medium text-sm text-gray-800">{r.name}</span>
              </div>
              {rOrder ? (
                <>
                  <StatusBadge status={rOrder.status} />
                  <div className="text-xs text-gray-500 mt-2">{rOrder.items.length} article{rOrder.items.length !== 1 ? 's' : ''}</div>
                  {rOrder.status !== 'sent' && (
                    <button onClick={() => markAsSent(rOrder.id)}
                      className="mt-2 text-xs px-2 py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100 w-full">
                      Marquer envoyée
                    </button>
                  )}
                </>
              ) : (
                <span className="text-xs text-gray-400">Pas de commande</span>
              )}
            </div>
          )
        })}
      </div>

      {/* Consolidated totals */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Totaux consolidés</h2>
          <p className="text-xs text-gray-500 mt-0.5">Quantités totales à commander par produit</p>
        </div>
        {Object.keys(totals).length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">Aucune commande pour cette semaine</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-gray-600 text-xs uppercase tracking-wider">Produit</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wider">Quantité totale</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wider">Fournisseur</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 text-xs uppercase tracking-wider hidden sm:table-cell">Restaurants</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(totals)
                .sort((a, b) => a[1].supplier.localeCompare(b[1].supplier) || a[0].localeCompare(b[0]))
                .map(([key, total]) => {
                  const productName = key.split('__')[0]
                  return (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-5 py-3 font-medium text-gray-900">{productName}</td>
                      <td className="px-4 py-3 text-right font-semibold">
                        {total.quantity} <span className="text-gray-400 font-normal">{total.unit}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${total.supplier === 'rossi' ? 'bg-blue-50 text-blue-700' : 'bg-green-50 text-green-700'}`}>
                          {total.supplier === 'rossi' ? 'Rossi' : 'Prodacteur'}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {total.restaurants.map(r => (
                            <span key={r} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{r}</span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail per restaurant */}
      <div className="space-y-4">
        <h2 className="font-semibold text-gray-900">Détail par restaurant</h2>
        {weekOrders.length === 0 && (
          <p className="text-gray-400 text-sm">Aucune commande cette semaine</p>
        )}
        {weekOrders.map(order => {
          const r = RESTAURANTS[order.restaurantId]
          const orderItems = order.items.filter(i => filterSupplier === 'all' || i.supplier === filterSupplier)
          if (orderItems.length === 0) return null
          return (
            <div key={order.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between border-b border-gray-100" style={{ borderLeftColor: r.color, borderLeftWidth: 4 }}>
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                  <span className="font-medium text-gray-900">{r.name}</span>
                  <StatusBadge status={order.status} />
                </div>
                <span className="text-xs text-gray-400">{orderItems.length} article{orderItems.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {orderItems.map(item => (
                  <div key={item.id} className="px-5 py-2.5 flex items-center justify-between">
                    <span className="text-sm text-gray-800">{item.productName}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{item.quantity} {item.unit}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded ${item.supplier === 'rossi' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                        {item.supplier === 'rossi' ? 'Rossi' : 'Prodacteur'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useOrders } from '@/hooks/useOrders'
import { SUPPLIERS, RESTAURANTS, RestaurantId, SupplierId } from '@/lib/types'
import { getWeekYear, getWeekLabel, generateWhatsAppMessage, openWhatsApp, copyToClipboard, exportToCSV, getSendDateLabel, getDeliveryDateById as getDeliveryDate, formatDate } from '@/lib/utils'

const SUPPLIER_IDS = Object.keys(SUPPLIERS) as SupplierId[]
const RESTAURANT_IDS = Object.keys(RESTAURANTS) as RestaurantId[]

export default function ManagerPage() {
  const { user, loaded: userLoaded } = useUser()
  const { orders, loaded: ordersLoaded, setSupplierStatus, getCurrentWeekOrders } = useOrders()
  const router = useRouter()

  const [activeSupplier, setActiveSupplier] = useState<SupplierId>('rossi')
  const [weekYear] = useState(getWeekYear())
  const [copiedSupplier, setCopiedSupplier] = useState<SupplierId | null>(null)

  useEffect(() => {
    if (userLoaded && user !== 'manager') router.push('/')
  }, [userLoaded, user, router])

  if (!userLoaded || !ordersLoaded || user !== 'manager') return null

  const weekOrders = getCurrentWeekOrders(weekYear)

  const handleCopy = async (sid: SupplierId) => {
    const msg = generateWhatsAppMessage(sid, weekOrders, weekYear)
    await copyToClipboard(msg)
    setCopiedSupplier(sid)
    setTimeout(() => setCopiedSupplier(null), 2000)
  }

  const handleExport = (sid: SupplierId) => {
    const rows = weekOrders.flatMap(o =>
      o.items.filter(i => i.supplierId === sid).map(i => ({
        Restaurant: RESTAURANTS[o.restaurantId].name,
        Produit: i.productName,
        Quantite: i.quantity,
        Unite: i.unit,
        Categorie: i.category,
        Notes: i.notes || '',
        Statut: o.statusBySupplier?.[sid] || 'draft',
      }))
    )
    exportToCSV(rows, `commande-${sid}-${weekYear}.csv`)
  }

  const getItemCount = (sid: SupplierId) =>
    weekOrders.flatMap(o => o.items.filter(i => i.supplierId === sid)).length

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Vue FNB Manager</h1>
        <p className="text-gray-500 text-sm mt-1">Semaine du {getWeekLabel(weekYear)} — toutes les commandes centralisées</p>
      </div>

      {/* Supplier tabs */}
      <div className="flex gap-2 flex-wrap mb-6">
        {SUPPLIER_IDS.map(sid => {
          const s = SUPPLIERS[sid]
          const count = getItemCount(sid)
          const isActive = activeSupplier === sid
          return (
            <button key={sid} onClick={() => setActiveSupplier(sid)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${isActive ? 'text-white' : 'bg-white border border-gray-200 text-gray-600'}`}
              style={isActive ? { backgroundColor: s.color } : {}}>
              {s.name}
              {count > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/30' : 'bg-gray-100'}`} style={isActive ? { color: s.color } : {}}>{count}</span>}
            </button>
          )
        })}
      </div>

      {/* Active supplier panel */}
      {(() => {
        const supplier = SUPPLIERS[activeSupplier]
        const deliveryDate = getDeliveryDate(activeSupplier)
        const allItems = weekOrders.flatMap(o => o.items.filter(i => i.supplierId === activeSupplier))

        return (
          <div>
            {/* Info envoi */}
            <div className="rounded-xl p-4 text-white mb-4 flex flex-wrap items-center justify-between gap-3" style={{ backgroundColor: supplier.color }}>
              <div>
                <div className="font-semibold">{supplier.name} — {supplier.description}</div>
                <div className="text-sm opacity-80 mt-1">📅 Envoi : {getSendDateLabel(activeSupplier)}</div>
                <div className="text-sm opacity-75">📦 Livraison : {formatDate(deliveryDate)}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => handleCopy(activeSupplier)}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
                  {copiedSupplier === activeSupplier ? '✅ Copié' : '📋 Copier message'}
                </button>
                <button onClick={() => openWhatsApp(activeSupplier, generateWhatsAppMessage(activeSupplier, weekOrders, weekYear))}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-white" style={{ backgroundColor: '#25D366' }}>
                  📱 WhatsApp
                </button>
                <button onClick={() => handleExport(activeSupplier)}
                  className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium">
                  ⬇️ Export CSV
                </button>
              </div>
            </div>

            {/* Status per restaurant */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              {RESTAURANT_IDS.filter(rId => supplier.restaurants.includes(rId)).map(rId => {
                const r = RESTAURANTS[rId]
                const rOrder = weekOrders.find(o => o.restaurantId === rId)
                const status = rOrder?.statusBySupplier?.[activeSupplier] || 'draft'
                const count = rOrder?.items.filter(i => i.supplierId === activeSupplier).length || 0
                const statusConfig = {
                  draft: { label: 'Brouillon', cls: 'bg-gray-100 text-gray-600' },
                  validated: { label: 'Validée', cls: 'bg-blue-100 text-blue-700' },
                  sent: { label: 'Envoyée', cls: 'bg-green-100 text-green-700' },
                }
                return (
                  <div key={rId} className="bg-white rounded-xl border border-gray-200 p-3">
                    <div className="flex items-center gap-1.5 mb-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="font-medium text-sm">{r.name}</span>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[status].cls}`}>{statusConfig[status].label}</span>
                    <div className="text-xs text-gray-400 mt-1.5">{count} article{count !== 1 ? 's' : ''}</div>
                    {status !== 'sent' && rOrder && (
                      <button onClick={() => setSupplierStatus(rId, activeSupplier)}
                        className="mt-2 w-full text-xs py-1 bg-green-50 text-green-700 rounded-md hover:bg-green-100">
                        ✓ Marquer envoyée
                      </button>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Consolidated table */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
              <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-gray-900">Totaux consolidés</h2>
                <span className="text-xs text-gray-400">{allItems.length} article{allItems.length !== 1 ? 's' : ''} au total</span>
              </div>
              {allItems.length === 0 ? (
                <div className="py-10 text-center text-gray-400 text-sm">Aucune commande cette semaine</div>
              ) : (() => {
                const totals: Record<string, { qty: number; unit: string; restaurants: string[] }> = {}
                weekOrders.forEach(o => {
                  o.items.filter(i => i.supplierId === activeSupplier).forEach(item => {
                    const key = `${item.productName}__${item.unit}`
                    if (!totals[key]) totals[key] = { qty: 0, unit: item.unit, restaurants: [] }
                    totals[key].qty += item.quantity
                    const rName = RESTAURANTS[o.restaurantId].name
                    if (!totals[key].restaurants.includes(rName)) totals[key].restaurants.push(rName)
                  })
                })
                return (
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                      <tr>
                        <th className="text-left px-5 py-3">Produit</th>
                        <th className="text-right px-4 py-3">Qté totale</th>
                        <th className="text-left px-4 py-3 hidden sm:table-cell">Restaurants</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {Object.entries(totals).map(([key, total]) => (
                        <tr key={key} className="hover:bg-gray-50">
                          <td className="px-5 py-2.5 font-medium text-gray-900">{key.split('__')[0]}</td>
                          <td className="px-4 py-2.5 text-right font-bold">{total.qty} <span className="text-gray-400 font-normal text-xs">{total.unit}</span></td>
                          <td className="px-4 py-2.5 hidden sm:table-cell">
                            <div className="flex flex-wrap gap-1">
                              {total.restaurants.map(r => <span key={r} className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{r}</span>)}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )
              })()}
            </div>

            {/* Detail per restaurant */}
            <div className="space-y-3">
              {RESTAURANT_IDS.filter(rId => supplier.restaurants.includes(rId)).map(rId => {
                const r = RESTAURANTS[rId]
                const rOrder = weekOrders.find(o => o.restaurantId === rId)
                const rItems = rOrder?.items.filter(i => i.supplierId === activeSupplier) || []
                return (
                  <div key={rId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 flex items-center gap-2 border-b border-gray-50" style={{ borderLeftColor: r.color, borderLeftWidth: 4 }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="font-medium text-sm text-gray-900">{r.name}</span>
                      <span className="text-xs text-gray-400 ml-auto">{rItems.length} article{rItems.length !== 1 ? 's' : ''}</span>
                    </div>
                    {rItems.length === 0 ? (
                      <div className="px-4 py-3 text-xs text-gray-400 italic">Pas de commande</div>
                    ) : rItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between px-4 py-2 border-b border-gray-50 last:border-b-0">
                        <span className="text-sm text-gray-800">{item.productName}</span>
                        <span className="text-sm font-medium">{item.quantity} <span className="text-gray-400 font-normal">{item.unit}</span></span>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })()}
    </div>
  )
}

'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useOrders } from '@/hooks/useOrders'
import { SUPPLIERS, RESTAURANTS, SupplierId, RestaurantId } from '@/lib/types'
import { getWeekYear, getWeekLabel, generateWhatsAppMessage, exportToCSV } from '@/lib/utils'

export default function ManagerPage() {
  const { user, loaded } = useUser()
  const router = useRouter()
  const { getCurrentWeekOrders, markSupplierSent } = useOrders()

  useEffect(() => {
    if (loaded && user !== 'manager') router.replace('/')
  }, [loaded, user, router])

  if (!loaded || user !== 'manager') return null

  const weekYear = getWeekYear()
  const weekOrders = getCurrentWeekOrders(weekYear)
  const weekLabel = getWeekLabel(weekYear)

  const handleExportCSV = (supplierId: SupplierId) => {
    const supplier = SUPPLIERS[supplierId]
    const rows: Record<string, unknown>[] = []
    for (const restId of supplier.restaurants) {
      const order = weekOrders.find(o => o.restaurantId === restId)
      const items = order ? order.items.filter(i => i.supplierId === supplierId) : []
      for (const item of items) {
        rows.push({
          Restaurant: RESTAURANTS[restId].name,
          Produit: item.productName,
          Quantité: item.quantity,
          Unité: item.unit,
          Notes: item.notes ?? '',
        })
      }
    }
    exportToCSV(rows, `commande-${supplier.name.toLowerCase()}-${weekYear}.csv`)
  }

  const handleMarkSent = (supplierId: SupplierId) => {
    for (const restId of SUPPLIERS[supplierId].restaurants) {
      markSupplierSent(restId as RestaurantId, supplierId)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Vue Manager</h1>
          <p className="text-sm text-gray-400">{weekLabel}</p>
        </div>

        <div className="space-y-4">
          {(Object.keys(SUPPLIERS) as SupplierId[]).map(sid => {
            const supplier = SUPPLIERS[sid]
            const allItems = weekOrders.flatMap(o =>
              o.items.filter(i => i.supplierId === sid)
            )
            const isSent = weekOrders.length > 0 && weekOrders
              .filter(o => supplier.restaurants.includes(o.restaurantId))
              .every(o => o.statusBySupplier?.[sid] === 'sent')

            return (
              <div key={sid} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ backgroundColor: `${supplier.color}15` }}
                >
                  <div>
                    <span className="font-semibold" style={{ color: supplier.color }}>{supplier.name}</span>
                    <span className="text-xs text-gray-400 ml-2">{supplier.description}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">{allItems.length} article{allItems.length > 1 ? 's' : ''}</span>
                    {isSent ? (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Envoyé</span>
                    ) : (
                      <button
                        onClick={() => handleMarkSent(sid)}
                        className="text-xs px-3 py-1 rounded-full text-white font-medium"
                        style={{ backgroundColor: supplier.color }}
                      >
                        Marquer envoyé
                      </button>
                    )}
                  </div>
                </div>

                {allItems.length > 0 && (
                  <div className="p-4">
                    <div className="space-y-3 mb-4">
                      {supplier.restaurants.map(restId => {
                        const order = weekOrders.find(o => o.restaurantId === restId)
                        const items = order ? order.items.filter(i => i.supplierId === sid) : []
                        if (items.length === 0) return null
                        const rest = RESTAURANTS[restId]
                        return (
                          <div key={restId}>
                            <p className="text-xs font-semibold mb-1" style={{ color: rest.color }}>{rest.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {items.map(item => (
                                <span key={item.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-lg">
                                  {item.productName} × {item.quantity} {item.unit}
                                </span>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <a
                        href={`https://wa.me/${supplier.whatsappNumber}?text=${encodeURIComponent(generateWhatsAppMessage(sid, weekOrders, weekYear))}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white"
                        style={{ backgroundColor: '#25D366' }}
                      >
                        WhatsApp
                      </a>
                      <button
                        onClick={() => handleExportCSV(sid)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 text-gray-600 hover:bg-gray-50"
                      >
                        Export CSV
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
